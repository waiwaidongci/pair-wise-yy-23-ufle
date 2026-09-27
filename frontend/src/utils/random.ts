/** 确定性随机：从候选集合中按种子选取干扰项，保证关闭再打开后队列稳定 */
export function pickN<T>(pool: T[], n: number, seed: number, exclude: (item: T) => boolean): T[] {
  const candidates = pool.filter((item) => !exclude(item));
  const result: T[] = [];
  let step = 0;
  while (result.length < n && step < candidates.length * 3 + 3) {
    step += 1;
    const idx = (seed * 7 + step * 13) % candidates.length;
    const item = candidates[Math.abs(idx)];
    if (!result.includes(item)) result.push(item);
  }
  return result;
}

/** MIXED：根据题目下标与种子决定本题模式 */
export function seededPick<T>(items: readonly T[], seed: number, salt: number): T {
  return items[Math.abs((seed + salt * 31) % items.length)];
}
