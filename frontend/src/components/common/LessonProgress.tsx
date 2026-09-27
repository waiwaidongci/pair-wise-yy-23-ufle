interface LessonProgressProps {
  completed: number;
  total: number;
  label?: string;
  suffix?: string;
}

export function LessonProgress({ completed, total, label = "学习进度", suffix }: LessonProgressProps) {
  const percent = total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;
  return (
    <div className="lesson-progress">
      <div className="lesson-progress-head">
        <span>{label}</span>
        <strong>
          {completed}/{total}
          {suffix ? ` · ${suffix}` : ""}
        </strong>
      </div>
      <div className="progress-track" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
