/** 错题本移出阈值：同一字符连续答对 3 次才移出 */
export const MASTERY_STREAK_THRESHOLD = 3;

/** 错题重练会话使用的虚拟课程 id */
export const MISTAKES_LESSON_ID = 0;
export const MISTAKES_LESSON_TITLE = "错题重练";

/** 选择题每道题的选项数 */
export const CHOICE_COUNT = 4;

/** IndexedDB 配置（全局配置分散读取：config 与请求封装之外，本地库也走常量） */
export const LOCAL_DB_NAME = "braille-trainer-db";
export const LOCAL_DB_VERSION = 1;
export const LOCAL_STORE = {
  symbols: "brailleSymbols",
  lessons: "lessons",
  sessions: "practiceSessions",
  answers: "answerRecords",
  mistakes: "mistakeStates",
  draft: "practiceDraft"
} as const;
