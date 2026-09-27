import { useMemo, useState, type ReactNode } from "react";
import { useBrailleSymbolStore } from "../stores/BrailleSymbolStore";
import { useLessonStore } from "../stores/LessonStore";
import { useIndexedDbStore } from "../hooks/useIndexedDbStore";
import { useBraillePattern } from "../hooks/useBraillePattern";
import { SymbolCard } from "../components/common/SymbolCard";
import { StatCard } from "../components/common/StatCard";
import { EmptyState } from "../components/common/EmptyState";
import { StatusBadge } from "../components/common/StatusBadge";
import { LessonProgress } from "../components/common/LessonProgress";
import { SymbolCategoryOptions, SymbolCategoryText } from "../constants/SymbolCategory";
import { MasteryLevelOptions, MasteryLevelText } from "../constants/MasteryLevel";
import type { MasteryLevel } from "../types/MasteryLevel";
import type { SymbolCategory } from "../types/SymbolCategory";

type CategoryFilter = SymbolCategory | "ALL";
type DifficultyFilter = MasteryLevel | "ALL";

export function LearnPage() {
  const symbols = useBrailleSymbolStore((s) => s.rows);
  const symbolStore = useBrailleSymbolStore();
  const lessons = useLessonStore((s) => s.rows);
  const lessonStore = useLessonStore();
  const { ready, error } = useIndexedDbStore([symbolStore, lessonStore]);

  const [category, setCategory] = useState<CategoryFilter>("ALL");
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("ALL");
  const [keyword, setKeyword] = useState("");
  const [activeLesson, setActiveLesson] = useState<number | "ALL">("ALL");

  const { models, filtered } = useBraillePattern(symbols, { category, difficulty, keyword });

  const visibleModels = useMemo(() => {
    if (activeLesson === "ALL") return models;
    const lesson = lessons.find((row) => row.id === activeLesson);
    if (!lesson) return models;
    const ids = new Set(lesson.symbol_ids);
    return models.filter((model) => ids.has(model.symbol.id));
  }, [models, activeLesson, lessons]);

  if (!ready) {
    return <section className="page-panel"><EmptyState title="正在加载本地点字数据…" /></section>;
  }
  if (error) {
    return <section className="page-panel"><EmptyState title="数据加载失败" hint={error} /></section>;
  }

  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">LEARN · 学习卡片</p>
          <h1>认识盲文六点字符</h1>
          <p className="page-subtitle">按课程、类别与难度切换，点击点阵卡片查看字符解释。</p>
        </div>
        <StatusBadge tone="dark" label={`共 ${symbols.length} 个字符`} />
      </header>

      <section className="metrics metrics-4">
        <StatCard label="字符总数" value={symbols.length} />
        <StatCard label="课程数" value={lessons.length} />
        <StatCard label="当前筛选命中" value={filtered} />
        <StatCard
          label="当前课程字符"
          value={activeLesson === "ALL" ? symbols.length : visibleModels.length}
        />
      </section>

      <section className="panel filters-panel">
        <div className="filter-group">
          <span className="filter-label">课程</span>
          <div className="filter-chips">
            <FilterChip active={activeLesson === "ALL"} onClick={() => setActiveLesson("ALL")}>
              全部字符
            </FilterChip>
            {lessons.map((lesson) => (
              <FilterChip key={lesson.id} active={activeLesson === lesson.id} onClick={() => setActiveLesson(lesson.id)}>
                {lesson.title}
              </FilterChip>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">类别</span>
          <div className="filter-chips">
            <FilterChip active={category === "ALL"} onClick={() => setCategory("ALL")}>全部</FilterChip>
            {SymbolCategoryOptions.map((value) => (
              <FilterChip key={value} active={category === value} onClick={() => setCategory(value)}>
                {SymbolCategoryText[value]}
              </FilterChip>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">难度</span>
          <div className="filter-chips">
            <FilterChip active={difficulty === "ALL"} onClick={() => setDifficulty("ALL")}>全部</FilterChip>
            {MasteryLevelOptions.map((value) => (
              <FilterChip key={value} active={difficulty === value} onClick={() => setDifficulty(value)}>
                {MasteryLevelText[value]}
              </FilterChip>
            ))}
          </div>
        </div>
        <div className="filter-group">
          <span className="filter-label">检索</span>
          <input
            className="filter-input"
            placeholder="输入字母 / 拼音，如 a、bā"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </section>

      {activeLesson !== "ALL" && (
        <section className="panel">
          {(() => {
            const lesson = lessons.find((row) => row.id === activeLesson);
            if (!lesson) return null;
            return (
              <div className="lesson-detail">
                <div className="lesson-head-row">
                  <h2>{lesson.title}</h2>
                  <StatusBadge tone="warning" label={`${lesson.stage} · 约 ${lesson.estimated_minutes} 分钟`} />
                </div>
                <p className="page-subtitle">解锁规则：{lesson.unlock_rule}</p>
                <LessonProgress value={0} max={lesson.symbol_ids.length} label="待练习" tone="warning" />
              </div>
            );
          })()}
        </section>
      )}

      {visibleModels.length === 0 ? (
        <section className="panel">
          <EmptyState title="没有符合条件的字符" hint="换一个类别或难度试试。" />
        </section>
      ) : (
        <section className="card-grid">
          {visibleModels.map(({ symbol }) => (
            <SymbolCard key={symbol.id} symbol={symbol} />
          ))}
        </section>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className={`filter-chip ${active ? "active" : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}
