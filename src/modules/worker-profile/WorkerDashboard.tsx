import React, { useState, useEffect } from 'react';
import { Worker, Booking } from '../../shared/types';
import { useAuth } from '../auth';
import { db } from '../../shared/services/database';
import { logger } from '../../shared/services/logger';
import { useToast } from '../../shared/components/Toast';
import { StatusBadge, VerifiedBadge } from '../../shared/components/Badge';
import { StarRating } from '../../shared/components/StarRating';
import { WorkerProfileForm } from './WorkerProfileForm';
import {
  Wrench,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  User,
  Phone,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const WorkerDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [currentWorker, setCurrentWorker] = useState<Worker | null>(null);
  const [workerBookings, setWorkerBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);

  const loadWorkerData = async () => {
    setLoading(true);
    try {
      const workers = await db.getWorkers();
      // Match worker with current logged in user or default to worker-1 for demo
      const matched = workers.find((w) => w.user_id === currentUser?.id) || workers[0];
      setCurrentWorker(matched);

      if (matched) {
        const bookings = await db.getBookings({ workerId: matched.id });
        setWorkerBookings(bookings);
      }
    } catch (e) {
      console.error('Failed to load worker dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkerData();
  }, [currentUser]);

  const handleStatusUpdate = async (bookingId: string, newStatus: 'confirmed' | 'completed') => {
    setUpdatingBookingId(bookingId);
    try {
      await db.updateBookingStatus(bookingId, newStatus);

      await logger.logBookingStatusChange(
        currentUser?.id || currentWorker?.user_id || 'worker',
        bookingId,
        newStatus,
        200
      );

      const msg =
        newStatus === 'confirmed'
          ? t('worker.job_accepted', 'Job accepted and scheduled.')
          : t('worker.job_completed', 'Job marked as completed successfully.');

      showSuccess(msg);
      await loadWorkerData();
    } catch (err: any) {
      showError(err.code || 500, err.message);
    } finally {
      setUpdatingBookingId(null);
    }
  };

  if (loading && !currentWorker) {
    return (
      <div className="p-8 text-center animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mx-auto mb-4" />
        <div className="h-40 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  if (!currentWorker) {
    return (
      <div className="p-8 bg-white rounded-3xl text-center border border-slate-200 space-y-3">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Worker Profile Not Found</h3>
        <p className="text-xs text-slate-500">Sign in with a Worker account to access the cooperative job management portal.</p>
      </div>
    );
  }

  const pendingCount = workerBookings.filter((b) => b.status === 'pending').length;
  const confirmedCount = workerBookings.filter((b) => b.status === 'confirmed').length;
  const completedCount = workerBookings.filter((b) => b.status === 'completed').length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Banner / Worker Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentWorker.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
            alt={currentWorker.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
          />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold">{currentWorker.name}</h1>
              <VerifiedBadge cooperativeId={currentWorker.cooperative_id} size="sm" />
            </div>
            <p className="text-xs text-emerald-200 font-mono mt-0.5">{currentWorker.cooperative_id}</p>
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={currentWorker.rating_avg} size="sm" showNumber />
              <span className="text-emerald-300">•</span>
              <span className="text-xs text-emerald-100 font-semibold">{currentWorker.area}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingProfile ? 'Close Editor' : t('worker.edit_profile', 'Edit Profile')}</span>
          </button>
          <button
            onClick={loadWorkerData}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            title="Refresh bookings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Editable Profile Section */}
      {isEditingProfile && (
        <WorkerProfileForm
          worker={currentWorker}
          onProfileUpdated={(updated) => {
            setCurrentWorker(updated);
            setIsEditingProfile(false);
          }}
        />
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Pending Acceptance</span>
            <div className="text-2xl font-extrabold text-amber-600 mt-1">{pendingCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Confirmed / Scheduled</span>
            <div className="text-2xl font-extrabold text-blue-600 mt-1">{confirmedCount}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Completed Services</span>
            <div className="text-2xl font-extrabold text-emerald-600 mt-1">
              {(currentWorker.completed_jobs_count || 0) + completedCount}
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Assigned Bookings Table / Cards */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              {t('worker.assigned_jobs', 'Assigned Customer Bookings')}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review incoming service slots, accept bookings, and mark completed once on-site work is done.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
            {workerBookings.length} Total Jobs
          </span>
        </div>

        {workerBookings.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No assigned bookings yet. New customer bookings in your area will appear here.
          </div>
        ) : (
          <div className="space-y-3">
            {workerBookings.map((b) => {
              const isUpdating = updatingBookingId === b.id;

              return (
                <div
                  key={b.id}
                  className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 hover:border-slate-300 transition space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                        #{b.id}
                      </span>
                      <span className="text-xs font-semibold text-slate-800">
                        {b.customer?.name || 'Customer'}
                      </span>
                      {b.customer?.phone && (
                        <span className="text-xs text-slate-500 font-mono">
                          (+91 {b.customer.phone})
                        </span>
                      )}
                    </div>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold bg-white p-2.5 rounded-xl border border-slate-100">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{b.date}</span>
                      <span className="text-slate-300">•</span>
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{b.time_slot}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600 bg-white p-2.5 rounded-xl border border-slate-100">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{b.address}</span>
                    </div>
                  </div>

                  {b.problem_description && (
                    <div className="text-xs bg-white p-2.5 rounded-xl border border-slate-100 text-slate-700">
                      <span className="font-bold text-slate-800">Requirement: </span>
                      {b.problem_description}
                    </div>
                  )}

                  {/* Worker Action Buttons */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="text-xs font-semibold text-emerald-800">
                      Tariff: <strong>₹{b.amount || 299}</strong> (Escrow Protected)
                    </div>

                    <div className="flex items-center gap-2">
                      {b.status === 'pending' && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusUpdate(b.id, 'confirmed')}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('worker.accept_job', 'Accept Job')}</span>
                        </button>
                      )}

                      {b.status === 'confirmed' && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() => handleStatusUpdate(b.id, 'completed')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('worker.complete_job', 'Mark Complete')}</span>
                        </button>
                      )}

                      {b.status === 'completed' && (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          ✓ Job Completed & Escrow Released
                        </span>
                      )}
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
