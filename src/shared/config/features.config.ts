/**
 * SahyogSeva - Plug & Play Feature Flags Configuration
 * 
 * To enable or disable any module/feature across the whole application,
 * simply change its boolean value to `true` or `false` below.
 * Everything (Navbars, Routes, Buttons, Modals, Banners) adapts automatically.
 */

export const FEATURES = {
  // Core Platform Modules
  BOOKING_SYSTEM: true,          // Core Service Catalog, Search, and Worker Directory
  MY_BOOKINGS: true,             // "My Bookings" tracking & status updates
  WORKER_DASHBOARD: true,        // "Worker Dashboard" job acceptance & earnings
  ADMIN_PORTAL: true,            // "Admin Portal" metrics & cooperative oversight
  DEMAND_FORECAST: true,         // "Demand Forecast" workload analysis
  AUDIT_LOGS: true,              // "Logs" security & operational audit viewer

  // User & Settings Capabilities
  ADDRESS_BOOK: true,            // Saved Address management with full edit & default selection
  SUPPORT_TICKETS: true,         // Technical helpdesk & ticket submission
  LANGUAGE_SWITCHER: true,       // Multi-language EN / HI toggle
  THEME_SELECTION: true,         // Visual theme selector
  LOCATION_AUTO_DETECT: true,    // Browser Geolocation auto-detection

  // Interactive Widgets & Components
  EMERGENCY_SOS: true,           // Rapid 30-min Emergency Technician Dispatch Banner
  WORKER_APPLICATION: true,      // "Apply as Worker / Cooperative" registration modal
  REVIEWS_AND_RATINGS: true,     // Customer rating & review system
  PAYMENT_CONFIRMATION: true,    // Simulated Cash/UPI payment receipt modal
} as const;

export type FeatureKey = keyof typeof FEATURES;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(featureKey: FeatureKey): boolean {
  return Boolean(FEATURES[featureKey]);
}

/**
 * React Hook for feature flag evaluation
 */
export function useFeature(featureKey: FeatureKey): boolean {
  return isFeatureEnabled(featureKey);
}
