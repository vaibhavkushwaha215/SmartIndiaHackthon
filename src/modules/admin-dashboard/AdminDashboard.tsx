import React, { useState, useEffect } from 'react';
import { Worker, Booking } from '../../shared/types';
import { db } from '../../shared/services/database';
import { StatusBadge, VerifiedBadge } from '../../shared/components/Badge';
import { StarRating } from '../../shared/components/StarRating';
import { AdminWorkersManagement } from './AdminWorkersManagement';
import { AdminAnalytics } from './AdminAnalytics';
import {
  Shield,
  Users,
  Calendar,
  CheckCircle2,
  Search,
  Filter,
  RefreshCw,
  TrendingUp,
  FileText,
  MapPin,
  Phone,
  Clock,
  Briefcase,
  Layers,
  ArrowRight,
  Scale,
  ShieldCheck,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth';

export type AdminSubTab = 'overview' | 'workers' | 'analytics';

interface AdminDashboardProps {
  initialSubTab?: AdminSubTab;
  onNavigateToForecast?: () => void;
  onNavigateToLogs?: () => void;
  onNavigateToSettings?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialSubTab = 'overview',
  onNavigateToForecast,
  onNavigateToLogs,
  onNavigateToSettings,
}) => {
  const { t } = useTranslation();
  const { isSuperAdmin } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>(initialSubTab);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [wData, bData] = await Promise.all([db.getWorkers(), db.getBookings()]);
      setWorkers(wData);
      setBookings(bData);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCompleted = bookings.filter((b) => b.status === 'completed').length;
  const totalEscrowPool = bookings.reduce((sum, b) => sum + (b.amount || 299), 0);
  const verifiedWorkersCount = workers.filter((w) => w.verified || w.verificationStatus === 'Verified').length;

  const SUB_TABS: { id: AdminSubTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'overview', label: t('admin.overview', 'Administration Overview'), icon: Layers },
    { id: 'workers', label: `${t('admin.workersCompliance', 'Workers & Compliance')} (/admin/workers)`, icon: Users },
    { id: 'analytics', label: `${t('admin.cooperativeAnalytics', 'Cooperative Analytics')} (/admin/analytics)`, icon: TrendingUp },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Admin Header Banner */}
      <div className="bg-slate-900 bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-purple-500/20">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center">
              <Shield className="w-4 h-4 text-purple-200" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white">
              {t('admin.dashboard_title', 'Cooperative Administration Portal')}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-purple-200/90 mt-1">
            {t('admin.dashboard_subtitle', 'System-wide oversight for cooperative workers, bookings, fair opportunity allocation, and compliance.')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onNavigateToForecast && (
            <button
              onClick={onNavigateToForecast}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20 hover:border-white/40 shadow-xs"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('nav.demand_forecast', 'Demand Forecast')}</span>
            </button>
          )}

          {onNavigateToLogs && (
            <button
              onClick={onNavigateToLogs}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-white/20 hover:border-white/40 shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-purple-300" />
              <span>{t('nav.logs', 'Audit Logs')}</span>
            </button>
          )}

          {isSuperAdmin && onNavigateToSettings && (
            <button
              onClick={onNavigateToSettings}
              className="px-3.5 py-2 rounded-xl bg-purple-600/70 hover:bg-purple-600 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-purple-400/50 shadow-xs"
              title="Open Platform Governance in Settings"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-200" />
              <span>Platform Governance</span>
            </button>
          )}

          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer border border-white/20 hover:border-white/40"
            title={t('common.refresh', 'Refresh')}
          >
            <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {SUB_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'border-purple-600 text-purple-900 dark:text-purple-300 bg-purple-50/80 dark:bg-purple-950/40 rounded-t-xl'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/60 dark:hover:bg-slate-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* SUBTAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-purple-700" />
                {t('admin.verifiedWorkers', 'Verified Workers')}
              </span>
              <div className="text-2xl font-black text-slate-900">
                {verifiedWorkersCount} / {workers.length}
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold">{t('home.hero.policeVerified', '100% Police Verified')}</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-700" />
                {t('admin.totalBookings', 'Total Bookings')}
              </span>
              <div className="text-2xl font-black text-slate-900">{bookings.length}</div>
              <p className="text-[11px] text-slate-500">{totalCompleted} {t('booking.completed_jobs', 'completed')}</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                {t('admin.escrowVolume', 'Escrow Volume')}
              </span>
              <div className="text-2xl font-black text-emerald-700">₹{totalEscrowPool}</div>
              <p className="text-[11px] text-emerald-700 font-semibold">{t('home.hero.zeroBrokerage', 'Cooperative Protected')}</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-purple-700" />
                {t('admin.fairnessIndex', 'FairMatch Gini')}
              </span>
              <div className="text-2xl font-black text-purple-900">0.14</div>
              <p className="text-[11px] text-purple-700 font-semibold">Equitable job spread</p>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-700" />
                <span>{t('admin.workerIntake', 'Worker & Intake Administration')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Audit active cooperative members, inspect verification IDs, approve incoming onboarding applications, or suspend non-compliant workers.
              </p>
              <button
                onClick={() => setActiveSubTab('workers')}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs transition cursor-pointer flex items-center justify-between"
              >
                <span>{t('admin.workersCompliance', 'Open Worker Registry')} (/admin/workers)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>{t('admin.analyticsFairness', 'Cooperative Analytics & Fairness')}</span>
              </h3>
              <p className="text-xs text-slate-500">
                Inspect category demand trends, booking fulfillment rates, and the anti-monopoly Worker Opportunity Distribution chart.
              </p>
              <button
                onClick={() => setActiveSubTab('analytics')}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-between"
              >
                <span>{t('admin.cooperativeAnalytics', 'View Analytics')} (/admin/analytics)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Recent Bookings List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-700" />
                <span>{t('admin.recentBookings', 'Recent Platform Bookings')}</span>
              </h3>
              <span className="text-xs text-slate-400 font-semibold">{bookings.length} total</span>
            </div>

            <div className="divide-y divide-slate-100">
              {bookings.slice(0, 5).map((booking) => (
                <div
                  key={booking.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded">
                        {booking.id}
                      </span>
                      <StatusBadge status={booking.status} />
                      <span className="font-bold text-slate-900">
                        {booking.worker?.name || 'Assigned Worker'}
                      </span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Customer: <strong>{booking.customer?.name || 'Customer'}</strong> • Location: {booking.address}
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 space-y-0.5">
                    <div className="font-black text-slate-900">₹{booking.amount || 299}</div>
                    <div className="text-[11px] text-slate-400">{booking.date} • {booking.time_slot}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUBTAB 2: WORKERS & COMPLIANCE */}
      {activeSubTab === 'workers' && <AdminWorkersManagement />}

      {/* SUBTAB 3: ANALYTICS */}
      {activeSubTab === 'analytics' && <AdminAnalytics />}

    </div>
  );
};
