import type { MistakeEntry } from "../types/MistakeEntry";
import type { MistakeReason } from "../constants/MistakeReason";

let sequence = 0;

export const createMistakeEntryId = () => {
  sequence += 1;
  return `mistake-${Date.now().toString(36)}-${sequence}`;
};

export interface CreateMistakeEntryParams {
  symbolId: number;
  reason: MistakeReason;
  at?: string;
}

/** 第一次答错时构造错题本条目，连续答对计数从 0 开始 */
export const createMistakeEntryForm = (params: CreateMistakeEntryParams): MistakeEntry => {
  const at = params.at ?? new Date().toISOString();
  return {
    id: createMistakeEntryId(),
    symbol_id: params.symbolId,
    last_reason: params.reason,
    wrong_count: 1,
    correct_streak: 0,
    removed: false,
    mastered: false,
    first_wrong_at: at,
    last_wrong_at: at,
    last_practiced_at: at,
    mastery_level: "LEARNING"
  };
};

export const createDefaultMistakeEntry = (overrides: Partial<MistakeEntry> = {}): MistakeEntry => ({
  ...createMistakeEntryForm({ symbolId: 0, reason: "WRONG_CHARACTER" }),
  ...overrides
});

export const createMistakeEntryResponse = createDefaultMistakeEntry;
