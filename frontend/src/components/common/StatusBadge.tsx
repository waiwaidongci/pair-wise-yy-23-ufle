import { formatStatus } from "../../utils/formatters";

interface StatusBadgeProps {
  value: string;
  label?: string;
  tone?: "default" | "ok" | "warn" | "danger" | "info";
}

export function StatusBadge({ value, label, tone = "default" }: StatusBadgeProps) {
  const slug = String(value).toLowerCase().replace(/_/g, "-");
  return <span className={`badge badge-${slug} tone-${tone}`}>{label ?? formatStatus(value)}</span>;
}
