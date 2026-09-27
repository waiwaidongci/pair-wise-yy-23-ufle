import type { MistakeReason } from "../constants/MistakeReason";

export interface AnswerRecord {
  id: string;
  session_id: string;
  symbol_id: number;
  user_answer: string;
  correct: boolean;
  latency_ms: number;
  mistake_reason: MistakeReason | "";
  /** 答题时使用的题型 */
  mode: string;
  created_at: string;
}
