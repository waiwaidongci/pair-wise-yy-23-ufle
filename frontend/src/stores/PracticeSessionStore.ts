import { create } from "zustand";
import { listPracticeSession } from "../api/PracticeSession";
import { StoreActionError } from "../utils/errors";
import type { PracticeSession } from "../types/PracticeSession";

type State = {
  rows: PracticeSession[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
};

export const usePracticeSessionStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  async load() {
    if (get().loading) return;
    set({ loading: true });
    try {
      set({ rows: await listPracticeSession(), loading: false, loaded: true });
    } catch (err) {
      set({ loading: false });
      throw new StoreActionError("LOCAL_DB_UNAVAILABLE", err);
    }
  }
}));
