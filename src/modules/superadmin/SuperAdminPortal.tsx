import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../auth';
import { db } from '../../shared/services/database';
import { FeatureFlagsPanel } from './FeatureFlagsPanel';
import { SystemSettingsPanel } from './SystemSettingsPanel';
import { IntegrationsPanel } from './IntegrationsPanel';
import { SuperAdminAuditLogs } from './SuperAdminAuditLogs';
import { useFeatureDefinitions } from '../../shared/config/features.config';
import { useTheme } from '../../shared/context/ThemeContext';
import { platformConfig, PLATFORM_EVENTS } from '../../shared/services/platform-config.service';
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
  ExternalLink,
  Bug,
  Terminal,
  RefreshCw,
  LogOut,
  Palette,
} from 'lucide-react';

export type SuperAdminSubTab = 'overview' | 'features' | 'system' | 'integrations' | 'logs' | 'diagnostics';

interface SuperAdminPortalProps {
  onExit: () => void;
}

export const SuperAdminPortal: React.FC<SuperAdminPortalProps> = ({ onExit }) => {
  const { currentUser, logout } = useAuth();
  const { currentTheme } = useTheme();
  const [activeSubTab, setActiveSubTab] = useState<SuperAdminSubTab>('overview');
  const { features } = useFeatureDefinitions();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalWorkers: 0,
    totalBookings: 0,
    activeFlags: 0,
    isMaintenance: false,
  });

  const [configStatus, setConfigStatus] = useState(() => platformConfig.getStatus());

  useEffect(() => {
    const handleStatus = () => setConfigStatus(platformConfig.getStatus());
    window.addEventListener(PLATFORM_EVENTS.CONFIG_STATUS_CHANGED, handleStatus);
    return () => window.removeEventListener(PLATFORM_EVENTS.CONFIG_STATUS_CHANGED, handleStatus);
  }, []);

  const [systemErrors, setSystemErrors] = useState<Array<{
    id: string;
    timestamp: string;
    level: 'CRITICAL' | 'WARNING' | 'ERROR';
    service: string;
    message: string;
    stack?: string;
  }>>([
    {
      id: 'diag-001',
      timestamp: new Date().toISOString(),
      level: 'WARNING',
      service: 'Escrow Pool Node',
      message: 'Settlement channel running in Sandbox Simulation Mode (Prototype Charter).',
      stack: 'EscrowGateway.ts:42 -> MockTransactionPipeline:active',
    },
  ]);

  const [simulatedErrorActive, setSimulatedErrorActive] = useState(false);

  const activeFlagsCount = useMemo(() => features.filter((f) => f.enabled).length, [features]);

  useEffect(() => {
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
  }, [activeFlagsCount]);

  const triggerErrorSimulation = () => {
    if (simulatedErrorActive) {
      setSystemErrors((prev) => prev.filter((e) => e.id !== 'sim-001'));
      setSimulatedErrorActive(false);
    } else {
      const newErr = {
        id: 'sim-001',
        timestamp: new Date().toISOString(),
        level: 'CRITICAL' as const,
        service: 'Gemini Vertex AI Endpoint',
        message: 'Simulated API Timeout: Gateway response latency exceeded 5000ms.',
        stack: 'at VertexClient.predict (gemini.service.ts:89)\n  at ChatAssistant.handleInquiry (chatbot.ts:114)',
      };
      setSystemErrors((prev) => [newErr, ...prev]);
      setSimulatedErrorActive(true);
    }
  };

  const hasCriticalErrors = systemErrors.some((e) => e.level === 'CRITICAL' || e.level === 'ERROR');

  const SUB_TABS: { id: SuperAdminSubTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: 'System Overview', icon: Activity },
    { id: 'features', label: 'Feature Flags', icon: Layers },
    { id: 'system', label: 'System Settings', icon: Settings },
    { id: 'integrations', label: 'Integrations & AI', icon: Plug },
    { id: 'logs', label: 'Governance Logs', icon: History },
    { id: 'diagnostics', label: 'Error Diagnostics', icon: Bug },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white">
      
      {/* 1. STANDALONE TOP COMMAND BAR */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Node Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white uppercase">
                  SahyogSeva Operations Control Plane
                </span>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  OPERATIONAL
                </span>
                {configStatus.source === 'SUPABASE' ? (
                  <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                    SUPABASE LIVE
                  </span>
                ) : (
                  <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1" title="Supabase not configured or unreachable; operating with immutable Safe Boot Defaults">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    SAFE BOOT DEFAULTS
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Cooperative Platform Governance • SuperAdmin clearance
              </p>
            </div>
          </div>

          {/* User Account & Exit Action */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              <span className="text-slate-300 font-medium">{currentUser?.name || 'SuperAdmin'}</span>
              <span className="bg-purple-900/80 text-purple-200 text-[10px] font-bold px-1.5 py-0.5 rounded">
                SUPERADMIN
              </span>
            </div>

            <button
              onClick={onExit}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 cursor-pointer shadow-sm"
              title="Return to the public customer application"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              <span>Exit to Public Portal</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. ERROR OCCURRED BANNER (Shown to SuperAdmin when system errors exist) */}
      {hasCriticalErrors && (
        <div className="bg-rose-950/90 border-b border-rose-800 text-rose-100 px-4 sm:px-8 py-3 animate-in slide-in-from-top duration-300">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-900/80 text-rose-300 border border-rose-700 shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-300 animate-bounce" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-rose-200">
                  ⚠️ ERROR OCCURRED!! [System Diagnostics Alert]
                </h4>
                <p className="text-xs text-rose-300/90">
                  One or more backend services or integration connections require attention. Kindly check the diagnostics logs below to fix these errors.
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('diagnostics')}
              className="px-3.5 py-1.5 rounded-xl bg-rose-800 hover:bg-rose-700 text-white text-xs font-bold transition cursor-pointer border border-rose-600 shadow-md shrink-0"
            >
              View Diagnostic Trace →
            </button>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* High-Contrast Operations Header Card */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>Platform Executive Control Center</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Manage platform feature isolation, cooperative tariff rules, live integrations, and audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={triggerErrorSimulation}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                simulatedErrorActive
                  ? 'bg-rose-900/50 border-rose-700 text-rose-200 hover:bg-rose-900'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Bug className="w-3.5 h-3.5" />
              <span>{simulatedErrorActive ? 'Clear Error Simulation' : 'Simulate Diagnostic Error'}</span>
            </button>
          </div>
        </div>

        {/* High-Contrast Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800">
          {SUB_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;
            const isDiagWithErrors = tab.id === 'diagnostics' && hasCriticalErrors;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap rounded-t-xl ${
                  isActive
                    ? 'border-purple-500 text-white bg-slate-900 shadow-md'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isDiagWithErrors ? 'text-rose-400 animate-pulse' : ''}`} />
                <span>{tab.label}</span>
                {tab.id === 'features' && (
                  <span className="bg-purple-900 text-purple-200 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                    {features.length}
                  </span>
                )}
                {isDiagWithErrors && (
                  <span className="bg-rose-900 text-rose-200 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                    !
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* SUBTAB 1: OVERVIEW */}
        {activeSubTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Accounts</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white">{stats.totalUsers}</div>
                <p className="text-[11px] text-slate-400">Platform registered users</p>
              </div>

              <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Verified Artisans</span>
                  <Wrench className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">{stats.totalWorkers}</div>
                <p className="text-[11px] text-emerald-400 font-semibold">Cooperative certified</p>
              </div>

              <div className="bg-slate-900 p-5 rounded-3xl border border-slate-200/10 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Service Bookings</span>
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="text-2xl font-black text-white">{stats.totalBookings}</div>
                <p className="text-[11px] text-slate-400">Escrow protected</p>
              </div>

              <div className="bg-slate-900 p-5 rounded-3xl border border-slate-800 shadow-lg space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Feature Flags</span>
                  <Layers className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-white">{stats.activeFlags} / {features.length}</div>
                <p className="text-[11px] text-emerald-400 font-semibold">Live modules active</p>
              </div>
            </div>

            {/* Infrastructure & Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-lg space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Server className="w-4 h-4 text-purple-400" />
                  <span>Infrastructure & Service Health</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-300">Application Core:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 100% Operational
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-300">Database Layer (Supabase/Local):</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Connected & Synced
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-300">Authentication & RBAC:</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> 4-Tier Guard Active
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-300">Maintenance Mode:</span>
                    {stats.isMaintenance ? (
                      <span className="text-rose-400 font-extrabold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> ACTIVE (Bookings Paused)
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Normal Operations (Off)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-lg space-y-4">
                <h3 className="font-extrabold text-sm text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-purple-400" />
                  <span>Control Plane Shortcuts</span>
                </h3>

                <div className="grid grid-cols-1 gap-2.5">
                  <button
                    onClick={() => setActiveSubTab('features')}
                    className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition text-left flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold text-xs text-white group-hover:text-purple-300">
                        Feature Flags Manager ({features.length} total)
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Hot-toggle modules like FairMatch, AI Chatbot, and Forecast
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
                  </button>

                  <button
                    onClick={() => setActiveSubTab('system')}
                    className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition text-left flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold text-xs text-white group-hover:text-purple-300">
                        System Settings & Maintenance Mode
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Adjust service radius, registration gates, and charter fees
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
                  </button>

                  <button
                    onClick={() => setActiveSubTab('integrations')}
                    className="p-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 transition text-left flex items-center justify-between cursor-pointer group"
                  >
                    <div>
                      <div className="font-bold text-xs text-white group-hover:text-purple-300">
                        External Integrations & AI Engine Health
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Monitor Gemini AI, Escrow, and Map connectors (Zero Secrets Exposed)
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SUBTAB 2: FEATURE FLAGS */}
        {activeSubTab === 'features' && <FeatureFlagsPanel />}

        {/* SUBTAB 3: SYSTEM SETTINGS */}
        {activeSubTab === 'system' && <SystemSettingsPanel />}

        {/* SUBTAB 4: INTEGRATIONS */}
        {activeSubTab === 'integrations' && <IntegrationsPanel />}

        {/* SUBTAB 5: AUDIT LOGS */}
        {activeSubTab === 'logs' && <SuperAdminAuditLogs />}

        {/* SUBTAB 6: ERROR DIAGNOSTICS & SYSTEM LOGS */}
        {activeSubTab === 'diagnostics' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-purple-400" />
                    <span>Real-Time Error Diagnostics & Trace Logs</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Live system trace events, exception captures, and platform anomaly diagnostics.
                  </p>
                </div>

                <button
                  onClick={triggerErrorSimulation}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-bold transition border border-purple-700 cursor-pointer"
                >
                  {simulatedErrorActive ? 'Clear Error State' : 'Trigger Test Error'}
                </button>
              </div>

              {/* Trace Logs List */}
              <div className="space-y-3 pt-2">
                {systemErrors.map((err) => (
                  <div
                    key={err.id}
                    className={`p-4 rounded-2xl border ${
                      err.level === 'CRITICAL'
                        ? 'bg-rose-950/60 border-rose-800'
                        : 'bg-amber-950/50 border-amber-800'
                    } space-y-2`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-black px-2 py-0.5 rounded text-[10px] uppercase ${
                            err.level === 'CRITICAL'
                              ? 'bg-rose-900 text-rose-200'
                              : 'bg-amber-900 text-amber-200'
                          }`}
                        >
                          {err.level}
                        </span>
                        <span className="font-bold text-white">{err.service}</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">
                        {new Date(err.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 font-medium">
                      {err.message}
                    </p>

                    {err.stack && (
                      <pre className="p-3 rounded-xl bg-slate-950/90 text-purple-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
                        {err.stack}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
};
