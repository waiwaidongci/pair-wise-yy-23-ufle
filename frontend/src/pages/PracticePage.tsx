import { useEffect, useState } from "react";
import { useLessonStore } from "../stores/LessonStore";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useMistakeStore } from "../stores/MistakeStore";
import { usePracticeStore } from "../stores/PracticeStore";
import { useIndexedDbStore } from "../hooks/useIndexedDbStore";
import { usePracticeSession } from "../hooks/usePracticeSession";
import { PracticePanel } from "../components/common/PracticePanel";
import { EmptyState } from "../components/common/EmptyState";
import { StatusBadge } from "../components/common/StatusBadge";
import { LessonPicker } from "./practice/LessonPicker";
import { FeedbackStage, QuestionStage } from "./practice/PracticeStages";
import { SessionSummary } from "./practice/SessionSummary";
import { stopSpeaking } from "../utils/speech";
import type { PracticeMode } from "../types/PracticeMode";

export function PracticePage() {
  const lessons = useLessonStore((s) => s.rows);
  const lessonStore = useLessonStore();
  const symbols = useBrailleSymbolStore((s) => s.rows);
  const symbolStore = useBrailleSymbolStore();
  const mistakes = useMistakeStore((s) => s.rows);
  const mistakeStore = useMistakeStore();

  const draft = usePracticeStore((s) => s.draft);
  const feedback = usePracticeStore((s) => s.feedback);
  const lastSession = usePracticeStore((s) => s.lastSession);
  const error = usePracticeStore((s) => s.error);
  const submitting = usePracticeStore((s) => s.submitting);
  const starting = usePracticeStore((s) => s.starting);
  const begin = usePracticeStore((s) => s.begin);
  const submit = usePracticeStore((s) => s.submit);
  const dismissFeedback = usePracticeStore((s) => s.dismissFeedback);
  const quit = usePracticeStore((s) => s.quit);
  const bootstrap = usePracticeStore((s) => s.bootstrap);
  const clearError = usePracticeStore((s) => s.clearError);
  const round = usePracticeStore((s) => s.round);
  const finishedContext = usePracticeStore((s) => s.finishedContext);

  const { ready, error: loadError } = useIndexedDbStore([symbolStore, lessonStore, mistakeStore]);
  const { question } = usePracticeSession();

  const [activeLesson, setActiveLesson] = useState(1);
  const [mode, setMode] = useState<PracticeMode>("CELL_TO_TEXT");
  const [selected, setSelected] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // 进入页面即恢复 IndexedDB 中未完成的草稿（保持原练习顺序）
  useEffect(() => {
    void bootstrap();
    return () => stopSpeaking();
  }, [bootstrap]);

  useEffect(() => {
    if (!draft) setShowSummary(false);
  }, [draft]);

  if (!ready) {
    return <section className="page-panel"><EmptyState title="正在加载本地数据…" /></section>;
  }
  if (loadError) {
    return <section className="page-panel"><EmptyState title="数据加载失败" hint={loadError} /></section>;
  }

  const activeMistakeCount = mistakes.filter((row) => row.in_book).length;

  // 刚答完最后一题：显示成绩小结
  if (showSummary && lastSession) {
    return (
      <div className="page-stack">
        <SessionSummary
          session={lastSession}
          mistakeCount={activeMistakeCount}
          onBackToPicker={() => setShowSummary(false)}
          onReviewMistakes={() => {
            setShowSummary(false);
            void begin(0, "CELL_TO_TEXT", "MISTAKES");
          }}
        />
      </div>
    );
  }

  // 没有进行中的草稿，但最后一题反馈还在：先展示反馈，再进入小结
  if (!draft && feedback && finishedContext) {
    return (
      <div className="page-stack">
        <PracticePanel
          mode={finishedContext.mode}
          lessonTitle={finishedContext.lessonTitle}
          source={finishedContext.source}
          position={finishedContext.total}
          total={finishedContext.total}
          mistakeCount={finishedContext.wrong}
        >
          <FeedbackStage
            feedback={feedback}
            nextLabel="查看本轮成绩"
            onNext={() => {
              setSelected(null);
              dismissFeedback();
              setShowSummary(true);
            }}
          />
        </PracticePanel>
      </div>
    );
  }

  // 没有进行中的草稿：从课程选择点字字符开始一轮练习
  if (!draft) {
    return (
      <div className="page-stack">
        <header className="page-header">
          <div>
            <p className="eyebrow">PRACTICE · 练习模式</p>
            <h1>从课程开始一轮练习</h1>
            <p className="page-subtitle">
              提交答案后立刻显示对错；会话与每道答题记录都会保存到本地 IndexedDB。
            </p>
          </div>
          <StatusBadge tone="warning" label={`错题本 ${activeMistakeCount} 个`} />
        </header>
        {error && (
          <div className="inline-error">
            <span>{error}</span>
            <button type="button" className="link-btn" onClick={clearError}>知道了</button>
          </div>
        )}
        <LessonPicker
          lessons={lessons}
          activeLesson={activeLesson}
          mode={mode}
          starting={starting}
          mistakeCount={activeMistakeCount}
          onSelectLesson={setActiveLesson}
          onChangeMode={setMode}
          onStart={() => void begin(activeLesson, mode, "LESSON")}
          onStartMistakes={() => void begin(0, "CELL_TO_TEXT", "MISTAKES")}
        />
      </div>
    );
  }

  // 进行中的一轮：题面或即时反馈
  const currentSymbolId = draft.queue[draft.position];
  return (
    <div className="page-stack">
      <PracticePanel
        mode={draft.mode}
        lessonTitle={draft.lesson_title}
        source={draft.source}
        position={Math.min(draft.position + (feedback ? 1 : 0), draft.queue.length)}
        total={draft.queue.length}
        mistakeCount={round.wrong}
        headerExtra={
          <button type="button" className="ghost-btn danger" onClick={() => void quit()}>
            放弃本轮
          </button>
        }
        footer={
          <div className="practice-footer-tip">
            <span>第 {draft.position + 1} / {draft.queue.length} 题 · 字符 id {currentSymbolId}</span>
            <span>队列顺序已本地保存，刷新或关闭页面后可继续</span>
          </div>
        }
      >
        {error && (
          <div className="inline-error">
            <span>{error}</span>
            <button type="button" className="link-btn" onClick={clearError}>知道了</button>
          </div>
        )}
        {feedback ? (
          <FeedbackStage
            feedback={feedback}
            nextLabel={draft.position >= draft.queue.length ? "查看本轮成绩" : "下一题"}
            onNext={() => {
              const done = draft.position >= draft.queue.length;
              setSelected(null);
              dismissFeedback();
              if (done) setShowSummary(true);
            }}
          />
        ) : question ? (
          <QuestionStage
            key={`${draft.session_id}-${draft.position}`}
            question={question}
            selected={selected}
            disabled={submitting}
            onSelect={(value) => {
              if (submitting) return;
              setSelected(value);
              void submit(value);
            }}
          />
        ) : (
          <EmptyState title="题目解析失败" hint="本地字符数据可能缺失。" />
        )}
      </PracticePanel>
    </div>
  );
}
