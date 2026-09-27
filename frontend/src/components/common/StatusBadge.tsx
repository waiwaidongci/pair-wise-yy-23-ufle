import type { ReactNode } from "react";

export type StatusBadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "dark";

const toneClass: Record<StatusBadgeTone, string> = {
  success: "tone-success",
  warning: "tone-warning",
  danger: "tone-danger",
  info: "tone-info",
  neutral: "tone-neutral",
  dark: "tone-dark"
};

export function StatusBadge({
  value,
  label,
  tone = "neutral",
  children
}: {
  value?: string;
  label?: string;
  tone?: StatusBadgeTone;
  children?: ReactNode;
}) {
  const text = children ?? label ?? (value ? value.replace(/_/g, " ") : "");
  return <span className={`badge ${toneClass[tone]}`}>{text}</span>;
}
