import React, { useState, useEffect } from 'react';
import { ServiceRequest, Worker, Booking } from '../../shared/types';
import { useAuth } from '../auth';
import { db } from '../../shared/services/database';
import { isFeatureEnabled } from '../../shared/config/features.config';
import { StarRating } from '../../shared/components/StarRating';
import { ReviewModal } from './ReviewModal';
import {
  CalendarDays,
  Clock,
  MapPin,
  Wrench,
  Star,
  CheckCircle2,
  AlertCircle,
  Phone,
  ShieldCheck,
  RefreshCw,
  User,
  Radio,
  XCircle,
  Lock,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { useToast } from '../../shared/components/Toast';

interface MyBookingsProps {
  highlightedRequestId?: string;
}

export const MyBookings: React.FC<MyBookingsProps> = ({ highlightedRequestId: propRequestId }) => {
  const { t } = useI18n();
  const { currentUser, currentRole } = useAuth();
  const { showSuccess, showError } = useToast();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  // Derive highlighted ID from props or URL
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(propRequestId || null);

  // SuperAdmin Feature Flag: Reviews visibility
  const canSeeReviews = isFeatureEnabled('workerReviewsVisibility') || currentRole === 'Admin' || currentRole === 'SuperAdmin';

  const loadRequests = async () => {
    setLoading(true);
    try {
      const filter = currentRole === 'Customer' && currentUser ? { customerId: currentUser.id } : undefined;
      const data = await db.getServiceRequests(filter);
      setRequests(data);
    } catch (e) {
      console.error('Failed to load service requests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();

    const handleRefresh = () => loadRequests();
    window.addEventListener('sahyog:request_created', handleRefresh);
    window.addEventListener('sahyog:request_assigned', handleRefresh);
    window.addEventListener('sahyog:request_updated', handleRefresh);
    window.addEventListener('sahyog:request_cancelled', handleRefresh);

    return () => {
      window.removeEventListener('sahyog:request_created', handleRefresh);
      window.removeEventListener('sahyog:request_assigned', handleRefresh);
      window.removeEventListener('sahyog:request_updated', handleRefresh);
      window.removeEventListener('sahyog:request_cancelled', handleRefresh);
    };
  }, [currentUser, currentRole]);

  const handleCancelByCustomer = async (reqId: string) => {
    if (!currentUser) return;
    try {
      await db.cancelServiceRequestByCustomer(reqId, currentUser.id, 'Cancelled by customer');
      showSuccess('Service request cancelled and 100% escrow payment refunded.');
      await loadRequests();
    } catch (err: any) {
      showError(err?.code || 500, err?.message || 'Failed to cancel request');
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'ACTIVE') return !['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(r.requestStatus);
    return r.requestStatus === statusFilter;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              {t('booking.my_bookings_title', 'My Service Bookings')}
            </h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {requests.length} Requests
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track real-time status of your broadcast service requests, assigned cooperative artisans, and escrow safety.
          </p>
        </div>

        <button
          onClick={loadRequests}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Prominent Focused Request Banner (When Navigating from Booking Submission) */}
      {activeHighlightId && requests.find((r) => r.id === activeHighlightId) && (() => {
        const targetReq = requests.find((r) => r.id === activeHighlightId)!;
        const isMatched = Boolean(targetReq.assignedWorkerId && targetReq.worker);
        return (
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10 animate-in slide-in-from-top-2">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>{isMatched ? 'Artisan Assigned' : 'Live Broadcast Dispatch'}</span>
              </div>
              <h2 className="text-lg font-black">
                {isMatched ? 'Professional Assigned & Scheduled' : 'Finding a Verified Professional in Your Neighborhood'}
              </h2>
              <p className="text-xs text-slate-300 max-w-xl">
                {isMatched
                  ? `Your request #${targetReq.id} has been claimed by certified artisan ${targetReq.worker?.name}.`
                  : `Your request #${targetReq.id} for ${targetReq.serviceName} is being broadcasted to verified professionals.`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActiveHighlightId(null)}
              className="self-start md:self-auto px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20 cursor-pointer"
            >
              View All Bookings
            </button>
          </div>
        );
      })()}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'ALL', label: 'All Requests' },
          { key: 'ACTIVE', label: 'Active & In Progress' },
          { key: 'OPEN', label: 'Open Broadcast' },
          { key: 'ASSIGNED', label: 'Assigned' },
          { key: 'COMPLETED', label: 'Completed' },
          { key: 'CANCELLED', label: 'Cancelled / Refunded' },
        ].map((st) => (
          <button
            key={st.key}
            onClick={() => setStatusFilter(st.key)}
            className={`px-4 py-2 text-xs font-bold rounded-2xl transition whitespace-nowrap cursor-pointer ${
              statusFilter === st.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-white rounded-3xl border border-slate-200/80 animate-pulse p-6" />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
          <CalendarDays className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-800">No service requests found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any bookings matching this filter. Explore services to create a new booking.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isAssigned = Boolean(req.assignedWorkerId && req.worker);
            const isFinished = req.requestStatus === 'COMPLETED';
            const isCancelled = req.requestStatus === 'CANCELLED' || req.requestStatus === 'EXPIRED';

            return (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow duration-200 p-6 space-y-5"
              >
                {/* Top Row: Service info + Escrow & Status badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-slate-400">#{req.id}</span>
                      <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-extrabold rounded-md uppercase">
                        {req.serviceCategoryId}
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">{req.serviceName}</h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Payment Escrow Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                        req.paymentStatus === 'HELD_IN_ESCROW'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : req.paymentStatus === 'RELEASED'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {req.paymentStatus === 'HELD_IN_ESCROW'
                          ? '₹' + req.amount + ' in Escrow'
                          : req.paymentStatus === 'RELEASED'
                          ? '₹' + req.amount + ' Released'
                          : '₹' + req.amount + ' Refunded'}
                      </span>
                    </span>

                    {/* Request Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide ${
                        req.requestStatus === 'OPEN' || req.requestStatus === 'MATCHING'
                          ? 'bg-amber-100 text-amber-900 animate-pulse'
                          : req.requestStatus === 'ASSIGNED' || req.requestStatus === 'EN_ROUTE' || req.requestStatus === 'ARRIVED' || req.requestStatus === 'IN_PROGRESS'
                          ? 'bg-emerald-700 text-white'
                          : req.requestStatus === 'COMPLETED'
                          ? 'bg-slate-900 text-white'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {req.requestStatus.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Problems Selected & Schedule */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Problems list & Address */}
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">
                        Reported Problem(s)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {(req.selectedProblems || []).map((probId) => (
                          <span
                            key={probId}
                            className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl"
                          >
                            {t(`services.problems.${probId}`, probId)}
                          </span>
                        ))}
                      </div>
                      {req.otherProblemDetails && (
                        <div className="text-xs text-slate-600 mt-1.5 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                          "{req.otherProblemDetails}"
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-2 text-xs text-slate-600">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{req.address}</span>
                    </div>
                  </div>

                  {/* Right: Assigned Worker Card OR Broadcast Radar */}
                  <div>
                    {isAssigned && req.worker ? (
                      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                            {t('wizard.proAssigned', 'Professional Assigned')}
                          </span>
                          <span className="text-xs font-bold text-slate-600">{req.worker.phone}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <img
                            src={req.worker.avatar_url || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=120&auto=format&fit=crop&q=75'}
                            alt={req.worker.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600 shadow-xs shrink-0"
                          />
                          <div className="space-y-0.5">
                            <div className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                              <span>{req.worker.name}</span>
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div className="text-xs font-semibold text-emerald-800">{req.worker.skill}</div>
                            <div className="text-[11px] text-slate-500">
                              {t('wizard.memberSince', `On SahyogSeva since ${req.worker.joinedDate || 'Aug 2025'}`)}
                            </div>
                          </div>
                        </div>

                        {/* Ratings / Reviews: HIDDEN by default unless SuperAdmin flag is ON */}
                        {canSeeReviews && (
                          <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs text-slate-700">
                            <div className="flex items-center gap-1">
                              <StarRating rating={req.worker.rating_avg || 4.9} size="sm" />
                              <span className="font-bold">({req.worker.completed_jobs_count || 32} jobs)</span>
                            </div>
                            <span className="text-[10px] text-slate-400">(Admin view)</span>
                          </div>
                        )}
                      </div>
                    ) : isCancelled ? (
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
                        <span className="font-bold text-slate-900 block">Cancellation / Refund Notice:</span>
                        <p>{req.cancellationReason || 'Request closed and refunded.'}</p>
                      </div>
                    ) : (
                      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-2">
                        <div className="flex items-center gap-2 font-bold text-amber-900">
                          <Radio className="w-4 h-4 text-amber-600 animate-pulse" />
                          <span>{t('wizard.findingPro', 'Finding a verified cooperative professional...')}</span>
                        </div>
                        <p className="text-[11px] text-amber-800">
                          Your request is being matched across certified artisans in pincode <b>{req.pincode}</b>.
                        </p>
                        <div className="text-[10px] text-amber-700 font-mono">
                          Auto-refund deadline: {new Date(req.assignmentDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Schedule & Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-4 text-slate-600">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <CalendarDays className="w-4 h-4 text-emerald-600" />
                      <span>{req.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>{req.timeSlotDisplay}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isFinished && !isCancelled && (
                      <button
                        type="button"
                        onClick={() => handleCancelByCustomer(req.id)}
                        className="px-3.5 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold transition cursor-pointer"
                      >
                        Cancel & Refund
                      </button>
                    )}

                    {isFinished && (
                      <button
                        type="button"
                        onClick={() => {
                          const adapterBooking: Booking = {
                            id: req.id,
                            customer_id: req.customerId,
                            worker_id: req.assignedWorkerId || '',
                            date: req.date,
                            time_slot: req.timeSlotDisplay,
                            address: req.address,
                            status: 'completed',
                            amount: req.amount,
                            grossAmount: req.amount,
                            platformFee: 0,
                            workerEarnings: req.amount,
                            created_at: req.createdAt,
                          };
                          setReviewBooking(adapterBooking);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold transition cursor-pointer flex items-center gap-1"
                      >
                        <Star className="w-3.5 h-3.5" />
                        <span>Rate Service</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          isOpen={Boolean(reviewBooking)}
          onClose={() => setReviewBooking(null)}
          onReviewSubmitted={() => {
            setReviewBooking(null);
            loadRequests();
          }}
        />
      )}
    </div>
  );
};
