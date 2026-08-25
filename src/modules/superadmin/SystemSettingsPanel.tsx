import React, { useState, useEffect } from 'react';
import { SystemSettings } from '../../shared/types';
import { db } from '../../shared/services/database';
import { useAuth } from '../auth';
import { useToast } from '../../shared/components/Toast';
import {
  Settings,
  ShieldAlert,
  Save,
  AlertTriangle,
  Radio,
  MapPin,
  Percent,
  Globe,
  UserPlus,
  Wrench,
  Clock,
} from 'lucide-react';

export const SystemSettingsPanel: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  useEffect(() => {
    db.getSystemSettings().then(setSettings);
  }, []);

  if (!settings) {
    return (
      <div className="p-12 text-center text-slate-400">Loading system settings...</div>
    );
  }

  const handleToggleMaintenance = (enabled: boolean) => {
    if (enabled) {
      setIsMaintenanceModalOpen(true);
    } else {
      setSettings((prev) => (prev ? { ...prev, maintenanceMode: false } : prev));
    }
  };

  const confirmMaintenanceMode = () => {
    setSettings((prev) => (prev ? { ...prev, maintenanceMode: true } : prev));
    setIsMaintenanceModalOpen(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !currentUser) return;
    setIsSaving(true);

    try {
      await db.updateSystemSettings(
        settings,
        { id: currentUser.id, name: currentUser.name },
        'SuperAdmin updated platform parameters via Control Plane'
      );
      showSuccess('Platform operational settings have been securely updated and synced.');
    } catch (err: any) {
      showError(500, 'Failed to save system settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-700" />
            <span>Platform Operational Governance & Settings</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Configure system-wide dispatch thresholds, registration controls, and charter parameters.
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-950 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
        >
          <Save className="w-4 h-4" />
          <span>{isSaving ? 'Saving Changes...' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* 1. Maintenance Mode Emergency Freeze */}
      <div
        className={`p-6 rounded-3xl border transition-all ${
          settings.maintenanceMode
            ? 'bg-rose-50 border-rose-300 shadow-sm'
            : 'bg-white border-slate-200/80 shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className={`w-4 h-4 ${settings.maintenanceMode ? 'text-rose-600' : 'text-slate-400'}`} />
                Platform Maintenance Mode
              </span>
              {settings.maintenanceMode && (
                <span className="bg-rose-200 text-rose-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                  Active - Non-Admins Locked
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 max-w-xl">
              When enabled, direct customer booking is safely paused and standard users see a maintenance banner. SuperAdmins retain full management access.
            </p>
          </div>

          <button
            type="button"
            onClick={() => handleToggleMaintenance(!settings.maintenanceMode)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.maintenanceMode ? 'bg-rose-600' : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={settings.maintenanceMode}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                settings.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {settings.maintenanceMode && (
          <div className="mt-4 pt-4 border-t border-rose-200 space-y-2">
            <label className="block text-xs font-bold text-rose-950 uppercase">
              Public Maintenance Notice Message
            </label>
            <textarea
              rows={2}
              value={settings.maintenanceMessage}
              onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-rose-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        )}
      </div>

      {/* 2. Registration & Intake Policies */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Customer Registration */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <UserPlus className="w-4 h-4 text-indigo-600" />
              Customer Sign-Ups
            </span>
            <input
              type="checkbox"
              checked={settings.customerRegistrationEnabled}
              onChange={(e) => setSettings({ ...settings, customerRegistrationEnabled: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
            />
          </div>
          <p className="text-xs text-slate-500">
            Allow new residents in coverage areas to create customer accounts.
          </p>
        </div>

        {/* Worker Applications */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-emerald-600" />
              Artisan Intake
            </span>
            <input
              type="checkbox"
              checked={settings.workerApplicationsEnabled}
              onChange={(e) => setSettings({ ...settings, workerApplicationsEnabled: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
            />
          </div>
          <p className="text-xs text-slate-500">
            Allow trade artisans and cooperatives to submit membership onboarding applications.
          </p>
        </div>

        {/* Direct Booking */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
              <Radio className="w-4 h-4 text-emerald-600" />
              Direct Bookings
            </span>
            <input
              type="checkbox"
              checked={settings.bookingEnabled}
              onChange={(e) => setSettings({ ...settings, bookingEnabled: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
            />
          </div>
          <p className="text-xs text-slate-500">
            Allow customers to schedule verified technician visits and emergency slots.
          </p>
        </div>

      </div>

      {/* 3. Geographical Dispatch & Tariffs */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
        <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-purple-700" />
          <span>Dispatch Radii & Cooperative Tariff Policies</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Default Radius */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Standard Service Radius (km)
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={settings.defaultServiceRadiusKm}
              onChange={(e) => setSettings({ ...settings, defaultServiceRadiusKm: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Max Radius */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Max Emergency Radius (km)
            </label>
            <input
              type="number"
              min={5}
              max={100}
              value={settings.maxBookingRadiusKm}
              onChange={(e) => setSettings({ ...settings, maxBookingRadiusKm: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Platform Fee */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <Percent className="w-3 h-3 text-emerald-600" />
              <span>Platform Fee (%)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={5}
                step={0.1}
                value={settings.platformServiceFeePercent}
                onChange={(e) => setSettings({ ...settings, platformServiceFeePercent: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
              0% Cooperative Charter Guarantee
            </span>
          </div>

          {/* Lead Timeout */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-600" />
              <span>Lead Acceptance (mins)</span>
            </label>
            <input
              type="number"
              min={5}
              max={60}
              value={settings.autoAssignLeadTimeoutMins}
              onChange={(e) => setSettings({ ...settings, autoAssignLeadTimeoutMins: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-purple-500"
            />
          </div>

        </div>
      </div>

      {/* 4. Localization & Currency Defaults */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
          <Globe className="w-4 h-4 text-purple-700" />
          <span>Regional Defaults</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Default Platform Language
            </label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-purple-500"
            >
              <option value="en">English (India)</option>
              <option value="hi">हिंदी (Hindi)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Settlement Currency
            </label>
            <input
              type="text"
              readOnly
              value={settings.defaultCurrency}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold bg-slate-100 text-slate-600 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Maintenance Confirmation Modal */}
      {isMaintenanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-extrabold text-base text-slate-900">
                Activate Platform Maintenance Mode?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                This action will display a maintenance notice to all regular customers and pause new booking submissions while you perform system upgrades.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsMaintenanceModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmMaintenanceMode}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer shadow-md"
              >
                Enable Maintenance Mode
              </button>
            </div>
          </div>
        </div>
      )}

    </form>
  );
};
