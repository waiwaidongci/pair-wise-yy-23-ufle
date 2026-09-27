import type { MistakeReason } from "../types/MistakeReason";

export const MistakeReasonText: Record<MistakeReason, string> = {
  POINT_MISREAD: "凸点误读",
  REVERSED_DOT: "点位镜像混淆",
  CATEGORY_MIXED: "相近字符混淆",
  LISTENING_MISS: "听写未听清"
};

export const MistakeReasonOptions = Object.keys(MistakeReasonText) as MistakeReason[];
