import type { PracticeMode } from "../constants/PracticeMode";
import type { SessionStatus } from "../constants/SessionStatus";

export interface PracticeSession {
  id: string;
  lesson_id: number;
  mode: PracticeMode;
  started_at: string;
  finished_at: string;
  /** 0-100 的正确率得分 */
  score: number;
  mistake_count: number;
  /** 完成 / 中途关闭时保留进行中状态，便于下次恢复练习顺序 */
  status: SessionStatus;
  /** 课程练习或错题重练 */
  source: string;
  /** 本轮题目顺序（符号 id 序列） */
  queue_symbol_ids: number[];
  /** 已经提交到的队列下标（下一题的位置） */
  queue_index: number;
  answer_count: number;
  correct_count: number;
  /** 最近一次题型，用于 MIXED 模式轮换 */
  last_mode?: PracticeMode;
}
