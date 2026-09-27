export interface Lesson {
  id: number;
  title: string;
  symbol_ids: number[];
  /** 课程阶段，例如 入门 / 基础 / 进阶 */
  stage: string;
  estimated_minutes: number;
  unlock_rule: string;
}
