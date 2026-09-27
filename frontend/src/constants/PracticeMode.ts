import type { PracticeMode } from "../types/PracticeMode";

export const PracticeModeText: Record<PracticeMode, string> = {
  CELL_TO_TEXT: "看点阵选字符",
  TEXT_TO_CELL: "看字符选点阵",
  LISTENING: "听写练习",
  MIXED: "混合模式"
};

/** 紧凑标签，用于徽章和筛选器 */
export const PracticeModeShortText: Record<PracticeMode, string> = {
  CELL_TO_TEXT: "点→字",
  TEXT_TO_CELL: "字→点",
  LISTENING: "听写",
  MIXED: "混合"
};

export const PracticeModeOptions = Object.keys(PracticeModeText) as PracticeMode[];
