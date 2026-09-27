import { create } from "zustand";
import {
  abandonPractice,
  loadActiveDraft,
  startPractice,
  submitPracticeAnswer,
  type SubmitResult
} from "../services/practiceService";
import { listPracticeSession } from "../api/PracticeSession";
import { StoreActionError } from "../utils/errors";
import type { PracticeDraft, PracticeSource } from "../types/PracticeDraft";
import type { PracticeMode } from "../types/PracticeMode";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { AnswerRecord } from "../types/AnswerRecord";
import type { PracticeSession } from "../types/PracticeSession";

export interface AnswerFeedback {
  record: AnswerRecord;
  symbol: BrailleSymbol;
  /** 正确答案（字母或点位串） */
  correctText: string;
  userAnswer: string;
  /** 本次答错后是否进入错题本 */
  addedToMistakes: boolean;
  /** 是否因再错被清零 */
  streakReset: boolean;
  /** 是否连续答对达标移出错题本 */
  removedFromMistakes: boolean;
}

type State = {
  draft: PracticeDraft | null;
  /** 刚提交后的即时反馈；点击"下一题"后清空 */
  feedback: AnswerFeedback | null;
  lastSession: PracticeSession | null;
  /** 最后一题提交后草稿已清除，但结果反馈仍要展示，保留其上下文 */
  finishedContext: FinishedContext | null;
  /** 当前会话已答题数 / 答对数 / 答错数（从持久化会话同步，刷新不丢） */
  round: { answered: number; correct: number; wrong: number };
  submitting: boolean;
  starting: boolean;
  error: string | null;
  questionStartedAt: number;
  bootstrapped: boolean;
  bootstrap: () => Promise<void>;
  begin: (lessonId: number, mode: PracticeMode, source?: PracticeSource) => Promise<boolean>;
  submit: (userAnswer: string) => Promise<SubmitResult | null>;
  dismissFeedback: () => void;
  quit: () => Promise<void>;
  markQuestionShown: () => void;
  clearError: () => void;
};

const emptyRound = { answered: 0, correct: 0, wrong: 0 };

/** 最后一道题反馈的展示上下文（仅内存，刷新后直接进成绩小结） */
export interface FinishedContext {
  lessonTitle: string;
  source: PracticeSource;
  mode: PracticeDraft["mode"];
  total: number;
  wrong: number;
}

export const usePracticeStore = create<State>((set, get) => ({
  draft: null,
  feedback: null,
  lastSession: null,
  finishedContext: null,
  round: emptyRound,
  submitting: false,
  starting: false,
  error: null,
  questionStartedAt: 0,
  bootstrapped: false,

  async bootstrap() {
    if (get().bootstrapped) return;
    try {
      const draft = await loadActiveDraft();
      if (draft) {
        const sessions = await listPracticeSession();
        const session = sessions.find((row) => row.id === draft.session_id);
        set({
          draft,
          questionStartedAt: Date.now(),
          bootstrapped: true,
          round: session
            ? {
                answered: session.answer_count,
                correct: session.correct_count,
                wrong: session.mistake_count
              }
            : emptyRound
        });
      } else {
        set({ draft: null, bootstrapped: true });
      }
    } catch (err) {
      set({
        error: new StoreActionError("DRAFT_NOT_ACTIVE", err).message,
        bootstrapped: true
      });
    }
  },

  async begin(lessonId, mode, source = "LESSON") {
    set({ starting: true, error: null, feedback: null, lastSession: null, round: emptyRound, finishedContext: null });
    try {
      const draft = await startPractice({ lessonId, mode, source });
      set({ draft, starting: false, questionStartedAt: Date.now() });
      return true;
    } catch (err) {
      const wrapped = new StoreActionError("LESSON_EMPTY", err);
      set({ starting: false, error: wrapped.message });
      return false;
    }
  },

  async submit(userAnswer) {
    const { draft, submitting, questionStartedAt } = get();
    if (!draft || submitting) return null;
    set({ submitting: true, error: null });
    try {
      const latencyMs = questionStartedAt ? Math.max(0, Date.now() - questionStartedAt) : 0;
      const result = await submitPracticeAnswer({ draft, userAnswer, latencyMs });
      const feedback: AnswerFeedback = {
        record: result.record,
        symbol: result.symbol,
        correctText:
          result.record.mode === "TEXT_TO_CELL" ? result.symbol.cell_pattern : result.symbol.letter,
        userAnswer: result.record.user_answer,
        addedToMistakes: result.transition.newlyAdded,
        streakReset: result.transition.streakReset,
        removedFromMistakes: result.transition.removed
      };
      set((state) => ({
        draft: result.draft,
        feedback,
        submitting: false,
        round: {
          answered: state.round.answered + 1,
          correct: state.round.correct + (result.record.correct ? 1 : 0),
          wrong: state.round.wrong + (result.record.correct ? 0 : 1)
        },
        lastSession: result.finished ? result.session : get().lastSession,
        finishedContext: result.finished
          ? {
              lessonTitle: draft.lesson_title,
              source: draft.source,
              mode: draft.mode,
              total: draft.queue.length,
              wrong: state.round.wrong + (result.record.correct ? 0 : 1)
            }
          : state.finishedContext
      }));
      return result;
    } catch (err) {
      const wrapped = new StoreActionError("ANSWER_MISMATCH", err);
      set({ submitting: false, error: wrapped.message });
      return null;
    }
  },

  dismissFeedback() {
    set({ feedback: null, questionStartedAt: Date.now() });
  },

  markQuestionShown() {
    set({ questionStartedAt: Date.now() });
  },

  async quit() {
    const { draft } = get();
    if (draft) {
      try {
        await abandonPractice(draft);
      } catch (err) {
        set({ error: new StoreActionError("DRAFT_NOT_ACTIVE", err).message });
      }
    }
    set({ draft: null, feedback: null, questionStartedAt: 0, round: emptyRound, finishedContext: null });
  },

  clearError() {
    set({ error: null });
  }
}));
