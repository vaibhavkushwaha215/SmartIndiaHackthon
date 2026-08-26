import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FeatureKey, FeatureDefinition, FeatureFlagState } from '../types';
import { SEED_FEATURE_DEFINITIONS } from '../data/seed-data';

export type { FeatureKey, FeatureDefinition, FeatureFlagState };

/**
 * SahyogSeva - Centralized Plug & Play Feature Flags Registry
 * 
 * Every major feature is isolated and can be enabled, disabled,
 * or removed cleanly without breaking unrelated system functionality.
 */

const STORAGE_KEY = 'sahyog_feature_flags';
const EVENT_NAME = 'sahyog:feature_flags_updated';

// Safe fail-closed default feature state
const DEFAULT_FEATURE_STATE: FeatureFlagState = SEED_FEATURE_DEFINITIONS.reduce(
  (acc, item) => {
    acc[item.key] = item.enabled;
    return acc;
  },
  {} as FeatureFlagState
);

/**
 * Legacy key alias mapping to maintain 100% backward compatibility
 * with existing UI component checks while transitioning to canonical keys.
 */
const LEGACY_KEY_MAP: Record<string, FeatureKey> = {
  BOOKING_SYSTEM: 'customerModule',
  MY_BOOKINGS: 'customerModule',
  WORKER_DASHBOARD: 'workerModule',
  ADMIN_PORTAL: 'adminModule',
  DEMAND_FORECAST: 'demandForecasting',
  AUDIT_LOGS: 'adminModule',
  EMERGENCY_SOS: 'emergencyBooking',
  WORKER_APPLICATION: 'workerApplications',
  REVIEWS_AND_RATINGS: 'workerReviewsVisibility',
  PAYMENT_CONFIRMATION: 'payments',
  LANGUAGE_SWITCHER: 'multilingual',
  LOCATION_AUTO_DETECT: 'customerModule',
  ADDRESS_BOOK: 'customerModule',
  SUPPORT_TICKETS: 'customerModule',
  THEME_SELECTION: 'customerModule',
};

/**
 * Read current active feature flags from memory/localStorage
 */
export function getActiveFeatureFlags(): FeatureFlagState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_FEATURE_STATE };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_FEATURE_STATE, ...parsed };
  } catch {
    // Fail-safe default
    return { ...DEFAULT_FEATURE_STATE };
  }
}

/**
 * Save updated feature flag state and dispatch update event
 */
export function saveActiveFeatureFlags(state: Partial<FeatureFlagState>): FeatureFlagState {
  try {
    const current = getActiveFeatureFlags();
    const updated = { ...current, ...state };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    return updated;
  } catch (e) {
    console.error('Failed to save feature flags:', e);
    return getActiveFeatureFlags();
  }
}

/**
 * Check if a feature is enabled by canonical key or legacy alias
 */
export function isFeatureEnabled(featureKey: FeatureKey | string): boolean {
  const canonicalKey = (LEGACY_KEY_MAP[featureKey] || featureKey) as FeatureKey;
  const flags = getActiveFeatureFlags();
  
  if (canonicalKey in flags) {
    return Boolean(flags[canonicalKey]);
  }
  
  // Safe default: return true only if defined in default seed as true
  return Boolean(DEFAULT_FEATURE_STATE[canonicalKey]);
}

/**
 * React Hook for reactive feature flag evaluation.
 * Instantly re-renders when SuperAdmin toggles any flag in the control plane.
 */
export function useFeature(featureKey: FeatureKey | string): boolean {
  const [enabled, setEnabled] = useState<boolean>(() => isFeatureEnabled(featureKey));

  useEffect(() => {
    const handleUpdate = () => {
      setEnabled(isFeatureEnabled(featureKey));
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(EVENT_NAME, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [featureKey]);

  return enabled;
}

/**
 * Hook to get all feature definitions with current live state
 */
export function useFeatureDefinitions(): {
  features: FeatureDefinition[];
  toggleFeature: (key: FeatureKey, enabled: boolean) => void;
  resetToDefaults: () => void;
} {
  const [flags, setFlags] = useState<FeatureFlagState>(getActiveFeatureFlags);

  useEffect(() => {
    const handleUpdate = (e: any) => {
      setFlags(e.detail || getActiveFeatureFlags());
    };

    window.addEventListener(EVENT_NAME, handleUpdate);
    return () => window.removeEventListener(EVENT_NAME, handleUpdate);
  }, []);

  const features: FeatureDefinition[] = useMemo(() => {
    return SEED_FEATURE_DEFINITIONS.map((def) => ({
      ...def,
      enabled: flags[def.key] ?? def.enabled,
    }));
  }, [flags]);

  const toggleFeature = useCallback((key: FeatureKey, enabled: boolean) => {
    saveActiveFeatureFlags({ [key]: enabled });
  }, []);

  const resetToDefaults = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: DEFAULT_FEATURE_STATE }));
    setFlags(DEFAULT_FEATURE_STATE);
  }, []);

  return { features, toggleFeature, resetToDefaults };
}

/**
 * Declarative FeatureGate Component
 * 
 * Usage:
 * <FeatureGate feature="chatbot" fallback={<Notice />}>
 *   <ChatbotWidget />
 * </FeatureGate>
 */
interface FeatureGateProps {
  feature: FeatureKey | string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback = null,
}) => {
  const isEnabled = useFeature(feature);
  if (!isEnabled) return React.createElement(React.Fragment, null, fallback);
  return React.createElement(React.Fragment, null, children);
};

/**
 * Backward compatibility alias export for legacy object syntax
 */
export const FEATURES = new Proxy({} as Record<string, boolean>, {
  get: (_target, prop: string) => isFeatureEnabled(prop),
});
