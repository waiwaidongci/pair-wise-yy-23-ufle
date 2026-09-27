/**
 * 盲文六点格：
 *   ① ④
 *   ② ⑤
 *   ③ ⑥
 */
export function BrailleCell({
  dots,
  size = "medium",
  tone = "dark",
  interactive = false,
  selected = false,
  highlight = true,
  onClickDot,
  ariaLabel
}: {
  dots: number[] | Set<number> | string;
  size?: "small" | "medium" | "large";
  /** dark=凸点实心；faint=只描边（干扰项可选） */
  tone?: "dark" | "faint";
  interactive?: boolean;
  selected?: boolean;
  highlight?: boolean;
  onClickDot?: (dot: number) => void;
  ariaLabel?: string;
}) {
  const dotSet = normalize(dots);
  const order = [1, 4, 2, 5, 3, 6];
  return (
    <div
      className={`braille-cell size-${size} tone-${tone} ${selected ? "selected" : ""} ${
        interactive ? "interactive" : ""
      }`}
      role="img"
      aria-label={ariaLabel ?? `盲文点位 ${[...dotSet].sort((a, b) => a - b).join("、") || "空方"}`}
    >
      {order.map((dot) => {
        const raised = dotSet.has(dot);
        return (
          <button
            type="button"
            key={dot}
            className={`braille-dot ${raised && highlight ? "raised" : ""} dot-${dot}`}
            aria-pressed={raised}
            disabled={!interactive}
            tabIndex={interactive ? 0 : -1}
            onClick={(e) => {
              e.stopPropagation();
              onClickDot?.(dot);
            }}
          />
        );
      })}
    </div>
  );
}

function normalize(dots: number[] | Set<number> | string): Set<number> {
  if (typeof dots === "string") {
    return new Set(
      dots
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => n >= 1 && n <= 6)
    );
  }
  return new Set(dots);
}
