/** 简单的可重置 id 序列；自增 id 持久化在 IndexedDB 计数器对象仓中 */
export function nextId(rows: { id: number }[]): number {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

export const nowIso = () => new Date().toISOString();
