import { useMemo, useState } from "react";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useLessonStore } from "../stores/LessonStore";
import { useMistakeStore } from "../stores/MistakeStore";
import { useIndexedDbStore } from "../hooks/useIndexedDbStore";
import { listAnswerRecords } from "../api/AnswerRecord";
import { computeSymbolMastery } from "../services/progressService";
import { speakPinyin } from "../services/practiceEngine";
import { DifficultyLevel, DifficultyLevelText } from "../constants/DifficultyLevel";
import { MasteryLevelText } from "../constants/MasteryLevel";
import { BrailleCell } from "../components/common/BrailleCell";
import { StatusBadge } from "../components/common/StatusBadge";
import { LessonProgress } from "../components/common/LessonProgress";
import { EmptyState } from "../components/common/EmptyState";
import { navigate } from "../router/hashRouter";
import { formatCategory, formatDifficulty } from "../utils/formatters";
import type { DifficultyLevel as Difficulty } from "../constants/DifficultyLevel";

export function LearnPage() {
  const symbols = useBrailleSymbolStore((state) => state.rows);
  const lessons = useLessonStore((state) => state.rows);
  const mistakes = useMistakeStore((state) => state.entries);
  const { rows: answers } = useIndexedDbStore(listAnswerRecords, []);

  const [lessonId, setLessonId] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | "ALL">("ALL");

  const lesson = lessons.find((item) => item.id === lessonId) ?? lessons[0];

  const lessonSymbols = useMemo(
    () =>
      lesson
        ? lesson.symbol_ids
            .map((id) => symbols.find((symbol) => symbol.id === id))
            .filter((symbol): symbol is NonNullable<typeof symbol> => Boolean(symbol))
        : [],
    [lesson, symbols]
  );

  const mastery = useMemo(
    () => computeSymbolMastery(symbols, answers, mistakes),
    [symbols, answers, mistakes]
  );

  const learnedCount = lessonSymbols.filter((symbol) => {
    const level = mastery.get(symbol.id);
    return level === "FAMILIAR" || level === "MASTERED";
  }).length;

  const filteredSymbols =
    difficulty === "ALL" ? lessonSymbols : lessonSymbols.filter((symbol) => symbol.difficulty === difficulty);

  if (!lesson) {
    return (
      <main className="page">
        <EmptyState title="课程数据加载中" hint="如果长时间没有内容，请检查浏览器是否支持 IndexedDB" />
      </main>
    );
  }

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">learn</p>
          <h1>学习卡片</h1>
        </div>
        <button className="primary" onClick={() => navigate("/practice", { lesson: lesson.id })}>
          去练习本课程
        </button>
      </section>

      <section className="lesson-strip">
        {lessons.map((item) => (
          <button
            key={item.id}
            className={`lesson-chip ${item.id === lesson.id ? "active" : ""}`}
            onClick={() => setLessonId(item.id)}
          >
            <strong>{item.title}</strong>
            <span>
              {item.stage} · {item.symbol_ids.length} 个字符 · 约 {item.estimated_minutes} 分钟
            </span>
          </button>
        ))}
      </section>

      <section className="panel">
        <div className="panel-row">
          <LessonProgress completed={learnedCount} total={lessonSymbols.length} label="本课程熟悉以上字符" />
          <div className="filter-chips">
            <button className={difficulty === "ALL" ? "chip active" : "chip"} onClick={() => setDifficulty("ALL")}>
              全部难度
            </button>
            {DifficultyLevel.map((level) => (
              <button
                key={level}
                className={difficulty === level ? "chip active" : "chip"}
                onClick={() => setDifficulty(level)}
              >
                {DifficultyLevelText[level]}
              </button>
            ))}
          </div>
        </div>
        <p className="panel-hint">解锁规则：{lesson.unlock_rule}</p>
      </section>

      {filteredSymbols.length === 0 ? (
        <EmptyState title="该难度下没有字符" hint="切换难度筛选查看其它点字字符" />
      ) : (
        <section className="symbol-grid">
          {filteredSymbols.map((symbol) => {
            const level = mastery.get(symbol.id) ?? "NEW";
            return (
              <article key={symbol.id} className="symbol-card">
                <div className="symbol-card-top">
                  <BrailleCell pattern={symbol.cell_pattern} size="lg" label={`${symbol.letter} 的点阵`} />
                  <div className="symbol-meta">
                    <strong className="symbol-letter">{symbol.letter}</strong>
                    <span className="symbol-pinyin">{symbol.pinyin}</span>
                  </div>
                </div>
                <div className="symbol-card-tags">
                  <StatusBadge value={symbol.category} label={formatCategory(symbol.category)} tone="info" />
                  <StatusBadge value={symbol.difficulty} label={formatDifficulty(symbol.difficulty)} />
                  <StatusBadge
                    value={level}
                    label={MasteryLevelText[level]}
                    tone={level === "MASTERED" ? "ok" : level === "NEW" ? "default" : "warn"}
                  />
                </div>
                <button className="ghost" onClick={() => speakPinyin(symbol)}>
                  ▶ 听发音
                </button>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
