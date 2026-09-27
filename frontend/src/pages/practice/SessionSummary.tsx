import { useEffect, useState } from "react";
import { StatCard } from "../../components/common/StatCard";
import { StatusBadge } from "../../components/common/StatusBadge";
import { formatDate, formatPercent } from "../../utils/formatters";
import type { PracticeSession } from "../../types/PracticeSession";

/** 一轮结束后的成绩小结 */
export function SessionSummary({
  session,
  onBackToPicker,
  onReviewMistakes,
  mistakeCount
}: {
  session: PracticeSession;
  mistakeCount: number;
  onBackToPicker: () => void;
  onReviewMistakes: () => void;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), 30);
    return () => window.clearTimeout(t);
  }, []);

  const accuracy = session.answer_count === 0 ? 0 : session.correct_count / session.answer_count;

  return (
    <section className={`panel summary-panel ${visible ? "show" : ""}`}>
      <header className="summary-head">
        <h1>本轮练习完成 🎉</h1>
        <StatusBadge
          tone={accuracy >= 0.9 ? "success" : accuracy >= 0.6 ? "warning" : "danger"}
          label={`正确率 ${formatPercent(accuracy)}`}
        />
      </header>
      <section className="metrics metrics-4">
        <StatCard label="得分" value={session.score} sub="满分 100" tone="good" />
        <StatCard label="答对题数" value={session.correct_count} sub={`共 ${session.answer_count} 题`} />
        <StatCard label="答错题数" value={session.mistake_count} tone={session.mistake_count > 0 ? "bad" : "good"} />
        <StatCard label="错题本待巩固" value={mistakeCount} tone={mistakeCount > 0 ? "warn" : "good"} />
      </section>
      <p className="page-subtitle">完成时间：{formatDate(session.finished_at)}</p>
      <p className="page-subtitle">
        答错的字符已进入错题本；同一字符连续答对 3 次才会移出，中途再错会重新计数。
      </p>
      <div className="picker-actions">
        <button type="button" className="primary-btn" onClick={onBackToPicker}>
          返回选择课程
        </button>
        <button type="button" className="ghost-btn" disabled={mistakeCount === 0} onClick={onReviewMistakes}>
          立刻错题重练
        </button>
      </div>
    </section>
  );
}
