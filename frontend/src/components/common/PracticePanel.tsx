import type { ReactNode } from "react";
import { LessonProgress } from "./LessonProgress";
import { StatusBadge } from "./StatusBadge";
import { PracticeModeText } from "../../constants/PracticeMode";
import type { PracticeMode } from "../../types/PracticeMode";

/**
 * 练习面板容器：展示模式、队列进度、题面和操作区。
 * 题面/选项通过 children 注入，保证练习模式页逻辑不写死在组件里。
 */
export function PracticePanel({
  mode,
  lessonTitle,
  source,
  position,
  total,
  mistakeCount = 0,
  headerExtra,
  children,
  footer
}: {
  mode: PracticeMode;
  lessonTitle: string;
  source?: "LESSON" | "MISTAKES";
  position: number;
  total: number;
  mistakeCount?: number;
  headerExtra?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="panel practice-panel">
      <header className="practice-panel-head">
        <div>
          <h2>{lessonTitle}</h2>
          <div className="practice-panel-tags">
            <StatusBadge tone="info" label={PracticeModeText[mode]} />
            {source === "MISTAKES" && <StatusBadge tone="warning" label="错题重练" />}
            {mistakeCount > 0 && <StatusBadge tone="danger" label={`本轮错题 ${mistakeCount}`} />}
          </div>
        </div>
        {headerExtra}
      </header>
      <LessonProgress value={position} max={total} label="练习进度" tone="info" />
      <div className="practice-panel-body">{children}</div>
      {footer && <footer className="practice-panel-footer">{footer}</footer>}
    </div>
  );
}
