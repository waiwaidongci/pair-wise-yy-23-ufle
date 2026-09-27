/**
 * 日志模板集中管理：每个实体至少 4 条写操作模板，
 * service / store 的每次写操作都必须经 utils/logger 调用对应模板。
 * 新增字段或状态时需同步修改模板与所有调用处。
 */
export const LOG_TEMPLATES = {
  BrailleSymbol: {
    CREATE: "[BrailleSymbol] 点字字符创建 id={id} letter={letter}",
    UPDATE: "[BrailleSymbol] 点字字符更新 id={id} fields={fields}",
    IMPORT: "[BrailleSymbol] 点字字符导入 count={count}",
    EXPORT: "[BrailleSymbol] 点字字符导出 count={count}"
  },
  Lesson: {
    CREATE: "[Lesson] 课程创建 id={id} title={title}",
    UPDATE: "[Lesson] 课程更新 id={id} fields={fields}",
    IMPORT: "[Lesson] 课程批量导入 count={count}",
    EXPORT: "[Lesson] 课程导出 count={count}"
  },
  PracticeSession: {
    CREATE: "[PracticeSession] 练习会话创建 id={id} lessonId={lessonId} mode={mode}",
    UPDATE: "[PracticeSession] 练习会话更新 id={id} score={score}",
    FINISH: "[PracticeSession] 练习会话结束 id={id} mistakeCount={mistakeCount}",
    EXPORT: "[PracticeSession] 练习会话导出 count={count}"
  },
  AnswerRecord: {
    CREATE: "[AnswerRecord] 答题记录创建 sessionId={sessionId} symbolId={symbolId} correct={correct}",
    UPDATE: "[AnswerRecord] 答题记录更新 id={id} fields={fields}",
    SUBMIT: "[AnswerRecord] 提交答案 sessionId={sessionId} symbolId={symbolId} latencyMs={latencyMs}",
    EXPORT: "[AnswerRecord] 答题记录导出 count={count}"
  },
  MistakeState: {
    ADD: "[MistakeState] 答错字符进入错题本 symbolId={symbolId} reason={reason}",
    STREAK: "[MistakeState] 连续答对进度 symbolId={symbolId} streak={streak}",
    RESET: "[MistakeState] 再次答错，计数清零 symbolId={symbolId}",
    REMOVE: "[MistakeState] 连续答对达标，移出错题本 symbolId={symbolId}",
    MASTERED: "[MistakeState] 手动标记掌握 symbolId={symbolId}"
  },
  PracticeDraft: {
    START: "[PracticeDraft] 开始练习 sessionId={sessionId} queueLength={queueLength}",
    ADVANCE: "[PracticeDraft] 推进到第 {position}/{total} 题",
    RESUME: "[PracticeDraft] 恢复未完成练习 sessionId={sessionId} position={position}",
    ABANDON: "[PracticeDraft] 放弃当前练习 sessionId={sessionId}",
    CLEAR: "[PracticeDraft] 练习完成，清除草稿 sessionId={sessionId}"
  }
} as const;

export type LogEntity = keyof typeof LOG_TEMPLATES;
