import { useEffect, useMemo, useRef, useState } from "react";
import { useLessonStore } from "../stores/LessonStore";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { usePracticeSessionStore } from "../stores/PracticeSessionStore";
import { useMistakeStore } from "../stores/MistakeStore";
import { usePracticeSession } from "../hooks/usePracticeSession";
import { activeMistakes, STREAK_TO_REMOVE } from "../services/mistakeService";
import { speakPinyin, type PracticeQuestion } from "../services/practiceEngine";
import { PracticeMode, PracticeModeHint, PracticeModeText } from "../constants/PracticeMode";
import { MISTAKE_REVIEW_LESSON_ID } from "../constants/ReviewSource";
import { BrailleCell } from "../components/common/BrailleCell";
import { StatusBadge } from "../components/common/StatusBadge";
import { LessonProgress } from "../components/common/LessonProgress";
import { PracticePanel } from "../components/common/PracticePanel";
import { ResultBadge } from "../components/common/ResultBadge";
import { StatCard } from "../components/common/StatCard";
import { EmptyState } from "../components/common/EmptyState";
import { formatLatency, formatMistakeReason } from "../utils/formatters";
import type { BrailleSymbol } from "../types/BrailleSymbol";
import type { PracticeSession } from "../types/PracticeSession";
import type { PracticeMode as Mode } from "../constants/PracticeMode";

interface PracticePageProps {
  query: URLSearchParams;
}

const QUESTION_TITLES: Record<Mode, string> = {
  CELL_TO_TEXT: "这个点阵代表什么字符？",
  TEXT_TO_CELL: "选出正确的点阵",
  LISTENING: "听到的是哪个字符？",
  MIXED: "混合训练"
};

const formatDuration = (from: string, to: string) => {
  const ms = Math.max(0, new Date(to).getTime() - new Date(from).getTime());
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return minutes > 0 ? `${minutes} 分 ${seconds} 秒` : `${seconds} 秒`;
};

