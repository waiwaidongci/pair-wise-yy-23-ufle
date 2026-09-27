import type { MistakeEntry } from "../types/MistakeEntry";
import type { MistakeReason } from "../constants/MistakeReason";
import { createMistakeEntryForm } from "../constructors/MistakeEntryConstructor";

/** 连续答对 N 次后自动移出错题本 */
export const STREAK_TO_REMOVE = 3;

/**
 * 答错：进入错题本；若已在错题本，连续答对计数清零并重新计数。
 */
export const applyWrongAnswer = (
  entry: MistakeEntry | undefined,
  symbolId: number,
  reason: MistakeReason,
  at: string
): MistakeEntry => {
  if (!entry) return createMistakeEntryForm({ symbolId, reason, at });
  return {
    ...entry,
    last_reason: reason,
    wrong_count: entry.wrong_count + 1,
    correct_streak: 0,
    removed: false,
    mastered: false,
    last_wrong_at: at,
    last_practiced_at: at,
    mastery_level: "LEARNING"
  };
};

/**
 * 答对：只有错题本里已有的条目才累计连续答对；
 * 连续答对达到 STREAK_TO_REMOVE 后自动移出。
 */
export const applyCorrectAnswer = (
  entry: MistakeEntry | undefined,
  at: string
): MistakeEntry | undefined => {
  if (!entry || entry.removed) return entry;
  const correct_streak = entry.correct_streak + 1;
  const removed = correct_streak >= STREAK_TO_REMOVE;
  return {
    ...entry,
    correct_streak,
    removed,
    last_practiced_at: at,
    mastery_level: removed ? "MASTERED" : correct_streak >= 2 ? "FAMILIAR" : "LEARNING"
  };
};

/** 手动标记掌握：立即移出错题本 */
export const markMastered = (entry: MistakeEntry, at: string): MistakeEntry => ({
  ...entry,
  mastered: true,
  removed: true,
  correct_streak: STREAK_TO_REMOVE,
  last_practiced_at: at,
  mastery_level: "MASTERED"
});

export const activeMistakes = (entries: MistakeEntry[]): MistakeEntry[] =>
  entries.filter((entry) => !entry.removed && !entry.mastered);

export const removedMistakes = (entries: MistakeEntry[]): MistakeEntry[] =>
  entries.filter((entry) => entry.removed || entry.mastered);
