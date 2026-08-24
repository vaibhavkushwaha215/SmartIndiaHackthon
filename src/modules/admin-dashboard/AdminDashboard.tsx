import React, { useState, useEffect } from 'react';
import { Worker, Booking } from '../../shared/types';
import { db } from '../../shared/services/database';
import { StatusBadge, VerifiedBadge } from '../../shared/components/Badge';
import { StarRating } from '../../shared/components/StarRating';
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
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface AdminDashboardProps {
  onNavigateToForecast?: () => void;
  onNavigateToLogs?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onNavigateToForecast,
  onNavigateToLogs,
}) => {
  const { t } = useTranslation();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'workers' | 'bookings'>('workers');
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

  const filteredWorkers = workers.filter(
    (w) =>
      (w.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.cooperative_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.skill.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBookings = bookings.filter(
    (b) =>
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.worker?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center">
              <Shield className="w-4 h-4 text-purple-200" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold">{t('admin.dashboard_title', 'Cooperative Administration Portal')}</h1>
          </div>
          <p className="text-xs sm:text-sm text-purple-200/80 mt-1">
            System-wide oversight for cooperative workers, bookings, demand allocation, and compliance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToForecast && (
            <button
              onClick={onNavigateToForecast}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
              <span>Forecast</span>
            </button>
          )}
          {onNavigateToLogs && (
            <button
              onClick={onNavigateToLogs}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-300" />
              <span>Audit Logs</span>
            </button>
          )}
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Refresh tables"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {t('admin.total_workers', 'Active Workers')}
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{workers.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {t('admin.total_bookings', 'Total Bookings')}
            </span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{bookings.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              {t('admin.completed_bookings', 'Completed Jobs')}
            </span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">{totalCompleted}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Coop Escrow Flow</span>
            <div className="text-2xl font-extrabold text-purple-600 mt-1">₹{totalEscrowPool}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        {/* Tab & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('workers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'workers'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('admin.all_workers_tab', 'Registered Electricians')} ({workers.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('admin.all_bookings_tab', 'All Bookings Register')} ({bookings.length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search table records..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* WORKERS TABLE */}
        {activeTab === 'workers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Electrician</th>
                  <th className="py-3 px-3">Cooperative ID</th>
                  <th className="py-3 px-3">Skill & Specialty</th>
                  <th className="py-3 px-3">Area</th>
                  <th className="py-3 px-3">Rating</th>
                  <th className="py-3 px-3">Tariff</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredWorkers.map((w) => (
                  <tr key={w.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={w.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                          alt={w.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-900">{w.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">+91 {w.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[11px] text-slate-700">{w.cooperative_id}</td>
                    <td className="py-3.5 px-3 max-w-[220px] truncate text-slate-600 font-medium" title={w.skill}>
                      {w.skill}
                    </td>
                    <td className="py-3.5 px-3 text-slate-700">{w.area}</td>
                    <td className="py-3.5 px-3">
                      <StarRating rating={w.rating_avg} size="sm" showNumber />
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-800">₹{w.hourly_rate || 299}/hr</td>
                    <td className="py-3.5 px-3">
                      <VerifiedBadge cooperativeId={w.cooperative_id} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* BOOKINGS TABLE */}
        {activeTab === 'bookings' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3 px-3">Booking ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Worker</th>
                  <th className="py-3 px-3">Date & Slot</th>
                  <th className="py-3 px-3">Address</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-800">#{b.id}</td>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-slate-900">{b.customer?.name || 'Customer'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{b.customer?.phone}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800">{b.worker?.name || 'Worker'}</div>
                      <div className="text-[10px] text-emerald-700">{b.worker?.area}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div className="font-semibold text-slate-800">{b.date}</div>
                      <div className="text-[10px] text-slate-500">{b.time_slot}</div>
                    </td>
                    <td className="py-3.5 px-3 max-w-[200px] truncate text-slate-600" title={b.address}>
                      {b.address}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-emerald-800">₹{b.amount || 299}</td>
                    <td className="py-3.5 px-3">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
