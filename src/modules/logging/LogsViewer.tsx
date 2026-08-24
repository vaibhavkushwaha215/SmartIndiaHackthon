import React, { useState, useEffect } from 'react';
import { LogEntry } from '../../shared/types';
import { db } from '../../shared/services/database';
import {
  FileText,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Globe,
  Clock,
  Terminal,
  Shield,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LogsViewer: React.FC = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await db.getLogs(actionFilter);
      setLogs(data);
    } catch (e) {
      console.error('Failed to load logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [actionFilter]);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      (log.user_id || '').toLowerCase().includes(q) ||
      (log.phone || '').toLowerCase().includes(q) ||
      log.route.toLowerCase().includes(q) ||
      log.ip_address.toLowerCase().includes(q) ||
      (log.details || '').toLowerCase().includes(q) ||
      String(log.result_code).includes(q)
    );
  });

  const getResultBadge = (code: number) => {
    if (code >= 200 && code < 300) {
      return (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" />
          {code} OK
        </span>
      );
    }
    if (code === 101 || code === 102 || code === 400 || code === 401) {
      return (
        <span className="inline-flex items-center gap-1 font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
          <AlertCircle className="w-3 h-3" />
          {code} WARN
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200">
        <XCircle className="w-3 h-3" />
        {code} ERR
      </span>
    );
  };

  const actionCategories = [
    'ALL',
    'LOGIN_SUCCESS',
    'LOGIN_FAILED',
    'BOOKING_CREATED',
    'BOOKING_STATUS_CHANGE',
    'PAYMENT_MOCK_SUCCESS',
    'REVIEW_SUBMITTED',
    'WORKER_PROFILE_UPDATED',
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Logs Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-indigo-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold">{t('logs.title', 'System Audit & Troubleshooting Logs')}</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            {t('logs.subtitle', 'Real-time audit log of all authentications, bookings, state mutations, and errors.')}
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>{t('logs.refresh', 'Refresh Logs')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Action Type Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:ring-2 focus:ring-slate-500"
          >
            {actionCategories.map((action) => (
              <option key={action} value={action}>
                {action === 'ALL' ? t('logs.filter_all', 'All Actions') : action}
              </option>
            ))}
          </select>
        </div>

        {/* Text search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search action, IP, code, user..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">{t('logs.col_time', 'Timestamp')}</th>
                <th className="py-3.5 px-3">{t('logs.col_action', 'Action')}</th>
                <th className="py-3.5 px-3">{t('logs.col_user', 'User / Phone')}</th>
                <th className="py-3.5 px-3">{t('logs.col_route', 'Route')}</th>
                <th className="py-3.5 px-3">{t('logs.col_ip', 'Client IP')}</th>
                <th className="py-3.5 px-3">{t('logs.col_code', 'Result Code')}</th>
                <th className="py-3.5 px-4">{t('logs.col_details', 'Details')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {t('logs.empty', 'No audit logs found matching the filter.')}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors font-mono">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-800 font-sans">{log.action}</span>
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-slate-800">{log.user_id || 'System'}</div>
                      {log.phone && <div className="text-[10px] text-slate-400 font-mono">+91 {log.phone}</div>}
                    </td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px]">{log.route}</td>
                    <td className="py-3 px-3 text-slate-600 font-mono text-[11px] flex items-center gap-1 mt-2">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span>{log.ip_address}</span>
                    </td>
                    <td className="py-3 px-3">{getResultBadge(Number(log.result_code))}</td>
                    <td className="py-3 px-4 font-sans text-slate-600 max-w-xs break-words" title={log.details}>
                      {log.details || '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