export function PracticePage({ query }: PracticePageProps) {
  const lessons = useLessonStore((state) => state.rows);
  const symbols = useBrailleSymbolStore((state) => state.rows);
  const sessions = usePracticeSessionStore((state) => state.sessions);
  const mistakes = useMistakeStore((state) => state.entries);
  const {
    activeSession,
    feedback,
    currentQuestion,
    answeredCount,
    totalCount,
    isFinished,
    loading,
    error,
    startSession,
    resumeSession,
    submitAnswer,
    clearFeedback,
    dismissSession,
    abandonSession,
    clearError
  } = usePracticeSession();

  const [lessonId, setLessonId] = useState<number>(() => lessons[0]?.id ?? 1);
  const [mode, setMode] = useState<Mode>("CELL_TO_TEXT");
  const questionStartRef = useRef<number>(Date.now());
  const autoStartRef = useRef(false);

  const lessonSymbols = (id: number): BrailleSymbol[] => {
    const lesson = lessons.find((item) => item.id === id);
    if (!lesson) return [];
    return lesson.symbol_ids
      .map((symbolId) => symbols.find((symbol) => symbol.id === symbolId))
      .filter((symbol): symbol is BrailleSymbol => Boolean(symbol));
  };

  const reviewSymbols = useMemo(() => {
    const active = activeMistakes(mistakes);
    return symbols.filter((symbol) => active.some((entry) => entry.symbol_id === symbol.id));
  }, [symbols, mistakes]);

  // 从学习卡片 / 错题本跳转进来时自动开始一轮练习；
  // 若该课程已有未完成的会话（例如关闭页面后重新打开），优先恢复原顺序继续
  useEffect(() => {
    if (autoStartRef.current || activeSession) return;
    autoStartRef.current = true;
    const findActive = (predicate: (session: PracticeSession) => boolean) =>
      sessions.find((session) => session.status === "ACTIVE" && predicate(session));

    if (query.get("review") === "1") {
      const existing = findActive((session) => session.source === "MISTAKE_REVIEW");
      if (existing) {
        void resumeSession(existing.id);
        return;
      }
      void startSession({
        lessonId: MISTAKE_REVIEW_LESSON_ID,
        mode: "MIXED",
        symbols: reviewSymbols,
        source: "MISTAKE_REVIEW"
      });
      return;
    }
    const lessonParam = query.get("lesson");
    if (lessonParam) {
      const id = Number(lessonParam);
      const existing = findActive((session) => session.lesson_id === id && session.source !== "MISTAKE_REVIEW");
      if (existing) {
        void resumeSession(existing.id);
        return;
      }
      const modeParam = query.get("mode");
      const parsedMode = PracticeMode.includes(modeParam as Mode) ? (modeParam as Mode) : "CELL_TO_TEXT";
      void startSession({ lessonId: id, mode: parsedMode, symbols: lessonSymbols(id) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const questionKey = currentQuestion ? `${currentQuestion.symbol.id}:${currentQuestion.mode}` : "";
  useEffect(() => {
    questionStartRef.current = Date.now();
  }, [questionKey]);

  // 听写题自动播放读音
  useEffect(() => {
    if (!feedback && currentQuestion?.mode === "LISTENING") {
      speakPinyin(currentQuestion.symbol);
    }
  }, [currentQuestion, feedback]);

  // 提交后按 Enter 进入下一题
  useEffect(() => {
    if (!feedback) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") clearFeedback();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [feedback, clearFeedback]);

  const sessionTitle = (session: PracticeSession) =>
    session.source === "MISTAKE_REVIEW"
      ? "错题重练"
      : lessons.find((item) => item.id === session.lesson_id)?.title ?? `课程 ${session.lesson_id}`;

  const handleSelect = (option: BrailleSymbol) => {
    if (!currentQuestion || feedback) return;
    const latencyMs = Date.now() - questionStartRef.current;
    const selectedLabel = currentQuestion.mode === "TEXT_TO_CELL" ? option.cell_pattern : option.letter;
    void submitAnswer({ selectedKey: String(option.id), selectedLabel, question: currentQuestion, latencyMs });
  };

  const handleRestart = () => {
    if (!activeSession) return;
    if (activeSession.source === "MISTAKE_REVIEW") {
      void startSession({
        lessonId: MISTAKE_REVIEW_LESSON_ID,
        mode: activeSession.mode,
        symbols: reviewSymbols,
        source: "MISTAKE_REVIEW"
      });
    } else {
      void startSession({
        lessonId: activeSession.lesson_id,
        mode: activeSession.mode,
        symbols: lessonSymbols(activeSession.lesson_id)
      });
    }
  };

  // ---------- 本轮总结 ----------
  if (activeSession && isFinished && !feedback) {
    return (
      <main className="page">
        <section className="page-head">
          <div>
            <p className="eyebrow">practice</p>
            <h1>{sessionTitle(activeSession)}</h1>
          </div>
          <StatusBadge value={activeSession.status} label="已完成" tone="ok" />
        </section>
        <section className="panel summary-panel">
          <h2>本轮练习完成 🎉</h2>
          {error ? (
            <div className="error-banner" role="alert">
              {error}
              <button className="ghost" onClick={clearError}>知道了</button>
            </div>
          ) : null}
          <div className="metrics four">
            <StatCard label="得分" value={activeSession.score} />
            <StatCard label="答对" value={`${activeSession.correct_count}/${activeSession.answer_count}`} />
            <StatCard label="答错" value={activeSession.mistake_count} hint="答错字符已进入错题本" />
            <StatCard label="用时" value={formatDuration(activeSession.started_at, activeSession.finished_at)} />
          </div>
          <div className="action-row">
            <button className="primary" onClick={handleRestart} disabled={loading}>
              再练一轮
            </button>
            <button className="ghost" onClick={dismissSession}>
              返回课程选择
            </button>
          </div>
        </section>
      </main>
    );
  }

  // ---------- 练习进行中（含答题反馈） ----------
  if (activeSession && (activeSession.status === "ACTIVE" || feedback)) {
    const displayQuestion: PracticeQuestion | null = feedback ? feedback.question : currentQuestion;
    const feedbackEntry = feedback
      ? mistakes.find((entry) => entry.symbol_id === feedback.question.symbol.id)
      : undefined;
    const isLastAnswer = activeSession.queue_index >= totalCount;

    let mistakeNote = "";
    if (feedback) {
      if (!feedback.correct) {
        mistakeNote = `已加入错题本，同一字符连续答对 ${STREAK_TO_REMOVE} 次后自动移出`;
      } else if (feedbackEntry && !feedbackEntry.removed && !feedbackEntry.mastered) {
        mistakeNote = `错题本连对进度 ${feedbackEntry.correct_streak}/${STREAK_TO_REMOVE}`;
      } else if (feedbackEntry?.removed) {
        mistakeNote = "该字符已连续答对 3 次，自动移出错题本 🎉";
      }
    }

    return (
      <main className="page">
        <section className="page-head">
          <div>
            <p className="eyebrow">practice</p>
            <h1>{sessionTitle(activeSession)}</h1>
          </div>
          <div className="head-actions">
            <StatusBadge value={activeSession.mode} label={PracticeModeText[activeSession.mode]} tone="info" />
            <button className="ghost" onClick={() => void abandonSession()}>
              结束本轮
            </button>
          </div>
        </section>

        <LessonProgress
          completed={answeredCount}
          total={totalCount}
          label="答题进度"
          suffix={`已答对 ${activeSession.correct_count} 题`}
        />

        {error ? (
          <div className="error-banner" role="alert">
            {error}
            <button className="ghost" onClick={clearError}>知道了</button>
          </div>
        ) : null}

        {displayQuestion ? (
          <PracticePanel
            title={QUESTION_TITLES[displayQuestion.mode]}
            hint={PracticeModeHint[displayQuestion.mode]}
            actions={<StatusBadge value={displayQuestion.mode} label={PracticeModeText[displayQuestion.mode]} />}
            footer={
              <span>
                第 {Math.min(answeredCount + 1, totalCount)} / {totalCount} 题 · 答错 {activeSession.mistake_count} 题
              </span>
            }
          >
            <div className="question-stimulus">
              {displayQuestion.mode === "CELL_TO_TEXT" ? (
                <BrailleCell pattern={displayQuestion.symbol.cell_pattern} size="lg" label="题目点阵" />
              ) : null}
              {displayQuestion.mode === "TEXT_TO_CELL" ? (
                <div className="stimulus-letter">
                  <strong>{displayQuestion.symbol.letter}</strong>
                  <span>{displayQuestion.symbol.pinyin}</span>
                </div>
              ) : null}
              {displayQuestion.mode === "LISTENING" ? (
                <div className="stimulus-listen">
                  <button className="speaker" onClick={() => speakPinyin(displayQuestion.symbol)}>
                    🔊 播放读音
                  </button>
                  {typeof speechSynthesis === "undefined" ? (
                    <span className="panel-hint">当前浏览器不支持语音，提示拼音：{displayQuestion.symbol.pinyin}</span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className={displayQuestion.mode === "TEXT_TO_CELL" ? "option-grid cells" : "option-grid"}>
              {displayQuestion.options.map((option) => {
                const optionKey = String(option.id);
                const isAnswer = feedback ? String(feedback.question.symbol.id) === optionKey : false;
                const isSelected = feedback ? feedback.selectedKey === optionKey : false;
                const className = [
                  "option",
                  feedback && isAnswer ? "correct" : "",
                  feedback && isSelected && !isAnswer ? "wrong" : ""
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <button
                    key={optionKey}
                    className={className}
                    disabled={Boolean(feedback)}
                    onClick={() => handleSelect(option)}
                  >
                    {displayQuestion.mode === "TEXT_TO_CELL" ? (
                      <BrailleCell pattern={option.cell_pattern} size="md" label={`选项点阵 ${option.cell_pattern}`} />
                    ) : (
                      <>
                        <strong>{option.letter}</strong>
                        <span>{option.pinyin}</span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {feedback ? (
              <div className={`feedback-card ${feedback.correct ? "ok" : "ng"}`}>
                <ResultBadge
                  correct={feedback.correct}
                  detail={feedback.correct ? undefined : formatMistakeReason(feedback.mistakeReason)}
                />
                <div className="feedback-body">
                  <div>
                    <span>你的答案</span>
                    <strong>{feedback.userAnswerLabel}</strong>
                  </div>
                  <div>
                    <span>正确答案</span>
                    <strong>{feedback.correctLabel}</strong>
                    <BrailleCell pattern={feedback.correctPattern} size="sm" label="正确点阵" />
                    <em>{feedback.pinyin}</em>
                  </div>
                  <div>
                    <span>本题用时</span>
                    <strong>{formatLatency(feedback.latencyMs)}</strong>
                  </div>
                </div>
                {mistakeNote ? <p className="feedback-note">{mistakeNote}</p> : null}
                <button className="primary" autoFocus onClick={clearFeedback}>
                  {isLastAnswer ? "查看本轮结果" : "下一题（Enter）"}
                </button>
              </div>
            ) : null}
          </PracticePanel>
        ) : (
          <EmptyState title="题目加载中" />
        )}
      </main>
    );
  }

  // ---------- 课程与题型选择 ----------
  const resumableSessions = sessions.filter((session) => session.status === "ACTIVE");

  return (
    <main className="page">
      <section className="page-head">
        <div>
          <p className="eyebrow">practice</p>
          <h1>练习模式</h1>
        </div>
      </section>

      {error ? (
        <div className="error-banner" role="alert">
          {error}
          <button className="ghost" onClick={clearError}>知道了</button>
        </div>
      ) : null}

      {resumableSessions.length > 0 ? (
        <section className="panel">
          <h2>继续上次练习</h2>
          <p className="panel-hint">上次关闭页面时练习还没有结束，题目顺序和答题进度都已保留。</p>
          <div className="table">
            {resumableSessions.map((session) => (
              <article key={session.id} className="row">
                <strong>{sessionTitle(session)}</strong>
                <span>
                  {PracticeModeText[session.mode]} · 已答 {session.answer_count}/{session.queue_symbol_ids.length} 题
                </span>
                <button className="primary" onClick={() => void resumeSession(session.id)}>
                  继续练习
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="panel">
        <h2>选择课程</h2>
        <div className="lesson-strip">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              className={`lesson-chip ${lesson.id === lessonId ? "active" : ""}`}
              onClick={() => setLessonId(lesson.id)}
            >
              <strong>{lesson.title}</strong>
              <span>
                {lesson.stage} · {lesson.symbol_ids.length} 个字符 · 约 {lesson.estimated_minutes} 分钟
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>选择题型</h2>
        <div className="mode-grid">
          {PracticeMode.map((item) => (
            <button
              key={item}
              className={mode === item ? "mode-card active" : "mode-card"}
              onClick={() => setMode(item)}
            >
              <strong>{PracticeModeText[item]}</strong>
              <span>{PracticeModeHint[item]}</span>
            </button>
          ))}
        </div>
        <button
          className="primary big"
          disabled={loading}
          onClick={() => void startSession({ lessonId, mode, symbols: lessonSymbols(lessonId) })}
        >
          开始练习
        </button>
      </section>
    </main>
  );
}
