import { CHOICE_COUNT } from "../constants/practice";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { PracticeDraft } from "../types/PracticeDraft";
import type { PracticeMode } from "../types/PracticeMode";
import { parseDots } from "../utils/formatters";
import { pickN, seededPick } from "../utils/random";

export interface PracticeQuestion {
  symbol: BrailleSymbol;
  /** 本题实际模式（MIXED 落为三种具体模式之一） */
  mode: Exclude<PracticeMode, "MIXED">;
  /** CELL_TO_TEXT / LISTENING：字符选项 */
  textOptions: string[];
  /** TEXT_TO_CELL：点阵选项（点位串） */
  cellOptions: string[];
  /** 当前题在队列中的序号（从 1 开始） */
  index: number;
  total: number;
}

const CONCRETE_MODES = ["CELL_TO_TEXT", "LISTENING", "TEXT_TO_CELL"] as const;

/** 根据草稿当前位置解析出当前题：模式、字符、干扰项 */
export function resolveQuestion(draft: PracticeDraft, symbols: BrailleSymbol[]): PracticeQuestion | null {
  const symbolId = draft.queue[draft.position];
  const symbol = symbols.find((row) => row.id === symbolId);
  if (!symbol) return null;

  const mode: PracticeQuestion["mode"] =
    draft.mode === "MIXED"
      ? seededPick(CONCRETE_MODES, draft.session_id, draft.position)
      : (draft.mode as PracticeQuestion["mode"]);

  const seed = draft.session_id * 1000 + draft.position + symbol.id;
  const textPool = symbols.filter((s) => s.category === symbol.category);
  const textDistractors = pickN(textPool, CHOICE_COUNT - 1, seed, (s) => s.id === symbol.id).map(
    (s) => s.letter
  );
  const textOptions = shuffleStable([symbol.letter, ...textDistractors], seed);

  const cellPool = symbols.filter(
    (s) => s.cell_pattern !== "" && s.id !== symbol.id && parseDots(s.cell_pattern).length > 0
  );
  const cellDistractors = pickN(cellPool, CHOICE_COUNT - 1, seed + 7, (s) => s.cell_pattern === symbol.cell_pattern).map(
    (s) => s.cell_pattern
  );
  const cellOptions = shuffleStable([symbol.cell_pattern, ...cellDistractors], seed + 13);

  return {
    symbol,
    mode,
    textOptions,
    cellOptions,
    index: draft.position + 1,
    total: draft.queue.length
  };
}

/** 用种子做稳定洗牌，重开页面选项顺序不变 */
function shuffleStable<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.abs((seed * (i + 3) + 11) % (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
