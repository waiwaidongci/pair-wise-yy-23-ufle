import { create } from "zustand";
import type { PracticeSession } from "../types/PracticeSession";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { PracticeMode } from "../constants/PracticeMode";
import type { MistakeReason } from "../constants/MistakeReason";
import {
  createPracticeSession,
  finishPracticeSession,
  listPracticeSessions,
  updatePracticeSession
} from "../api/PracticeSession";
import { createAnswerRecord } from "../api/AnswerRecord";
import { createPracticeSessionForm } from "../constructors/PracticeSessionConstructor";
import { createAnswerRecordForm } from "../constructors/AnswerRecordConstructor";
import { buildPracticeQueue, gradeAnswer, type PracticeQuestion } from "../services/practiceEngine";
import { ServiceError, getErrorMessage } from "../services/errors";
import { useMistakeStore } from "./MistakeStore";

export interface AnswerFeedback {
  correct: boolean;
  /** 用户选中的候选项 key，用于在选项上高亮 */
  selectedKey: string;
  userAnswerLabel: string;
  correctLabel: string;
  correctPattern: string;
  pinyin: string;
  mistakeReason: MistakeReason | "";
  latencyMs: number;
  /** 刚作答的题目，反馈期间继续展示 */
  question: PracticeQuestion;
}

export interface StartSessionParams {
  lessonId: number;
  mode: PracticeMode;
  symbols: BrailleSymbol[];
  source?: string;
}

export interface SubmitAnswerParams {
  selectedKey: string;
  selectedLabel: string;
  question: PracticeQuestion;
  latencyMs: number;
}

type State = {
  sessions: PracticeSession[];
  loading: boolean;
  error: string;
  activeSession: PracticeSession | null;
  feedback: AnswerFeedback | null;
  load: () => Promise<void>;
  startSession: (params: StartSessionParams) => Promise<void>;
  resumeSession: (sessionId: string) => Promise<void>;
  submitAnswer: (params: SubmitAnswerParams) => Promise<void>;
  clearFeedback: () => void;
  dismissSession: () => void;
  abandonSession: () => Promise<void>;
  clearError: () => void;
};

export const usePracticeSessionStore = create<State>((set, get) => ({
  sessions: [],
  loading: false,
  error: "",
  activeSession: null,
  feedback: null,

  async load() {
    set({ loading: true });
    try {
      set({ sessions: await listPracticeSessions(), loading: false, error: "" });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    }
  },

  async startSession({ lessonId, mode, symbols, source = "LESSON" }) {
    set({ loading: true, error: "" });
    try {
      if (symbols.length === 0) {
        throw new ServiceError(source === "MISTAKE_REVIEW" ? "MISTAKE_EMPTY" : "LESSON_EMPTY");
      }
      // 重新洗牌后的符号顺序会随会话一起持久化，重开页面保持原顺序
      const session = createPracticeSessionForm({
        lessonId,
        mode,
        queueSymbolIds: buildPracticeQueue(symbols),
        source
      });
      await createPracticeSession(session);
      set((state) => ({
        sessions: [session, ...state.sessions],
        activeSession: session,
        feedback: null,
        loading: false
      }));
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    }
  },

  async resumeSession(sessionId) {
    const session = get().sessions.find((item) => item.id === sessionId);
    if (!session) {
      set({ error: getErrorMessage(new ServiceError("SESSION_NOT_FOUND")) });
      return;
    }
    set({ activeSession: session, feedback: null, error: "" });
  },

  async submitAnswer({ selectedKey, selectedLabel, question, latencyMs }) {
    const session = get().activeSession;
    if (!session || session.status !== "ACTIVE" || get().feedback) return;

    const grade = gradeAnswer(question.mode, selectedKey, question);
    const at = new Date().toISOString();

    // 1. 保存每一道答题记录
    const record = createAnswerRecordForm({
      sessionId: session.id,
      symbolId: question.symbol.id,
      userAnswer: selectedLabel,
      correct: grade.correct,
      latencyMs,
      mistakeReason: grade.mistakeReason,
      mode: question.mode,
      createdAt: at
    });
    await createAnswerRecord(record);

    // 2. 错题本联动：答错入本、清零计数；答对累加连续答对
    await useMistakeStore.getState().applyAnswer(question.symbol.id, grade.correct, grade.mistakeReason, at);

    // 3. 更新会话进度
    const answerCount = session.answer_count + 1;
    const correctCount = session.correct_count + (grade.correct ? 1 : 0);
    const mistakeCount = session.mistake_count + (grade.correct ? 0 : 1);
    const queueIndex = session.queue_index + 1;
    const finished = queueIndex >= session.queue_symbol_ids.length;
    const nextSession: PracticeSession = {
      ...session,
      answer_count: answerCount,
      correct_count: correctCount,
      mistake_count: mistakeCount,
      queue_index: queueIndex,
      last_mode: question.mode,
      status: finished ? "FINISHED" : "ACTIVE",
      finished_at: finished ? at : "",
      score: finished ? Math.round((correctCount / answerCount) * 100) : 0
    };
    if (finished) {
      await finishPracticeSession(nextSession);
    } else {
      await updatePracticeSession(nextSession);
    }

    // 4. 提交后立刻给出结果
    const feedback: AnswerFeedback = {
      correct: grade.correct,
      selectedKey,
      userAnswerLabel: selectedLabel,
      correctLabel: question.symbol.letter,
      correctPattern: question.symbol.cell_pattern,
      pinyin: question.symbol.pinyin,
      mistakeReason: grade.mistakeReason,
      latencyMs,
      question
    };

    set((state) => ({
      activeSession: nextSession,
      sessions: [nextSession, ...state.sessions.filter((item) => item.id !== nextSession.id)],
      feedback
    }));
  },

  clearFeedback() {
    // 清除反馈后：进行中会话进入下一题，已完成会话展示总结
    set({ feedback: null });
  },

  dismissSession() {
    set({ activeSession: null, feedback: null });
  },

  async abandonSession() {
    const session = get().activeSession;
    if (!session) {
      set({ activeSession: null, feedback: null });
      return;
    }
    if (session.status === "ACTIVE") {
      const at = new Date().toISOString();
      const score = session.answer_count > 0
        ? Math.round((session.correct_count / session.answer_count) * 100)
        : 0;
      const abandoned: PracticeSession = {
        ...session,
        status: "ABANDONED",
        finished_at: at,
        score
      };
      await finishPracticeSession(abandoned);
      set((state) => ({
        sessions: [abandoned, ...state.sessions.filter((item) => item.id !== abandoned.id)]
      }));
    }
    set({ activeSession: null, feedback: null });
  },

  clearError() {
    set({ error: "" });
  }
}));
