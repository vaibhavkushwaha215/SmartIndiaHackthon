import React, { useState, useEffect } from 'react';
import { AreaDemandForecast } from '../../shared/types';
import { db } from '../../shared/services/database';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Cell,
} from 'recharts';
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Users,
  Sparkles,
  Info,
  Calendar,
  Layers,
} from 'lucide-react';
import { useI18n } from '../i18n';

export const DemandForecast: React.FC = () => {
  const { t } = useI18n();
  const [forecastData, setForecastData] = useState<AreaDemandForecast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    db.getDemandForecast()
      .then((data) => setForecastData(data))
      .finally(() => setLoading(false));
  }, []);

  const totalPredictedJobs = forecastData.reduce((acc, curr) => acc + curr.predicted_jobs, 0);

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'High':
        return '#f59e0b'; // Amber
      case 'Medium':
        return '#3b82f6'; // Blue
      default:
        return '#10b981'; // Emerald
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header with Preview Badge */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-orange-600 text-white p-6 sm:p-8 rounded-3xl shadow-xl space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold text-amber-100 border border-white/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('forecast.badge', 'Preview Feature • Predictive Dispatch AI')}</span>
          </div>
          <span className="bg-white text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Prototype Data
          </span>
        </div>

        <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
          {t('forecast.title', 'Cooperative Demand Forecasting')}
        </h1>
        <p className="text-xs sm:text-sm text-amber-100 max-w-2xl leading-relaxed">
          {t('forecast.subtitle', 'AI-projected service demand by area for the upcoming week based on seasonal trends, weather alerts, and cooperative load history.')}
        </p>
      </div>

      {/* Cooperative Mobilization Alert */}
      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-950">{t('forecast.table_status', 'Cooperative Alert')}: </span>
          {t('forecast.high_demand_alert', 'Cooperative mobilization recommended for high demand zones.')}
        </div>
      </div>

      {/* Recharts Bar Chart Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>{t('forecast.chart_title', 'Predicted Bookings by Area (Next 7 Days)')}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('forecast.predictedBookings', 'Projected booking volume vs. currently active registered electricians.')}
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-slate-700">
            <span className="text-emerald-700">Total: {totalPredictedJobs} Jobs</span>
          </div>
        </div>

        {/* Responsive Recharts Container */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={forecastData}
              margin={{ top: 10, right: 10, left: -20, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="area"
                tick={{ fontSize: 11, fill: '#475569', fontWeight: 500 }}
                tickFormatter={(v) => v.split(' ')[0]}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={50}
                dy={6}
              />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none',
                }}
                itemStyle={{ color: '#f8fafc' }}
              />
              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '15px' }}
              />
              <Bar
                dataKey="predicted_jobs"
                name={t('forecast.table_demand', 'Predicted Demand')}
                fill="#f59e0b"
                radius={[6, 6, 0, 0]}
              >
                {forecastData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getDemandColor(entry.demand_level)} />
                ))}
              </Bar>
              <Bar
                dataKey="active_workers"
                name={t('forecast.table_workers', 'Active Workers')}
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Demand Breakdown Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>{t('forecast.chart_title', 'Regional Demand & Peak Load Analysis')}</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">{t('forecast.table_area', 'Area / Sector')}</th>
                <th className="py-3 px-3">{t('forecast.table_demand', 'Predicted Demand')}</th>
                <th className="py-3 px-3">{t('forecast.table_peak', 'Expected Peak Time')}</th>
                <th className="py-3 px-3">{t('forecast.table_workers', 'Active Workers')}</th>
                <th className="py-3 px-3">{t('forecast.table_status', 'Cooperative Alert')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forecastData.map((row) => (
                <tr key={row.area} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 font-bold text-slate-900">{row.area}</td>
                  <td className="py-3.5 px-3 font-bold text-amber-700">{row.predicted_jobs}</td>
                  <td className="py-3.5 px-3 text-slate-600">{row.peak_time}</td>
                  <td className="py-3.5 px-3 font-semibold text-emerald-800">{row.active_workers}</td>
                  <td className="py-3.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                        row.demand_level === 'High'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : row.demand_level === 'Medium'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {row.demand_level === 'High' ? t('forecast.high', 'High') : row.demand_level === 'Medium' ? t('forecast.moderate', 'Moderate') : t('forecast.balanced', 'Balanced')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
