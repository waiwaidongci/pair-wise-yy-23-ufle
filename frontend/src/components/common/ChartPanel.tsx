import { EmptyState } from "./EmptyState";

export interface ChartPoint {
  label: string;
  /** 0..1 之间的数值，例如正确率 */
  value: number;
  hint?: string;
}

interface ChartPanelProps {
  title: string;
  points: ChartPoint[];
  height?: number;
  emptyText?: string;
}

const WIDTH = 560;
const PAD = 30;

/** 轻量 SVG 折线图：展示最近趋势，不依赖外部图表库 */
export function ChartPanel({ title, points, height = 170, emptyText = "还没有练习数据" }: ChartPanelProps) {
  if (points.length === 0) {
    return (
      <section className="panel chart-panel">
        <h3>{title}</h3>
        <EmptyState title={emptyText} />
      </section>
    );
  }

  const innerW = WIDTH - PAD * 2;
  const innerH = height - PAD * 2;
  const stepX = points.length > 1 ? innerW / (points.length - 1) : 0;
  const coords = points.map((point, index) => ({
    x: points.length > 1 ? PAD + index * stepX : WIDTH / 2,
    y: PAD + (1 - Math.max(0, Math.min(1, point.value))) * innerH,
    point
  }));
  const path = coords.map((coord, index) => `${index === 0 ? "M" : "L"}${coord.x},${coord.y}`).join(" ");

  return (
    <section className="panel chart-panel">
      <h3>{title}</h3>
      <svg viewBox={`0 0 ${WIDTH} ${height}`} className="chart-svg" role="img" aria-label={title}>
        {[0, 0.5, 1].map((ratio) => {
          const y = PAD + (1 - ratio) * innerH;
          return (
            <g key={ratio}>
              <line x1={PAD} x2={WIDTH - PAD} y1={y} y2={y} className="chart-grid" />
              <text x={PAD - 6} y={y + 4} className="chart-tick" textAnchor="end">
                {Math.round(ratio * 100)}%
              </text>
            </g>
          );
        })}
        <path d={path} className="chart-line" fill="none" />
        {coords.map((coord, index) => (
          <g key={index}>
            <circle cx={coord.x} cy={coord.y} r={4.5} className="chart-dot">
              <title>{coord.point.hint ?? `${coord.point.label} ${(coord.point.value * 100).toFixed(0)}%`}</title>
            </circle>
            <text x={coord.x} y={height - 8} className="chart-label" textAnchor="middle">
              {coord.point.label}
            </text>
          </g>
        ))}
      </svg>
    </section>
  );
}
