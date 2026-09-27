export const PracticeModeValues = ["CELL_TO_TEXT", "TEXT_TO_CELL", "LISTENING", "MIXED"] as const;
export type PracticeMode = (typeof PracticeModeValues)[number];
