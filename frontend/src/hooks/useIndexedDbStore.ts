import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../services/errors";

/**
 * 通用的 IndexedDB 只读加载 hook：
 * 页面通过 api 层的 async loader 读取本地数据，并支持手动 reload。
 */
export function useIndexedDbStore<T>(loader: () => Promise<T[]>, deps: unknown[] = []) {
  const [rows, setRows] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const data = await loader();
      setRows(data);
      setError("");
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { rows, loading, error, reload };
}
