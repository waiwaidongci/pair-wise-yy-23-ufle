export interface Lesson {
  id: number;
  title: string;
  /** 课程内点字字符顺序，练习队列严格按该顺序生成 */
  symbol_ids: number[];
  stage: string;
  estimated_minutes: number;
  unlock_rule: string;
}
