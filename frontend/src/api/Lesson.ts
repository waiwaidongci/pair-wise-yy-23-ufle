import { getAll, put } from "./db";
import { LOCAL_STORE } from "../constants/practice";
import type { Lesson } from "../types/Lesson";

export async function listLesson(): Promise<Lesson[]> {
  const rows = await getAll<Lesson>(LOCAL_STORE.lessons);
  return rows.sort((a, b) => a.id - b.id);
}

export async function saveLesson(payload: Lesson): Promise<Lesson> {
  return put(LOCAL_STORE.lessons, payload);
}
