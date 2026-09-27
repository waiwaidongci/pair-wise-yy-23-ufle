import { bulkPut, getAll, put } from "./db";
import { LOCAL_STORE } from "../constants/practice";
import type { BrailleSymbol } from "../types/BrailleSymbol";

/** 点字字符的本地模拟 API（IndexedDB 持久化，禁止接入第三方） */
export async function listBrailleSymbol(): Promise<BrailleSymbol[]> {
  return getAll<BrailleSymbol>(LOCAL_STORE.symbols);
}

export async function saveBrailleSymbol(payload: BrailleSymbol): Promise<BrailleSymbol> {
  return put(LOCAL_STORE.symbols, payload);
}

export async function importBrailleSymbols(rows: BrailleSymbol[]): Promise<BrailleSymbol[]> {
  return bulkPut(LOCAL_STORE.symbols, rows);
}
