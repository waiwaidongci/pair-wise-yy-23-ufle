import type { PracticeDraft, PracticeSource } from "../types/PracticeDraft";
import type { PracticeMode } from "../types/PracticeMode";

export const createDefaultPracticeDraft = (overrides: Partial<PracticeDraft> = {}): PracticeDraft => ({
  id: "active",
  session_id: 0,
  lesson_id: 0,
  lesson_title: "",
  source: "LESSON",
  mode: "CELL_TO_TEXT",
  queue: [],
  position: 0,
  started_at: new Date(0).toISOString(),
  ...overrides
});

/** 开练时构造持久化草稿，queue 顺序就是出题顺序 */
export const createStartedPracticeDraft = (params: {
  sessionId: number;
  lessonId: number;
  lessonTitle: string;
  source: PracticeSource;
  mode: PracticeMode;
  queue: number[];
  startedAt: string;
}): PracticeDraft =>
  createDefaultPracticeDraft({
    session_id: params.sessionId,
    lesson_id: params.lessonId,
    lesson_title: params.lessonTitle,
    source: params.source,
    mode: params.mode,
    queue: params.queue,
    started_at: params.startedAt
  });

export const createPracticeDraftForm = createDefaultPracticeDraft;
export const createPracticeDraftResponse = (row: Partial<PracticeDraft>): PracticeDraft =>
  createDefaultPracticeDraft(row);
