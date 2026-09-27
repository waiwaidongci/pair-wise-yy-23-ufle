import type { PracticeMode } from "./PracticeMode";

export interface PracticeSession {
  id: number;
  /** 所属课程 id；0 表示错题重练 */
  lesson_id: number;
  mode: PracticeMode;
  started_at: string;
  /** 未完成的会话为 null */
  finished_at: string | null;
  /** 0-100，实时随答题更新 */
  score: number;
  mistake_count: number;
  answer_count: number;
  correct_count: number;
}
