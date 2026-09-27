import { getAll, put } from "./db";
import { LOCAL_STORE } from "../constants/practice";
import type { PracticeSession } from "../types/PracticeSession";

export async function listPracticeSession(): Promise<PracticeSession[]> {
  const rows = await getAll<PracticeSession>(LOCAL_STORE.sessions);
  return rows.sort((a, b) => (a.started_at < b.started_at ? 1 : -1));
}

export async function savePracticeSession(payload: PracticeSession): Promise<PracticeSession> {
  return put(LOCAL_STORE.sessions, payload);
}
