import type { PracticeMode } from "./PracticeMode";

export type PracticeSource = "LESSON" | "MISTAKES";

/**
 * 进行中的练习草稿。整体持久化到 IndexedDB，
 * 关闭页面后重新打开可以按原队列顺序继续。
 */
export interface PracticeDraft {
  /** 固定主键，全局只保留一个进行中的草稿 */
  id: "active";
  session_id: number;
  lesson_id: number;
  lesson_title: string;
  source: PracticeSource;
  mode: PracticeMode;
  /** 字符 id 队列，顺序即出题顺序 */
  queue: number[];
  /** 下一题下标，等于已答题数 */
  position: number;
  started_at: string;
}
