import { getMistakeState, listMistakeState, saveMistakeState } from "../api/MistakeState";
import { MASTERY_STREAK_THRESHOLD } from "../constants/practice";
import { ERROR_CODES } from "../constants/errorCodes";
import type { MistakeState } from "../types/MistakeState";
import {
  createBookedMistakeState,
  createDefaultMistakeState
} from "../constructors/MistakeStateConstructor";
import { ServiceError, toServiceError } from "../utils/errors";
import { writeLog } from "../utils/logger";
import { nowIso } from "../utils/id";
import type { MistakeReason } from "../types/MistakeReason";

export interface MistakeTransition {
  state: MistakeState;
  /** 本次答对后是否刚好达标移出错题本 */
  removed: boolean;
  /** 本次是否中途再错导致计数清零 */
  streakReset: boolean;
  /** 是否首次进入错题本 */
  newlyAdded: boolean;
}

/**
 * 错题本核心规则：
 * - 答错：直接进入错题本，连续答对计数立即归零（无论之前是几）；
 * - 答对且在错题本：计数 +1，达到 MASTERY_STREAK_THRESHOLD 才移出。
 */
export async function applyAnswerToMistake(
  symbolId: number,
  correct: boolean,
  reason: MistakeReason | "",
  at: string = nowIso()
): Promise<MistakeTransition> {
  try {
    const prev = (await getMistakeState(symbolId)) ?? createDefaultMistakeState({ symbol_id: symbolId });
    let next: MistakeState = {
      ...prev,
      last_practiced_at: at,
      updated_at: at
    };
    let removed = false;
    let streakReset = false;
    let newlyAdded = false;

    if (!correct) {
      if (!next.in_book && next.total_wrong === 0) newlyAdded = true;
      next.in_book = true;
      // 中途再错，从零计数
      streakReset = next.correct_streak > 0;
      next.correct_streak = 0;
      next.total_wrong += 1;
      next.last_wrong_at = at;
      await saveMistakeState(next);
      writeLog("MistakeState", newlyAdded ? "ADD" : "RESET", {
        symbolId,
        reason
      });
      return { state: next, removed, streakReset, newlyAdded };
    }

    next.total_correct += 1;
    if (next.in_book) {
      next.correct_streak += 1;
      if (next.correct_streak >= MASTERY_STREAK_THRESHOLD) {
        next.in_book = false;
        removed = true;
        await saveMistakeState(next);
        writeLog("MistakeState", "REMOVE", { symbolId });
      } else {
        await saveMistakeState(next);
        writeLog("MistakeState", "STREAK", { symbolId, streak: next.correct_streak });
      }
    } else {
      await saveMistakeState(next);
    }
    return { state: next, removed, streakReset, newlyAdded };
  } catch (err) {
    throw toServiceError(err);
  }
}

/** 错题重练队列：仍在错题本中的字符，错得最久的排最前 */
export async function getReviewQueue(): Promise<number[]> {
  const rows = await listMistakeState();
  return rows
    .filter((row) => row.in_book)
    .sort((a, b) => (a.last_wrong_at ?? "").localeCompare(b.last_wrong_at ?? ""))
    .map((row) => row.symbol_id);
}

/** 手动标记掌握：直接达标移出错题本 */
export async function markSymbolMastered(symbolId: number): Promise<MistakeState> {
  try {
    const prev = await getMistakeState(symbolId);
    if (!prev || !prev.in_book) {
      throw new ServiceError(ERROR_CODES.MISTAKE_NOT_IN_BOOK, String(symbolId));
    }
    const at = nowIso();
    const next: MistakeState = {
      ...prev,
      in_book: false,
      correct_streak: MASTERY_STREAK_THRESHOLD,
      last_practiced_at: at,
      updated_at: at
    };
    await saveMistakeState(next);
    writeLog("MistakeState", "MASTERED", { symbolId });
    return next;
  } catch (err) {
    throw toServiceError(err);
  }
}

export { createBookedMistakeState };
