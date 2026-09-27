import { getAll, put, remove } from "./db";
import { LOCAL_STORE } from "../constants/practice";
import type { MistakeState } from "../types/MistakeState";

export async function listMistakeState(): Promise<MistakeState[]> {
  return getAll<MistakeState>(LOCAL_STORE.mistakes);
}

export async function listActiveMistakeState(): Promise<MistakeState[]> {
  const rows = await getAll<MistakeState>(LOCAL_STORE.mistakes);
  return rows.filter((row) => row.in_book);
}

export async function getMistakeState(symbolId: number): Promise<MistakeState | undefined> {
  const rows = await getAll<MistakeState>(LOCAL_STORE.mistakes);
  return rows.find((row) => row.symbol_id === symbolId);
}

export async function saveMistakeState(payload: MistakeState): Promise<MistakeState> {
  return put(LOCAL_STORE.mistakes, payload);
}

/** 错题本不允许物理删除历史；移出仅置 in_book=false */
export async function deleteMistakeState(symbolId: number): Promise<void> {
  await remove(LOCAL_STORE.mistakes, symbolId);
}
