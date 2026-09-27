import type { ReactNode } from "react";

export interface ChartSeriesPoint {
  label: string;
  value: number;
}

/** 轻量 SVG 图表面板：趋势折线 / 分类柱状，进度页使用（不引入第三方图表运行时） */
export function ChartPanel({
  title,
  subtitle,
  type = "bar",
  data,
  percent = false,
  height = 160,
  emptyText = "暂无练习数据",
  actions
}: {
  title: string;
  subtitle?: string;
  type?: "bar" | "line";
  data: ChartSeriesPoint[];
  percent?: boolean;
  height?: number;
  emptyText?: string;
  actions?: ReactNode;
}) {
  const hasData = data.some((point) => point.value > 0);
  return (
    <div className="panel chart-panel">
      <header className="chart-panel-head">
        <div>
          <h2>{title}</h2>
          {subtitle && <p className="chart-subtitle">{subtitle}</p>}
        </div>
        {actions}
      </header>
      {!hasData ? (
        <div className="chart-empty">{emptyText}</div>
      ) : type === "line" ? (
        <LineChart data={data} percent={percent} height={height} />
      ) : (
        <BarChart data={data} percent={percent} height={height} />
      )}
    </div>
  );
}

function BarChart({ data, percent, height }: { data: ChartSeriesPoint[]; percent: boolean; height: number }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="chart-bars" style={{ height }}>
      {data.map((point) => (
        <div className="chart-bar-col" key={point.label}>
          <div className="chart-bar-track">
            <div className="chart-bar" style={{ height: `${(point.value / max) * 100}%` }} title={fmt(point.value, percent)} />
          </div>
          <span className="chart-bar-value">{fmt(point.value, percent)}</span>
          <span className="chart-bar-label">{point.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data, percent, height }: { data: ChartSeriesPoint[]; percent: boolean; height: number }) {
  const width = 320;
  const padding = 28;
  const values = data.map((d) => d.value);
  const max = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const points = data.map((point, i) => {
    const x = padding + (i * (width - padding * 2)) / Math.max(1, data.length - 1);
    const y = height - padding - ((point.value - min) / (max - min || 1)) * (height - padding * 2);
    return { x, y, point };
  });
  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  return (
    <div className="chart-line-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} className="chart-line" role="img">
        {[0.25, 0.5, 0.75].map((ratio) => (
          <line
            key={ratio}
            x1={padding}
            x2={width - padding}
            y1={padding + ratio * (height - padding * 2)}
            y2={padding + ratio * (height - padding * 2)}
            className="chart-grid"
          />
        ))}
        <path d={path} className="chart-line-path" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={3.5} className="chart-line-dot" />
            <text x={p.x} y={height - 8} textAnchor="middle" className="chart-line-label">
              {p.point.label}
            </text>
            <text x={p.x} y={p.y - 8} textAnchor="middle" className="chart-line-value">
              {fmt(p.point.value, percent)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function fmt(value: number, percent: boolean) {
  return percent ? `${Math.round(value * 100)}%` : String(value);
}
