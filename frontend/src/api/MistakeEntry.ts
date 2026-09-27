import type { MistakeEntry } from "../types/MistakeEntry";
import { STORE, dbGetAll, dbPut } from "../services/db";
import { writeCreateLog, writeExportLog, writeStatusLog, writeUpdateLog } from "../services/logService";

export async function listMistakeEntries(): Promise<MistakeEntry[]> {
  const rows = await dbGetAll<MistakeEntry>(STORE.mistakes);
  return rows.sort((a, b) => b.last_practiced_at.localeCompare(a.last_practiced_at));
}

export async function createMistakeEntry(payload: MistakeEntry): Promise<MistakeEntry> {
  writeCreateLog("MistakeEntry", { id: payload.id, symbolId: payload.symbol_id, reason: payload.last_reason });
  return dbPut(STORE.mistakes, payload);
}

export async function updateMistakeStreak(payload: MistakeEntry): Promise<MistakeEntry> {
  writeUpdateLog("MistakeEntry", {
    id: payload.id,
    symbolId: payload.symbol_id,
    streak: payload.correct_streak,
    removed: payload.removed
  });
  return dbPut(STORE.mistakes, payload);
}

export async function updateMistakeMastery(payload: MistakeEntry): Promise<MistakeEntry> {
  writeStatusLog("MistakeEntry", { id: payload.id, symbolId: payload.symbol_id, mastered: payload.mastered });
  return dbPut(STORE.mistakes, payload);
}

export async function exportMistakeEntries(): Promise<MistakeEntry[]> {
  const rows = await listMistakeEntries();
  writeExportLog("MistakeEntry", { count: rows.length });
  return rows;
}
