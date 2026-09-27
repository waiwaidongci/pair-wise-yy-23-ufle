export const MistakeReasonValues = ["POINT_MISREAD", "REVERSED_DOT", "CATEGORY_MIXED", "LISTENING_MISS"] as const;
export type MistakeReason = (typeof MistakeReasonValues)[number];
