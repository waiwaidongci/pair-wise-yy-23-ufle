import { useEffect, useMemo, useState } from "react";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { usePracticeStore } from "../stores/PracticeStore";
import { resolveQuestion, type PracticeQuestion } from "../services/questionService";
import type { PracticeMode } from "../types/PracticeMode";

export interface PracticeSessionModel {
  question: PracticeQuestion | null;
  mode: PracticeMode;
  position: number;
  total: number;
  answeredCount: number;
  /** 当前题展示的时刻，用于组件层展示用时（计时持久值在 store 中记录） */
  shownAt: number;
}

/**
 * 练习会话 hook：从 PracticeStore 的持久化草稿解析当前题，
 * 关闭页面再打开仍能拿到同一道题与原始队列顺序。
 */
export function usePracticeSession(): PracticeSessionModel {
  const draft = usePracticeStore((s) => s.draft);
  const feedback = usePracticeStore((s) => s.feedback);
  const symbols = useBrailleSymbolStore((s) => s.rows);
  const markQuestionShown = usePracticeStore((s) => s.markQuestionShown);
  const [shownAt, setShownAt] = useState(() => Date.now());

  const question = useMemo(
    () => (draft ? resolveQuestion(draft, symbols) : null),
    [draft, symbols]
  );

  // 换题（草稿位置变化）或反馈消失时重置计时
  useEffect(() => {
    setShownAt(Date.now());
    markQuestionShown();
  }, [draft?.session_id, draft?.position, feedback === null, markQuestionShown]);

  return {
    question,
    mode: draft?.mode ?? "CELL_TO_TEXT",
    position: draft?.position ?? 0,
    total: draft?.queue.length ?? 0,
    answeredCount: draft?.position ?? 0,
    shownAt
  };
}
