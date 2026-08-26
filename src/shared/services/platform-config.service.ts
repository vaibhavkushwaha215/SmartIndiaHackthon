import { supabase, isSupabaseConfigured } from './supabase';
import {
  FeatureKey,
  FeatureFlagState,
  FeatureDefinition,
  SystemSettings,
  SuperAdminAuditEntry,
  User,
} from '../types';
import {
  SEED_FEATURE_DEFINITIONS,
  SEED_SYSTEM_SETTINGS,
  SEED_SUPERADMIN_AUDIT,
} from '../data/seed-data';

/**
 * SahyogSeva - Authoritative Platform Configuration & SuperAdmin Service
 * 
 * Architecture:
 * 1. Supabase is the single source of truth (platform_settings & superadmin_audit_logs tables).
 * 2. An in-memory cache powers synchronous React hooks (useFeature, useFeatureDefinitions).
 * 3. Real-time Supabase subscriptions sync changes across multiple browser tabs/sessions.
 * 4. LocalStorage is NOT used as an authoritative override.
 * 5. If Supabase is unavailable, explicitly documented SAFE BOOT DEFAULTS are used (fail-closed).
 */

export type ConfigSource = 'SUPABASE' | 'SAFE_BOOT_DEFAULT';

export interface PlatformSettingRow {
  id: string;
  key: string;
  value: any;
  value_type: 'boolean' | 'number' | 'string' | 'json';
  category: string;
  description?: string;
  updated_at: string;
  updated_by?: string;
}

export const PLATFORM_EVENTS = {
  FEATURE_FLAGS_UPDATED: 'sahyog:feature_flags_updated',
  SETTINGS_UPDATED: 'sahyog:settings_updated',
  CONFIG_STATUS_CHANGED: 'sahyog:config_status_changed',
};

// -------------------------------------------------------------
// 1. SAFE IMMUTABLE BOOT DEFAULTS (Fail-Closed Baseline)
// -------------------------------------------------------------
export const SAFE_BOOT_FEATURE_FLAGS: FeatureFlagState = Object.freeze(
  SEED_FEATURE_DEFINITIONS.reduce((acc, item) => {
    acc[item.key] = item.enabled;
    return acc;
  }, {} as FeatureFlagState)
);

export const SAFE_BOOT_SYSTEM_SETTINGS: SystemSettings = Object.freeze({
  ...SEED_SYSTEM_SETTINGS,
});

class PlatformConfigService {
  private inMemoryFeatureFlags: FeatureFlagState = { ...SAFE_BOOT_FEATURE_FLAGS };
  private inMemorySystemSettings: SystemSettings = { ...SAFE_BOOT_SYSTEM_SETTINGS };
  private inMemoryAuditLogs: SuperAdminAuditEntry[] = [...SEED_SUPERADMIN_AUDIT];

  private configSource: ConfigSource = 'SAFE_BOOT_DEFAULT';
  private isInitialized = false;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;
  private realtimeChannel: any = null;

  constructor() {
    // Automatically trigger initial fetch on instantiation
    this.initPromise = this.initialize();
  }

