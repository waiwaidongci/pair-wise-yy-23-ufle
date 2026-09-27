import { useHashRoute } from "../hooks/useHashRoute";
import { routes, defaultRoute } from "./routes";

export { routes, defaultRoute };

/** 当前路由配置解析，供 App 渲染页面与侧边导航 */
export function useRouter() {
  const [hash, navigate] = useHashRoute();
  const current = routes.find((item) => item.route === hash) ?? routes[0];
  return { current: current.route, currentName: current.name, navigate, routes };
}
