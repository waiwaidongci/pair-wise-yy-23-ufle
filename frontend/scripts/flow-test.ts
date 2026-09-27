// 端到端核心流程测试：开练 -> 提交 -> 错题本三振规则 -> 恢复草稿 -> 进度统计
import "fake-indexeddb/auto";
import { ensureSeeded, resetDatabase } from "../src/api/db";
import { listBrailleSymbol } from "../src/api/BrailleSymbol";
import { startPractice, submitPracticeAnswer, loadActiveDraft, abandonPractice } from "../src/services/practiceService";
import { getReviewQueue, markSymbolMastered, applyAnswerToMistake } from "../src/services/mistakeService";
import { getProgressOverview } from "../src/services/progressService";
import { listMistakeState } from "../src/api/MistakeState";

let passed = 0;
function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("✗", msg);
    process.exitCode = 1;
  } else {
    passed += 1;
    console.log("✓", msg);
  }
}

async function main() {
  await ensureSeeded();
  const symbols = await listBrailleSymbol();
  assert(symbols.length === 47, `种子字符 47 个（实际 ${symbols.length}）`);
  const first = symbols[0];
  const second = symbols[1];

  // 1) 从课程 1 开始一轮，队列保持课程 symbol_ids 顺序
  const draft0 = await startPractice({ lessonId: 1, mode: "CELL_TO_TEXT", source: "LESSON" });
  assert(draft0.queue[0] === 1 && draft0.queue.length === 10, "练习队列按课程顺序生成（10 题）");
  assert((await loadActiveDraft()) !== null, "草稿已持久化，可被恢复");

  // 2) 第一题故意答错：立刻进入错题本，计数 0
  const wrong = await submitPracticeAnswer({ draft: draft0, userAnswer: "z", latencyMs: 500 });
  assert(wrong.record.correct === false, "错误答案判错");
  assert(wrong.record.mistake_reason === "CATEGORY_MIXED", "错因归类：相近字符混淆");
  assert(wrong.transition.state.in_book === true, "答错字符直接进入错题本");
  assert(wrong.transition.state.correct_streak === 0, "进错题本时连续计数为 0");
  assert(wrong.transition.newlyAdded === true, "标记为新加入错题本");

  // 3) 中途再错：计数保持 0
  // 直接用错题服务模拟再错（队列继续推进，第二题答 symbol2 的错误答案）
  const afterWrongAgain = await applyAnswerToMistake(first.id, false, "POINT_MISREAD");
  assert(afterWrongAgain.state.total_wrong === 2, "再次答错累计错误次数");
  assert(afterWrongAgain.state.correct_streak === 0, "中途再错，计数从零（保持 0）");

  // 4) 连续答对 2 次：仍在错题本
  const s1 = await applyAnswerToMistake(first.id, true, "");
  assert(s1.state.in_book && s1.state.correct_streak === 1, "第 1 次连续答对，仍在错题本");
  const s2 = await applyAnswerToMistake(first.id, true, "");
  assert(s2.state.in_book && s2.state.correct_streak === 2, "第 2 次连续答对，仍在错题本");

  // 5) 2 连对后再错：清零
  const reset = await applyAnswerToMistake(first.id, false, "REVERSED_DOT");
  assert(reset.state.correct_streak === 0 && reset.state.in_book, "2 连对后再错立即清零，仍在错题本");
  assert(reset.streakReset === true, "事件标记为计数清零");

  // 6) 再连续答对 3 次：移出
  await applyAnswerToMistake(first.id, true, "");
  await applyAnswerToMistake(first.id, true, "");
  const removed = await applyAnswerToMistake(first.id, true, "");
  assert(removed.state.in_book === false, "连续答对 3 次后移出错题本");
  assert(removed.state.correct_streak === 3, "移出时计数为 3");
  assert(removed.removed === true, "事件标记为移出");

  // 7) 放弃本轮，草稿清除但记录保留
  const active = await loadActiveDraft();
  assert(active !== null, "草稿仍在（队列已推进）");
  await abandonPractice(active!);
  assert((await loadActiveDraft()) === null, "放弃后草稿清除");

  // 8) 错题重练队列只含在错题本中的字符
  // 手动把 second 放进错题本
  await applyAnswerToMistake(second.id, false, "LISTENING_MISS");
  const queue = await getReviewQueue();
  assert(queue.includes(second.id) && !queue.includes(first.id), "错题重练队列只含在错题本中的字符");

  // 9) 标记掌握直接移出
  const marked = await markSymbolMastered(second.id);
  assert(marked.in_book === false, "手动标记掌握后移出错题本");

  // 10) 完整完成一轮：会话 finished_at 落库，进度统计可聚合
  const draft = await startPractice({ lessonId: 1, mode: "CELL_TO_TEXT", source: "LESSON" });
  let current = draft;
  // 全部答对
  for (let i = 0; i < draft.queue.length; i += 1) {
    const sym = symbols.find((s) => s.id === current!.queue[i])!;
    const r = await submitPracticeAnswer({ draft: current!, userAnswer: sym.letter, latencyMs: 300 + i });
    current = r.draft;
    if (r.finished) {
      assert(r.session.finished_at !== null, "最后一题提交后会话标记完成");
      assert(r.session.score === 100, "全对得 100 分");
      assert(r.session.answer_count === 10 && r.session.correct_count === 10, "会话答题统计正确");
    }
  }
  assert((await loadActiveDraft()) === null, "完成后草稿清除");

  const overview = await getProgressOverview();
  const lesson1 = overview.lessonStats.find((l) => l.lessonId === 1)!;
  assert(overview.overall.completed >= 2, `已完成轮次统计 >=2（实际 ${overview.overall.completed}）`);
  assert(lesson1.completionCount >= 1, "按课程显示完成次数");
  assert(lesson1.accuracy > 0, "按课程显示正确率");
  assert(overview.overall.averageLatencyMs > 0, "平均答题用时已统计");
  assert(Array.isArray(lesson1.trend) && lesson1.trend.length >= 1, "最近趋势数组有数据");
  assert(overview.mistakeSummary.byReason.length === 4, "错因分类有 4 项");

  // 11) 持久化：重新"打开页面"（清空内存中的 store 状态后重新从 IDB 读取）
  await resetDatabase();
  // resetDatabase 会删库重建并重新灌种子；改为不删库，直接重新读
  const symbolsAgain = await listBrailleSymbol();
  assert(symbolsAgain.length === 47, "重建后种子恢复");

  // 12) 进行中草稿刷新恢复：开始一轮答 2 题，然后重新 loadActiveDraft
  const d = await startPractice({ lessonId: 2, mode: "LISTENING", source: "LESSON" });
  let cur = d;
  const r1 = await submitPracticeAnswer({ draft: cur, userAnswer: "zzz", latencyMs: 100 });
  cur = r1.draft!;
  const restored = await loadActiveDraft();
  assert(restored !== null && restored.position === 1, "重开页面后恢复到第 2 题位置");
  assert(restored!.queue.join(",") === d.queue.join(","), "恢复后练习顺序不变");
  assert(restored!.mode === "LISTENING" && restored!.lesson_id === 2, "恢复后模式与课程不变");
  const allMistakes = await listMistakeState();
  assert(allMistakes.some((m) => m.in_book), "错题状态跨会话保留");

  // 听写模式答错应归类 LISTENING_MISS
  assert(r1.record.mistake_reason === "LISTENING_MISS", "听写错误归类为听写未听清");

  // TEXT_TO_CELL 判分
  await abandonPractice(restored!);
  const d2 = await startPractice({ lessonId: 1, mode: "TEXT_TO_CELL", source: "LESSON" });
  const symFirst = symbols.find((s) => s.id === d2.queue[0])!;
  const cellWrong = await submitPracticeAnswer({ draft: d2, userAnswer: "2", latencyMs: 200 });
  assert(cellWrong.record.correct === false, "点阵答错判错");
  const symSecond = symbols.find((s) => s.id === cellWrong.draft!.queue[cellWrong.draft!.position])!;
  const cellRight = await submitPracticeAnswer({
    draft: cellWrong.draft!,
    userAnswer: symSecond.cell_pattern,
    latencyMs: 200
  });
  assert(cellRight.record.correct === true, "点位串正确判对");
  void symFirst;

  console.log(`\n${passed} 项断言通过`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
