import type { PracticeMode } from "./PracticeMode";
import type { MistakeReason } from "./MistakeReason";

export interface AnswerRecord {
  id: number;
  session_id: number;
  symbol_id: number;
  /** 选择/输入的答案：字母 或 "1,3,4" 形式的点位串 */
  user_answer: string;
  correct: boolean;
  latency_ms: number;
  /** 答错原因，答对为 "" */
  mistake_reason: MistakeReason | "";
  /** 该题实际采用的模式（MIXED 会在答题时落为具体模式） */
  mode: PracticeMode;
}
