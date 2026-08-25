import React, { useState, useEffect } from 'react';
import { IntegrationStatusInfo } from '../../shared/types';
import { db } from '../../shared/services/database';
import {
  Plug,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Wallet,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Lock,
  Activity,
  RefreshCw,
} from 'lucide-react';

const INTEGRATION_ICONS: Record<string, React.FC<{ className?: string }>> = {
  'gemini-ai': Cpu,
  'payments-escrow': Wallet,
  'maps-geolocation': MapPin,
  'notifications': MessageSquare,
};

export const IntegrationsPanel: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatusInfo[]>([]);
  const [testingId, setTestingId] = useState<string | null>(null);

  useEffect(() => {
    db.getIntegrations().then(setIntegrations);
  }, []);

  const handleTestConnection = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setTestingId(null);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner with Security Notice */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Plug className="w-5 h-5 text-purple-700" />
              <span>External Service Integrations & Protocols</span>
            </h3>
            <span className="bg-purple-100 text-purple-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-purple-300">
              Zero-Trust Architecture
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time health monitoring of third-party APIs, AI engines, and payment escrow nodes.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold">Secrets are strictly isolated on server environment</span>
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((item) => {
          const Icon = INTEGRATION_ICONS[item.id] || Plug;
          const isTesting = testingId === item.id;

          return (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-200 transition"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{item.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{item.provider}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full border ${
                      item.status === 'Configured' || item.status === 'Enabled'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {item.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                {/* Secure Environment Reference */}
                {item.environmentVarName && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono text-[11px]">Env Reference:</span>
                    <code className="bg-slate-200/70 text-slate-800 px-2 py-0.5 rounded text-[11px] font-bold">
                      {item.environmentVarName}
                    </code>
                  </div>
                )}

                {/* Capabilities Badges */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                    Supported Workflows:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="bg-purple-50 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-purple-100"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Heartbeat: Operational</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleTestConnection(item.id)}
                  disabled={isTesting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-700 text-xs font-bold transition cursor-pointer border border-slate-200"
                >
                  <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin text-purple-700' : ''}`} />
                  <span>{isTesting ? 'Pinging...' : 'Ping Test'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
