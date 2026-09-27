import { create } from "zustand";
import { listAnswerRecords } from "../api/AnswerRecord";
import type { AnswerRecord } from "../types/AnswerRecord";
import { getErrorMessage } from "../services/errors";

type State = {
  rows: AnswerRecord[];
  loading: boolean;
  error: string;
  load: () => Promise<void>;
};

export const useAnswerRecordStore = create<State>((set) => ({
  rows: [],
  loading: false,
  error: "",
  async load() {
    set({ loading: true });
    try {
      set({ rows: await listAnswerRecords(), loading: false, error: "" });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    }
  }
}));
