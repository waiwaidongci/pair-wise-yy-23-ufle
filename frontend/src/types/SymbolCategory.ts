export const SymbolCategoryValues = ["LETTER", "NUMBER", "PUNCTUATION", "CONTRACTION"] as const;
export type SymbolCategory = (typeof SymbolCategoryValues)[number];
