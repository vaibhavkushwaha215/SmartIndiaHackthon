/**
 * Standardized Error Code System for SahyogSeva
 *
 * Every form validation, API, and Supabase call resolves to one of these standard codes
 * and displays formatted toasts or alerts in the UI: e.g., "ERROR 404: Booking not found"
 */

export const ERROR_CODES = {
  // Auth & Validation Errors
  INVALID_CREDENTIALS: 101,
  INVALID_PHONE_NUMBER: 102,

  // HTTP / Resource Standard Codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  CONFLICT: 409,
  SERVER_ERROR: 500,
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: string;
  field?: string;
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid credentials. Please check your login details.',
  [ERROR_CODES.INVALID_PHONE_NUMBER]: 'Invalid phone number. Must be a valid 10-digit mobile number.',
  [ERROR_CODES.BAD_REQUEST]: 'Bad request. Required fields are missing or invalid.',
  [ERROR_CODES.UNAUTHORIZED]: 'Unauthorized. You do not have permission for this action.',
  [ERROR_CODES.NOT_FOUND]: 'Resource not found in cooperative records.',
  [ERROR_CODES.CONFLICT]: 'Conflict detected. Selected time slot is already booked.',
  [ERROR_CODES.SERVER_ERROR]: 'Internal server or database error. Please try again later.',
};

/**
 * Formats a standardized UI string e.g. "ERROR 409: Conflict - Slot already booked"
 */
export function formatErrorMessage(code: ErrorCode, customDetail?: string): string {
  const baseMessage = ERROR_MESSAGES[code] || 'Unknown error occurred';
  const detailText = customDetail ? `: ${customDetail}` : `: ${baseMessage}`;
  return `ERROR ${code}${detailText}`;
}

/**
 * Creates an AppError object
 */
export function createAppError(code: ErrorCode, customDetail?: string, field?: string): AppError {
  return {
    code,
    message: customDetail || ERROR_MESSAGES[code],
    details: customDetail,
    field,
  };
}
