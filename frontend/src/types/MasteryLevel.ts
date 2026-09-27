export const MasteryLevelValues = ["NEW", "LEARNING", "FAMILIAR", "MASTERED"] as const;
export type MasteryLevel = (typeof MasteryLevelValues)[number];
