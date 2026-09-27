import { useEffect, useState } from "react";

/** 极简 hash 路由：不引入第三方路由库，刷新 / 重开都落在当前路由 */
export function useHashRoute(): [string, (next: string) => void] {
  const read = () => {
    const hash = window.location.hash.replace(/^#/, "");
    return hash || "/learn";
  };

  const [route, setRoute] = useState<string>(read);

  useEffect(() => {
    const onChange = () => setRoute(read());
    window.addEventListener("hashchange", onChange);
    if (!window.location.hash) window.location.hash = "/learn";
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  const navigate = (next: string) => {
    if (read() !== next) window.location.hash = next;
  };

  return [route, navigate];
}
