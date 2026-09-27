import type { AnswerRecord } from "../types/AnswerRecord";
import type { MistakeReason } from "../types/MistakeReason";
import type { PracticeMode } from "../types/PracticeMode";

export const createDefaultAnswerRecord = (overrides: Partial<AnswerRecord> = {}): AnswerRecord => ({
  id: 0,
  session_id: 0,
  symbol_id: 0,
  user_answer: "",
  correct: false,
  latency_ms: 0,
  mistake_reason: "",
  mode: "CELL_TO_TEXT",
  ...overrides
});

/** 每次提交答案时构造落库记录 */
export const createSubmittedAnswerRecord = (params: {
  id: number;
  sessionId: number;
  symbolId: number;
  userAnswer: string;
  correct: boolean;
  latencyMs: number;
  mistakeReason: MistakeReason | "";
  mode: PracticeMode;
}): AnswerRecord =>
  createDefaultAnswerRecord({
    id: params.id,
    session_id: params.sessionId,
    symbol_id: params.symbolId,
    user_answer: params.userAnswer,
    correct: params.correct,
    latency_ms: params.latencyMs,
    mistake_reason: params.mistakeReason,
    mode: params.mode
  });

export const createAnswerRecordForm = createDefaultAnswerRecord;
export const createAnswerRecordResponse = (row: Partial<AnswerRecord>): AnswerRecord =>
  createDefaultAnswerRecord(row);
