import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { Lesson } from "../types/Lesson";

/**
 * 本地种子数据（中国通用盲文 / 英文布莱叶点位）。
 * 点位编号：
 *   1 4
 *   2 5
 *   3 6
 */

type SeedRow = [id: number, pattern: string, letter: string, pinyin: string, category: BrailleSymbol["category"], difficulty: BrailleSymbol["difficulty"]];

const seedRows: SeedRow[] = [
  // —— 第一组字母 a-j（只用上 4 点）——
  [1, "1", "a", "拼音 a（啊）", "LETTER", "NEW"],
  [2, "1,2", "b", "拼音 b（玻）", "LETTER", "NEW"],
  [3, "1,4", "c", "拼音 c（雌）", "LETTER", "NEW"],
  [4, "1,4,5", "d", "拼音 d（得）", "LETTER", "NEW"],
  [5, "1,5", "e", "拼音 e（鹅）", "LETTER", "NEW"],
  [6, "1,2,4", "f", "拼音 f（佛）", "LETTER", "NEW"],
  [7, "1,2,4,5", "g", "拼音 g（哥）", "LETTER", "NEW"],
  [8, "1,2,5", "h", "拼音 h（喝）", "LETTER", "NEW"],
  [9, "2,4", "i", "拼音 i（衣）", "LETTER", "NEW"],
  [10, "2,4,5", "j", "拼音 j（基）", "LETTER", "NEW"],
  // —— 第二组字母 k-t ——
  [11, "1,3", "k", "拼音 k（科）", "LETTER", "LEARNING"],
  [12, "1,2,3", "l", "拼音 l（勒）", "LETTER", "LEARNING"],
  [13, "1,3,4", "m", "拼音 m（摸）", "LETTER", "LEARNING"],
  [14, "1,3,4,5", "n", "拼音 n（讷）", "LETTER", "LEARNING"],
  [15, "1,3,5", "o", "拼音 o（喔）", "LETTER", "LEARNING"],
  [16, "1,2,3,4", "p", "拼音 p（坡）", "LETTER", "LEARNING"],
  [17, "1,2,3,4,5", "q", "拼音 q（欺）", "LETTER", "LEARNING"],
  [18, "1,2,3,5", "r", "拼音 r（日）", "LETTER", "LEARNING"],
  [19, "2,3,4", "s", "拼音 s（思）", "LETTER", "LEARNING"],
  [20, "2,3,4,5", "t", "拼音 t（特）", "LETTER", "LEARNING"],
  // —— 第三组字母 u-z ——
  [21, "1,3,6", "u", "拼音 u（乌）", "LETTER", "FAMILIAR"],
  [22, "1,2,3,6", "v", "拼音 v（万）", "LETTER", "FAMILIAR"],
  [23, "2,4,5,6", "w", "拼音 w（屋）", "LETTER", "FAMILIAR"],
  [24, "1,3,4,6", "x", "拼音 x（希）", "LETTER", "FAMILIAR"],
  [25, "1,3,4,5,6", "y", "拼音 y（衣）", "LETTER", "FAMILIAR"],
  [26, "1,3,5,6", "z", "拼音 z（资）", "LETTER", "FAMILIAR"],
  // —— 数字（数字号 3,4,5 + a-j 点位）——
  [27, "1", "1", "数字一 yī", "NUMBER", "LEARNING"],
  [28, "1,2", "2", "数字二 èr", "NUMBER", "LEARNING"],
  [29, "1,4", "3", "数字三 sān", "NUMBER", "LEARNING"],
  [30, "1,4,5", "4", "数字四 sì", "NUMBER", "LEARNING"],
  [31, "1,5", "5", "数字五 wǔ", "NUMBER", "LEARNING"],
  [32, "1,2,4", "6", "数字六 liù", "NUMBER", "FAMILIAR"],
  [33, "1,2,4,5", "7", "数字七 qī", "NUMBER", "FAMILIAR"],
  [34, "1,2,5", "8", "数字八 bā", "NUMBER", "FAMILIAR"],
  [35, "2,4", "9", "数字九 jiǔ", "NUMBER", "FAMILIAR"],
  [36, "2,4,5", "0", "数字零 líng", "NUMBER", "FAMILIAR"],
  // —— 常用标点 ——
  [37, "3", "，", "逗号 dòu hào", "PUNCTUATION", "FAMILIAR"],
  [38, "3,5,6", "。", "句号 jù hào", "PUNCTUATION", "FAMILIAR"],
  [39, "3,6", "-", "连字符 lián zì fú", "PUNCTUATION", "MASTERED"],
  [40, "5", "\"", "上引号 shàng yǐn hào", "PUNCTUATION", "MASTERED"],
  [41, "2,3,5,6", "!", "感叹号 gǎn tàn hào", "PUNCTUATION", "MASTERED"],
  [42, "2,3,6", "?", "问号 wèn hào", "PUNCTUATION", "MASTERED"],
  // —— 英文二级点字缩略词 ——
  [43, "1,2,3,4,6", "and", "缩略词 and（和）", "CONTRACTION", "MASTERED"],
  [44, "1,4,5,6", "the", "缩略词 the（定冠词）", "CONTRACTION", "MASTERED"],
  [45, "2,3,4,6", "of", "缩略词 of（的）", "CONTRACTION", "MASTERED"],
  [46, "1,2,5,6", "with", "缩略词 with（与）", "CONTRACTION", "MASTERED"],
  [47, "1,2,3,4,5,6", "for", "缩略词 for（为了）", "CONTRACTION", "MASTERED"]
];

