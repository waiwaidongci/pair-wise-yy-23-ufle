import type { MistakeReason } from "../constants/MistakeReason";
import type { MasteryLevel } from "../constants/MasteryLevel";

export interface MistakeEntry {
  id: string;
  symbol_id: number;
  /** 最近一次错误原因，用于错题本归类 */
  last_reason: MistakeReason;
  wrong_count: number;
  /** 连续答对计数，答错立即清零；达到 3 后移出错题本 */
  correct_streak: number;
  /** 连续答对三次后为 true，保留最近状态便于进度统计 */
  removed: boolean;
  mastered: boolean;
  first_wrong_at: string;
  last_wrong_at: string;
  last_practiced_at: string;
  mastery_level: MasteryLevel;
}
