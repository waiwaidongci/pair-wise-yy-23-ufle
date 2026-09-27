import { StatusBadge } from "./StatusBadge";

/** 提交答案后立刻展示的对错徽章 */
export function ResultBadge({
  correct,
  reasonText
}: {
  correct: boolean;
  reasonText?: string;
}) {
  return correct ? (
    <StatusBadge tone="success" label="回答正确" />
  ) : (
    <StatusBadge tone="danger" label={reasonText ? `回答错误 · ${reasonText}` : "回答错误"} />
  );
}
