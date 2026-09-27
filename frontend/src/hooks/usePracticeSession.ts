import { useMemo } from "react";
import {
  usePracticeSessionStore,
  type AnswerFeedback
} from "../stores/PracticeSessionStore";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { buildQuestion, resolveQuestionMode, type PracticeQuestion } from "../services/practiceEngine";
import type { PracticeSession } from "../types/PracticeSession";

export interface PracticeSessionModel {
  activeSession: PracticeSession | null;
  feedback: AnswerFeedback | null;
  currentQuestion: PracticeQuestion | null;
  answeredCount: number;
  totalCount: number;
  isFinished: boolean;
  loading: boolean;
  error: string;
  startSession: ReturnType<typeof usePracticeSessionStore.getState>["startSession"];
  resumeSession: ReturnType<typeof usePracticeSessionStore.getState>["resumeSession"];
  submitAnswer: ReturnType<typeof usePracticeSessionStore.getState>["submitAnswer"];
  clearFeedback: ReturnType<typeof usePracticeSessionStore.getState>["clearFeedback"];
  dismissSession: ReturnType<typeof usePracticeSessionStore.getState>["dismissSession"];
  abandonSession: ReturnType<typeof usePracticeSessionStore.getState>["abandonSession"];
  clearError: ReturnType<typeof usePracticeSessionStore.getState>["clearError"];
}

/** 组合会话 store 与字符 store，派生出当前题目（题型与候选项） */
export function usePracticeSession(): PracticeSessionModel {
  const activeSession = usePracticeSessionStore((state) => state.activeSession);
  const feedback = usePracticeSessionStore((state) => state.feedback);
  const loading = usePracticeSessionStore((state) => state.loading);
  const error = usePracticeSessionStore((state) => state.error);
  const startSession = usePracticeSessionStore((state) => state.startSession);
  const resumeSession = usePracticeSessionStore((state) => state.resumeSession);
  const submitAnswer = usePracticeSessionStore((state) => state.submitAnswer);
  const clearFeedback = usePracticeSessionStore((state) => state.clearFeedback);
  const dismissSession = usePracticeSessionStore((state) => state.dismissSession);
  const abandonSession = usePracticeSessionStore((state) => state.abandonSession);
  const clearError = usePracticeSessionStore((state) => state.clearError);
  const symbols = useBrailleSymbolStore((state) => state.rows);

  const currentQuestion = useMemo<PracticeQuestion | null>(() => {
    if (!activeSession || activeSession.status !== "ACTIVE") return null;
    const symbolId = activeSession.queue_symbol_ids[activeSession.queue_index];
    const symbol = symbols.find((item) => item.id === symbolId);
    if (!symbol) return null;
    const mode = resolveQuestionMode(activeSession.mode, activeSession.queue_index, activeSession.last_mode);
    return buildQuestion(symbol, mode, symbols);
  }, [activeSession, symbols]);

  return {
    activeSession,
    feedback,
    currentQuestion,
    answeredCount: activeSession?.answer_count ?? 0,
    totalCount: activeSession?.queue_symbol_ids.length ?? 0,
    isFinished: activeSession?.status === "FINISHED",
    loading,
    error,
    startSession,
    resumeSession,
    submitAnswer,
    clearFeedback,
    dismissSession,
    abandonSession,
    clearError
  };
}
