import { create } from "zustand";
import { listBrailleSymbols } from "../api/BrailleSymbol";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import { getErrorMessage } from "../services/errors";

type State = {
  rows: BrailleSymbol[];
  loading: boolean;
  error: string;
  load: () => Promise<void>;
};

export const useBrailleSymbolStore = create<State>((set) => ({
  rows: [],
  loading: false,
  error: "",
  async load() {
    set({ loading: true });
    try {
      set({ rows: await listBrailleSymbols(), loading: false, error: "" });
    } catch (error) {
      set({ loading: false, error: getErrorMessage(error) });
    }
  }
}));
