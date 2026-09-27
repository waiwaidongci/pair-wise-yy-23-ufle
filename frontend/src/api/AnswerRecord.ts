import type { AnswerRecord } from "../types/AnswerRecord";
import { STORE, dbGetAll, dbPut } from "../services/db";
import { writeCreateLog, writeExportLog } from "../services/logService";

export async function listAnswerRecords(): Promise<AnswerRecord[]> {
  const rows = await dbGetAll<AnswerRecord>(STORE.answers);
  return rows.sort((a, b) => a.created_at.localeCompare(b.created_at));
}

export async function createAnswerRecord(payload: AnswerRecord): Promise<AnswerRecord> {
  writeCreateLog("AnswerRecord", {
    id: payload.id,
    sessionId: payload.session_id,
    symbolId: payload.symbol_id,
    correct: payload.correct
  });
  return dbPut(STORE.answers, payload);
}

export async function exportAnswerRecords(): Promise<AnswerRecord[]> {
  const rows = await listAnswerRecords();
  writeExportLog("AnswerRecord", { count: rows.length });
  return rows;
}
