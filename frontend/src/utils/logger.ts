import { LOG_TEMPLATES, type LogEntity } from "../constants/logTemplates";

type Params = Record<string, string | number | boolean | undefined>;

const render = (template: string, params: Params) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] === undefined ? "" : String(params[key])
  );

/**
 * 统一日志出口：所有写操作必须经此记录，
 * 模板变更只需要改 constants/logTemplates.ts。
 */
export function writeLog<E extends LogEntity, A extends keyof (typeof LOG_TEMPLATES)[E]>(
  entity: E,
  action: A,
  params: Params = {}
) {
  const group = LOG_TEMPLATES[entity] as Record<string, string>;
  const template = group[action as string];
  if (template) console.info(render(template, params));
}
