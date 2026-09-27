import { useEffect, useMemo, useState } from "react";
import { ensureSeeded } from "../api/db";

type LoadFn = () => Promise<void>;
type StoreLike = { loaded: boolean; loading: boolean; load: LoadFn };

/**
 * 统一引导 IndexedDB：首次写入种子数据，再触发各实体 store 的 load。
 * 页面只声明要引导哪些 store，不直接操作 IndexedDB。
 */
export function useIndexedDbStore(stores: StoreLike[]) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const key = useMemo(() => stores.map((s) => `${s.loaded}:${s.loading}`).join("|"), [stores]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await ensureSeeded();
        await Promise.all(stores.map((store) => !store.loaded && store.load()));
        if (!cancelled) setReady(true);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "本地数据加载失败");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { ready, error };
}
