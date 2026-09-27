import type { PracticeSession } from "../types/PracticeSession";
import type { PracticeMode } from "../constants/PracticeMode";

let sequence = 0;

export const createSessionId = () => {
  sequence += 1;
  return `session-${Date.now().toString(36)}-${sequence}`;
};

export interface CreateSessionParams {
  lessonId: number;
  mode: PracticeMode;
  queueSymbolIds: number[];
  source?: string;
  startedAt?: string;
}

/** 构造一轮新的练习会话表单对象 */
export const createPracticeSessionForm = (params: CreateSessionParams): PracticeSession => ({
  id: createSessionId(),
  lesson_id: params.lessonId,
  mode: params.mode,
  started_at: params.startedAt ?? new Date().toISOString(),
  finished_at: "",
  score: 0,
  mistake_count: 0,
  status: "ACTIVE",
  source: params.source ?? "LESSON",
  queue_symbol_ids: params.queueSymbolIds,
  queue_index: 0,
  answer_count: 0,
  correct_count: 0,
  last_mode: undefined
});

export const createDefaultPracticeSession = (overrides: Partial<PracticeSession> = {}): PracticeSession => ({
  ...createPracticeSessionForm({ lessonId: 0, mode: "CELL_TO_TEXT", queueSymbolIds: [] }),
  ...overrides
});

export const createPracticeSessionResponse = createDefaultPracticeSession;
