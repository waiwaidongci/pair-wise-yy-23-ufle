export const BrailleSymbolCategoryValues = ["LETTER", "NUMBER", "PUNCTUATION", "CONTRACTION"] as const;
export type SymbolCategory = (typeof BrailleSymbolCategoryValues)[number];

// 难度档位复用 MasteryLevel 四档（入门/基础/进阶/高级），见 constants/MasteryLevel
import type { MasteryLevel } from "./MasteryLevel";

export interface BrailleSymbol {
  id: number;
  /** 6 点位编码，凸点编号用逗号分隔，例如 "1,4"；空串表示空方 */
  cell_pattern: string;
  /** 展示用字符：字母 / 数字 / 标点 / 缩略词 */
  letter: string;
  /** 拼音或读音提示，用于听写与卡片解释 */
  pinyin: string;
  category: SymbolCategory;
  /** 难度：NEW / LEARNING / FAMILIAR / MASTERED */
  difficulty: MasteryLevel;
  audio_hint_key: string;
}
