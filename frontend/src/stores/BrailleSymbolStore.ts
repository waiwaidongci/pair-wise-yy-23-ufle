import { create } from "zustand";
import { listBrailleSymbol } from "../api/BrailleSymbol";
import { StoreActionError } from "../utils/errors";
import type { BrailleSymbol } from "../types/BrailleSymbol";

type State = {
  rows: BrailleSymbol[];
  loading: boolean;
  loaded: boolean;
  load: () => Promise<void>;
};

export const useBrailleSymbolStore = create<State>((set, get) => ({
  rows: [],
  loading: false,
  loaded: false,
  async load() {
    if (get().loading) return;
    set({ loading: true });
    try {
      set({ rows: await listBrailleSymbol(), loading: false, loaded: true });
    } catch (err) {
      set({ loading: false });
      throw new StoreActionError("LOCAL_DB_UNAVAILABLE", err);
    }
  }
}));
