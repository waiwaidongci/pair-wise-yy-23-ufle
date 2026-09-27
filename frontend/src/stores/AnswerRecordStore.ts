import { create } from "zustand";
import { listAnswerRecord } from "../api/AnswerRecord";
import { StoreActionError } from "../utils/errors";
import type { AnswerRecord } from "../types/AnswerRecord";

type State = {
  rows: AnswerRecord[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
};

export const useAnswerRecordStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  async load() {
    if (get().loading) return;
    set({ loading: true });
    try {
      set({ rows: await listAnswerRecord(), loading: false, loaded: true });
    } catch (err) {
      set({ loading: false });
      throw new StoreActionError("LOCAL_DB_UNAVAILABLE", err);
    }
  }
}));
