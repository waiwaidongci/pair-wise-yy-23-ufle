import type { SymbolCategory } from "../constants/SymbolCategory";
import type { DifficultyLevel } from "../constants/DifficultyLevel";

export interface BrailleSymbol {
  id: number;
  /** 六点盲符，按点位 1..6 排列的 0/1 字符串，例如 "100000" */
  cell_pattern: string;
  letter: string;
  pinyin: string;
  category: SymbolCategory;
  difficulty: DifficultyLevel;
  audio_hint_key: string;
}
