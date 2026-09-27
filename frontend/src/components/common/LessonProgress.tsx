/** 学习进度条：当前轮已答题数 / 总题数 */
export function LessonProgress({
  value,
  max,
  label,
  showCount = true,
  tone = "success"
}: {
  value: number;
  max: number;
  label?: string;
  showCount?: boolean;
  tone?: "success" | "info" | "warning";
}) {
  const percent = max <= 0 ? 0 : Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="lesson-progress">
      {(label || showCount) && (
        <div className="lesson-progress-meta">
          <span>{label ?? "完成进度"}</span>
          {showCount && (
            <span>
              {value}/{max}
            </span>
          )}
        </div>
      )}
      <div className="lesson-progress-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className={`lesson-progress-bar bar-${tone}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
