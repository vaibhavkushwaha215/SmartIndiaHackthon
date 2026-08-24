import { supabase, isSupabaseConfigured } from './supabase';
import { User, Worker, Booking, Review, LogEntry, BookingStatus, AreaDemandForecast, SavedAddress } from '../types';
import { ERROR_CODES, createAppError } from '../constants/error-codes';
import {
  SEED_USERS,
  SEED_WORKERS,
  SEED_BOOKINGS,
  SEED_REVIEWS,
  SEED_LOGS,
  SEED_FORECASTS,
  SEED_ADDRESSES,
} from '../data/seed-data';

const STORAGE_KEYS = {
  USERS: 'sahyog_users',
  WORKERS: 'sahyog_workers',
  BOOKINGS: 'sahyog_bookings',
  REVIEWS: 'sahyog_reviews',
  LOGS: 'sahyog_logs',
  ADDRESSES: 'sahyog_addresses',
};

// Initialize LocalStorage with seed data if not present
function initializeLocalStorage() {
  // Check if existing user data has password_hash, if not, force-refresh with updated seed
  const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  if (existingUsers) {
    try {
      const parsed = JSON.parse(existingUsers);
      if (parsed.length > 0 && !parsed[0].password_hash) {
        // Old data without passwords — merge passwords from seed
        const updated = parsed.map((u: User) => {
          const seedMatch = SEED_USERS.find((s) => s.id === u.id);
          return seedMatch ? { ...u, password_hash: seedMatch.password_hash } : u;
        });
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
      }
    } catch {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    }
  } else {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
  }

  // Always keep workers synced with latest seed categories
  const existingWorkers = localStorage.getItem(STORAGE_KEYS.WORKERS);
  if (!existingWorkers || JSON.parse(existingWorkers).length < SEED_WORKERS.length) {
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(SEED_WORKERS));
  }

  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(SEED_REVIEWS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(SEED_LOGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ADDRESSES)) {
    localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(SEED_ADDRESSES));
  }
}

initializeLocalStorage();

// Helper for local storage read/write
function getLocalItem<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

// Password verification helper (plain text comparison for prototype, bcrypt in production)
function verifyPassword(inputPassword: string, storedHash: string): boolean {
  // In production, replace with: bcrypt.compareSync(inputPassword, storedHash)
  return inputPassword === storedHash;
}

// ----------------------------------------------------------------------
// Database Operations Service
// ----------------------------------------------------------------------

