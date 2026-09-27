import { create } from "zustand";
import { listMistakeState } from "../api/MistakeState";
import {
  applyAnswerToMistake,
  getReviewQueue,
  markSymbolMastered
} from "../services/mistakeService";
import { StoreActionError } from "../utils/errors";
import { MASTERY_STREAK_THRESHOLD } from "../constants/practice";
import type { MistakeState } from "../types/MistakeState";
import type { MistakeReason } from "../types/MistakeReason";

interface MistakeEvent {
  removed: boolean;
  streakReset: boolean;
  newlyAdded: boolean;
}

type State = {
  rows: MistakeState[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
  lastEvent: MistakeEvent | null;
  load: () => Promise<void>;
  recordAnswer: (symbolId: number, correct: boolean, reason: MistakeReason | "") => Promise<MistakeEvent>;
  markMastered: (symbolId: number) => Promise<void>;
  reviewQueue: () => Promise<number[]>;
  clearError: () => void;
};

/** 错题本 store：连续答对 3 次移出，再错清零的规则在 mistakeService 中 */
export const useMistakeStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  error: null,
  lastEvent: null,
  async load() {
    if (get().loading) return;
    set({ loading: true });
    try {
      set({ rows: await listMistakeState(), loading: false, loaded: true });
    } catch (err) {
      const wrapped = new StoreActionError("LOCAL_DB_UNAVAILABLE", err);
      set({ loading: false, error: wrapped.message });
    }
  },
  async recordAnswer(symbolId, correct, reason) {
    try {
      const transition = await applyAnswerToMistake(symbolId, correct, reason);
      set((state) => ({
        rows: [
          ...state.rows.filter((row) => row.symbol_id !== symbolId),
          transition.state
        ],
        lastEvent: {
          removed: transition.removed,
          streakReset: transition.streakReset,
          newlyAdded: transition.newlyAdded
        }
      }));
      return transition;
    } catch (err) {
      const wrapped = new StoreActionError("VALIDATION_FAILED", err);
      set({ error: wrapped.message });
      throw wrapped;
    }
  },
  async markMastered(symbolId) {
    try {
      const next = await markSymbolMastered(symbolId);
      set((state) => ({
        rows: [...state.rows.filter((row) => row.symbol_id !== symbolId), next]
      }));
    } catch (err) {
      const wrapped = new StoreActionError("MISTAKE_NOT_IN_BOOK", err);
      set({ error: wrapped.message });
    }
  },
  async reviewQueue() {
    return getReviewQueue();
  },
  clearError() {
    set({ error: null });
  }
}));

export { MASTERY_STREAK_THRESHOLD };
