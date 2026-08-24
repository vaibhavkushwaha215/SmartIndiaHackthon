import { db } from './database';
import { ErrorCode } from '../constants/error-codes';
import { LogEntry } from '../types';

let cachedClientIp: string | null = null;

// Best-effort client IP detection
async function getClientIp(): Promise<string> {
  if (cachedClientIp) return cachedClientIp;

  try {
    const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      const data = await res.json();
      if (data?.ip) {
        cachedClientIp = data.ip;
        return data.ip;
      }
    }
  } catch {
    // Ignore network error in offline / local development mode
  }

  // Fallback to a realistic client prototype IP
  cachedClientIp = '103.24.88.192';
  return cachedClientIp;
}

export interface LogActionParams {
  action: string;
  route?: string;
  userId?: string | null;
  phone?: string | null;
  resultCode: number | ErrorCode;
  details?: string;
}

export const logger = {
  async log(params: LogActionParams): Promise<LogEntry> {
    const ip = await getClientIp();
    const route = params.route || window.location.pathname || '/';

    const entry: Omit<LogEntry, 'id' | 'timestamp'> = {
      action: params.action,
      route,
      user_id: params.userId ?? null,
      phone: params.phone ?? null,
      ip_address: ip,
      result_code: params.resultCode,
      details: params.details || '',
    };

    console.log(`[SahyogSeva Logger] [${entry.action}] Code: ${entry.result_code} | Route: ${entry.route}`, entry);
    return db.addLog(entry);
  },

  async logAuth(action: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'LOGOUT', userId: string | null, phone: string | null, resultCode: number, details?: string) {
    return this.log({ action, userId, phone, resultCode, details });
  },

  async logBookingCreated(userId: string, workerId: string, bookingId: string, resultCode = 201, details?: string) {
    return this.log({
      action: 'BOOKING_CREATED',
      userId,
      resultCode,
      details: details || `Booking ${bookingId} created for worker ${workerId}`,
    });
  },

  async logBookingStatusChange(userId: string, bookingId: string, newStatus: string, resultCode = 200) {
    return this.log({
      action: 'BOOKING_STATUS_CHANGE',
      userId,
      resultCode,
      details: `Booking ${bookingId} updated to status '${newStatus}'`,
    });
  },

  async logPaymentMock(userId: string, bookingId: string, amount: number, success: boolean, resultCode = success ? 200 : 500) {
    return this.log({
      action: success ? 'PAYMENT_MOCK_SUCCESS' : 'PAYMENT_MOCK_FAILED',
      userId,
      resultCode,
      details: `Simulated payment of ₹${amount} for booking ${bookingId} ${success ? 'succeeded' : 'failed'}`,
    });
  },

  async logReviewSubmitted(userId: string, bookingId: string, rating: number, resultCode = 201) {
    return this.log({
      action: 'REVIEW_SUBMITTED',
      userId,
      resultCode,
      details: `Customer left ${rating}-star review for booking ${bookingId}`,
    });
  },

  async logError(action: string, error: any, userId?: string | null, phone?: string | null) {
    const code = error?.code || 500;
    const message = error?.message || (typeof error === 'string' ? error : 'Unexpected runtime error');
    return this.log({
      action: `ERROR_${action.toUpperCase()}`,
      userId,
      phone,
      resultCode: code,
      details: message,
    });
  },
};
