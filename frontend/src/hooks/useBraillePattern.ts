import { useMemo } from "react";

export interface BraillePatternModel {
  /** 按点位 1..6 的凸点布尔值 */
  dots: boolean[];
  raisedCount: number;
  /** 对应的 Unicode 盲符（仅用于无障碍/复制） */
  unicode: string;
}

const DOT_BITS = [1 << 0, 1 << 1, 1 << 2, 1 << 3, 1 << 4, 1 << 5];
/** 两列网格渲染顺序：左列点位 1/2/3，右列点位 4/5/6 */
export const CELL_DOT_ORDER = [0, 3, 1, 4, 2, 5] as const;

/** 把 "100000" 形式的点位串解析为可渲染的盲符模型 */
export function useBraillePattern(pattern: string): BraillePatternModel {
  return useMemo(() => {
    const dots = Array.from({ length: 6 }, (_, index) => pattern[index] === "1");
    const raisedCount = dots.filter(Boolean).length;
    const bits = dots.reduce((sum, raised, index) => (raised ? sum | DOT_BITS[index] : sum), 0);
    return { dots, raisedCount, unicode: String.fromCharCode(0x2800 + bits) };
  }, [pattern]);
}
