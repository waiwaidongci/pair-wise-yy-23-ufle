import { create } from "zustand";
import type { MistakeEntry } from "../types/MistakeEntry";
import type { MistakeReason } from "../constants/MistakeReason";
import {
  createMistakeEntry,
  listMistakeEntries,
  updateMistakeMastery,
  updateMistakeStreak
} from "../api/MistakeEntry";
import { applyCorrectAnswer, applyWrongAnswer, markMastered as markEntryMastered } from "../services/mistakeService";
import { getErrorMessage } from "../services/errors";

type State = {
  entries: MistakeEntry[];
  loading: boolean;
  error: string;
  load: () => Promise<void>;
  /** 每道题提交后联动调用：答错入本并清零连对计数；答对累计连对计数 */
  applyAnswer: (symbolId: number, correct: boolean, reason: MistakeReason | "", at: string) => Promise<void>;
  /** 手动标记掌握：立即移出错题本 */
  markMastered: (symbolId: number) => Promise<void>;
  clearError: () => void;
};

export const useMistakeStore = create<State>((set, get) => ({
  entries: [],
  loading: false,
  error: "",

  async load() {
    set({ loading: true });
    try {
      set({ entries: await listMistakeEntries(), loading: false, error: "" });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    }
  },

  async applyAnswer(symbolId, correct, reason, at) {
    const existing = get().entries.find((entry) => entry.symbol_id === symbolId);

    if (correct) {
      const next = applyCorrectAnswer(existing, at);
      // 不在错题本、或已经移出的字符不产生新的写操作
      if (!next || next === existing) return;
      const saved = await updateMistakeStreak(next);
      set({ entries: get().entries.map((entry) => (entry.id === saved.id ? saved : entry)) });
      return;
    }

    const next = applyWrongAnswer(existing, symbolId, reason || "WRONG_CHARACTER", at);
    if (existing) {
      const saved = await updateMistakeStreak(next);
      set({ entries: get().entries.map((entry) => (entry.id === saved.id ? saved : entry)) });
    } else {
      const saved = await createMistakeEntry(next);
      set({ entries: [saved, ...get().entries] });
    }
  },

  async markMastered(symbolId) {
    const existing = get().entries.find((entry) => entry.symbol_id === symbolId);
    if (!existing) return;
    const saved = await updateMistakeMastery(markEntryMastered(existing, new Date().toISOString()));
    set({ entries: get().entries.map((entry) => (entry.id === saved.id ? saved : entry)) });
  },

  clearError() {
    set({ error: "" });
  }
}));
