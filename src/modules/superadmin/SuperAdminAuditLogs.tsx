import React, { useState, useEffect } from 'react';
import { SuperAdminAuditEntry } from '../../shared/types';
import { db } from '../../shared/services/database';
import {
  History,
  User,
  Clock,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const SuperAdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<SuperAdminAuditEntry[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');

  const loadLogs = () => {
    db.getSuperAdminAuditLogs().then(setLogs);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter((log) => {
    if (filterType === 'ALL') return true;
    return log.actionType === filterType;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-purple-700" />
            <span>Immutable Governance Audit Trail</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Cryptographically timestamped record of all configuration and feature flag modifications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Action Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 text-slate-700 focus:ring-2 focus:ring-purple-500"
          >
            <option value="ALL">All Action Types</option>
            <option value="FEATURE_TOGGLE">Feature Flag Toggles</option>
            <option value="SETTING_CHANGE">System Settings</option>
            <option value="MAINTENANCE_TOGGLE">Maintenance Mode</option>
            <option value="INTEGRATION_UPDATE">Integrations</option>
          </select>

          <button
            onClick={loadLogs}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            title="Refresh logs"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No audit log records match the selected filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((log) => {
              const formattedDate = new Date(log.timestamp).toLocaleString('en-IN', {
                dateStyle: 'medium',
                timeStyle: 'short',
              });

              return (
                <div
                  key={log.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-extrabold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                          log.actionType === 'FEATURE_TOGGLE'
                            ? 'bg-purple-100 text-purple-800'
                            : log.actionType === 'MAINTENANCE_TOGGLE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {log.actionType.replace('_', ' ')}
                      </span>
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                        {log.target}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <span className="font-semibold text-rose-600 line-through bg-rose-50 px-1.5 py-0.5 rounded text-[11px]">
                        {log.previousValue}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[11px]">
                        {log.newValue}
                      </span>
                    </div>

                    {log.reason && (
                      <p className="text-slate-500 text-[11px] italic">
                        "{log.reason}"
                      </p>
                    )}
                  </div>

                  {/* Actor & Timestamp */}
                  <div className="sm:text-right shrink-0 space-y-1 text-slate-400 text-[11px]">
                    <div className="flex items-center sm:justify-end gap-1 font-semibold text-slate-700">
                      <User className="w-3 h-3 text-purple-700" />
                      <span>{log.actorName}</span>
                    </div>
                    <div className="flex items-center sm:justify-end gap-1 text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
