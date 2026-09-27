import { create } from "zustand";
import { listLessons } from "../api/Lesson";
import type { Lesson } from "../types/Lesson";
import { getErrorMessage } from "../services/errors";

type State = {
  rows: Lesson[];
  loading: boolean;
  error: string;
  load: () => Promise<void>;
};

export const useLessonStore = create<State>((set) => ({
  rows: [],
  loading: false,
  error: "",
  async load() {
    set({ loading: true });
    try {
      set({ rows: await listLessons(), loading: false, error: "" });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    }
  }
}));