const prefixByCategory: Record<BrailleSymbol["category"], string> = {
  LETTER: "letter",
  NUMBER: "number",
  PUNCTUATION: "punct",
  CONTRACTION: "word"
};

export const seedBrailleSymbols: BrailleSymbol[] = seedRows.map(
  ([id, cell_pattern, letter, pinyin, category, difficulty]) => ({
    id,
    cell_pattern,
    letter,
    pinyin,
    category,
    difficulty,
    audio_hint_key: `${prefixByCategory[category]}.${letter}`
  })
);

export const seedLessons: Lesson[] = [
  {
    id: 1,
    title: "第一阶 · 点字入门（a-j）",
    symbol_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    stage: "入门",
    estimated_minutes: 8,
    unlock_rule: "开放练习"
  },
  {
    id: 2,
    title: "第二阶 · 基础字母（k-t）",
    symbol_ids: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    stage: "基础",
    estimated_minutes: 8,
    unlock_rule: "完成第一阶后练习"
  },
  {
    id: 3,
    title: "第三阶 · 进阶字母（u-z）",
    symbol_ids: [21, 22, 23, 24, 25, 26],
    stage: "进阶",
    estimated_minutes: 6,
    unlock_rule: "完成第二阶后练习"
  },
  {
    id: 4,
    title: "第四阶 · 数字 0-9",
    symbol_ids: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    stage: "基础",
    estimated_minutes: 8,
    unlock_rule: "完成第一阶后练习"
  },
  {
    id: 5,
    title: "第五阶 · 常用标点",
    symbol_ids: [37, 38, 39, 40, 41, 42],
    stage: "进阶",
    estimated_minutes: 6,
    unlock_rule: "完成第三阶后练习"
  },
  {
    id: 6,
    title: "第六阶 · 缩略词挑战",
    symbol_ids: [43, 44, 45, 46, 47],
    stage: "高级",
    estimated_minutes: 7,
    unlock_rule: "完成第五阶后练习"
  }
];

/** 兼容旧占位页面的汇总入口（main.tsx 之外不再依赖） */
export const mockData = {
  brailleSymbol: seedBrailleSymbols,
  lesson: seedLessons,
  practiceSession: [] as never[],
  answerRecord: [] as never[]
} as const;
