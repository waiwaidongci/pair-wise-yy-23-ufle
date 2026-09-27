import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { MistakeReason } from "../types/MistakeReason";
import type { PracticeMode } from "../types/PracticeMode";
import { mirrorDots, samePattern } from "../utils/formatters";

export interface GradeInput {
  symbol: BrailleSymbol;
  mode: PracticeMode;
  userAnswer: string;
}

export interface GradeResult {
  correct: boolean;
  mistakeReason: MistakeReason | "";
  resolvedMode: PracticeMode;
}

/** 常见镜像形近字母对（布莱叶点位左右互映） */
const MIRROR_PAIRS: [string, string][] = [
  ["b", "f"],
  ["d", "h"],
  ["k", "r"],
  ["s", "t"],
  ["u", "v"],
  ["1", "3"],
  ["2", "5"],
  ["9", "0"]
];

function isMirrorPair(a: string, b: string): boolean {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  return MIRROR_PAIRS.some(([p, q]) => (p === x && q === y) || (p === y && q === x));
}

/** 判定对错并归类错误原因；MIXED 模式由调用方先落为具体模式 */
export function gradeAnswer({ symbol, mode, userAnswer }: GradeInput): GradeResult {
  const resolvedMode: PracticeMode = mode === "MIXED" ? "CELL_TO_TEXT" : mode;
  const answer = userAnswer.trim();

  let correct = false;
  if (resolvedMode === "TEXT_TO_CELL") {
    correct = samePattern(answer, symbol.cell_pattern);
  } else {
    // CELL_TO_TEXT / LISTENING 都是听音或看方选字符
    correct = answer.toLowerCase() === symbol.letter.toLowerCase();
  }

  if (correct) {
    return { correct: true, mistakeReason: "", resolvedMode };
  }

  return {
    correct: false,
    mistakeReason: classifyMistake(symbol, resolvedMode, answer),
    resolvedMode
  };
}

function classifyMistake(symbol: BrailleSymbol, mode: PracticeMode, answer: string): MistakeReason {
  if (mode === "LISTENING") return "LISTENING_MISS";

  if (mode === "TEXT_TO_CELL") {
    // 答出的点位恰好是正确点位的左右镜像
    if (answer !== "" && samePattern(answer, mirrorDots(symbol.cell_pattern))) return "REVERSED_DOT";
    return "POINT_MISREAD";
  }

  // CELL_TO_TEXT：选错字符，判断是否为镜像形近字符
  if (isMirrorPair(symbol.letter, answer)) return "REVERSED_DOT";
  // 选错点位形状接近的字符：凸点误读
  if (patternDistance(symbol.letter, answer) === 1) return "POINT_MISREAD";
  return "CATEGORY_MIXED";
}

const LETTER_PATTERNS: Record<string, string> = {
  a: "1",
  b: "1,2",
  c: "1,4",
  d: "1,4,5",
  e: "1,5",
  f: "1,2,4",
  g: "1,2,4,5",
  h: "1,2,5",
  i: "2,4",
  j: "2,4,5",
  k: "1,3",
  l: "1,2,3",
  m: "1,3,4",
  n: "1,3,4,5",
  o: "1,3,5",
  p: "1,2,3,4",
  q: "1,2,3,4,5",
  r: "1,2,3,5",
  s: "2,3,4",
  t: "2,3,4,5",
  u: "1,3,6",
  v: "1,2,3,6",
  w: "2,4,5,6",
  x: "1,3,4,6",
  y: "1,3,4,5,6",
  z: "1,3,5,6"
};

function patternDistance(letterA: string, letterB: string): number {
  const pa = LETTER_PATTERNS[letterA.toLowerCase()];
  const pb = LETTER_PATTERNS[letterB.toLowerCase()];
  if (!pa || !pb) return -1;
  const sa = new Set(pa.split(",").map(Number));
  const sb = new Set(pb.split(",").map(Number));
  let diff = 0;
  sa.forEach((d) => {
    if (!sb.has(d)) diff += 1;
  });
  sb.forEach((d) => {
    if (!sa.has(d)) diff += 1;
  });
  return diff;
}
