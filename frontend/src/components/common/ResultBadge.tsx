interface ResultBadgeProps {
  correct: boolean;
  detail?: string;
}

/** 提交答案后的即时结果徽标 */
export function ResultBadge({ correct, detail }: ResultBadgeProps) {
  return (
    <span className={`result-badge ${correct ? "result-ok" : "result-ng"}`} role="status">
      {correct ? "✓ 回答正确" : "✗ 回答错误"}
      {detail ? <em>{detail}</em> : null}
    </span>
  );
}
