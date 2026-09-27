import { DifficultyLevelText } from "../constants/DifficultyLevel";
import { MasteryLevelText } from "../constants/MasteryLevel";
import { MistakeReasonText } from "../constants/MistakeReason";
import { PracticeModeText } from "../constants/PracticeMode";
import { ReviewSourceText } from "../constants/ReviewSource";
import { SessionStatusText } from "../constants/SessionStatus";
import { SymbolCategoryText } from "../constants/SymbolCategory";

export const formatDate = (value: string) => new Date(value).toLocaleString("zh-CN");

export const formatShortDate = (value: string) => {
  const date = new Date(value);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const formatStatus = (value: string) => value.replace(/_/g, " ");

export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);

export const formatPercent = (value: number, digits = 0) => `${(value * 100).toFixed(digits)}%`;

export const formatLatency = (ms: number) => (ms < 1000 ? `${ms}ms` : `${(ms / 1000).toFixed(1)}s`);

export const formatRisk = (value: string) =>
  ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);

type LabelMap = Record<string, string>;

export const formatEnumLabel = (map: LabelMap, value: string) => map[value] ?? formatStatus(value);

export const formatPracticeMode = (value: string) => formatEnumLabel(PracticeModeText, value);
export const formatCategory = (value: string) => formatEnumLabel(SymbolCategoryText, value);
export const formatDifficulty = (value: string) => formatEnumLabel(DifficultyLevelText, value);
export const formatMastery = (value: string) => formatEnumLabel(MasteryLevelText, value);
export const formatMistakeReason = (value: string) => formatEnumLabel(MistakeReasonText, value);
export const formatSessionStatus = (value: string) => formatEnumLabel(SessionStatusText, value);
export const formatReviewSource = (value: string) => formatEnumLabel(ReviewSourceText, value);

/** 最近趋势：根据最近两次会话正确率差值给出上升/下降/持平 */
export const formatTrend = (delta: number) => {
  if (Number.isNaN(delta)) return "暂无数据";
  if (delta >= 0.05) return `上升 ${formatPercent(Math.abs(delta))}`;
  if (delta <= -0.05) return `下降 ${formatPercent(Math.abs(delta))}`;
  return "基本持平";
};
