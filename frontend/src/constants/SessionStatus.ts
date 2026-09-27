export const SessionStatus = ["ACTIVE", "FINISHED", "ABANDONED"] as const;
export type SessionStatus = (typeof SessionStatus)[number];

export const SessionStatusText: Record<SessionStatus, string> = {
  ACTIVE: "进行中",
  FINISHED: "已完成",
  ABANDONED: "已放弃"
};
