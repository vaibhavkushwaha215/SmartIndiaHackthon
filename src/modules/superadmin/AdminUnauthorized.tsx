import React, { useEffect } from 'react';
import { ShieldAlert, ArrowLeft, Lock, Shield } from 'lucide-react';
import { useAuth } from '../auth';
import { logger } from '../../shared/services/logger';

interface AdminUnauthorizedProps {
  onGoToAdmin: () => void;
}

export const AdminUnauthorized: React.FC<AdminUnauthorizedProps> = ({ onGoToAdmin }) => {
  const { currentUser } = useAuth();

  useEffect(() => {
    logger.logAuth(
      'ACCESS_DENIED',
      currentUser?.id || null,
      currentUser?.phone || null,
      403,
      `Standard Admin ${currentUser?.name} attempted to access SuperAdmin control plane`
    );
  }, [currentUser]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-amber-200 shadow-xl text-center space-y-6 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            <Lock className="w-3 h-3" /> 403 Unauthorized Access
          </span>
          <h2 className="text-xl font-extrabold text-slate-900">
            SuperAdmin Clearance Required
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Your account is authenticated as a <strong>Standard Cooperative Admin</strong>. Access to the master control plane, global feature toggles, and system settings requires dedicated <strong>SuperAdmin</strong> executive clearance.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Active Account:</span>
            <span className="font-bold text-slate-900">{currentUser?.name || 'Admin'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Your Role:</span>
            <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[11px]">
              Admin
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Required Role:</span>
            <span className="bg-indigo-900 text-white font-bold px-2 py-0.5 rounded text-[11px]">
              SuperAdmin
            </span>
          </div>
        </div>

        <button
          onClick={onGoToAdmin}
          className="w-full py-3 px-4 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
        >
          <Shield className="w-4 h-4" />
          <span>Return to Cooperative Admin Portal</span>
        </button>
      </div>
    </div>
  );
};
