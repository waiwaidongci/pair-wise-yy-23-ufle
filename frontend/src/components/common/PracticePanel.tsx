import type { ReactNode } from "react";

interface PracticePanelProps {
  title: string;
  hint?: string;
  actions?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

export function PracticePanel({ title, hint, actions, children, footer }: PracticePanelProps) {
  return (
    <section className="practice-panel">
      <header className="practice-panel-head">
        <div>
          <h3>{title}</h3>
          {hint ? <p className="panel-hint">{hint}</p> : null}
        </div>
        {actions ? <div className="practice-panel-actions">{actions}</div> : null}
      </header>
      <div className="practice-panel-body">{children}</div>
      {footer ? <footer className="practice-panel-foot">{footer}</footer> : null}
    </section>
  );
}
