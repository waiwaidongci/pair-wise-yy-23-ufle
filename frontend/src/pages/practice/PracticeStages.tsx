import { useEffect } from "react";
import type { ReactNode } from "react";
import { BrailleCell } from "../../components/common/BrailleCell";
import { ResultBadge } from "../../components/common/ResultBadge";
import { StatusBadge } from "../../components/common/StatusBadge";
import { SymbolCategoryText } from "../../constants/SymbolCategory";
import { MistakeReasonText } from "../../constants/mistakeReasons";
import { formatDots } from "../../utils/formatters";
import { speakHint } from "../../utils/speech";
import type { PracticeQuestion } from "../../services/questionService";
import type { AnswerFeedback } from "../../stores/PracticeStore";

/** 题面：根据模式渲染"看点阵选字符 / 看字符选点阵 / 听写" */
export function QuestionStage({
  question,
  selected,
  disabled,
  onSelect
}: {
  question: PracticeQuestion;
  selected: string | null;
  disabled: boolean;
  onSelect: (value: string) => void;
}) {
  const { symbol, mode } = question;

  // 听写题一出现自动播放一次读音
  useEffect(() => {
    if (mode === "LISTENING") {
      const t = window.setTimeout(() => speakHint(symbol.pinyin), 250);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [mode, symbol.pinyin]);

  if (mode === "LISTENING") {
    return (
      <div className="question-stage">
        <div className="question-prompt">
          <StatusBadge tone="info" label="听写练习" />
          <p className="question-hint">听读音，选择对应的字符（可重复播放）</p>
        </div>
        <button type="button" className="listen-btn" onClick={() => speakHint(symbol.pinyin)}>
          <span className="listen-icon" aria-hidden>🔊</span>
          播放读音
        </button>
        <ChoiceGrid
          options={question.textOptions}
          selected={selected}
          disabled={disabled}
          onSelect={onSelect}
          renderOption={(option) => <span className="choice-letter">{option}</span>}
        />
      </div>
    );
  }

  if (mode === "TEXT_TO_CELL") {
    return (
      <div className="question-stage">
        <div className="question-prompt">
          <StatusBadge tone="info" label="看字符选点阵" />
          <p className="question-hint">下面这个字符对应的盲文点阵是？</p>
        </div>
        <div className="question-symbol">{symbol.letter}</div>
        <ChoiceGrid
          options={question.cellOptions}
          selected={selected}
          disabled={disabled}
          onSelect={onSelect}
          renderOption={(option) => <BrailleCell dots={option} size="small" />}
        />
      </div>
    );
  }

  return (
    <div className="question-stage">
      <div className="question-prompt">
        <StatusBadge tone="info" label="看点阵选字符" />
        <p className="question-hint">识别下列点阵对应的{SymbolCategoryText[symbol.category]}</p>
      </div>
      <BrailleCell dots={symbol.cell_pattern} size="large" />
      <ChoiceGrid
        options={question.textOptions}
        selected={selected}
        disabled={disabled}
        onSelect={onSelect}
        renderOption={(option) => <span className="choice-letter">{option}</span>}
      />
    </div>
  );
}

function ChoiceGrid<T extends string>({
  options,
  selected,
  disabled,
  onSelect,
  renderOption
}: {
  options: T[];
  selected: string | null;
  disabled: boolean;
  onSelect: (value: T) => void;
  renderOption: (option: T) => ReactNode;
}) {
  return (
    <div className={`choice-grid ${options.some((o) => o.includes(",")) ? "choice-grid-cells" : ""}`}>
      {options.map((option) => (
        <button
          type="button"
          key={option}
          className={`choice-option ${selected === option ? "selected" : ""}`}
          disabled={disabled}
          onClick={() => onSelect(option)}
        >
          {renderOption(option)}
        </button>
      ))}
    </div>
  );
}

/** 提交后立刻展示的结果区 */
export function FeedbackStage({
  feedback,
  onNext,
  nextLabel
}: {
  feedback: AnswerFeedback;
  onNext: () => void;
  nextLabel: string;
}) {
  const { record, symbol } = feedback;
  const correct = record.correct;
  return (
    <div className={`feedback-stage ${correct ? "is-correct" : "is-wrong"}`}>
      <div className="feedback-head">
        <ResultBadge correct={correct} reasonText={record.mistake_reason ? MistakeReasonText[record.mistake_reason] : undefined} />
        {feedback.addedToMistakes && <StatusBadge tone="warning" label="已加入错题本" />}
        {feedback.streakReset && <StatusBadge tone="danger" label="再错一次，连续答对计数清零" />}
        {feedback.removedFromMistakes && <StatusBadge tone="success" label="连续答对 3 次，已移出错题本" />}
      </div>
      <div className="feedback-body">
        <BrailleCell dots={symbol.cell_pattern} size="large" />
        <dl className="feedback-detail">
          <div>
            <dt>正确答案</dt>
            <dd className="feedback-answer">
              {feedback.correctText.includes(",") ? formatDots(feedback.correctText) : feedback.correctText}
            </dd>
          </div>
          <div>
            <dt>你的回答</dt>
            <dd className={correct ? "text-correct" : "text-wrong"}>
              {record.user_answer.includes(",") ? formatDots(record.user_answer) : record.user_answer || "（未作答）"}
            </dd>
          </div>
          <div>
            <dt>字符解释</dt>
            <dd>{symbol.pinyin}</dd>
          </div>
          <div>
            <dt>本题用时</dt>
            <dd>{record.latency_ms < 1000 ? `${record.latency_ms} ms` : `${(record.latency_ms / 1000).toFixed(1)} s`}</dd>
          </div>
        </dl>
      </div>
      <div className="feedback-actions">
        <button type="button" className="primary-btn" onClick={onNext}>
          {nextLabel}
        </button>
      </div>
    </div>
  );
}
