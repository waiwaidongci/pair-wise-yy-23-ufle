import type { MasteryLevel } from "../types/MasteryLevel";

/** 难度档位同时用在点字字符 difficulty 字段与掌握度展示 */
export const MasteryLevelText: Record<MasteryLevel, string> = {
  NEW: "入门",
  LEARNING: "基础",
  FAMILIAR: "进阶",
  MASTERED: "高级"
};

/** 掌握度视角下的同一枚枚举（错题本、进度页复用） */
export const MasteryStateText: Record<MasteryLevel, string> = {
  NEW: "未学习",
  LEARNING: "学习中",
  FAMILIAR: "熟悉",
  MASTERED: "已掌握"
};

export const MasteryLevelOptions = Object.keys(MasteryLevelText) as MasteryLevel[];
