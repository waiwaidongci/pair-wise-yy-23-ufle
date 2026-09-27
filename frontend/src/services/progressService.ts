import { listAnswerRecord } from "../api/AnswerRecord";
import { listLesson } from "../api/Lesson";
import { listPracticeSession } from "../api/PracticeSession";
import { listBrailleSymbol } from "../api/BrailleSymbol";
import { listMistakeState } from "../api/MistakeState";
import { MISTAKES_LESSON_ID } from "../constants/practice";
import type { PracticeSession } from "../types/PracticeSession";
import type { AnswerRecord } from "../types/AnswerRecord";
import type { MasteryLevel } from "../types/MasteryLevel";
import type { SymbolCategory } from "../types/SymbolCategory";
import type { MistakeReason } from "../types/MistakeReason";

export interface LessonProgressStat {
  lessonId: number;
  title: string;
  stage: string;
  symbolCount: number;
  /** 完成次数：已结束的会话数 */
  completionCount: number;
  answerCount: number;
  correctCount: number;
  accuracy: number;
  /** 最近 5 次完成会话的正确率趋势（时间正序） */
  trend: number[];
  lastFinishedAt: string | null;
}

export interface MistakeSummary {
  totalInBook: number;
  byReason: { reason: MistakeReason; count: number }[];
}

export interface ProgressOverview {
  lessonStats: LessonProgressStat[];
  overall: {
    sessions: number;
    completed: number;
    answerCount: number;
    correctCount: number;
    accuracy: number;
    averageLatencyMs: number;
    mistakesInBook: number;
  };
  recentSessions: PracticeSession[];
  difficultyDistribution: { level: MasteryLevel; total: number; practiced: number }[];
  categoryAccuracy: { category: SymbolCategory; answerCount: number; accuracy: number }[];
  mistakeSummary: MistakeSummary;
}

/** 学习进度按课程聚合：完成次数、正确率、最近趋势 */
export async function getProgressOverview(): Promise<ProgressOverview> {
  const [lessons, sessions, answers, symbols, mistakeRows] = await Promise.all([
    listLesson(),
    listPracticeSession(),
    listAnswerRecord(),
    listBrailleSymbol(),
    listMistakeState()
  ]);

  const completed = sessions.filter((s) => s.finished_at !== null);

  const lessonStats: LessonProgressStat[] = lessons.map((lesson) => {
    const lessonSessions = sessions.filter(
      (s) => s.lesson_id === lesson.id && s.lesson_id !== MISTAKES_LESSON_ID
    );
    const completedSessions = completed
      .filter((s) => s.lesson_id === lesson.id)
      .sort((a, b) => (a.finished_at ?? "").localeCompare(b.finished_at ?? ""));
    const lessonSessionIds = new Set(lessonSessions.map((s) => s.id));
    const lessonAnswers = answers.filter((a) => lessonSessionIds.has(a.session_id));
    const correctCount = lessonAnswers.filter((a) => a.correct).length;
    return {
      lessonId: lesson.id,
      title: lesson.title,
      stage: lesson.stage,
      symbolCount: lesson.symbol_ids.length,
      completionCount: completedSessions.length,
      answerCount: lessonAnswers.length,
      correctCount,
      accuracy: lessonAnswers.length === 0 ? 0 : correctCount / lessonAnswers.length,
      trend: completedSessions.slice(-5).map((s) => s.score / 100),
      lastFinishedAt: completedSessions.length
        ? completedSessions[completedSessions.length - 1].finished_at
        : null
    };
  });

  const latencyValues = answers.map((a) => a.latency_ms).filter((ms) => ms > 0);
  const overallCorrect = answers.filter((a) => a.correct).length;

  // 难度分布：各档字符总数与被练习过的数量
  const levels: MasteryLevel[] = ["NEW", "LEARNING", "FAMILIAR", "MASTERED"];
  const practicedSymbolIds = new Set(answers.map((a) => a.symbol_id));
  const difficultyDistribution = levels.map((level) => ({
    level,
    total: symbols.filter((s) => s.difficulty === level).length,
    practiced: symbols.filter((s) => s.difficulty === level && practicedSymbolIds.has(s.id)).length
  }));

  // 分类正确率
  const symbolById = new Map(symbols.map((s) => [s.id, s]));
  const categories: SymbolCategory[] = ["LETTER", "NUMBER", "PUNCTUATION", "CONTRACTION"];
  const categoryAccuracy = categories.map((category) => {
    const ids = new Set(symbols.filter((s) => s.category === category).map((s) => s.id));
    const rows = answers.filter((a) => ids.has(a.symbol_id));
    const hit = rows.filter((a) => a.correct).length;
    return {
      category,
      answerCount: rows.length,
      accuracy: rows.length === 0 ? 0 : hit / rows.length
    };
  });

  // 错题原因归类（统计仍在错题本中的字符最近一次错误原因）
  const activeMistakes = mistakeRows.filter((m) => m.in_book);
  const reasonOf = new Map<number, MistakeReason>();
  for (const answer of [...answers].sort((a, b) => b.id - a.id)) {
    if (!answer.correct && answer.mistake_reason && !reasonOf.has(answer.symbol_id)) {
      reasonOf.set(answer.symbol_id, answer.mistake_reason);
    }
  }
  const reasonCounts = new Map<MistakeReason, number>();
  activeMistakes.forEach((m) => {
    const reason = reasonOf.get(m.symbol_id);
    if (reason) reasonCounts.set(reason, (reasonCounts.get(reason) ?? 0) + 1);
  });
  const byReason = (["POINT_MISREAD", "REVERSED_DOT", "CATEGORY_MIXED", "LISTENING_MISS"] as MistakeReason[]).map(
    (reason) => ({ reason, count: reasonCounts.get(reason) ?? 0 })
  );

  return {
    lessonStats,
    overall: {
      sessions: sessions.length,
      completed: completed.length,
      answerCount: answers.length,
      correctCount: overallCorrect,
      accuracy: answers.length === 0 ? 0 : overallCorrect / answers.length,
      averageLatencyMs:
        latencyValues.length === 0
          ? 0
          : Math.round(latencyValues.reduce((sum, v) => sum + v, 0) / latencyValues.length),
      mistakesInBook: activeMistakes.length
    },
    recentSessions: sessions.slice(0, 8),
    difficultyDistribution,
    categoryAccuracy,
    mistakeSummary: { totalInBook: activeMistakes.length, byReason }
  };
}

export function sessionLessonTitle(session: PracticeSession, lessonTitleById: Map<number, string>): string {
  return lessonTitleById.get(session.lesson_id) ?? "错题重练";
}

export type { AnswerRecord };
