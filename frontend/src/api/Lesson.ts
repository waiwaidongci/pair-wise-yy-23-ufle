import type { Lesson } from "../types/Lesson";
import { STORE, dbGetAll, dbPut } from "../services/db";
import { writeCreateLog, writeExportLog } from "../services/logService";

export async function listLessons(): Promise<Lesson[]> {
  const rows = await dbGetAll<Lesson>(STORE.lessons);
  return rows.sort((a, b) => a.id - b.id);
}

export async function saveLesson(payload: Lesson): Promise<Lesson> {
  writeCreateLog("Lesson", { id: payload.id, title: payload.title });
  return dbPut(STORE.lessons, payload);
}

export async function exportLessons(): Promise<Lesson[]> {
  const rows = await listLessons();
  writeExportLog("Lesson", { count: rows.length });
  return rows;
}
