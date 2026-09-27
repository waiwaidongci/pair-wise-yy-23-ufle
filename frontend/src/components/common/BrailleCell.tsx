import { useBraillePattern, CELL_DOT_ORDER } from "../../hooks/useBraillePattern";

interface BrailleCellProps {
  pattern: string;
  size?: "sm" | "md" | "lg";
  label?: string;
}

/** 六点盲符渲染：左列点位 1/2/3，右列点位 4/5/6 */
export function BrailleCell({ pattern, size = "md", label }: BrailleCellProps) {
  const { dots, raisedCount, unicode } = useBraillePattern(pattern);
  return (
    <span
      className={`braille-cell braille-cell-${size}`}
      role="img"
      aria-label={label ?? `盲符 ${unicode}，${raisedCount} 个凸点`}
      title={label}
    >
      {CELL_DOT_ORDER.map((dotIndex) => (
        <span key={dotIndex} className={dots[dotIndex] ? "dot raised" : "dot"} />
      ))}
    </span>
  );
}
