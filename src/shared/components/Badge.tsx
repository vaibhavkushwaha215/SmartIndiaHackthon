import React from 'react';
import { BookingStatus, UserRole } from '../types';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const { t } = useTranslation();

  const config = {
    pending: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200/80',
      icon: Clock,
      label: t('status.pending', 'Pending Acceptance'),
    },
    confirmed: {
      bg: 'bg-blue-50 text-blue-800 border-blue-200/80',
      icon: CheckCircle2,
      label: t('status.confirmed', 'Confirmed & Scheduled'),
    },
    completed: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
      icon: CheckCircle2,
      label: t('status.completed', 'Service Completed'),
    },
    cancelled: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200/80',
      icon: XCircle,
      label: t('status.cancelled', 'Cancelled'),
    },
  }[status] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: AlertCircle,
    label: status,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
};

interface VerifiedBadgeProps {
  cooperativeId?: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const VerifiedBadge: React.FC<VerifiedBadgeProps> = ({ cooperativeId, className = '', size = 'md' }) => {
  const { t } = useTranslation();

  if (size === 'sm') {
    return (
      <span
        title={cooperativeId ? `Affiliation: ${cooperativeId}` : 'Verified Cooperative Member'}
        className={`inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 ${className}`}
      >
        <ShieldCheck className="w-3 h-3 text-emerald-600" />
        {t('booking.verified_badge', 'Verified')}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-900 border border-emerald-200/80 px-2.5 py-1 rounded-lg text-xs font-semibold ${className}`}>
      <ShieldCheck className="w-4 h-4 text-emerald-600" />
      <span>{t('booking.verified_badge', 'Verified Cooperative Member')}</span>
    </div>
  );
};

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  const colors = {
    Customer: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    Worker: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Admin: 'bg-purple-50 text-purple-700 border-purple-200',
  }[role];

  return (
    <span className={`px-2 py-0.5 text-[11px] font-bold rounded uppercase tracking-wider border ${colors} ${className}`}>
      {role}
    </span>
  );
};
