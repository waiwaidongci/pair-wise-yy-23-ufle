import type { MistakeState } from "../types/MistakeState";

export const createDefaultMistakeState = (overrides: Partial<MistakeState> = {}): MistakeState => ({
  symbol_id: 0,
  in_book: false,
  correct_streak: 0,
  total_wrong: 0,
  total_correct: 0,
  last_wrong_at: null,
  last_practiced_at: null,
  updated_at: new Date(0).toISOString(),
  ...overrides
});

/** 第一次答错：直接进入错题本，连续答对计数为 0 */
export const createBookedMistakeState = (symbolId: number, at: string): MistakeState =>
  createDefaultMistakeState({
    symbol_id: symbolId,
    in_book: true,
    correct_streak: 0,
    total_wrong: 1,
    last_wrong_at: at,
    last_practiced_at: at,
    updated_at: at
  });

export const createMistakeStateForm = createDefaultMistakeState;
export const createMistakeStateResponse = (row: Partial<MistakeState>): MistakeState =>
  createDefaultMistakeState(row);
