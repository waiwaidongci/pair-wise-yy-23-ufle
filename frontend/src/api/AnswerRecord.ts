import { getAll, put } from "./db";
import { LOCAL_STORE } from "../constants/practice";
import type { AnswerRecord } from "../types/AnswerRecord";

export async function listAnswerRecord(): Promise<AnswerRecord[]> {
  return getAll<AnswerRecord>(LOCAL_STORE.answers);
}

export async function listAnswerRecordBySession(sessionId: number): Promise<AnswerRecord[]> {
  const rows = await getAll<AnswerRecord>(LOCAL_STORE.answers);
  return rows
    .filter((row) => row.session_id === sessionId)
    .sort((a, b) => a.id - b.id);
}

export async function saveAnswerRecord(payload: AnswerRecord): Promise<AnswerRecord> {
  return put(LOCAL_STORE.answers, payload);
}
