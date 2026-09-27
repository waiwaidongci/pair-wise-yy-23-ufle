import type { AnswerRecord } from "../types/AnswerRecord";
import type { MistakeReason } from "../constants/MistakeReason";
import type { PracticeMode } from "../constants/PracticeMode";

let sequence = 0;

export const createAnswerRecordId = () => {
  sequence += 1;
  return `answer-${Date.now().toString(36)}-${sequence}`;
};

export interface CreateAnswerRecordParams {
  sessionId: string;
  symbolId: number;
  userAnswer: string;
  correct: boolean;
  latencyMs: number;
  mistakeReason?: MistakeReason | "";
  mode: PracticeMode;
  createdAt?: string;
}

/** 提交答案后构造答题记录 */
export const createAnswerRecordForm = (params: CreateAnswerRecordParams): AnswerRecord => ({
  id: createAnswerRecordId(),
  session_id: params.sessionId,
  symbol_id: params.symbolId,
  user_answer: params.userAnswer,
  correct: params.correct,
  latency_ms: params.latencyMs,
  mistake_reason: params.mistakeReason ?? (params.correct ? "" : "WRONG_CHARACTER"),
  mode: params.mode,
  created_at: params.createdAt ?? new Date().toISOString()
});

export const createDefaultAnswerRecord = (overrides: Partial<AnswerRecord> = {}): AnswerRecord => ({
  id: createAnswerRecordId(),
  session_id: "",
  symbol_id: 0,
  user_answer: "",
  correct: false,
  latency_ms: 0,
  mistake_reason: "",
  mode: "CELL_TO_TEXT",
  created_at: new Date().toISOString(),
  ...overrides
});

export const createAnswerRecordResponse = createDefaultAnswerRecord;
