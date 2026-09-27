import { LOG_TEMPLATES, type LogAction, type LogEntity } from "../constants/logTemplates";

export interface LogEntry {
  time: string;
  entity: LogEntity;
  action: LogAction;
  template: string;
  detail: string;
}

/**
 * 所有写操作都经过这里记录日志。
 * 日志模板集中在 constants/logTemplates，字段变化时需要同步模板和调用处。
 */
export const writeLog = (entity: LogEntity, action: LogAction, detail: unknown): LogEntry => {
  const entry: LogEntry = {
    time: new Date().toISOString(),
    entity,
    action,
    template: LOG_TEMPLATES[entity][action],
    detail: typeof detail === "string" ? detail : JSON.stringify(detail)
  };
  console.info(`[${entry.time}] ${entry.template}`, detail);
  return entry;
};

export const writeCreateLog = (entity: LogEntity, detail: unknown) => writeLog(entity, 0, detail);
export const writeUpdateLog = (entity: LogEntity, detail: unknown) => writeLog(entity, 1, detail);
export const writeStatusLog = (entity: LogEntity, detail: unknown) => writeLog(entity, 2, detail);
export const writeExportLog = (entity: LogEntity, detail: unknown) => writeLog(entity, 3, detail);
