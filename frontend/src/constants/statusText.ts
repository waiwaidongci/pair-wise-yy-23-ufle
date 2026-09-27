import { PracticeModeText } from "./PracticeMode";
import { SymbolCategoryText } from "./SymbolCategory";
import { MasteryLevelText, MasteryStateText } from "./MasteryLevel";
import { MistakeReasonText } from "./mistakeReasons";

/** 展示层统一从这里取文案；新增枚举值时本文件必须同步 */
export const STATUS_TEXT = {
  PracticeMode: PracticeModeText,
  SymbolCategory: SymbolCategoryText,
  MasteryLevel: MasteryLevelText,
  MasteryState: MasteryStateText,
  MistakeReason: MistakeReasonText
};
