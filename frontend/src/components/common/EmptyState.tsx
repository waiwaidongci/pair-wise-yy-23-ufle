import type { ReactNode } from "react";

export function EmptyState({
  title = "暂无数据",
  hint,
  children
}: {
  title?: string;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {hint && <p>{hint}</p>}
      {children}
    </div>
  );
}