export const db = {
  // ----------------- AUTHENTICATION -----------------
  async authenticateUser(phone: string, password: string): Promise<User> {
    const cleanPhone = phone.trim().replace(/\D/g, '');

    if (cleanPhone.length !== 10) {
      throw createAppError(ERROR_CODES.INVALID_PHONE_NUMBER, 'Must be a valid 10-digit mobile number');
    }
    if (!password) {
      throw createAppError(ERROR_CODES.BAD_REQUEST, 'Password is required');
    }

    // Try Supabase first
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('phone', cleanPhone)
          .maybeSingle();
        if (!error && data) {
          if (!data.password_hash || !verifyPassword(password, data.password_hash)) {
            throw createAppError(ERROR_CODES.INVALID_CREDENTIALS, 'Incorrect password');
          }
          return data;
        }
      } catch (err: any) {
        if (err.code === ERROR_CODES.INVALID_CREDENTIALS) throw err;
        // Fall through to local
      }
    }

    // Local fallback
    const users = getLocalItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    const user = users.find((u) => u.phone === cleanPhone) || SEED_USERS.find((u) => u.phone === cleanPhone);

    if (!user) {
      throw createAppError(ERROR_CODES.NOT_FOUND, 'No account found with this phone number');
    }
    if (!user.password_hash || !verifyPassword(password, user.password_hash)) {
      throw createAppError(ERROR_CODES.INVALID_CREDENTIALS, 'Incorrect password');
    }

    return user;
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    if (!newPassword || newPassword.length < 6) {
      throw createAppError(ERROR_CODES.BAD_REQUEST, 'New password must be at least 6 characters');
    }

    const users = getLocalItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) throw createAppError(ERROR_CODES.NOT_FOUND, 'User not found');

    if (users[index].password_hash && !verifyPassword(currentPassword, users[index].password_hash!)) {
      throw createAppError(ERROR_CODES.INVALID_CREDENTIALS, 'Current password is incorrect');
    }

    // In production: users[index].password_hash = bcrypt.hashSync(newPassword, 10);
    users[index].password_hash = newPassword;
    setLocalItem(STORAGE_KEYS.USERS, users);

    // Also update Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('users').update({ password_hash: newPassword }).eq('id', userId);
      } catch {
        // Local already updated, Supabase sync is best-effort
      }
    }
  },

  // ----------------- USERS -----------------
  async getUsers(): Promise<User[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*');
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('[SahyogSeva DB] Supabase getUsers fallback to local store:', err);
      }
    }
    return getLocalItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
  },

  async getUserById(id: string): Promise<User> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
        if (!error && data) return data;
      } catch {
        // Fall through to local fallback
      }
    }
    const users = getLocalItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    const user = users.find((u) => u.id === id) || SEED_USERS.find((u) => u.id === id) || SEED_USERS[0];
    return user;
  },

  async getUserByPhone(phone: string): Promise<User | null> {
    if (!phone || phone.trim().length !== 10) {
      throw createAppError(ERROR_CODES.INVALID_PHONE_NUMBER, 'Must be a 10-digit mobile number');
    }
    const cleanPhone = phone.trim();
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('users').select('*').eq('phone', cleanPhone).maybeSingle();
        if (!error && data) return data;
      } catch {
        // Fall through to local fallback
      }
    }
    const users = getLocalItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    return users.find((u) => u.phone === cleanPhone) || SEED_USERS.find((u) => u.phone === cleanPhone) || null;
  },

  async upsertUser(user: User): Promise<User> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('users').upsert(user).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[SahyogSeva DB] Supabase upsertUser fallback to local store:', err);
      }
    }
    const users = getLocalItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    const index = users.findIndex((u) => u.id === user.id || u.phone === user.phone);
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    setLocalItem(STORAGE_KEYS.USERS, users);
    return user;
  },

  // ----------------- WORKERS -----------------
  async getWorkers(): Promise<Worker[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('workers').select('*, users(*)');
        if (!error && data && data.length > 0) {
          return data.map((w: any) => ({
            ...w,
            name: w.users?.name || w.name,
            phone: w.users?.phone || w.phone,
            avatar_url: w.users?.avatar_url || w.avatar_url,
          }));
        }
      } catch (err) {
        console.warn('[SahyogSeva DB] Supabase getWorkers fallback to local store:', err);
      }
    }
    const workers = getLocalItem<Worker[]>(STORAGE_KEYS.WORKERS, SEED_WORKERS);
    const users = getLocalItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
    return workers.map((w) => {
      const u = users.find((user) => user.id === w.user_id);
      return {
        ...w,
        name: w.name || u?.name || 'Cooperative Worker',
        phone: w.phone || u?.phone || '',
        avatar_url: w.avatar_url || u?.avatar_url,
      };
    });
  },

  async getWorkerById(id: string): Promise<Worker> {
    const workers = await this.getWorkers();
    const worker = workers.find((w) => w.id === id || w.user_id === id) || SEED_WORKERS.find((w) => w.id === id || w.user_id === id) || SEED_WORKERS[0];
    return worker;
  },

  async updateWorker(id: string, updates: Partial<Worker>): Promise<Worker> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('workers').update(updates).eq('id', id).select().single();
      if (error) throw createAppError(ERROR_CODES.SERVER_ERROR, error.message);
      return data;
    }
    const workers = getLocalItem<Worker[]>(STORAGE_KEYS.WORKERS, SEED_WORKERS);
    const index = workers.findIndex((w) => w.id === id || w.user_id === id);
    if (index === -1) throw createAppError(ERROR_CODES.NOT_FOUND, `Worker #${id} not found`);
    
    workers[index] = { ...workers[index], ...updates };
    setLocalItem(STORAGE_KEYS.WORKERS, workers);

    // Also update associated user name if provided
    if (updates.name && workers[index].user_id) {
      const users = getLocalItem<User[]>(STORAGE_KEYS.USERS, SEED_USERS);
      const uIdx = users.findIndex((u) => u.id === workers[index].user_id);
      if (uIdx >= 0) {
        users[uIdx].name = updates.name;
        setLocalItem(STORAGE_KEYS.USERS, users);
      }
    }

    return workers[index];
  },

  // ----------------- BOOKINGS -----------------
  async getBookings(filter?: { customerId?: string; workerId?: string }): Promise<Booking[]> {
    const workers = await this.getWorkers();
    const users = await this.getUsers();
    const reviews = await this.getReviews();

    let bookingsList: Booking[] = [];

    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
        if (filter?.customerId) query = query.eq('customer_id', filter.customerId);
        if (filter?.workerId) query = query.eq('worker_id', filter.workerId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          bookingsList = data;
        }
      } catch (err) {
        console.warn('[SahyogSeva DB] Supabase getBookings fallback to local store:', err);
      }
    }

    if (bookingsList.length === 0) {
      bookingsList = getLocalItem<Booking[]>(STORAGE_KEYS.BOOKINGS, SEED_BOOKINGS);
      if (filter?.customerId) {
        bookingsList = bookingsList.filter((b) => b.customer_id === filter.customerId);
      }
      if (filter?.workerId) {
        bookingsList = bookingsList.filter((b) => b.worker_id === filter.workerId);
      }
    }

    // Join relations for frontend ease
    return bookingsList.map((b) => ({
      ...b,
      worker: workers.find((w) => w.id === b.worker_id) || SEED_WORKERS.find((w) => w.id === b.worker_id),
      customer: users.find((u) => u.id === b.customer_id) || SEED_USERS.find((u) => u.id === b.customer_id),
      review: reviews.find((r) => r.booking_id === b.id),
    }));
  },

  async getBookingById(id: string): Promise<Booking> {
    const bookings = await this.getBookings();
    const booking = bookings.find((b) => b.id === id);
    if (!booking) throw createAppError(ERROR_CODES.NOT_FOUND, `Booking #${id} not found`);
    return booking;
  },

  async createBooking(bookingData: Omit<Booking, 'id' | 'created_at' | 'status'> & { status?: BookingStatus }): Promise<Booking> {
    // 1. Validation checks (Error 400)
    if (!bookingData.customer_id || !bookingData.worker_id || !bookingData.date || !bookingData.time_slot || !bookingData.address?.trim()) {
      throw createAppError(ERROR_CODES.BAD_REQUEST, 'Please provide worker, date, time slot, and full service address');
    }

    // 2. Date window validation: Not in past & within 14 days (Error 302)
    const bookingDate = new Date(bookingData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 14);
    maxDate.setHours(23, 59, 59, 999);

    if (bookingDate < today || bookingDate > maxDate) {
      throw createAppError(ERROR_CODES.INVALID_SERVICE_DATE, 'Service booking date must be between today and the next 14 days');
    }

    // 3. Conflict check (Error 301 / 409 - Double booked slot)
    const existingBookings = await this.getBookings();
    const conflict = existingBookings.find(
      (b) =>
        b.worker_id === bookingData.worker_id &&
        b.date === bookingData.date &&
        b.time_slot === bookingData.time_slot &&
        b.status !== 'cancelled'
    );

    if (conflict) {
      throw createAppError(
        ERROR_CODES.SLOT_ALREADY_BOOKED,
        `Technician already has a scheduled slot on ${bookingData.date} during ${bookingData.time_slot}`
      );
    }

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      created_at: new Date().toISOString(),
      status: bookingData.status || 'confirmed',
      ...bookingData,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('bookings').insert(newBooking).select().single();
      if (error) throw createAppError(ERROR_CODES.SERVER_ERROR, error.message);
      return data;
    }

    const bookings = getLocalItem<Booking[]>(STORAGE_KEYS.BOOKINGS, SEED_BOOKINGS);
    bookings.unshift(newBooking);
    setLocalItem(STORAGE_KEYS.BOOKINGS, bookings);

    return newBooking;
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    const bookings = getLocalItem<Booking[]>(STORAGE_KEYS.BOOKINGS, SEED_BOOKINGS);
    const index = bookings.findIndex((b) => b.id === id);
    if (index === -1) throw createAppError(ERROR_CODES.NOT_FOUND, `Booking #${id} not found`);

    const prevStatus = bookings[index].status;

    // State machine check (Error 305: Invalid status transition)
    if (prevStatus === 'completed' && status !== 'completed') {
      throw createAppError(ERROR_CODES.INVALID_STATUS_TRANSITION, 'Completed booking status cannot be reverted.');
    }
    if (prevStatus === 'cancelled' && status === 'completed') {
      throw createAppError(ERROR_CODES.INVALID_STATUS_TRANSITION, 'Cancelled booking cannot be marked completed.');
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('bookings').update({ status }).eq('id', id).select().single();
      if (error) throw createAppError(ERROR_CODES.SERVER_ERROR, error.message);
      return data;
    }

    bookings[index].status = status;
    setLocalItem(STORAGE_KEYS.BOOKINGS, bookings);

    // If newly marked completed, increment worker's completed jobs count only once!
    if (status === 'completed' && prevStatus !== 'completed') {
      const workerId = bookings[index].worker_id;
      const workers = getLocalItem<Worker[]>(STORAGE_KEYS.WORKERS, SEED_WORKERS);
      const wIdx = workers.findIndex((w) => w.id === workerId);
      if (wIdx >= 0) {
        workers[wIdx].completed_jobs_count = (workers[wIdx].completed_jobs_count || 0) + 1;
        setLocalItem(STORAGE_KEYS.WORKERS, workers);
      }
    }

    return bookings[index];
  },

  // ----------------- REVIEWS -----------------
  async getReviews(bookingId?: string): Promise<Review[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
        if (bookingId) query = query.eq('booking_id', bookingId);
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('[SahyogSeva DB] Supabase getReviews fallback to local store:', err);
      }
    }
    const reviews = getLocalItem<Review[]>(STORAGE_KEYS.REVIEWS, SEED_REVIEWS);
    if (bookingId) return reviews.filter((r) => r.booking_id === bookingId);
    return reviews;
  },

  async createReview(reviewData: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    if (!reviewData.booking_id || !reviewData.rating || !reviewData.comment?.trim()) {
      throw createAppError(ERROR_CODES.BAD_REQUEST, 'Please provide a star rating (1-5) and feedback comment');
    }
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      throw createAppError(ERROR_CODES.BAD_REQUEST, 'Rating must be between 1 and 5 stars');
    }

    // Check duplicate review submission (Error 306)
    const existing = await this.getReviews(reviewData.booking_id);
    if (existing && existing.length > 0) {
      throw createAppError(ERROR_CODES.DUPLICATE_REVIEW, 'A customer review has already been submitted for this booking.');
    }

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
      ...reviewData,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('reviews').insert(newReview).select().single();
        if (!error && data) return data;
      } catch (err) {
        console.warn('[SahyogSeva DB] Supabase createReview fallback to local store:', err);
      }
    }

    const reviews = getLocalItem<Review[]>(STORAGE_KEYS.REVIEWS, SEED_REVIEWS);
    reviews.unshift(newReview);
    setLocalItem(STORAGE_KEYS.REVIEWS, reviews);

    // Recalculate Worker Rating average
    try {
      const bookings = getLocalItem<Booking[]>(STORAGE_KEYS.BOOKINGS, SEED_BOOKINGS);
      const booking = bookings.find((b) => b.id === reviewData.booking_id);
      if (booking) {
        const workerBookings = bookings.filter((b) => b.worker_id === booking.worker_id).map((b) => b.id);
        const workerReviews = reviews.filter((r) => workerBookings.includes(r.booking_id));
        if (workerReviews.length > 0) {
          const avg = Number((workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length).toFixed(2));
          const workers = getLocalItem<Worker[]>(STORAGE_KEYS.WORKERS, SEED_WORKERS);
          const wIdx = workers.findIndex((w) => w.id === booking.worker_id);
          if (wIdx >= 0) {
            workers[wIdx].rating_avg = avg;
            setLocalItem(STORAGE_KEYS.WORKERS, workers);
          }
        }
      }
    } catch (e) {
      console.warn('Could not update worker average rating:', e);
    }

    return newReview;
  },

  // ----------------- LOGS -----------------
  async getLogs(filterAction?: string): Promise<LogEntry[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        let query = supabase.from('logs').select('*').order('timestamp', { ascending: false });
        if (filterAction && filterAction !== 'ALL') {
          query = query.eq('action', filterAction);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('[SahyogSeva DB] Supabase getLogs fallback to local store:', err);
      }
    }

    let logs = getLocalItem<LogEntry[]>(STORAGE_KEYS.LOGS, SEED_LOGS);
    logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (filterAction && filterAction !== 'ALL') {
      logs = logs.filter((l) => l.action === filterAction);
    }
    return logs;
  },

  async addLog(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<LogEntry> {
    const newLog: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      ...entry,
    };

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.from('logs').insert(newLog).select().single();
      if (!error && data) return data;
    }

    const logs = getLocalItem<LogEntry[]>(STORAGE_KEYS.LOGS, SEED_LOGS);
    logs.unshift(newLog);
    // Keep last 200 logs in local storage
    if (logs.length > 200) logs.pop();
    setLocalItem(STORAGE_KEYS.LOGS, logs);

    return newLog;
  },

  // ----------------- ADDRESSES (FULL CRUD) -----------------
  async getSavedAddresses(userId?: string): Promise<SavedAddress[]> {
    const addresses = getLocalItem<SavedAddress[]>(STORAGE_KEYS.ADDRESSES, SEED_ADDRESSES);
    if (userId) {
      const userAddrs = addresses.filter((a) => !a.user_id || a.user_id === userId);
      return userAddrs.length > 0 ? userAddrs : addresses;
    }
    return addresses;
  },

  async saveAddress(newAddrData: Omit<SavedAddress, 'id'>): Promise<SavedAddress> {
    if (newAddrData.pincode && !/^\d{6}$/.test(newAddrData.pincode.trim())) {
      throw createAppError(ERROR_CODES.INVALID_PINCODE, 'Pincode must be exactly 6 digits [0-9]');
    }

    const addresses = getLocalItem<SavedAddress[]>(STORAGE_KEYS.ADDRESSES, SEED_ADDRESSES);
    const newAddr: SavedAddress = {
      ...newAddrData,
      id: `addr-${Date.now()}`,
    };

    let updated = [...addresses];
    if (newAddr.isDefault || updated.length === 0) {
      newAddr.isDefault = true;
      updated = updated.map((a) => ({ ...a, isDefault: false }));
    }
    updated.push(newAddr);
    setLocalItem(STORAGE_KEYS.ADDRESSES, updated);
    return newAddr;
  },

  async updateAddress(updatedAddr: SavedAddress): Promise<SavedAddress> {
    if (updatedAddr.pincode && !/^\d{6}$/.test(updatedAddr.pincode.trim())) {
      throw createAppError(ERROR_CODES.INVALID_PINCODE, 'Pincode must be exactly 6 digits [0-9]');
    }

    const addresses = getLocalItem<SavedAddress[]>(STORAGE_KEYS.ADDRESSES, SEED_ADDRESSES);
    let updated = addresses.map((a) => {
      if (a.id === updatedAddr.id) {
        return updatedAddr;
      }
      if (updatedAddr.isDefault) {
        return { ...a, isDefault: false };
      }
      return a;
    });

    setLocalItem(STORAGE_KEYS.ADDRESSES, updated);
    return updatedAddr;
  },

  async deleteAddress(id: string): Promise<void> {
    const addresses = getLocalItem<SavedAddress[]>(STORAGE_KEYS.ADDRESSES, SEED_ADDRESSES);
    const target = addresses.find((a) => a.id === id);
    const remaining = addresses.filter((a) => a.id !== id);
    if (target?.isDefault && remaining.length > 0) {
      remaining[0].isDefault = true;
    }
    setLocalItem(STORAGE_KEYS.ADDRESSES, remaining);
  },

  async setDefaultAddress(id: string): Promise<void> {
    const addresses = getLocalItem<SavedAddress[]>(STORAGE_KEYS.ADDRESSES, SEED_ADDRESSES);
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setLocalItem(STORAGE_KEYS.ADDRESSES, updated);
  },

  // ----------------- DEMAND FORECAST -----------------
  async getDemandForecast(): Promise<AreaDemandForecast[]> {
    return SEED_FORECASTS;
  },

  // ----------------- RESET DEMO -----------------
  resetToDefaults(): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(STORAGE_KEYS.WORKERS, JSON.stringify(SEED_WORKERS));
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(SEED_REVIEWS));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(SEED_LOGS));
    localStorage.setItem(STORAGE_KEYS.ADDRESSES, JSON.stringify(SEED_ADDRESSES));
  },
};
