import type { ReactNode } from "react";
import { BrailleCell } from "./BrailleCell";
import { StatusBadge } from "./StatusBadge";
import { SymbolCategoryText } from "../../constants/SymbolCategory";
import { MasteryLevelText } from "../../constants/MasteryLevel";
import { formatDots } from "../../utils/formatters";
import type { BrailleSymbol } from "../../types/BrailleSymbol";

/** 点字字符卡片：学习卡片页与错题本共用 */
export function SymbolCard({
  symbol,
  footer,
  compact = false
}: {
  symbol: BrailleSymbol;
  footer?: ReactNode;
  compact?: boolean;
}) {
  return (
    <article className={`symbol-card ${compact ? "compact" : ""}`}>
      <div className="symbol-card-main">
        <BrailleCell dots={symbol.cell_pattern} size={compact ? "small" : "medium"} />
        <div className="symbol-card-info">
          <div className="symbol-card-letter-row">
            <span className="symbol-card-letter">{symbol.letter}</span>
            <StatusBadge tone="info" label={SymbolCategoryText[symbol.category]} />
            <StatusBadge tone="neutral" label={MasteryLevelText[symbol.difficulty]} />
          </div>
          <p className="symbol-card-pinyin">{symbol.pinyin}</p>
          <p className="symbol-card-dots">{formatDots(symbol.cell_pattern)}</p>
        </div>
      </div>
      {footer && <footer className="symbol-card-footer">{footer}</footer>}
    </article>
  );
}
