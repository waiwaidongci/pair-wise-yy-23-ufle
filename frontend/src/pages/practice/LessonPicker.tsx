import { StatusBadge } from "../../components/common/StatusBadge";
import { LessonProgress } from "../../components/common/LessonProgress";
import { PracticeModeOptions, PracticeModeShortText, PracticeModeText } from "../../constants/PracticeMode";
import type { Lesson } from "../../types/Lesson";
import type { PracticeMode } from "../../types/PracticeMode";

/** 课程选择点字字符的入口面板 */
export function LessonPicker({
  lessons,
  activeLesson,
  mode,
  starting,
  mistakeCount,
  onSelectLesson,
  onChangeMode,
  onStart,
  onStartMistakes
}: {
  lessons: Lesson[];
  activeLesson: number;
  mode: PracticeMode;
  starting: boolean;
  mistakeCount: number;
  onSelectLesson: (id: number) => void;
  onChangeMode: (mode: PracticeMode) => void;
  onStart: () => void;
  onStartMistakes: () => void;
}) {
  const lesson = lessons.find((row) => row.id === activeLesson);

  return (
    <div className="lesson-picker">
      <section className="panel">
        <h2>1. 选择课程</h2>
        <p className="page-subtitle">练习队列按课程内字符顺序生成，关闭页面再打开仍会保留。</p>
        <div className="lesson-list">
          {lessons.map((row) => (
            <button
              type="button"
              key={row.id}
              className={`lesson-item ${activeLesson === row.id ? "active" : ""}`}
              onClick={() => onSelectLesson(row.id)}
            >
              <div className="lesson-item-main">
                <strong>{row.title}</strong>
                <span>{row.symbol_ids.length} 个字符 · 约 {row.estimated_minutes} 分钟</span>
              </div>
              <StatusBadge tone={activeLesson === row.id ? "success" : "neutral"} label={row.stage} />
            </button>
          ))}
        </div>
        {lesson && (
          <div className="lesson-preview">
            <LessonProgress value={0} max={lesson.symbol_ids.length} label="字符数量" tone="warning" />
            <p className="page-subtitle">解锁规则：{lesson.unlock_rule}</p>
          </div>
        )}
      </section>

      <section className="panel">
        <h2>2. 选择练习模式</h2>
        <div className="mode-list">
          {PracticeModeOptions.map((value) => (
            <button
              type="button"
              key={value}
              className={`mode-item ${mode === value ? "active" : ""}`}
              onClick={() => onChangeMode(value)}
            >
              <strong>{PracticeModeText[value]}</strong>
              <StatusBadge tone={mode === value ? "success" : "neutral"} label={PracticeModeShortText[value]} />
            </button>
          ))}
        </div>
        <div className="picker-actions">
          <button type="button" className="primary-btn big" disabled={starting || !lesson} onClick={onStart}>
            {starting ? "正在开始…" : `开始练习（${lesson?.symbol_ids.length ?? 0} 题）`}
          </button>
          <button
            type="button"
            className="ghost-btn"
            disabled={starting || mistakeCount === 0}
            onClick={onStartMistakes}
            title={mistakeCount === 0 ? "错题本为空时无法重练" : "只练错题本中的字符"}
          >
            错题重练{mistakeCount > 0 ? `（${mistakeCount} 个字符）` : "（错题本为空）"}
          </button>
        </div>
      </section>
    </div>
  );
}
