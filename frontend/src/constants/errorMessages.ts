import type { ErrorCode } from "./errorCodes";

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  LOCAL_DB_UNAVAILABLE: "本地数据库不可用，请确认浏览器支持 IndexedDB",
  LESSON_EMPTY: "该课程没有可练习的点字字符",
  LESSON_NOT_FOUND: "未找到所选课程",
  SYMBOL_NOT_FOUND: "未找到对应的点字字符",
  DRAFT_NOT_ACTIVE: "当前没有进行中的练习",
  ANSWER_MISMATCH: "答案格式与题目模式不匹配",
  MISTAKE_NOT_IN_BOOK: "该字符当前不在错题本中"
};
