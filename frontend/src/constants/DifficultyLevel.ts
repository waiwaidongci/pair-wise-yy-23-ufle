export const DifficultyLevel = ["EASY", "MEDIUM", "HARD"] as const;
export type DifficultyLevel = (typeof DifficultyLevel)[number];

export const DifficultyLevelText: Record<DifficultyLevel, string> = {
  EASY: "入门",
  MEDIUM: "基础",
  HARD: "进阶"
};
