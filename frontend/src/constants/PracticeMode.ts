export const PracticeMode = ["CELL_TO_TEXT", "TEXT_TO_CELL", "LISTENING", "MIXED"] as const;
export type PracticeMode = (typeof PracticeMode)[number];

export const PracticeModeText: Record<PracticeMode, string> = {
  CELL_TO_TEXT: "看形识字",
  TEXT_TO_CELL: "看字选点",
  LISTENING: "听音辨字",
  MIXED: "混合训练"
};

export const PracticeModeHint: Record<PracticeMode, string> = {
  CELL_TO_TEXT: "观察点阵，选出对应的字母或符号",
  TEXT_TO_CELL: "看到字符，选出正确的六点盲符",
  LISTENING: "听读音，选出对应的字符",
  MIXED: "三种题型按顺序轮换出现"
};
