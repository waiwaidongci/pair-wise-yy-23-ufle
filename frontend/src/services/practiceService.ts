import { listBrailleSymbol } from "../api/BrailleSymbol";
import { listLesson } from "../api/Lesson";
import { listAnswerRecord, saveAnswerRecord } from "../api/AnswerRecord";
import { listPracticeSession, savePracticeSession } from "../api/PracticeSession";
import {
  clearPracticeDraft,
  getActivePracticeDraft,
  savePracticeDraft
} from "../api/PracticeDraft";
import { getReviewQueue } from "./mistakeService";
import { applyAnswerToMistake } from "./mistakeService";
import { gradeAnswer } from "./answerGrading";
import { MISTAKES_LESSON_ID, MISTAKES_LESSON_TITLE } from "../constants/practice";
import { ERROR_CODES } from "../constants/errorCodes";
import type { PracticeDraft, PracticeSource } from "../types/PracticeDraft";
import type { PracticeMode } from "../types/PracticeMode";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { PracticeSession } from "../types/PracticeSession";
import type { AnswerRecord } from "../types/AnswerRecord";
import type { MistakeTransition } from "./mistakeService";
import { createStartedPracticeSession } from "../constructors/PracticeSessionConstructor";
import { createSubmittedAnswerRecord } from "../constructors/AnswerRecordConstructor";
import { createStartedPracticeDraft } from "../constructors/PracticeDraftConstructor";
import { ServiceError, toServiceError } from "../utils/errors";
import { writeLog } from "../utils/logger";
import { nextId, nowIso } from "../utils/id";

export interface StartParams {
  lessonId: number;
  mode: PracticeMode;
  source: PracticeSource;
}

export interface SubmitParams {
  draft: PracticeDraft;
  userAnswer: string;
  latencyMs: number;
}

export interface SubmitResult {
  record: AnswerRecord;
  session: PracticeSession;
  draft: PracticeDraft | null;
  symbol: BrailleSymbol;
  finished: boolean;
  transition: MistakeTransition;
}

/** 取当前未完成的练习草稿（关闭页面后重开仍在） */
export async function loadActiveDraft(): Promise<PracticeDraft | null> {
  try {
    const draft = await getActivePracticeDraft();
    if (draft) writeLog("PracticeDraft", "RESUME", { sessionId: draft.session_id, position: draft.position });
    return draft;
  } catch (err) {
    throw toServiceError(err);
  }
}

/**
 * 从课程选择点字字符开始一轮练习：
 * 队列严格按 lesson.symbol_ids 原顺序；错题重练按错题时间顺序。
 */
export async function startPractice(params: StartParams): Promise<PracticeDraft> {
  try {
    const at = nowIso();
    let queue: number[];
    let lessonTitle: string;
    let lessonId = params.lessonId;

    if (params.source === "MISTAKES") {
      lessonId = MISTAKES_LESSON_ID;
      lessonTitle = MISTAKES_LESSON_TITLE;
      queue = await getReviewQueue();
      if (queue.length === 0) throw new ServiceError(ERROR_CODES.LESSON_EMPTY, "错题本为空");
    } else {
      const lessons = await listLesson();
      const lesson = lessons.find((row) => row.id === lessonId);
      if (!lesson) throw new ServiceError(ERROR_CODES.LESSON_NOT_FOUND, String(lessonId));
      lessonTitle = lesson.title;
      queue = lesson.symbol_ids.filter((id, idx, all) => all.indexOf(id) === idx);
      if (queue.length === 0) throw new ServiceError(ERROR_CODES.LESSON_EMPTY, lessonTitle);
    }

    // 开新轮前清掉旧的未完成草稿与其会话，保证全局只有一轮进行中
    const oldDraft = await getActivePracticeDraft();
    if (oldDraft) await clearPracticeDraft();

    const sessions = await listPracticeSession();
    const session = createStartedPracticeSession(nextId(sessions), lessonId, params.mode, at);
    await savePracticeSession(session);

    const draft = createStartedPracticeDraft({
      sessionId: session.id,
      lessonId,
      lessonTitle,
      source: params.source,
      mode: params.mode,
      queue,
      startedAt: at
    });
    await savePracticeDraft(draft);
    writeLog("PracticeSession", "CREATE", { id: session.id, lessonId, mode: params.mode });
    writeLog("PracticeDraft", "START", { sessionId: session.id, queueLength: queue.length });
    return draft;
  } catch (err) {
    throw toServiceError(err);
  }
}

