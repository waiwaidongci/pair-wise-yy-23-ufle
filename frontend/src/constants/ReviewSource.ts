export const ReviewSource = ["LESSON", "MISTAKE_REVIEW"] as const;
export type ReviewSource = (typeof ReviewSource)[number];

export const ReviewSourceText: Record<ReviewSource, string> = {
  LESSON: "课程练习",
  MISTAKE_REVIEW: "错题重练"
};

/** 错题重练使用的虚拟课程 id，避免与真实课程混淆 */
export const MISTAKE_REVIEW_LESSON_ID = -1;
