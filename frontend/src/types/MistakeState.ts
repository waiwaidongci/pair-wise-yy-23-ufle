export interface MistakeState {
  /** 与 BrailleSymbol.id 相同，即主键 */
  symbol_id: number;
  /** 是否仍在错题本中：连续答对 3 次后置为 false */
  in_book: boolean;
  /** 连续答对计数；一旦答错立即归零 */
  correct_streak: number;
  total_wrong: number;
  total_correct: number;
  last_wrong_at: string | null;
  last_practiced_at: string | null;
  updated_at: string;
}
