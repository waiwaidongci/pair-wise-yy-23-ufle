import type { PracticeSession } from "../types/PracticeSession";
import type { PracticeMode } from "../types/PracticeMode";

export const createDefaultPracticeSession = (overrides: Partial<PracticeSession> = {}): PracticeSession => ({
  id: 0,
  lesson_id: 0,
  mode: "CELL_TO_TEXT",
  started_at: new Date(0).toISOString(),
  finished_at: null,
  score: 0,
  mistake_count: 0,
  answer_count: 0,
  correct_count: 0,
  ...overrides
});

/** 创建一条新的进行中会话 */
export const createStartedPracticeSession = (
  id: number,
  lessonId: number,
  mode: PracticeMode,
  startedAt: string
): PracticeSession =>
  createDefaultPracticeSession({ id, lesson_id: lessonId, mode, started_at: startedAt });

export const createPracticeSessionForm = createDefaultPracticeSession;
export const createPracticeSessionResponse = (row: Partial<PracticeSession>): PracticeSession =>
  createDefaultPracticeSession(row);
