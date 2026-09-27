import { useEffect, useState } from "react";
import { DEFAULT_ROUTE } from "./routes";

export interface HashLocation {
  path: string;
  query: URLSearchParams;
}

export const parseHash = (hash: string): HashLocation => {
  const raw = hash.replace(/^#/, "") || DEFAULT_ROUTE;
  const [path, queryString] = raw.split("?");
  return { path: path || DEFAULT_ROUTE, query: new URLSearchParams(queryString ?? "") };
};

export const navigate = (path: string, query?: Record<string, string | number>) => {
  const search = query
    ? `?${new URLSearchParams(
        Object.entries(query).map(([key, value]) => [key, String(value)])
      ).toString()}`
    : "";
  window.location.hash = `${path}${search}`;
};

/** 基于 location.hash 的极简路由，刷新 / 关闭重开后保持当前页面 */
export function useHashRoute(): HashLocation {
  const [location, setLocation] = useState<HashLocation>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setLocation(parseHash(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return location;
}
