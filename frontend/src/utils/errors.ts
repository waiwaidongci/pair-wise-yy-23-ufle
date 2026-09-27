import { ERROR_CODES, type ErrorCode } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

/** service 层统一抛这个 */
export class ServiceError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, detail?: string) {
    super(detail ? `${ERROR_MESSAGES[code]}：${detail}` : ERROR_MESSAGES[code]);
    this.code = code;
    this.name = "ServiceError";
  }
}

/** store / controller 层再包一层，禁止在全局位置吞掉异常 */
export class StoreActionError extends Error {
  code: ErrorCode;
  cause?: unknown;
  constructor(code: ErrorCode, cause?: unknown) {
    super(ERROR_MESSAGES[code]);
    this.code = code;
    this.name = "StoreActionError";
    this.cause = cause;
  }
}

export const errorText = (code: ErrorCode) => ERROR_MESSAGES[code] ?? ERROR_CODES.VALIDATION_FAILED;

export function toServiceError(err: unknown): ServiceError {
  return err instanceof ServiceError ? err : new ServiceError("LOCAL_DB_UNAVAILABLE", String(err));
}
