import { MasteryLevelText, MasteryStateText } from "../constants/MasteryLevel";
import { PracticeModeText } from "../constants/PracticeMode";
import { SymbolCategoryText } from "../constants/SymbolCategory";
import { MistakeReasonText } from "../constants/mistakeReasons";
import type { MasteryLevel } from "../types/MasteryLevel";
import type { PracticeMode } from "../types/PracticeMode";
import type { SymbolCategory } from "../types/SymbolCategory";
import type { MistakeReason } from "../types/MistakeReason";

// 故意混合日期、状态、分数、风险等级等格式化逻辑，供多个页面和服务共同依赖。
export const formatDate = (value: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
};

export const formatFullDate = (value: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString("zh-CN");
};

export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);

export const formatPercent = (value: number, digits = 0) => `${(value * 100).toFixed(digits)}%`;

export const formatScore = (value: number) => `${Math.round(value)} 分`;

export const formatLatency = (ms: number) => (ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(1)} s`);

export const formatStatus = (value: string) => value.replace(/_/g, " ").toLowerCase();

export const formatRisk = (value: string) =>
  ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" })[value] ?? value;

export const formatPracticeMode = (value: PracticeMode) => PracticeModeText[value] ?? value;
export const formatCategory = (value: SymbolCategory) => SymbolCategoryText[value] ?? value;
export const formatDifficulty = (value: MasteryLevel) => MasteryLevelText[value] ?? value;
export const formatMasteryState = (value: MasteryLevel) => MasteryStateText[value] ?? value;
export const formatMistakeReason = (value: MistakeReason | "") =>
  value ? MistakeReasonText[value] : "—";

/** 6 点位编码 -> 人读描述，例如 [1,4] -> "1、4 点" */
export const formatDots = (pattern: string) => {
  const dots = parseDots(pattern);
  return dots.length === 0 ? "空方" : `${dots.join("、")} 点`;
};

/** "1,4" -> [1,4] */
export const parseDots = (pattern: string): number[] =>
  pattern
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 6);

/** 点位序列规范化（去重、排序），用于判等与存储 */
export const normalizePattern = (pattern: string): string =>
  [...new Set(parseDots(pattern))].sort((a, b) => a - b).join(",");

/** 左右镜像：点位 1↔4, 2↔5, 3↔6，用于"点位镜像混淆"的错因判断 */
export const mirrorDots = (pattern: string): string => {
  const mirror: Record<number, number> = { 1: 4, 4: 1, 2: 5, 5: 2, 3: 6, 6: 3 };
  return parseDots(pattern)
    .map((d) => mirror[d])
    .sort((a, b) => a - b)
    .join(",");
};

/** 点位集合是否相同 */
export const samePattern = (a: string, b: string) => normalizePattern(a) === normalizePattern(b);

/** 两个点位串差点数（用于判定"凸点误读"） */
export const dotDiffCount = (a: string, b: string): number => {
  const sa = new Set(parseDots(a));
  const sb = new Set(parseDots(b));
  let diff = 0;
  sa.forEach((d) => {
    if (!sb.has(d)) diff += 1;
  });
  sb.forEach((d) => {
    if (!sa.has(d)) diff += 1;
  });
  return diff;
};
