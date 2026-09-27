export interface RouteDef {
  name: string;
  route: string;
  description: string;
}

export const routes: RouteDef[] = [
  { name: "学习卡片", route: "/learn", description: "点阵卡片与字符解释" },
  { name: "练习模式", route: "/practice", description: "选课程开始一轮练习" },
  { name: "错题本", route: "/mistakes", description: "连续答对三次移出" },
  { name: "学习进度", route: "/progress", description: "完成次数、正确率与趋势" }
];

export const defaultRoute = routes[0].route;
