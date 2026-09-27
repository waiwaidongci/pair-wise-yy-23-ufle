import { create } from "zustand";
import { listLesson } from "../api/Lesson";
import { StoreActionError } from "../utils/errors";
import type { Lesson } from "../types/Lesson";

type State = {
  rows: Lesson[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
};

export const useLessonStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  async load() {
    if (get().loading) return;
    set({ loading: true });
    try {
      set({ rows: await listLesson(), loading: false, loaded: true });
    } catch (err) {
      set({ loading: false });
      throw new StoreActionError("LOCAL_DB_UNAVAILABLE", err);
    }
  }
}));
