import { useMemo } from "react";
import { useLessonStore } from "../stores/LessonStore";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useMistakeStore } from "../stores/MistakeStore";
import { useIndexedDbStore } from "../hooks/useIndexedDbStore";
import { listAnswerRecords } from "../api/AnswerRecord";
import { listPracticeSessions } from "../api/PracticeSession";
import {
  computeDifficultyDistribution,
  computeLessonStats,
  computeMasteryCounts
} from "../services/progressService";
import { activeMistakes } from "../services/mistakeService";
import { MasteryLevel, MasteryLevelText } from "../constants/MasteryLevel";
import { DifficultyLevelText } from "../constants/DifficultyLevel";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { ChartPanel, type ChartPoint } from "../components/common/ChartPanel";
import { formatDate, formatPercent, formatShortDate, formatTrend } from "../utils/formatters";

export function ProgressPage() {
  const lessons = useLessonStore((state) => state.rows);
  const symbols = useBrailleSymbolStore((state) => state.rows);
  const mistakes = useMistakeStore((state) => state.entries);
  const { rows: sessions, loading: sessionsLoading } = useIndexedDbStore(listPracticeSessions, []);
  const { rows: answers, loading: answersLoading } = useIndexedDbStore(listAnswerRecords, []);

  const lessonStats = useMemo(
    () => computeLessonStats(lessons, sessions, answers),
    [lessons, sessions, answers]
  );
  const difficultyDistribution = useMemo(
    () => computeDifficultyDistribution(answers, symbols),
    [answers, symbols]
  );
  const masteryCounts = useMemo(
    () => computeMasteryCounts(symbols, answers, mistakes),
    [symbols, answers, mistakes]
  );

  const finishedSessions = sessions.filter((session) => session.status === "FINISHED");
  const totalCorrect = answers.filter((answer) => answer.correct).length;
  const activeMistakeCount = activeMistakes(mistakes).length;

  const trendTone = (delta: number) =>
    Number.isNaN(delta) ? "default" : delta >= 0.05 ? "ok" : delta <= -0.05 ? "danger" : "default";

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">progress</p>
          <h1>学习进度</h1>
        </div>
        {(sessionsLoading || answersLoading) ? <StatusBadge value="LOCAL_DATA" label="数据刷新中" /> : null}
      </section>

      <section className="metrics four">
        <StatCard label="完成练习" value={`${finishedSessions.length} 轮`} />
        <StatCard label="累计答题" value={answers.length} />
        <StatCard
          label="总正确率"
          value={answers.length > 0 ? formatPercent(totalCorrect / answers.length) : "--"}
          hint={`${totalCorrect}/${answers.length} 题`}
        />
        <StatCard label="待攻克错题" value={activeMistakeCount} hint="错题本中仍需重练的字符" />
      </section>

      <section className="panel">
        <h2>字符掌握度分布</h2>
        <div className="mastery-row">
          {MasteryLevel.map((level) => (
            <div key={level} className="mastery-item">
              <StatusBadge
                value={level}
                label={MasteryLevelText[level]}
                tone={level === "MASTERED" ? "ok" : level === "LEARNING" ? "warn" : "default"}
              />
              <strong>{masteryCounts[level]}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>各难度正确率</h2>
        <div className="dist-list">
          {difficultyDistribution.map((slice) => (
            <div key={slice.difficulty} className="dist-row">
              <span>{DifficultyLevelText[slice.difficulty]}</span>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${slice.accuracy * 100}%` }} />
              </div>
              <strong>{slice.total > 0 ? formatPercent(slice.accuracy) : "--"}</strong>
              <small>
                {slice.correct}/{slice.total}
              </small>
            </div>
          ))}
        </div>
      </section>

      {lessonStats.map((stat) => {
        const points: ChartPoint[] = stat.trend.slice(-8).map((point) => ({
          label: formatShortDate(point.date),
          value: point.accuracy,
          hint: `${formatDate(point.date)} · 正确率 ${formatPercent(point.accuracy, 1)}`
        }));
        return (
          <section key={stat.lesson.id} className="panel lesson-stat">
            <header className="panel-head-row">
              <div>
                <h2>{stat.lesson.title}</h2>
                <p className="panel-hint">
                  {stat.lesson.stage} · 最近练习：
                  {stat.lastPracticedAt ? formatDate(stat.lastPracticedAt) : "还没有练习记录"}
                </p>
              </div>
              <StatusBadge value={stat.lesson.stage} label={stat.lesson.stage} tone="info" />
            </header>
            <div className="metrics three">
              <StatCard
                label="完成次数"
                value={`${stat.completions} 轮`}
                hint={stat.activeRounds > 0 ? `${stat.activeRounds} 轮进行中` : "暂无进行中的练习"}
              />
              <StatCard
                label="正确率"
                value={stat.answerCount > 0 ? formatPercent(stat.accuracy) : "--"}
                hint={`${stat.correctCount}/${stat.answerCount} 题`}
              />
              <div className="stat trend-stat">
                <span>最近趋势</span>
                <strong className={`trend trend-${trendTone(stat.trendDelta)}`}>{formatTrend(stat.trendDelta)}</strong>
              </div>
            </div>
            <ChartPanel title="最近正确率走势" points={points} emptyText="完成一轮练习后这里会出现趋势线" />
          </section>
        );
      })}
    </main>
  );
}
