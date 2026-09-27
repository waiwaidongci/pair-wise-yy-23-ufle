import type { AnswerRecord } from "../types/AnswerRecord";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { Lesson } from "../types/Lesson";
import type { MistakeEntry } from "../types/MistakeEntry";
import type { PracticeSession } from "../types/PracticeSession";
import type { DifficultyLevel } from "../constants/DifficultyLevel";
import type { MasteryLevel } from "../constants/MasteryLevel";
import { DifficultyLevel as DifficultyLevels } from "../constants/DifficultyLevel";

export interface TrendPoint {
  sessionId: string;
  date: string;
  accuracy: number;
  score: number;
}

export interface LessonStats {
  lesson: Lesson;
  /** 完成次数（已结束的会话数） */
  completions: number;
  /** 进行中轮数 */
  activeRounds: number;
  answerCount: number;
  correctCount: number;
  accuracy: number;
  /** 最近趋势（按时间排序，旧 -> 新） */
  trend: TrendPoint[];
  /** 最近一次与上一次正确率差值 */
  trendDelta: number;
  lastPracticedAt: string;
}

export const computeLessonStats = (
  lessons: Lesson[],
  sessions: PracticeSession[],
  answers: AnswerRecord[]
): LessonStats[] => {
  const answersBySession = new Map<string, AnswerRecord[]>();
  for (const answer of answers) {
    const list = answersBySession.get(answer.session_id) ?? [];
    list.push(answer);
    answersBySession.set(answer.session_id, list);
  }

  return lessons.map((lesson) => {
    const lessonSessions = sessions
      .filter((session) => session.lesson_id === lesson.id)
      .sort((a, b) => a.started_at.localeCompare(b.started_at));
    // 完成次数只统计正常结束的会话；中途放弃的轮次仍计入答题与趋势
    const finished = lessonSessions.filter((session) => session.status === "FINISHED");
    const closed = lessonSessions.filter((session) => session.status !== "ACTIVE");

    let answerCount = 0;
    let correctCount = 0;
    const trend: TrendPoint[] = [];

    for (const session of closed) {
      const sessionAnswers = answersBySession.get(session.id) ?? [];
      answerCount += sessionAnswers.length;
      correctCount += sessionAnswers.filter((answer) => answer.correct).length;
      if (sessionAnswers.length > 0) {
        trend.push({
          sessionId: session.id,
          date: session.finished_at || session.started_at,
          accuracy: sessionAnswers.filter((answer) => answer.correct).length / sessionAnswers.length,
          score: session.score
        });
      }
    }

    const last = trend[trend.length - 1];
    const prev = trend[trend.length - 2];

    return {
      lesson,
      completions: finished.length,
      activeRounds: lessonSessions.length - closed.length,
      answerCount,
      correctCount,
      accuracy: answerCount > 0 ? correctCount / answerCount : 0,
      trend,
      trendDelta: last && prev ? last.accuracy - prev.accuracy : Number.NaN,
      lastPracticedAt: lessonSessions.length > 0 ? lessonSessions[lessonSessions.length - 1].started_at : ""
    };
  });
};

export interface DifficultySlice {
  difficulty: DifficultyLevel;
  total: number;
  correct: number;
  accuracy: number;
}

export const computeDifficultyDistribution = (
  answers: AnswerRecord[],
  symbols: BrailleSymbol[]
): DifficultySlice[] => {
  const symbolById = new Map(symbols.map((symbol) => [symbol.id, symbol]));
  return DifficultyLevels.map((difficulty) => {
    const slice = answers.filter((answer) => symbolById.get(answer.symbol_id)?.difficulty === difficulty);
    const correct = slice.filter((answer) => answer.correct).length;
    return {
      difficulty,
      total: slice.length,
      correct,
      accuracy: slice.length > 0 ? correct / slice.length : 0
    };
  });
};

/** 按字符统计掌握度：无记录 NEW，答错过 LEARNING，连续答对>=2 FAMILIAR，错题本已移出 MASTERED */
export const computeSymbolMastery = (
  symbols: BrailleSymbol[],
  answers: AnswerRecord[],
  mistakes: MistakeEntry[]
): Map<number, MasteryLevel> => {
  const mistakeBySymbol = new Map(mistakes.map((entry) => [entry.symbol_id, entry]));
  const result = new Map<number, MasteryLevel>();

  for (const symbol of symbols) {
    const entry = mistakeBySymbol.get(symbol.id);
    if (entry && (entry.removed || entry.mastered)) {
      result.set(symbol.id, "MASTERED");
      continue;
    }
    if (entry && !entry.removed) {
      result.set(symbol.id, entry.correct_streak >= 2 ? "FAMILIAR" : "LEARNING");
      continue;
    }
    const symbolAnswers = answers.filter((answer) => answer.symbol_id === symbol.id);
    if (symbolAnswers.length === 0) {
      result.set(symbol.id, "NEW");
      continue;
    }
    const correct = symbolAnswers.filter((answer) => answer.correct).length;
    result.set(symbol.id, correct / symbolAnswers.length >= 0.8 ? "FAMILIAR" : "LEARNING");
  }
  return result;
};

export const computeMasteryCounts = (
  symbols: BrailleSymbol[],
  answers: AnswerRecord[],
  mistakes: MistakeEntry[]
): Record<MasteryLevel, number> => {
  const mastery = computeSymbolMastery(symbols, answers, mistakes);
  const counts: Record<MasteryLevel, number> = { NEW: 0, LEARNING: 0, FAMILIAR: 0, MASTERED: 0 };
  for (const level of mastery.values()) counts[level] += 1;
  return counts;
};
