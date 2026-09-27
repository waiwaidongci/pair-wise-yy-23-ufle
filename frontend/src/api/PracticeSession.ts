import type { PracticeSession } from "../types/PracticeSession";
import { STORE, dbGet, dbGetAll, dbPut } from "../services/db";
import { writeCreateLog, writeStatusLog, writeUpdateLog } from "../services/logService";

export async function listPracticeSessions(): Promise<PracticeSession[]> {
  const rows = await dbGetAll<PracticeSession>(STORE.sessions);
  return rows.sort((a, b) => b.started_at.localeCompare(a.started_at));
}

export async function getPracticeSession(id: string): Promise<PracticeSession | undefined> {
  return dbGet<PracticeSession>(STORE.sessions, id);
}

export async function createPracticeSession(payload: PracticeSession): Promise<PracticeSession> {
  writeCreateLog("PracticeSession", { id: payload.id, lessonId: payload.lesson_id, mode: payload.mode });
  return dbPut(STORE.sessions, payload);
}

export async function updatePracticeSession(payload: PracticeSession): Promise<PracticeSession> {
  writeUpdateLog("PracticeSession", {
    id: payload.id,
    queueIndex: payload.queue_index,
    correct: payload.correct_count,
    answers: payload.answer_count
  });
  return dbPut(STORE.sessions, payload);
}

export async function finishPracticeSession(payload: PracticeSession): Promise<PracticeSession> {
  writeStatusLog("PracticeSession", {
    id: payload.id,
    status: payload.status,
    score: payload.score,
    mistakes: payload.mistake_count
  });
  return dbPut(STORE.sessions, payload);
}
