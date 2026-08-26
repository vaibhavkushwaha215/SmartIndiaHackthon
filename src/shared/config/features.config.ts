import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { FeatureKey, FeatureDefinition, FeatureFlagState } from '../types';
import { SEED_FEATURE_DEFINITIONS } from '../data/seed-data';
import {
  platformConfig,
  PLATFORM_EVENTS,
  SAFE_BOOT_FEATURE_FLAGS,
} from '../services/platform-config.service';

export type { FeatureKey, FeatureDefinition, FeatureFlagState };

/**
 * SahyogSeva - Centralized Plug & Play Feature Flags Registry
 * 
 * Powered by Authoritative Supabase platform_settings configuration.
 * LocalStorage is NOT authoritative for SuperAdmin configuration.
 */

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
 * Read current active feature flags from authoritative in-memory Supabase store
 */
export function getActiveFeatureFlags(): FeatureFlagState {
  return platformConfig.getFeatureFlags();
}

/**
 * Save updated feature flag state directly to Supabase platform_settings
 */
export async function saveActiveFeatureFlags(
  state: Partial<FeatureFlagState>,
  actor?: { id: string; name: string },
  reason?: string
): Promise<FeatureFlagState> {
  for (const [k, enabled] of Object.entries(state)) {
    if (enabled !== undefined) {
      await platformConfig.updateFeatureFlag(k as FeatureKey, Boolean(enabled), actor, reason);
    }
  }
  return platformConfig.getFeatureFlags();
}

/**
 * Check if a feature is enabled by canonical key or legacy alias
 */
export function isFeatureEnabled(featureKey: FeatureKey | string): boolean {
  const canonicalKey = (LEGACY_KEY_MAP[featureKey] || featureKey) as FeatureKey;
  return platformConfig.isFeatureEnabled(canonicalKey);
}

/**
 * React Hook for reactive feature flag evaluation.
 * Instantly re-renders when SuperAdmin toggles any flag in Supabase.
 */
export function useFeature(featureKey: FeatureKey | string): boolean {
  const [enabled, setEnabled] = useState<boolean>(() => isFeatureEnabled(featureKey));

  useEffect(() => {
    const handleUpdate = () => {
      setEnabled(isFeatureEnabled(featureKey));
    };

    window.addEventListener(PLATFORM_EVENTS.FEATURE_FLAGS_UPDATED, handleUpdate);
    window.addEventListener(PLATFORM_EVENTS.CONFIG_STATUS_CHANGED, handleUpdate);

    return () => {
      window.removeEventListener(PLATFORM_EVENTS.FEATURE_FLAGS_UPDATED, handleUpdate);
      window.removeEventListener(PLATFORM_EVENTS.CONFIG_STATUS_CHANGED, handleUpdate);
    };
  }, [featureKey]);

  return enabled;
}

/**
 * Hook to get all feature definitions with current live state from Supabase
 */
export function useFeatureDefinitions(): {
  features: FeatureDefinition[];
  toggleFeature: (key: FeatureKey, enabled: boolean, actor?: { id: string; name: string }) => Promise<void>;
  resetToDefaults: (actor?: { id: string; name: string }) => Promise<void>;
} {
  const [flags, setFlags] = useState<FeatureFlagState>(() => platformConfig.getFeatureFlags());

  useEffect(() => {
    const handleUpdate = (e: any) => {
      setFlags(e.detail || platformConfig.getFeatureFlags());
    };

    window.addEventListener(PLATFORM_EVENTS.FEATURE_FLAGS_UPDATED, handleUpdate);
    window.addEventListener(PLATFORM_EVENTS.CONFIG_STATUS_CHANGED, handleUpdate);
    return () => {
      window.removeEventListener(PLATFORM_EVENTS.FEATURE_FLAGS_UPDATED, handleUpdate);
      window.removeEventListener(PLATFORM_EVENTS.CONFIG_STATUS_CHANGED, handleUpdate);
    };
  }, []);

  const features: FeatureDefinition[] = useMemo(() => {
    return SEED_FEATURE_DEFINITIONS.map((def) => ({
      ...def,
      enabled: flags[def.key] ?? def.enabled,
    }));
  }, [flags]);

  const toggleFeature = useCallback(
    async (key: FeatureKey, enabled: boolean, actor?: { id: string; name: string }) => {
      await platformConfig.updateFeatureFlag(key, enabled, actor);
    },
    []
  );

  const resetToDefaults = useCallback(async (actor?: { id: string; name: string }) => {
    await platformConfig.resetToCharterDefaults(actor);
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
