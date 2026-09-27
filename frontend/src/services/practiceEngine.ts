import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { PracticeMode } from "../constants/PracticeMode";
import { MistakeReason } from "../constants/MistakeReason";

export interface PracticeQuestion {
  symbol: BrailleSymbol;
  mode: PracticeMode;
  /** 候选项（看形识字 / 听音为字符选项；看字选点为点阵选项） */
  options: BrailleSymbol[];
  /** 正确答案在 options 中的稳定 key */
  answerKey: string;
}

export interface GradeResult {
  correct: boolean;
  mistakeReason: MistakeReason | "";
}

/** Fisher-Yates 洗牌，保证每轮练习顺序随机且可持久化 */
export const shuffleSymbolIds = (ids: number[]): number[] => {
  const next = [...ids];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
};

export const buildPracticeQueue = (symbols: BrailleSymbol[]): number[] =>
  shuffleSymbolIds(symbols.map((symbol) => symbol.id));

const QUESTION_MODES: PracticeMode[] = ["CELL_TO_TEXT", "TEXT_TO_CELL", "LISTENING"];

export const resolveQuestionMode = (sessionMode: PracticeMode, index: number, lastMode?: PracticeMode): PracticeMode => {
  if (sessionMode !== "MIXED") return sessionMode;
  const start = lastMode
    ? (QUESTION_MODES.indexOf(lastMode) + 1) % QUESTION_MODES.length
    : index % QUESTION_MODES.length;
  return QUESTION_MODES[start];
};

const pickOptions = (target: BrailleSymbol, pool: BrailleSymbol[], count: number): BrailleSymbol[] => {
  const distractors = pool
    .filter((symbol) => symbol.id !== target.id && symbol.letter !== target.letter)
    .map((symbol) => ({ symbol, weight: symbol.category === target.category ? 2 : 1 }))
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.max(0, count - 1))
    .map(({ symbol }) => symbol);
  return [target, ...distractors].sort((a, b) => a.id - b.id);
};

export const buildQuestion = (
  symbol: BrailleSymbol,
  mode: PracticeMode,
  pool: BrailleSymbol[]
): PracticeQuestion => {
  const optionCount = Math.min(4, pool.length);
  const options = pickOptions(symbol, pool, optionCount);
  return { symbol, mode, options, answerKey: String(symbol.id) };
};

/** 提交即判定：根据题型确定错误原因 */
export const gradeAnswer = (mode: PracticeMode, selectedKey: string, question: PracticeQuestion): GradeResult => {
  const correct = selectedKey === question.answerKey;
  if (correct) return { correct: true, mistakeReason: "" };
  const mistakeReason: MistakeReason =
    mode === "TEXT_TO_CELL" ? "WRONG_PATTERN" : mode === "LISTENING" ? "LISTEN_MISS" : "WRONG_CHARACTER";
  return { correct: false, mistakeReason };
};

/** 浏览器支持语音时模拟“听写”，否则退化为展示拼音提示 */
export const speakPinyin = (symbol: BrailleSymbol): boolean => {
  if (typeof speechSynthesis === "undefined") return false;
  const utterance = new SpeechSynthesisUtterance(symbol.pinyin);
  utterance.lang = "zh-CN";
  utterance.rate = 0.85;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
  return true;
};
