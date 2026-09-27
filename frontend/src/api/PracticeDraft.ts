import { get, put, remove } from "./db";
import { LOCAL_STORE } from "../constants/practice";
import type { PracticeDraft } from "../types/PracticeDraft";

const DRAFT_KEY: IDBValidKey = "active";

export async function getActivePracticeDraft(): Promise<PracticeDraft | null> {
  const draft = await get<PracticeDraft>(LOCAL_STORE.draft, DRAFT_KEY);
  return draft ?? null;
}

export async function savePracticeDraft(payload: PracticeDraft): Promise<PracticeDraft> {
  return put(LOCAL_STORE.draft, payload);
}

export async function clearPracticeDraft(): Promise<void> {
  await remove(LOCAL_STORE.draft, DRAFT_KEY);
}
