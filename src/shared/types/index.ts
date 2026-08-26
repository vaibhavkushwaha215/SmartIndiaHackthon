import { ErrorCode } from '../constants/error-codes';

export type UserRole = 'Customer' | 'Worker' | 'Admin' | 'SuperAdmin';
export type LanguagePreference = 'en' | 'hi' | 'te' | 'kn' | 'ta';
export type BookingStatus = 'pending' | 'accepted' | 'in_progress' | 'confirmed' | 'completed' | 'cancelled';
export type AddressType = 'House' | 'Apartment' | 'Business' | 'Other';
export type WorkerApplicationStatus = 'Pending' | 'Under Review' | 'Approved' | 'Rejected';

export interface WorkerApplication {
  id: string;
  user_id?: string;
  fullName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  pincode: string;
  primarySkill: string;
  additionalSkills: string[];
  experienceYears: number;
  serviceArea: string;
  availability: 'Full-Time' | 'Part-Time' | 'On-Demand';
  hourlyRate: number;
  documentType: 'Aadhaar' | 'Voter ID' | 'Trade Certificate' | 'Other';
  documentNumberMasked: string;
  cooperativeSociety: string;
  status: WorkerApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface WorkerEarningTransaction {
  id: string;
  booking_id: string;
  worker_id: string;
  customer_name: string;
  service_name: string;
  gross_amount: number;
  cooperative_fee: number;
  net_earnings: number;
  date: string;
  status: 'Settled' | 'In Escrow' | 'Processing';
}

// ==========================================
// FEATURE FLAGS & SYSTEM CONFIGURATION TYPES
// ==========================================

export type FeatureKey =
  | 'customerModule'
  | 'workerModule'
  | 'adminModule'
  | 'fairMatch'
  | 'workerApplications'
  | 'chatbot'
  | 'demandForecasting'
  | 'payments'
  | 'notifications'
  | 'multilingual'
  | 'emergencyBooking'
  | 'workerReviewsVisibility';

export type FeatureCategory = 'core' | 'operations' | 'ai' | 'finance' | 'communication';

export interface FeatureDefinition {
  key: FeatureKey;
  name: string;
  description: string;
  enabled: boolean;
  category: FeatureCategory;
  environmentRestriction?: 'all' | 'development' | 'production' | 'staging';
  isExperimental?: boolean;
  dependsOn?: FeatureKey[];
}

export type FeatureFlagState = Record<FeatureKey, boolean>;

export interface SystemSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  customerRegistrationEnabled: boolean;
  workerApplicationsEnabled: boolean;
  bookingEnabled: boolean;
  defaultServiceRadiusKm: number;
  maxBookingRadiusKm: number;
  platformServiceFeePercent: number;
  defaultLanguage: LanguagePreference;
  defaultCurrency: string;
  escrowProtectionEnabled: boolean;
  autoAssignLeadTimeoutMins: number;
}

export type IntegrationId = 'gemini-ai' | 'payments-escrow' | 'maps-geolocation' | 'notifications';
export type IntegrationHealthStatus = 'Configured' | 'Not configured' | 'Enabled' | 'Disabled' | 'Connection unavailable';

export interface IntegrationStatusInfo {
  id: IntegrationId;
  name: string;
  description: string;
  status: IntegrationHealthStatus;
  provider: string;
  environmentVarName?: string; // name only, never the secret
  lastHeartbeat?: string;
  isPrototypeMock: boolean;
  capabilities: string[];
}

export interface SuperAdminAuditEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actionType: 'FEATURE_TOGGLE' | 'SETTING_CHANGE' | 'MAINTENANCE_TOGGLE' | 'INTEGRATION_UPDATE';
  target: string;
  previousValue: string;
  newValue: string;
  reason?: string;
}

export type ServiceRequestStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'OPEN'
  | 'MATCHING'
  | 'ASSIGNED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'REFUNDED';

export type GenderPreference = 'no_preference' | 'male' | 'female';
export type RequestPriority = 'normal' | 'emergency';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  language_pref: LanguagePreference;
  avatar_url?: string;
  gender?: 'male' | 'female' | 'other';
  password_hash?: string; // Plain text in prototype, bcrypt in production
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
  category?: string; // e.g. "ELECTRICAL", "PLUMBING", "APPLIANCE", "CARPENTRY", "CLEANING", "PAINTING", "PEST_GARDENING"
  services?: string[]; // IDs of services provided, e.g. ['srv-elec-1', 'srv-elec-2']
  pincodes?: string[]; // Serviced postal codes, e.g. ['110001', '110002', '110024']
  gender?: 'male' | 'female' | 'other';
  isAvailable?: boolean;
  verificationStatus?: 'Verified' | 'Pending' | 'Rejected' | 'Suspended';
  joinedDate?: string;
  totalEarnings?: number;
  recentJobCount?: number;
  // Joined / populated fields for UI
  name?: string;
  phone?: string;
  avatar_url?: string;
}

export interface SavedAddress {
  id: string;
  user_id?: string;
  tag: string;
  fullName: string;
  mobileNumber: string;
  pincode: string;
  flat: string;
  area: string;
  landmark?: string;
  city: string;
  state: string;
  isDefault: boolean;
  addressType: AddressType;
  deliveryInstructions?: string;
  canDeliverSaturday?: boolean;
  canDeliverSunday?: boolean;
}

export interface ServiceRequest {
  id: string;
  customerId: string;
  serviceCategoryId: string;
  serviceId: string;
  serviceName?: string;
  selectedProblems: string[];
  otherProblemDetails?: string;
  date: string; // YYYY-MM-DD
  slotStart: string; // "09:00"
  slotEnd: string; // "11:00"
  timeSlotDisplay: string;
  address: string;
  pincode: string;
  locality?: string;
  additionalDetails?: string;
  genderPreference: GenderPreference;
  priority: RequestPriority;
  amount: number;
  paymentStatus: 'HELD_IN_ESCROW' | 'RELEASED' | 'REFUNDED';
  requestStatus: ServiceRequestStatus;
  assignedWorkerId?: string;
  assignedAt?: string;
  assignmentDeadline: string; // ISO string
  isLateBooking?: boolean;
  lateBookingConfirmedAt?: string;
  ignoredByWorkerIds?: string[];
  rejectedByWorkerIds?: string[];
  cancelledBy?: 'customer' | 'worker' | 'system';
  cancellationReason?: string;
  cancelledAt?: string;
  penaltyApplied?: number;
  createdAt: string;
  updatedAt: string;

  // Joined / Populated properties for UI
  customer?: User;
  worker?: Worker;
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
  grossAmount?: number;
  platformFee?: number;
  workerEarnings?: number;
  matchedViaFairMatch?: boolean;
  service_request_id?: string;
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