  /**
   * Initializes platform configuration by fetching authoritative state from Supabase.
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.isInitializing && this.initPromise) return this.initPromise;

    this.isInitializing = true;

    try {
      if (isSupabaseConfigured && supabase) {
        await this.fetchFromSupabase();
        this.setupRealtimeSubscription();
        this.configSource = 'SUPABASE';
        console.log('[PlatformConfig] Successfully hydrated authoritative configuration from Supabase.');
      } else {
        this.configSource = 'SAFE_BOOT_DEFAULT';
        console.info('[PlatformConfig] Supabase not configured. Operating with immutable Safe Boot Defaults.');
      }
    } catch (err) {
      console.warn('[PlatformConfig] Failed to fetch authoritative configuration from Supabase. Failing closed to Safe Boot Defaults:', err);
      this.configSource = 'SAFE_BOOT_DEFAULT';
      this.inMemoryFeatureFlags = { ...SAFE_BOOT_FEATURE_FLAGS };
      this.inMemorySystemSettings = { ...SAFE_BOOT_SYSTEM_SETTINGS };
    } finally {
      this.isInitialized = true;
      this.isInitializing = false;
      this.broadcastUpdates();
    }
  }

  /**
   * Returns current configuration status and authoritative source
   */
  public getStatus(): { source: ConfigSource; isInitialized: boolean } {
    return {
      source: this.configSource,
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Fetches settings and feature flags from Supabase platform_settings table
   */
  private async fetchFromSupabase(): Promise<void> {
    if (!supabase) return;

    // 1. Fetch platform_settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('platform_settings')
      .select('*');

    if (settingsError) {
      // Table may not exist yet or connection issue
      throw settingsError;
    }

    if (settingsData && settingsData.length > 0) {
      const newFlags: Partial<FeatureFlagState> = {};
      const newSettings: Partial<SystemSettings> = {};

      for (const row of settingsData as PlatformSettingRow[]) {
        if (row.key.startsWith('feature.')) {
          const flagKey = row.key.replace('feature.', '') as FeatureKey;
          newFlags[flagKey] = Boolean(row.value);
        } else if (row.key.startsWith('system.')) {
          const sysKey = row.key.replace('system.', '') as keyof SystemSettings;
          (newSettings as any)[sysKey] = row.value;
        }
      }

      this.inMemoryFeatureFlags = {
        ...SAFE_BOOT_FEATURE_FLAGS,
        ...newFlags,
      };

      this.inMemorySystemSettings = {
        ...SAFE_BOOT_SYSTEM_SETTINGS,
        ...newSettings,
      };
    } else {
      // Supabase platform_settings table is empty -> seed initial values into Supabase
      console.log('[PlatformConfig] Initializing empty Supabase platform_settings table with charter defaults...');
      await this.seedSupabaseDefaults();
    }

    // 2. Fetch superadmin_audit_logs
    try {
      const { data: auditData, error: auditError } = await supabase
        .from('superadmin_audit_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (!auditError && auditData) {
        this.inMemoryAuditLogs = auditData.map((d: any) => ({
          id: d.id,
          timestamp: d.timestamp,
          actorId: d.actor_id,
          actorName: d.actor_name,
          actionType: d.action_type,
          target: d.target,
          previousValue: d.previous_value,
          newValue: d.new_value,
          reason: d.reason,
        }));
      }
    } catch {
      // Audit log read issue, retain memory baseline
    }
  }

  /**
   * Seeds initial defaults into Supabase platform_settings if table is empty
   */
  private async seedSupabaseDefaults(): Promise<void> {
    if (!supabase) return;

    const rowsToInsert: PlatformSettingRow[] = [];

    // Seed feature flags
    for (const def of SEED_FEATURE_DEFINITIONS) {
      rowsToInsert.push({
        id: `feature.${def.key}`,
        key: `feature.${def.key}`,
        value: def.enabled,
        value_type: 'boolean',
        category: 'feature_flag',
        description: def.description,
        updated_at: new Date().toISOString(),
        updated_by: 'system_bootstrap',
      });
    }

    // Seed system settings
    for (const [key, val] of Object.entries(SEED_SYSTEM_SETTINGS)) {
      const valType = typeof val === 'boolean' ? 'boolean' : typeof val === 'number' ? 'number' : typeof val === 'string' ? 'string' : 'json';
      rowsToInsert.push({
        id: `system.${key}`,
        key: `system.${key}`,
        value: val,
        value_type: valType as any,
        category: 'system_setting',
        description: `Platform setting: ${key}`,
        updated_at: new Date().toISOString(),
        updated_by: 'system_bootstrap',
      });
    }

    try {
      await supabase.from('platform_settings').upsert(rowsToInsert, { onConflict: 'key' });
    } catch (e) {
      console.warn('[PlatformConfig] Notice during seed insertion:', e);
    }
  }

  /**
   * Subscribes to Supabase Realtime channel for live multi-tab & multi-device sync
   */
  private setupRealtimeSubscription(): void {
    if (!supabase || this.realtimeChannel) return;

    try {
      this.realtimeChannel = supabase
        .channel('platform_settings_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'platform_settings' },
          (payload: any) => {
            this.handleRealtimeSettingChange(payload);
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'superadmin_audit_logs' },
          (payload: any) => {
            if (payload?.new) {
              const newLog: SuperAdminAuditEntry = {
                id: payload.new.id,
                timestamp: payload.new.timestamp,
                actorId: payload.new.actor_id,
                actorName: payload.new.actor_name,
                actionType: payload.new.action_type,
                target: payload.new.target,
                previousValue: payload.new.previous_value,
                newValue: payload.new.new_value,
                reason: payload.new.reason,
              };
              this.inMemoryAuditLogs = [newLog, ...this.inMemoryAuditLogs.filter((l) => l.id !== newLog.id)];
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[PlatformConfig] Realtime subscription not available in this environment:', err);
    }
  }

  private handleRealtimeSettingChange(payload: any): void {
    const record = payload.new || payload.old;
    if (!record || !record.key) return;

    if (record.key.startsWith('feature.')) {
      const flagKey = record.key.replace('feature.', '') as FeatureKey;
      this.inMemoryFeatureFlags[flagKey] = Boolean(record.value);
      this.broadcastFeatureFlags();
    } else if (record.key.startsWith('system.')) {
      const sysKey = record.key.replace('system.', '') as keyof SystemSettings;
      (this.inMemorySystemSettings as any)[sysKey] = record.value;
      this.broadcastSystemSettings();
    }
  }

  private broadcastFeatureFlags(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(PLATFORM_EVENTS.FEATURE_FLAGS_UPDATED, {
          detail: { ...this.inMemoryFeatureFlags },
        })
      );
    }
  }

  private broadcastSystemSettings(): void {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(PLATFORM_EVENTS.SETTINGS_UPDATED, {
          detail: { ...this.inMemorySystemSettings },
        })
      );
    }
  }

  private broadcastUpdates(): void {
    this.broadcastFeatureFlags();
    this.broadcastSystemSettings();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent(PLATFORM_EVENTS.CONFIG_STATUS_CHANGED, {
          detail: this.getStatus(),
        })
      );
    }
  }

  // -------------------------------------------------------------
  // PUBLIC GETTERS (Direct In-Memory Access from Supabase State)
  // -------------------------------------------------------------

  public getFeatureFlags(): FeatureFlagState {
    return { ...this.inMemoryFeatureFlags };
  }

  public isFeatureEnabled(key: FeatureKey | string): boolean {
    return Boolean(this.inMemoryFeatureFlags[key as FeatureKey]);
  }

  public getSystemSettings(): SystemSettings {
    return { ...this.inMemorySystemSettings };
  }

  public getAuditLogs(): SuperAdminAuditEntry[] {
    return [...this.inMemoryAuditLogs];
  }

  // -------------------------------------------------------------
  // PUBLIC MUTATIONS (Authoritative Write directly to Supabase)
  // -------------------------------------------------------------

  /**
   * Updates a feature flag in Supabase and records an audit log entry
   */
  public async updateFeatureFlag(
    key: FeatureKey,
    enabled: boolean,
    actor?: { id: string; name: string },
    reason?: string
  ): Promise<boolean> {
    const prevVal = this.inMemoryFeatureFlags[key];
    const timestamp = new Date().toISOString();
    const settingKey = `feature.${key}`;

    // 1. Update in-memory state immediately
    this.inMemoryFeatureFlags[key] = enabled;
    this.broadcastFeatureFlags();

    // 2. Persist to Supabase if available
    if (isSupabaseConfigured && supabase) {
      try {
        const { error: upsertError } = await supabase.from('platform_settings').upsert({
          id: settingKey,
          key: settingKey,
          value: enabled,
          value_type: 'boolean',
          category: 'feature_flag',
          updated_at: timestamp,
          updated_by: actor?.name || 'SuperAdmin',
        });

        if (upsertError) {
          console.error('[PlatformConfig] Supabase updateFeatureFlag error:', upsertError);
          throw upsertError;
        }

        // Record Audit Log in Supabase
        if (actor) {
          await this.logAuditAction({
            actorId: actor.id,
            actorName: actor.name,
            actionType: 'FEATURE_TOGGLE',
            target: key,
            previousValue: String(prevVal),
            newValue: String(enabled),
            reason: reason || `Toggled feature flag "${key}" to ${enabled ? 'ENABLED' : 'DISABLED'}`,
          });
        }
      } catch (err) {
        console.error('[PlatformConfig] Failed to persist feature flag update to Supabase:', err);
        // Rollback memory if write failed
        this.inMemoryFeatureFlags[key] = prevVal;
        this.broadcastFeatureFlags();
        throw err;
      }
    } else {
      // In standalone demo mode without Supabase, maintain memory log
      if (actor) {
        this.inMemoryAuditLogs = [
          {
            id: `audit-${Date.now()}`,
            timestamp,
            actorId: actor.id,
            actorName: actor.name,
            actionType: 'FEATURE_TOGGLE',
            target: key,
            previousValue: String(prevVal),
            newValue: String(enabled),
            reason: reason || `Toggled feature flag "${key}"`,
          },
          ...this.inMemoryAuditLogs,
        ];
      }
    }

    return enabled;
  }

  /**
   * Updates system settings in Supabase and records audit entries
   */
  public async updateSystemSettings(
    newSettings: Partial<SystemSettings>,
    actor?: { id: string; name: string },
    reason?: string
  ): Promise<SystemSettings> {
    const previous = { ...this.inMemorySystemSettings };
    const updated = { ...previous, ...newSettings };
    const timestamp = new Date().toISOString();

    // 1. Update in-memory state
    this.inMemorySystemSettings = updated;
    this.broadcastSystemSettings();

    // 2. Persist to Supabase if available
    if (isSupabaseConfigured && supabase) {
      try {
        const rows: PlatformSettingRow[] = [];
        for (const [k, val] of Object.entries(newSettings)) {
          const valType = typeof val === 'boolean' ? 'boolean' : typeof val === 'number' ? 'number' : typeof val === 'string' ? 'string' : 'json';
          const rowKey = `system.${k}`;
          rows.push({
            id: rowKey,
            key: rowKey,
            value: val,
            value_type: valType as any,
            category: 'system_setting',
            description: `Platform operational setting: ${k}`,
            updated_at: timestamp,
            updated_by: actor?.name || 'SuperAdmin',
          });
        }

        const { error: upsertError } = await supabase.from('platform_settings').upsert(rows, {
          onConflict: 'key',
        });

        if (upsertError) {
          console.error('[PlatformConfig] Supabase updateSystemSettings error:', upsertError);
          throw upsertError;
        }

        // Record Audit Logs in Supabase
        if (actor) {
          for (const [k, val] of Object.entries(newSettings)) {
            await this.logAuditAction({
              actorId: actor.id,
              actorName: actor.name,
              actionType: k === 'maintenanceMode' ? 'MAINTENANCE_TOGGLE' : 'SETTING_CHANGE',
              target: k,
              previousValue: String((previous as any)[k]),
              newValue: String(val),
              reason: reason || `Updated system configuration parameter "${k}"`,
            });
          }
        }
      } catch (err) {
        console.error('[PlatformConfig] Failed to persist system settings to Supabase:', err);
        // Rollback memory on failure
        this.inMemorySystemSettings = previous;
        this.broadcastSystemSettings();
        throw err;
      }
    } else {
      // In standalone demo mode without Supabase, maintain memory log
      if (actor) {
        for (const [k, val] of Object.entries(newSettings)) {
          this.inMemoryAuditLogs = [
            {
              id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              timestamp,
              actorId: actor.id,
              actorName: actor.name,
              actionType: k === 'maintenanceMode' ? 'MAINTENANCE_TOGGLE' : 'SETTING_CHANGE',
              target: k,
              previousValue: String((previous as any)[k]),
              newValue: String(val),
              reason: reason || `Updated parameter "${k}"`,
            },
            ...this.inMemoryAuditLogs,
          ];
        }
      }
    }

    return updated;
  }

  /**
   * Records an audit log entry in Supabase superadmin_audit_logs table
   */
  public async logAuditAction(
    entry: Omit<SuperAdminAuditEntry, 'id' | 'timestamp'>
  ): Promise<SuperAdminAuditEntry> {
    const timestamp = new Date().toISOString();
    const id = `audit-sa-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newLog: SuperAdminAuditEntry = {
      id,
      timestamp,
      ...entry,
    };

    // Prepend to local memory cache
    this.inMemoryAuditLogs = [newLog, ...this.inMemoryAuditLogs];

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('superadmin_audit_logs').insert({
          id: newLog.id,
          timestamp: newLog.timestamp,
          actor_id: newLog.actorId,
          actor_name: newLog.actorName,
          action_type: newLog.actionType,
          target: newLog.target,
          previous_value: newLog.previousValue,
          new_value: newLog.newValue,
          reason: newLog.reason,
        });
      } catch (err) {
        console.warn('[PlatformConfig] Failed to insert audit log row in Supabase:', err);
      }
    }

    return newLog;
  }

  /**
   * Resets all feature flags and system settings to Safe Factory Defaults in Supabase
   */
  public async resetToCharterDefaults(actor?: { id: string; name: string }): Promise<void> {
    this.inMemoryFeatureFlags = { ...SAFE_BOOT_FEATURE_FLAGS };
    this.inMemorySystemSettings = { ...SAFE_BOOT_SYSTEM_SETTINGS };
    this.broadcastUpdates();

    if (isSupabaseConfigured && supabase) {
      await this.seedSupabaseDefaults();
      if (actor) {
        await this.logAuditAction({
          actorId: actor.id,
          actorName: actor.name,
          actionType: 'CHARTER_UPDATE',
          target: 'ALL_CONFIGURATION',
          previousValue: 'CUSTOM',
          newValue: 'FACTORY_CHARTER_DEFAULTS',
          reason: 'SuperAdmin reset platform settings to factory defaults',
        });
      }
    }
  }
}

export const platformConfig = new PlatformConfigService();
