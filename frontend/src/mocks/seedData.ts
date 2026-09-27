import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { Lesson } from "../types/Lesson";

/**
 * 六点盲符点位编号：
 *   1 4
 *   2 5
 *   3 6
 * cell_pattern 按点位 1..6 记录，1 表示凸点。
 */
export const seedBrailleSymbols: BrailleSymbol[] = [
  // 字母 a-j
  { id: 1, cell_pattern: "100000", letter: "a", pinyin: "a", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:a" },
  { id: 2, cell_pattern: "110000", letter: "b", pinyin: "b", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:b" },
  { id: 3, cell_pattern: "100100", letter: "c", pinyin: "c", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:c" },
  { id: 4, cell_pattern: "100110", letter: "d", pinyin: "d", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:d" },
  { id: 5, cell_pattern: "100010", letter: "e", pinyin: "e", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:e" },
  { id: 6, cell_pattern: "110100", letter: "f", pinyin: "f", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:f" },
  { id: 7, cell_pattern: "110110", letter: "g", pinyin: "g", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:g" },
  { id: 8, cell_pattern: "110010", letter: "h", pinyin: "h", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:h" },
  { id: 9, cell_pattern: "010100", letter: "i", pinyin: "i", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:i" },
  { id: 10, cell_pattern: "010110", letter: "j", pinyin: "j", category: "LETTER", difficulty: "EASY", audio_hint_key: "letter:j" },
  // 字母 k-t
  { id: 11, cell_pattern: "101000", letter: "k", pinyin: "k", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:k" },
  { id: 12, cell_pattern: "111000", letter: "l", pinyin: "l", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:l" },
  { id: 13, cell_pattern: "101100", letter: "m", pinyin: "m", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:m" },
  { id: 14, cell_pattern: "101110", letter: "n", pinyin: "n", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:n" },
  { id: 15, cell_pattern: "101010", letter: "o", pinyin: "o", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:o" },
  { id: 16, cell_pattern: "111100", letter: "p", pinyin: "p", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:p" },
  { id: 17, cell_pattern: "111110", letter: "q", pinyin: "q", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:q" },
  { id: 18, cell_pattern: "111010", letter: "r", pinyin: "r", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:r" },
  { id: 19, cell_pattern: "011100", letter: "s", pinyin: "s", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:s" },
  { id: 20, cell_pattern: "011110", letter: "t", pinyin: "t", category: "LETTER", difficulty: "MEDIUM", audio_hint_key: "letter:t" },
  // 字母 u-z
  { id: 21, cell_pattern: "101001", letter: "u", pinyin: "u", category: "LETTER", difficulty: "HARD", audio_hint_key: "letter:u" },
  { id: 22, cell_pattern: "111001", letter: "v", pinyin: "v", category: "LETTER", difficulty: "HARD", audio_hint_key: "letter:v" },
  { id: 23, cell_pattern: "010111", letter: "w", pinyin: "w", category: "LETTER", difficulty: "HARD", audio_hint_key: "letter:w" },
  { id: 24, cell_pattern: "101101", letter: "x", pinyin: "x", category: "LETTER", difficulty: "HARD", audio_hint_key: "letter:x" },
  { id: 25, cell_pattern: "101111", letter: "y", pinyin: "y", category: "LETTER", difficulty: "HARD", audio_hint_key: "letter:y" },
  { id: 26, cell_pattern: "101011", letter: "z", pinyin: "z", category: "LETTER", difficulty: "HARD", audio_hint_key: "letter:z" },
  // 数字（数字号 + 数字本身）
  { id: 27, cell_pattern: "001111", letter: "⠼", pinyin: "数字号", category: "NUMBER", difficulty: "MEDIUM", audio_hint_key: "number:sign" },
  { id: 28, cell_pattern: "100000", letter: "1", pinyin: "yi", category: "NUMBER", difficulty: "MEDIUM", audio_hint_key: "number:1" },
  { id: 29, cell_pattern: "110000", letter: "2", pinyin: "er", category: "NUMBER", difficulty: "MEDIUM", audio_hint_key: "number:2" },
  { id: 30, cell_pattern: "100100", letter: "3", pinyin: "san", category: "NUMBER", difficulty: "MEDIUM", audio_hint_key: "number:3" },
  { id: 31, cell_pattern: "100110", letter: "4", pinyin: "si", category: "NUMBER", difficulty: "MEDIUM", audio_hint_key: "number:4" },
  { id: 32, cell_pattern: "100010", letter: "5", pinyin: "wu", category: "NUMBER", difficulty: "MEDIUM", audio_hint_key: "number:5" },
  { id: 33, cell_pattern: "110100", letter: "6", pinyin: "liu", category: "NUMBER", difficulty: "HARD", audio_hint_key: "number:6" },
  { id: 34, cell_pattern: "110110", letter: "7", pinyin: "qi", category: "NUMBER", difficulty: "HARD", audio_hint_key: "number:7" },
  { id: 35, cell_pattern: "110010", letter: "8", pinyin: "ba", category: "NUMBER", difficulty: "HARD", audio_hint_key: "number:8" },
  { id: 36, cell_pattern: "010100", letter: "9", pinyin: "jiu", category: "NUMBER", difficulty: "HARD", audio_hint_key: "number:9" },
  { id: 37, cell_pattern: "010110", letter: "0", pinyin: "ling", category: "NUMBER", difficulty: "HARD", audio_hint_key: "number:0" },
  // 常用标点
  { id: 38, cell_pattern: "010000", letter: "，", pinyin: "逗号", category: "PUNCTUATION", difficulty: "MEDIUM", audio_hint_key: "punct:comma" },
  { id: 39, cell_pattern: "010011", letter: "。", pinyin: "句号", category: "PUNCTUATION", difficulty: "MEDIUM", audio_hint_key: "punct:period" },
  { id: 40, cell_pattern: "010001", letter: "？", pinyin: "问号", category: "PUNCTUATION", difficulty: "HARD", audio_hint_key: "punct:question" },
  { id: 41, cell_pattern: "011010", letter: "！", pinyin: "叹号", category: "PUNCTUATION", difficulty: "HARD", audio_hint_key: "punct:exclaim" },
  { id: 42, cell_pattern: "010101", letter: "：", pinyin: "冒号", category: "PUNCTUATION", difficulty: "HARD", audio_hint_key: "punct:colon" },
  // 常用简写 / 连写
  { id: 43, cell_pattern: "111101", letter: "的", pinyin: "de", category: "CONTRACTION", difficulty: "HARD", audio_hint_key: "word:de" },
  { id: 44, cell_pattern: "111111", letter: "了", pinyin: "le", category: "CONTRACTION", difficulty: "HARD", audio_hint_key: "word:le" },
  { id: 45, cell_pattern: "001110", letter: "和", pinyin: "he", category: "CONTRACTION", difficulty: "HARD", audio_hint_key: "word:he" }
];

export const seedLessons: Lesson[] = [
  {
    id: 1,
    title: "第一阶：a-j 基础点形",
    symbol_ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    stage: "入门",
    estimated_minutes: 8,
    unlock_rule: "默认开放"
  },
  {
    id: 2,
    title: "第二阶：k-t 左列加点",
    symbol_ids: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    stage: "基础",
    estimated_minutes: 10,
    unlock_rule: "完成第一阶后建议学习"
  },
  {
    id: 3,
    title: "第三阶：u-z 下点变化",
    symbol_ids: [21, 22, 23, 24, 25, 26],
    stage: "进阶",
    estimated_minutes: 8,
    unlock_rule: "完成第二阶后建议学习"
  },
  {
    id: 4,
    title: "数字与数字号",
    symbol_ids: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37],
    stage: "基础",
    estimated_minutes: 10,
    unlock_rule: "掌握 a-j 后开放"
  },
  {
    id: 5,
    title: "标点与常用连写",
    symbol_ids: [38, 39, 40, 41, 42, 43, 44, 45],
    stage: "进阶",
    estimated_minutes: 9,
    unlock_rule: "完成数字课程后开放"
  }
];
