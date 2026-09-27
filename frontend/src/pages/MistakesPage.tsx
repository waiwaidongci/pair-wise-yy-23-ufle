import { useMemo, useState } from "react";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useMistakeStore } from "../stores/MistakeStore";
import { activeMistakes, removedMistakes, STREAK_TO_REMOVE } from "../services/mistakeService";
import { MistakeReason, MistakeReasonText } from "../constants/MistakeReason";
import { BrailleCell } from "../components/common/BrailleCell";
import { StatusBadge } from "../components/common/StatusBadge";
import { EmptyState } from "../components/common/EmptyState";
import { navigate } from "../router/hashRouter";
import { formatCategory, formatDate, formatMistakeReason } from "../utils/formatters";
import type { MistakeReason as Reason } from "../constants/MistakeReason";

export function MistakesPage() {
  const symbols = useBrailleSymbolStore((state) => state.rows);
  const entries = useMistakeStore((state) => state.entries);
  const markMastered = useMistakeStore((state) => state.markMastered);
  const [reason, setReason] = useState<Reason | "ALL">("ALL");
  const [showRemoved, setShowRemoved] = useState(false);

  const active = useMemo(
    () => activeMistakes(entries).sort((a, b) => b.last_practiced_at.localeCompare(a.last_practiced_at)),
    [entries]
  );
  const removed = useMemo(() => removedMistakes(entries), [entries]);
  const filtered = reason === "ALL" ? active : active.filter((entry) => entry.last_reason === reason);
  const symbolOf = (id: number) => symbols.find((symbol) => symbol.id === id);

  const reasonCount = (value: Reason) => active.filter((entry) => entry.last_reason === value).length;

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">mistakes</p>
          <h1>错题本</h1>
        </div>
        <button
          className="primary"
          disabled={active.length === 0}
          onClick={() => navigate("/practice", { review: "1" })}
        >
          开始错题重练（{active.length}）
        </button>
      </section>

      <section className="panel">
        <div className="filter-chips">
          <button className={reason === "ALL" ? "chip active" : "chip"} onClick={() => setReason("ALL")}>
            全部原因（{active.length}）
          </button>
          {MistakeReason.map((value) => (
            <button
              key={value}
              className={reason === value ? "chip active" : "chip"}
              onClick={() => setReason(value)}
            >
              {MistakeReasonText[value]}（{reasonCount(value)}）
            </button>
          ))}
        </div>
        <p className="panel-hint">
          答错的字符会立刻进入错题本；同一字符连续答对 {STREAK_TO_REMOVE} 次自动移出，中途再错则从零重新计数。
        </p>
      </section>

      {filtered.length === 0 ? (
        <EmptyState
          title="错题本里还没有待攻克的字符"
          hint="去练习模式答几道题，答错的字符会自动出现在这里"
        />
      ) : (
        <section className="mistake-list">
          {filtered.map((entry) => {
            const symbol = symbolOf(entry.symbol_id);
            if (!symbol) return null;
            return (
              <article key={entry.id} className="mistake-card">
                <BrailleCell pattern={symbol.cell_pattern} size="md" label={`${symbol.letter} 的点阵`} />
                <div className="mistake-info">
                  <strong>{symbol.letter}</strong>
                  <span>{symbol.pinyin}</span>
                  <div className="symbol-card-tags">
                    <StatusBadge value={symbol.category} label={formatCategory(symbol.category)} tone="info" />
                    <StatusBadge value={entry.last_reason} label={formatMistakeReason(entry.last_reason)} tone="danger" />
                  </div>
                  <small>
                    累计答错 {entry.wrong_count} 次 · 最近错误 {formatDate(entry.last_wrong_at)}
                  </small>
                </div>
                <div className="streak">
                  <span>
                    连对 {entry.correct_streak}/{STREAK_TO_REMOVE}
                  </span>
                  <div className="streak-dots">
                    {Array.from({ length: STREAK_TO_REMOVE }, (_, index) => (
                      <i key={index} className={index < entry.correct_streak ? "on" : ""} />
                    ))}
                  </div>
                </div>
                <button className="ghost" onClick={() => void markMastered(entry.symbol_id)}>
                  标记掌握
                </button>
              </article>
            );
          })}
        </section>
      )}

      {removed.length > 0 ? (
        <section className="panel">
          <button className="ghost wide" onClick={() => setShowRemoved((value) => !value)}>
            已移出错题本（{removed.length}）{showRemoved ? " ▲" : " ▼"}
          </button>
          {showRemoved ? (
            <div className="table">
              {removed.map((entry) => {
                const symbol = symbolOf(entry.symbol_id);
                if (!symbol) return null;
                return (
                  <article key={entry.id} className="row">
                    <strong>{symbol.letter}</strong>
                    <span>{symbol.pinyin}</span>
                    <StatusBadge value="MASTERED" label="已掌握" tone="ok" />
                    <small>{formatDate(entry.last_practiced_at)}</small>
                  </article>
                );
              })}
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
