import { useEffect, useMemo, useState } from "react";
import { useLessonStore } from "../stores/LessonStore";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useMistakeStore } from "../stores/MistakeStore";
import { useIndexedDbStore } from "../hooks/useIndexedDbStore";
import { getProgressOverview, type ProgressOverview } from "../services/progressService";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { ChartPanel } from "../components/common/ChartPanel";
import { EmptyState } from "../components/common/EmptyState";
import { LessonProgress } from "../components/common/LessonProgress";
import { MasteryLevelText } from "../constants/MasteryLevel";
import { SymbolCategoryText } from "../constants/SymbolCategory";
import { MistakeReasonText } from "../constants/mistakeReasons";
import { formatDate, formatLatency, formatPercent, formatScore } from "../utils/formatters";
import { PracticeModeText } from "../constants/PracticeMode";

export function ProgressPage() {
  const lessons = useLessonStore((s) => s.rows);
  const lessonStore = useLessonStore();
  const symbolStore = useBrailleSymbolStore();
  const mistakeStore = useMistakeStore();
  const { ready, error } = useIndexedDbStore([symbolStore, lessonStore, mistakeStore]);

  const [overview, setOverview] = useState<ProgressOverview | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void getProgressOverview().then((data) => {
      if (!cancelled) setOverview(data);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, reloadKey]);

  const lessonTitleById = useMemo(
    () => new Map(lessons.map((lesson) => [lesson.id, lesson.title])),
    [lessons]
  );

  if (!ready) {
    return <section className="page-panel"><EmptyState title="正在统计本地练习数据…" /></section>;
  }
  if (error) {
    return <section className="page-panel"><EmptyState title="数据加载失败" hint={error} /></section>;
  }
  if (!overview) {
    return <section className="page-panel"><EmptyState title="正在汇总…" /></section>;
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">PROGRESS · 学习进度</p>
          <h1>学习进度统计</h1>
          <p className="page-subtitle">按课程查看完成次数、正确率和最近 5 轮趋势，数据全部来自本地记录。</p>
        </div>
        <button type="button" className="ghost-btn" onClick={() => setReloadKey((k) => k + 1)}>
          刷新统计
        </button>
      </header>

      <section className="metrics metrics-4">
        <StatCard
          label="总正确率"
          value={formatPercent(overview.overall.accuracy)}
          sub={`${overview.overall.correctCount}/${overview.overall.answerCount} 题`}
          tone={overview.overall.accuracy >= 0.8 ? "good" : "warn"}
        />
        <StatCard label="完成轮次" value={overview.overall.completed} sub={`共开始 ${overview.overall.sessions} 轮`} />
        <StatCard label="平均答题用时" value={formatLatency(overview.overall.averageLatencyMs)} />
        <StatCard
          label="错题本"
          value={overview.overall.mistakesInBook}
          tone={overview.overall.mistakesInBook > 0 ? "bad" : "good"}
          sub="待巩固字符"
        />
      </section>

      <section className="panel">
        <h2>按课程的学习进度</h2>
        <div className="lesson-progress-table">
          {overview.lessonStats.map((stat) => (
            <div className="lesson-progress-row" key={stat.lessonId}>
              <div className="lesson-progress-head">
                <div>
                  <strong>{stat.title}</strong>
                  <p className="symbol-card-dots">
                    {stat.symbolCount} 个字符 · 最近完成 {formatDate(stat.lastFinishedAt)}
                  </p>
                </div>
                <div className="lesson-progress-badges">
                  <StatusBadge
                    tone={stat.accuracy >= 0.8 ? "success" : stat.accuracy >= 0.5 ? "warning" : "danger"}
                    label={stat.answerCount === 0 ? "未练习" : `正确率 ${formatPercent(stat.accuracy)}`}
                  />
                  <StatusBadge tone="info" label={`完成 ${stat.completionCount} 次`} />
                </div>
              </div>
              <LessonProgress
                value={stat.completionCount}
                max={Math.max(3, stat.completionCount)}
                label="完成次数"
                tone="success"
              />
              <TrendChips trend={stat.trend} />
            </div>
          ))}
        </div>
      </section>

      <section className="chart-grid">
        <ChartPanel
          title="各难度档位覆盖"
          subtitle="每档字符数 / 已练习过的字符数"
          type="bar"
          data={overview.difficultyDistribution.map((row) => ({
            label: MasteryLevelText[row.level],
            value: row.practiced
          }))}
        />
        <ChartPanel
          title="分类正确率"
          subtitle="字母 / 数字 / 标点 / 缩略词"
          type="bar"
          percent
          data={overview.categoryAccuracy.map((row) => ({
            label: SymbolCategoryText[row.category],
            value: row.accuracy
          }))}
        />
        <ChartPanel
          title="错题原因分布"
          subtitle="当前错题本内字符的最近错因"
          type="bar"
          data={overview.mistakeSummary.byReason.map((row) => ({
            label: MistakeReasonText[row.reason].slice(0, 4),
            value: row.count
          }))}
        />
      </section>

      <section className="panel">
        <h2>最近练习会话</h2>
        {overview.recentSessions.length === 0 ? (
          <EmptyState title="还没有练习记录" hint="去练习模式完成第一轮练习吧。" />
        ) : (
          <div className="session-table">
            <div className="session-table-head">
              <span>课程</span>
              <span>模式</span>
              <span>开始时间</span>
              <span>用时状态</span>
              <span>得分</span>
            </div>
            {overview.recentSessions.map((session) => (
              <div className="session-table-row" key={session.id}>
                <span>{lessonTitleById.get(session.lesson_id) ?? "错题重练"}</span>
                <span>{PracticeModeText[session.mode]}</span>
                <span>{formatDate(session.started_at)}</span>
                <span>
                  {session.finished_at ? (
                    <StatusBadge tone="success" label="已完成" />
                  ) : (
                    <StatusBadge tone="warning" label="进行中（可继续）" />
                  )}
                </span>
                <span>{formatScore(session.score)}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/** 最近趋势：用小圆点表示每轮正确率 */
function TrendChips({ trend }: { trend: number[] }) {
  if (trend.length === 0) {
    return <p className="trend-empty">暂无完成记录</p>;
  }
  return (
    <div className="trend-chips" aria-label="最近 5 轮正确率趋势">
      <span className="trend-label">最近趋势</span>
      {trend.map((value, i) => (
        <span
          key={i}
          className={`trend-chip trend-${value >= 0.8 ? "up" : value >= 0.5 ? "flat" : "down"}`}
          title={formatPercent(value)}
        >
          {formatPercent(value)}
        </span>
      ))}
      {trend.length >= 2 && (
        <span
          className={`trend-arrow trend-${trend[trend.length - 1] >= trend[0] ? "up" : "down"}`}
        >
          {trend[trend.length - 1] >= trend[0] ? "↗ 上升" : "↘ 回落"}
        </span>
      )}
    </div>
  );
}
