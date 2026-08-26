import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../auth';
import { db } from '../../shared/services/database';
import { AccessDenied } from './AccessDenied';
import { FeatureFlagsPanel } from './FeatureFlagsPanel';
import { SystemSettingsPanel } from './SystemSettingsPanel';
import { IntegrationsPanel } from './IntegrationsPanel';
import { SuperAdminAuditLogs } from './SuperAdminAuditLogs';
import { useFeatureDefinitions } from '../../shared/config/features.config';
import {
  ShieldCheck,
  Layers,
  Settings,
  Plug,
  History,
  Activity,
  Server,
  Users,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export type SuperAdminSubTab = 'overview' | 'features' | 'system' | 'integrations' | 'logs';

interface SuperAdminDashboardProps {
  initialSubTab?: SuperAdminSubTab;
  onGoBack?: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  initialSubTab = 'overview',
  onGoBack = () => {},
}) => {
  const { isSuperAdmin, currentUser } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<SuperAdminSubTab>(initialSubTab);
  const { features } = useFeatureDefinitions();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    totalBookings: 0,
    activeFlags: 0,
    isMaintenance: false,
  });

  const activeFlagsCount = useMemo(() => features.filter((f) => f.enabled).length, [features]);

  useEffect(() => {
    if (!isSuperAdmin) return;

    Promise.all([
      db.getUsers(),
      db.getWorkers(),
      db.getBookings(),
      db.getSystemSettings(),
    ]).then(([users, workers, bookings, settings]) => {
      setStats({
        totalUsers: users.length,
        totalWorkers: workers.length,
        totalBookings: bookings.length,
        activeFlags: activeFlagsCount,
        isMaintenance: settings.maintenanceMode,
      });
    });
  }, [isSuperAdmin, activeFlagsCount]);

  // Strict Security Clearance Verification
  if (!isSuperAdmin) {
    return <AccessDenied onGoBack={onGoBack} />;
  }

  const SUB_TABS: { id: SuperAdminSubTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'System Overview', icon: Activity },
    { id: 'features', label: 'Feature Flags', icon: Layers },
    { id: 'system', label: 'System Settings', icon: Settings },
    { id: 'integrations', label: 'Integrations & AI', icon: Plug },
    { id: 'logs', label: 'Governance Logs', icon: History },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Control Center Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 bg-purple-500/20 border border-purple-400/40 text-purple-200 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> SuperAdmin Operations Control Plane
              </span>
              <span className="bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Node: Active
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              SahyogSeva Platform Governance
            </h1>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-2xl leading-relaxed">
              Centralized mission control for feature toggles, cooperative policies, third-party integrations, and audit logs.
            </p>
          </div>

          {/* Admin Identity Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-xs space-y-1.5 shrink-0">
            <div className="text-purple-200/70 font-semibold uppercase text-[10px] tracking-wider">
              Authorized Officer
            </div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              {currentUser?.name || 'SuperAdmin'}
            </div>
            <div className="text-[11px] text-purple-200/80 font-mono">
              Role: <span className="text-white font-bold">SuperAdmin</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-purple-700 text-purple-900 bg-purple-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === 'features' && (
                <span className="bg-purple-100 text-purple-800 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                  {features.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Sub-Tab Contents */}

      {/* 1. OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Accounts
                </span>
                <Users className="w-4 h-4 text-purple-700" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {stats.totalUsers}
              </div>
              <p className="text-[11px] text-slate-500">
                Customers & trade workers
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Verified Artisans
                </span>
                <Wrench className="w-4 h-4 text-emerald-700" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {stats.totalWorkers}
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold">
                Cooperative certified
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Service Bookings
                </span>
                <TrendingUp className="w-4 h-4 text-indigo-700" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {stats.totalBookings}
              </div>
              <p className="text-[11px] text-slate-500">
                Escrow protected
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Feature Flags
                </span>
                <Layers className="w-4 h-4 text-purple-700" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {stats.activeFlags} / {features.length}
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold">
                Modules online
              </p>
            </div>

          </div>

          {/* System Status Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* System Health Check */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Server className="w-4 h-4 text-purple-700" />
                <span>Live System Status & Infrastructure</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">Application Core:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 100% Operational
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">Database Layer (Supabase/Local):</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected & Synced
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">Authentication & RBAC:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 4-Tier Guard Active
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700">Maintenance Mode:</span>
                  {stats.isMaintenance ? (
                    <span className="text-rose-600 font-extrabold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> ACTIVE (Bookings Paused)
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Normal Operations (Off)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-700" />
                <span>Operational Shortcuts</span>
              </h3>

              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => setActiveSubTab('features')}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 transition text-left flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 group-hover:text-purple-900">
                      Manage Feature Flags ({features.length} total)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Toggle modules like FairMatch, AI Chatbot, and Forecast
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-700 transition transform group-hover:translate-x-0.5" />
                </button>

                <button
                  onClick={() => setActiveSubTab('system')}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 transition text-left flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 group-hover:text-purple-900">
                      System Settings & Maintenance Mode
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Adjust service radius, registration gates, and charter fees
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-700 transition transform group-hover:translate-x-0.5" />
                </button>

                <button
                  onClick={() => setActiveSubTab('integrations')}
                  className="p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50 hover:border-purple-200 border border-slate-200 transition text-left flex items-center justify-between cursor-pointer group"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 group-hover:text-purple-900">
                      View Integrations Health & AI Status
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Monitor Google Gemini AI, Escrow, and Map connectors
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-700 transition transform group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* 2. FEATURE FLAGS */}
      {activeSubTab === 'features' && <FeatureFlagsPanel />}

      {/* 3. SYSTEM SETTINGS */}
      {activeSubTab === 'system' && <SystemSettingsPanel />}

      {/* 4. INTEGRATIONS */}
      {activeSubTab === 'integrations' && <IntegrationsPanel />}

      {/* 5. AUDIT LOGS */}
      {activeSubTab === 'logs' && <SuperAdminAuditLogs />}

    </div>
  );
};
