import React from 'react';
import { BookingStatus, UserRole } from '../types';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { useI18n } from '../../modules/i18n';

interface StatusBadgeProps {
  status: BookingStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const { t } = useI18n();

  const config = {
    pending: {
      bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200/80 dark:border-amber-800',
      icon: Clock,
      label: t('status.pending', 'Pending Acceptance'),
    },
    accepted: {
      bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200/80 dark:border-blue-800',
      icon: CheckCircle2,
      label: t('status.confirmed', 'Accepted'),
    },
    in_progress: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800',
      icon: Clock,
      label: t('worker.activeServiceInProgress', 'In Progress'),
    },
    confirmed: {
      bg: 'bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-200/80 dark:border-blue-800',
      icon: CheckCircle2,
      label: t('status.confirmed', 'Confirmed & Scheduled'),
    },
    completed: {
      bg: 'bg-[var(--color-primary-light,#ecfdf5)] dark:bg-emerald-950/60 text-[var(--color-primary,#059669)] dark:text-emerald-300 border-[var(--color-border,#e2e8f0)] dark:border-emerald-800',
      icon: CheckCircle2,
      label: t('status.completed', 'Service Completed'),
    },
    cancelled: {
      bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200/80 dark:border-rose-800',
      icon: XCircle,
      label: t('status.cancelled', 'Cancelled'),
    },
  }[status] || {
    bg: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
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
  const { t } = useI18n();

  if (size === 'sm') {
    return (
      <span
        title={cooperativeId ? `Affiliation: ${cooperativeId}` : t('common.verified', 'Verified Member')}
        className={`inline-flex items-center gap-1 bg-[var(--color-primary-light,#ecfdf5)] dark:bg-emerald-950/80 text-[var(--color-primary,#059669)] dark:text-emerald-300 text-xs font-bold px-2 py-0.5 rounded-md border border-[var(--color-border,#e2e8f0)] dark:border-emerald-800 ${className}`}
      >
        <ShieldCheck className="w-3 h-3 text-[var(--color-primary,#059669)] dark:text-emerald-400" />
        {t('common.verified', 'Verified')}
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 bg-[var(--color-primary-light,#ecfdf5)] dark:bg-slate-800 text-[var(--color-text,#0f172a)] dark:text-slate-100 border border-[var(--color-border,#e2e8f0)] dark:border-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold ${className}`}>
      <ShieldCheck className="w-4 h-4 text-[var(--color-primary,#059669)] dark:text-emerald-400" />
      <span>{t('common.verified', 'Verified Member')}</span>
    </div>
  );
};

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, className = '' }) => {
  const { t } = useI18n();

  const colors = {
    Customer: 'bg-[var(--color-primary-light,#ecfdf5)] text-[var(--color-primary,#059669)] border-[var(--color-border,#e2e8f0)] dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-800',
    Worker: 'bg-[var(--color-primary-light,#ecfdf5)] text-[var(--color-primary,#059669)] border-[var(--color-border,#e2e8f0)] dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800',
    Admin: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-800',
    SuperAdmin: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-900/90 dark:text-purple-200 dark:border-purple-700 font-extrabold shadow-xs',
  }[role];

  const roleLabel = role === 'Customer'
    ? t('roles.customer', 'Customer')
    : role === 'Worker'
    ? t('roles.worker', 'Worker')
    : role === 'Admin'
    ? t('roles.admin', 'Admin')
    : t('roles.superadmin', 'SuperAdmin');

  return (
    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md uppercase tracking-wider border ${colors} ${className}`}>
      {roleLabel}
    </span>
  );
};
