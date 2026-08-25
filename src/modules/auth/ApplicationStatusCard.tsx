import React, { useState } from 'react';
import { db } from '../../shared/services/database';
import { WorkerApplication } from '../../shared/types';
import { Search, Clock, CheckCircle2, XCircle, AlertCircle, Building2, User, Phone, MapPin } from 'lucide-react';

export const ApplicationStatusCard: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [app, setApp] = useState<WorkerApplication | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length !== 10) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const result = await db.getWorkerApplicationByPhone(phone.trim());
      setApp(result);
    } catch {
      setApp(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
      <div>
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Search className="w-4 h-4 text-emerald-700" />
          <span>Check Existing Application Status</span>
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Already submitted a cooperative worker onboarding form? Enter your 10-digit registered mobile number to check review progress.
        </p>
      </div>

      <form onSubmit={handleLookup} className="flex gap-2">
        <input
          type="tel"
          maxLength={10}
          value={phone}
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter 10-digit mobile number"
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50"
        />
        <button
          type="submit"
          disabled={loading || phone.length !== 10}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Check Status'}
        </button>
      </form>

      {hasSearched && !loading && !app && (
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
          <p className="text-xs font-bold text-slate-700">No Application Found</p>
          <p className="text-[11px] text-slate-500">
            No cooperative application is currently recorded for mobile number {phone}.
          </p>
        </div>
      )}

      {app && (
        <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-4 animate-in fade-in">
          {/* Status Header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-500">{app.id}</span>
              <span
                className={`text-[11px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  app.status === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800'
                    : app.status === 'Rejected'
                    ? 'bg-rose-100 text-rose-800'
                    : app.status === 'Under Review'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {app.status}
              </span>
            </div>

            <span className="text-[11px] text-slate-400">
              Submitted: {new Date(app.submittedAt).toLocaleDateString('en-IN')}
            </span>
          </div>

          {/* Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span><strong>Applicant:</strong> {app.fullName}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span><strong>Mobile:</strong> {app.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              <span><strong>Cooperative:</strong> {app.cooperativeSociety}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span><strong>Trade Skill:</strong> {app.primarySkill}</span>
            </div>
          </div>

          {/* Decision Notes */}
          {app.status === 'Approved' && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong>Application Approved!</strong> Your artisan account is verified and active. Sign in with your phone and password <code>worker123</code> to access your Worker Dashboard.
              </div>
            </div>
          )}

          {app.status === 'Rejected' && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-900 border border-rose-200 text-xs flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div>
                <strong>Application Not Approved:</strong> {app.rejectionReason || 'Cooperative verification requirements were not met. You may submit a corrected application.'}
              </div>
            </div>
          )}

          {app.status === 'Pending' && (
            <div className="p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs flex items-start gap-2">
              <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Pending Verification:</strong> Your application has been queued for document and police verification by the cooperative administrator.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
