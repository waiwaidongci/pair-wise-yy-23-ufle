import { useEffect, useMemo, useState } from "react";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useMistakeStore } from "../stores/MistakeStore";
import { usePracticeStore } from "../stores/PracticeStore";
import { useIndexedDbStore } from "../hooks/useIndexedDbStore";
import { listAnswerRecord } from "../api/AnswerRecord";
import { BrailleCell } from "../components/common/BrailleCell";
import { StatCard } from "../components/common/StatCard";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { ResultBadge } from "../components/common/ResultBadge";
import { MistakeReasonOptions, MistakeReasonText } from "../constants/mistakeReasons";
import { MASTERY_STREAK_THRESHOLD } from "../constants/practice";
import { formatDate, formatDots } from "../utils/formatters";
import type { MistakeReason } from "../types/MistakeReason";
import type { MistakeState } from "../types/MistakeState";

type ReasonFilter = MistakeReason | "ALL";

/** 取某字符最近一次答错原因（从 store 不方便，改由答题记录 API 读取） */
export function MistakesPage() {
  const symbols = useBrailleSymbolStore((s) => s.rows);
  const symbolStore = useBrailleSymbolStore();
  const mistakeRows = useMistakeStore((s) => s.rows);
  const mistakeStore = useMistakeStore();
  const begin = usePracticeStore((s) => s.begin);
  const error = useMistakeStore((s) => s.error);

  const { ready, error: loadError } = useIndexedDbStore([symbolStore, mistakeStore]);
  const [reasonFilter, setReasonFilter] = useState<ReasonFilter>("ALL");
  const [reasons, setReasons] = useState<Record<number, MistakeReason>>({});

  // 加载最近错因映射
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    void listAnswerRecord().then((records) => {
      if (cancelled) return;
      const map: Record<number, MistakeReason> = {};
      for (const record of [...records].sort((a, b) => b.id - a.id)) {
        if (!record.correct && record.mistake_reason && map[record.symbol_id] === undefined) {
          map[record.symbol_id] = record.mistake_reason;
        }
      }
      setReasons(map);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, mistakeRows.length]);

  const symbolById = useMemo(() => new Map(symbols.map((s) => [s.id, s])), [symbols]);

  const activeRows = useMemo(
    () =>
      mistakeRows
        .filter((row) => row.in_book)
        .sort((a, b) => (a.last_wrong_at ?? "").localeCompare(b.last_wrong_at ?? "")),
    [mistakeRows]
  );

  const filteredRows = activeRows.filter((row) => reasonFilter === "ALL" || reasons[row.symbol_id] === reasonFilter);

  const reasonCounts = useMemo(() => {
    const counts = new Map<MistakeReason, number>();
    activeRows.forEach((row) => {
      const reason = reasons[row.symbol_id];
      if (reason) counts.set(reason, (counts.get(reason) ?? 0) + 1);
    });
    return counts;
  }, [activeRows, reasons]);

  if (!ready) {
    return <section className="page-panel"><EmptyState title="正在加载错题本…" /></section>;
  }
  if (loadError) {
    return <section className="page-panel"><EmptyState title="数据加载失败" hint={loadError} /></section>;
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">MISTAKES · 错题本</p>
          <h1>错题本</h1>
          <p className="page-subtitle">
            答错的字符直接进入错题本；同一字符连续答对 {MASTERY_STREAK_THRESHOLD} 次才移出，中途再错立即从零计数。
          </p>
        </div>
        <StatusBadge tone={activeRows.length > 0 ? "danger" : "success"} label={`待巩固 ${activeRows.length} 个`} />
      </header>

      <section className="metrics metrics-4">
        <StatCard label="错题本字符" value={activeRows.length} tone={activeRows.length > 0 ? "bad" : "good"} />
        <StatCard label="累计答错次数" value={mistakeRows.reduce((sum, r) => sum + r.total_wrong, 0)} />
        <StatCard label="已移出字符" value={mistakeRows.filter((r) => !r.in_book).length} tone="good" />
        <button
          type="button"
          className="primary-btn"
          disabled={activeRows.length === 0}
          onClick={() => void begin(0, "CELL_TO_TEXT", "MISTAKES")}
        >
          开始错题重练
        </button>
      </section>

      {error && <div className="inline-error">{error}</div>}

      <section className="panel filters-panel">
        <div className="filter-group">
          <span className="filter-label">按错误原因归类</span>
          <div className="filter-chips">
            <button
              type="button"
              className={`filter-chip ${reasonFilter === "ALL" ? "active" : ""}`}
              onClick={() => setReasonFilter("ALL")}
            >
              全部（{activeRows.length}）
            </button>
            {MistakeReasonOptions.map((reason) => (
              <button
                type="button"
                key={reason}
                className={`filter-chip ${reasonFilter === reason ? "active" : ""}`}
                onClick={() => setReasonFilter(reason)}
              >
                {MistakeReasonText[reason]}（{reasonCounts.get(reason) ?? 0}）
              </button>
            ))}
          </div>
        </div>
      </section>

      {activeRows.length === 0 ? (
        <section className="panel">
          <EmptyState
            title="错题本是空的"
            hint="去练习模式完成一轮练习，答错的字符会自动收录在这里。"
          />
        </section>
      ) : filteredRows.length === 0 ? (
        <section className="panel">
          <EmptyState title="该错因分类下暂无字符" />
        </section>
      ) : (
        <section className="mistake-list">
          {filteredRows.map((row) => (
            <MistakeRow
              key={row.symbol_id}
              state={row}
              reason={reasons[row.symbol_id]}
              letter={symbolById.get(row.symbol_id)?.letter ?? "?"}
              pattern={symbolById.get(row.symbol_id)?.cell_pattern ?? ""}
              pinyin={symbolById.get(row.symbol_id)?.pinyin ?? ""}
              onMastered={() => void mistakeStore.markMastered(row.symbol_id)}
            />
          ))}
        </section>
      )}
    </div>
  );
}

