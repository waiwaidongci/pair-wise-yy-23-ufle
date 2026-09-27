export function StatCard({
  label,
  value,
  sub,
  tone = "default"
}: {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  return (
    <div className={`stat stat-${tone}`}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}
