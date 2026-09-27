import type { SymbolCategory } from "../types/SymbolCategory";

export const SymbolCategoryText: Record<SymbolCategory, string> = {
  LETTER: "字母",
  NUMBER: "数字",
  PUNCTUATION: "标点",
  CONTRACTION: "缩略词"
};

export const SymbolCategoryOptions = Object.keys(SymbolCategoryText) as SymbolCategory[];
