/**
 * Standardized Error Code System for SahyogSeva
 *
 * Every validation, API operation, and database call resolves to a standardized
 * numeric error code mapped to clear UI alerts and structured audit logs.
 */

export const ERROR_CODES = {
  // 100s: Auth & Identity Validation
  INVALID_CREDENTIALS: 101,
  INVALID_PHONE_NUMBER: 102,
  PHONE_ALREADY_REGISTERED: 103,
  INVALID_EMAIL_FORMAT: 104,

  // 300s: Booking, Scheduling & Geography
  SLOT_ALREADY_BOOKED: 301,
  INVALID_SERVICE_DATE: 302,
  INVALID_PINCODE: 304,
  INVALID_STATUS_TRANSITION: 305,
  DUPLICATE_REVIEW: 306,

  // 400s: HTTP & Resource Lifecycle
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INVALID_TARIFF_AMOUNT: 405,
  CONFLICT: 409, // Alias for concurrent slot conflict

  // 500s: System, Cloud & Hardware
  SERVER_ERROR: 500,
  SUPABASE_UNREACHABLE: 501,
  GEOLOCATION_DENIED: 502,
  ATTACHMENT_TOO_LARGE: 504,
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: string;
  field?: string;
}

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  // 100s
  [ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid credentials. Please check your phone or password.',
  [ERROR_CODES.INVALID_PHONE_NUMBER]: 'Invalid phone number. Must be a valid 10-digit Indian mobile number.',
  [ERROR_CODES.PHONE_ALREADY_REGISTERED]: 'An account with this phone number already exists. Please sign in.',
  [ERROR_CODES.INVALID_EMAIL_FORMAT]: 'Invalid email address format.',

  // 300s
  [ERROR_CODES.SLOT_ALREADY_BOOKED]: 'Selected time slot is already booked for this technician.',
  [ERROR_CODES.INVALID_SERVICE_DATE]: 'Service date must be between today and the next 14 days.',
  [ERROR_CODES.INVALID_PINCODE]: 'Pincode must be exactly 6 digits [0-9].',
  [ERROR_CODES.INVALID_STATUS_TRANSITION]: 'Invalid booking status transition.',
  [ERROR_CODES.DUPLICATE_REVIEW]: 'A customer review has already been submitted for this booking.',

  // 400s
  [ERROR_CODES.BAD_REQUEST]: 'Bad request. Required fields are missing or invalid.',
  [ERROR_CODES.UNAUTHORIZED]: 'Unauthorized. You do not have permission for this action.',
  [ERROR_CODES.FORBIDDEN]: 'Forbidden. Access restricted to authorized platform personnel.',
  [ERROR_CODES.NOT_FOUND]: 'Resource not found in cooperative records.',
  [ERROR_CODES.INVALID_TARIFF_AMOUNT]: 'Cooperative tariff rate must be between ₹100 and ₹2,000 / hour.',
  [ERROR_CODES.CONFLICT]: 'Conflict detected. Selected time slot is already booked.',

  // 500s
  [ERROR_CODES.SERVER_ERROR]: 'Internal server or database error. Please try again later.',
  [ERROR_CODES.SUPABASE_UNREACHABLE]: 'Cloud database unreachable. Running in local persistent mode.',
  [ERROR_CODES.GEOLOCATION_DENIED]: 'Location access was denied. Please select address manually.',
  [ERROR_CODES.ATTACHMENT_TOO_LARGE]: 'Uploaded file exceeds the maximum 10MB size limit.',
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
 * Creates a typed AppError object
 */
export function createAppError(code: ErrorCode, customDetail?: string, field?: string): AppError {
  return {
    code,
    message: customDetail || ERROR_MESSAGES[code] || 'Unknown error',
    details: customDetail,
    field,
  };
}
