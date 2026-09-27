export const MistakeReason = ["WRONG_CHARACTER", "WRONG_PATTERN", "LISTEN_MISS"] as const;
export type MistakeReason = (typeof MistakeReason)[number];

export const MistakeReasonText: Record<MistakeReason, string> = {
  WRONG_CHARACTER: "字符认错",
  WRONG_PATTERN: "点位选错",
  LISTEN_MISS: "听辨失误"
};
