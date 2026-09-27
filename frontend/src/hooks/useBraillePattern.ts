import { useMemo } from "react";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { MasteryLevel } from "../types/MasteryLevel";
import type { SymbolCategory } from "../types/SymbolCategory";
import { parseDots } from "../utils/formatters";

export interface BraillePatternModel {
  symbol: BrailleSymbol;
  dots: number[];
  dotSet: Set<number>;
}

export interface UseBraillePatternFilters {
  category?: SymbolCategory | "ALL";
  difficulty?: MasteryLevel | "ALL";
  keyword?: string;
}

/** 点字字符筛选与点阵解析，供学习卡片页和练习题面共用 */
export function useBraillePattern(symbols: BrailleSymbol[], filters: UseBraillePatternFilters = {}) {
  return useMemo(() => {
    const keyword = (filters.keyword ?? "").trim().toLowerCase();
    const rows = symbols.filter((symbol) => {
      if (filters.category && filters.category !== "ALL" && symbol.category !== filters.category) {
        return false;
      }
      if (filters.difficulty && filters.difficulty !== "ALL" && symbol.difficulty !== filters.difficulty) {
        return false;
      }
      if (
        keyword &&
        !symbol.letter.toLowerCase().includes(keyword) &&
        !symbol.pinyin.toLowerCase().includes(keyword)
      ) {
        return false;
      }
      return true;
    });

    const models: BraillePatternModel[] = rows.map((symbol) => {
      const dots = parseDots(symbol.cell_pattern);
      return { symbol, dots, dotSet: new Set(dots) };
    });

    return { rows, models, total: symbols.length, filtered: models.length };
  }, [symbols, filters.category, filters.difficulty, filters.keyword]);
}

/** 单个字符的点位模型（题面、错题本复用） */
export function useBrailleDotModel(symbol?: BrailleSymbol | null): BraillePatternModel | null {
  return useMemo(() => {
    if (!symbol) return null;
    const dots = parseDots(symbol.cell_pattern);
    return { symbol, dots, dotSet: new Set(dots) };
  }, [symbol]);
}
