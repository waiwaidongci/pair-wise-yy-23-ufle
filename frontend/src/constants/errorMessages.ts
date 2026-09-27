import type { ErrorCode } from "./errorCodes";

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  STORAGE_UNAVAILABLE: "当前浏览器不支持 IndexedDB，练习结果无法保存到本地",
  STORAGE_READ_FAILED: "读取本地练习数据失败，请刷新后重试",
  STORAGE_WRITE_FAILED: "写入本地练习数据失败，请检查浏览器存储设置",
  LESSON_EMPTY: "该课程还没有可练习的点字字符",
  MISTAKE_EMPTY: "错题本里还没有需要重练的字符",
  SESSION_NOT_FOUND: "没有找到可继续的练习会话",
  QUESTION_EXHAUSTED: "本轮题目已经全部完成"
};
