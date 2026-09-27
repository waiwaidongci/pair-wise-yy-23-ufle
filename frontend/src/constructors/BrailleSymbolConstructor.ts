import type { BrailleSymbol } from "../types/BrailleSymbol";

export const createDefaultBrailleSymbol = (overrides: Partial<BrailleSymbol> = {}): BrailleSymbol => ({
  id: 0,
  cell_pattern: "",
  letter: "",
  pinyin: "",
  category: "LETTER",
  difficulty: "NEW",
  audio_hint_key: "",
  ...overrides
});

/** 表单编辑用：默认空方结构 */
export const createBrailleSymbolForm = createDefaultBrailleSymbol;

/** 接口响应用：补展示层兜底字段 */
export const createBrailleSymbolResponse = (row: Partial<BrailleSymbol>): BrailleSymbol =>
  createDefaultBrailleSymbol(row);
