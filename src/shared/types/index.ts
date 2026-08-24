import { ErrorCode } from '../constants/error-codes';

export type UserRole = 'Customer' | 'Worker' | 'Admin';
export type LanguagePreference = 'en' | 'hi';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  language_pref: LanguagePreference;
  avatar_url?: string;
}

export interface Worker {
  id: string;
  user_id: string;
  cooperative_id: string;
  skill: string;
  area: string;
  verified: boolean;
  rating_avg: number;
  hourly_rate?: number;
  experience_years?: number;
  completed_jobs_count?: number;
  bio?: string;
  // Joined / populated fields for UI
  name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  worker_id: string;
  date: string; // YYYY-MM-DD
  time_slot: string; // e.g. "09:00 AM - 11:00 AM"
  address: string;
  status: BookingStatus;
  created_at: string;
  problem_description?: string;
  amount?: number;
  // Joined fields for UI convenience
  worker?: Worker;
  customer?: User;
  review?: Review;
}

export interface Review {
  id: string;
  booking_id: string;
  rating: number; // 1 - 5
  comment: string;
  created_at?: string;
  customer_name?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  user_id: string | null;
  phone: string | null;
  action: string;
  route: string;
  ip_address: string;
  result_code: number | ErrorCode; // e.g. 200, 201, 101, 102, 400, 401, 404, 409, 500
  details?: string;
}

export interface AreaDemandForecast {
  area: string;
  predicted_jobs: number;
  peak_time: string;
  active_workers: number;
  demand_level: 'High' | 'Medium' | 'Normal';
  cooperative_support_needed: boolean;
}