function MistakeRow({
  state,
  reason,
  letter,
  pattern,
  pinyin,
  onMastered
}: {
  state: MistakeState;
  reason?: MistakeReason;
  letter: string;
  pattern: string;
  pinyin: string;
  onMastered: () => void;
}) {
  return (
    <article className="panel mistake-row">
      <BrailleCell dots={pattern} size="medium" />
      <div className="mistake-row-info">
        <div className="mistake-row-title">
          <span className="symbol-card-letter">{letter}</span>
          {reason && <StatusBadge tone="danger" label={MistakeReasonText[reason]} />}
          <ResultBadge correct={false} />
        </div>
        <p className="symbol-card-pinyin">{pinyin}</p>
        <p className="symbol-card-dots">{formatDots(pattern)}</p>
        <p className="mistake-row-meta">
          最近答错：{formatDate(state.last_wrong_at)} · 累计错 {state.total_wrong} 次
        </p>
      </div>
      <div className="mistake-row-side">
        <StreakDots streak={state.correct_streak} threshold={MASTERY_STREAK_THRESHOLD} />
        <p className="streak-caption">
          连续答对 {state.correct_streak}/{MASTERY_STREAK_THRESHOLD}
          {state.correct_streak === 0 ? "（再错将重新计数）" : "（答错立即清零）"}
        </p>
        <button type="button" className="ghost-btn" onClick={onMastered}>
          标记掌握（直接移出）
        </button>
      </div>
    </article>
  );
}

/** 连续答对进度的三个点 */
function StreakDots({ streak, threshold }: { streak: number; threshold: number }) {
  return (
    <div className="streak-dots" aria-label={`连续答对 ${streak} 次`}>
      {Array.from({ length: threshold }, (_, i) => (
        <span key={i} className={`streak-dot ${i < streak ? "filled" : ""}`} />
      ))}
    </div>
  );
}
