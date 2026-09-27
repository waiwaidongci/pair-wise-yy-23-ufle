import type { BrailleSymbol } from "../types/BrailleSymbol";
import { STORE, dbGetAll, dbPut } from "../services/db";
import { writeCreateLog, writeExportLog } from "../services/logService";

export async function listBrailleSymbols(): Promise<BrailleSymbol[]> {
  const rows = await dbGetAll<BrailleSymbol>(STORE.symbols);
  return rows.sort((a, b) => a.id - b.id);
}

export async function saveBrailleSymbol(payload: BrailleSymbol): Promise<BrailleSymbol> {
  writeCreateLog("BrailleSymbol", { id: payload.id, letter: payload.letter });
  return dbPut(STORE.symbols, payload);
}

export async function exportBrailleSymbols(): Promise<BrailleSymbol[]> {
  const rows = await listBrailleSymbols();
  writeExportLog("BrailleSymbol", { count: rows.length });
  return rows;
}
