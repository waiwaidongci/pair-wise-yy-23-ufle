import { ERROR_CODES, type ErrorCode } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";

/** service / controller 层统一抛出的业务异常 */
export class ServiceError extends Error {
  readonly code: ErrorCode;

  constructor(code: ErrorCode, cause?: unknown) {
    super(ERROR_MESSAGES[code]);
    this.name = "ServiceError";
    this.code = code;
    if (cause !== undefined) {
      (this as { cause?: unknown }).cause = cause;
    }
  }
}

/** controller 侧再次包装，避免异常只在一个全局位置被吞掉 */
export class ControllerError extends Error {
  readonly code: ErrorCode;
  readonly origin: ServiceError;

  constructor(origin: ServiceError) {
    super(`[${ERROR_CODES[origin.code]}] ${origin.message}`);
    this.name = "ControllerError";
    this.code = origin.code;
    this.origin = origin;
  }
}

export const toServiceError = (code: ErrorCode) => (cause: unknown) => new ServiceError(code, cause);

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ServiceError || error instanceof ControllerError) return error.message;
  if (error instanceof Error) return error.message;
  return ERROR_MESSAGES.VALIDATION_FAILED;
};

export const getErrorCode = (error: unknown): ErrorCode | "" =>
  error instanceof ServiceError || error instanceof ControllerError ? error.code : "";