/** 提交一道答案：判分、落会话/答题记录、更新错题本、推进或结束草稿 */
export async function submitPracticeAnswer(params: SubmitParams): Promise<SubmitResult> {
  try {
    const { draft, userAnswer, latencyMs } = params;
    const symbols = await listBrailleSymbol();
    const symbolId = draft.queue[draft.position];
    const symbol = symbols.find((row) => row.id === symbolId);
    if (!symbol) throw new ServiceError(ERROR_CODES.SYMBOL_NOT_FOUND, String(symbolId));

    const { correct, mistakeReason, resolvedMode } = gradeAnswer({
      symbol,
      mode: draft.mode,
      userAnswer
    });

    const at = nowIso();
    const existingAnswers = await listAnswerRecord();
    const record = createSubmittedAnswerRecord({
      id: nextId(existingAnswers),
      sessionId: draft.session_id,
      symbolId,
      userAnswer,
      correct,
      latencyMs,
      mistakeReason,
      mode: resolvedMode
    });
    await saveAnswerRecord(record);
    writeLog("AnswerRecord", "CREATE", {
      sessionId: draft.session_id,
      symbolId,
      correct
    });

    // 更新会话汇总（会话在提交时就持续保存，关掉页面也查得到）
    const sessions = await listPracticeSession();
    const prevSession = sessions.find((row) => row.id === draft.session_id);
    if (!prevSession) throw new ServiceError(ERROR_CODES.LESSON_NOT_FOUND, String(draft.session_id));
    const answerCount = prevSession.answer_count + 1;
    const correctCount = prevSession.correct_count + (correct ? 1 : 0);
    const mistakeCount = prevSession.mistake_count + (correct ? 0 : 1);
    const finished = answerCount >= draft.queue.length;
    const session: PracticeSession = {
      ...prevSession,
      answer_count: answerCount,
      correct_count: correctCount,
      mistake_count: mistakeCount,
      score: Math.round((correctCount / draft.queue.length) * 100),
      finished_at: finished ? at : null
    };
    await savePracticeSession(session);
    writeLog("PracticeSession", finished ? "FINISH" : "UPDATE", {
      id: session.id,
      score: session.score,
      mistakeCount: session.mistake_count
    });

    // 错题本状态机
    const transition = await applyAnswerToMistake(symbolId, correct, mistakeReason, at);

    // 推进队列或清草稿
    let nextDraft: PracticeDraft | null = null;
    if (finished) {
      await clearPracticeDraft();
      writeLog("PracticeDraft", "CLEAR", { sessionId: draft.session_id });
    } else {
      nextDraft = { ...draft, position: draft.position + 1 };
      await savePracticeDraft(nextDraft);
      writeLog("PracticeDraft", "ADVANCE", {
        position: nextDraft.position + 1,
        total: nextDraft.queue.length
      });
    }

    return { record, session, draft: nextDraft, symbol, finished, transition };
  } catch (err) {
    throw toServiceError(err);
  }
}

/** 放弃当前练习：会话标记结束（按已答题计分），草稿清除 */
export async function abandonPractice(draft: PracticeDraft): Promise<PracticeSession | null> {
  try {
    const sessions = await listPracticeSession();
    const session = sessions.find((row) => row.id === draft.session_id);
    if (session && !session.finished_at) {
      const finishedSession: PracticeSession = {
        ...session,
        finished_at: nowIso(),
        score:
          session.answer_count === 0
            ? 0
            : Math.round((session.correct_count / draft.queue.length) * 100)
      };
      await savePracticeSession(finishedSession);
    }
    await clearPracticeDraft();
    writeLog("PracticeDraft", "ABANDON", { sessionId: draft.session_id });
    return session ?? null;
  } catch (err) {
    throw toServiceError(err);
  }
}
