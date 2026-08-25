import React, { useEffect } from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { useAuth } from '../auth';
import { logger } from '../../shared/services/logger';

interface AccessDeniedProps {
  onGoBack: () => void;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ onGoBack }) => {
  const { currentUser, currentRole } = useAuth();

  useEffect(() => {
    logger.logAuth(
      'ACCESS_DENIED',
      currentUser?.id || null,
      currentUser?.phone || null,
      403,
      `Unauthorized user ${currentUser?.name || 'Anonymous'} (${currentRole}) attempted to access /superadmin`
    );
  }, [currentUser, currentRole]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-5 animate-in zoom-in-95">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            <Lock className="w-3 h-3" /> 403 Forbidden
          </span>
          <h2 className="text-xl font-extrabold text-slate-900">
            SuperAdmin Access Restricted
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The platform control plane is reserved strictly for authorized cooperative SuperAdministrators. Your current account role does not have operational governance clearance.
          </p>
        </div>

        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Active Account:</span>
            <span className="font-bold text-slate-900">{currentUser?.name || 'Guest'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Assigned Role:</span>
            <span className="bg-slate-200 text-slate-800 font-bold px-2 py-0.5 rounded text-[11px]">
              {currentRole}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-600">
            <span className="font-medium">Required Role:</span>
            <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded text-[11px]">
              SuperAdmin
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onGoBack}
            className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Safe Directory</span>
          </button>
        </div>
      </div>
    </div>
  );
};
