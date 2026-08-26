import React, { useState, useEffect, useCallback } from 'react';
import { Worker, Booking, ServiceRequest, BookingStatus, ServiceRequestStatus } from '../../shared/types';
import { db } from '../../shared/services/database';
import { matchingService, RankedRequest } from '../../shared/services/matching.service';
import { useAuth } from '../auth';
import { useToast } from '../../shared/components/Toast';
import { StatusBadge } from '../../shared/components/Badge';
import {
  Briefcase,
  Clock,
  MapPin,
  Phone,
  User,
  Calendar,
  CheckCircle2,
  Play,
  XCircle,
  IndianRupee,
  Search,
  AlertTriangle,
  Radio,
  EyeOff,
  ThumbsDown,
  ShieldCheck,
  Zap,
  Info,
  Truck,
  Check,
} from 'lucide-react';
import { useI18n } from '../i18n';
import { useTheme } from '../../shared/context/ThemeContext';

export const WorkerJobs: React.FC = () => {
  const { t } = useI18n();
  const { currentTheme } = useTheme();
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [activeMainTab, setActiveMainTab] = useState<'FEED' | 'MY_JOBS'>('FEED');
  const [workerProfile, setWorkerProfile] = useState<Worker | null>(null);
  const [rankedRequests, setRankedRequests] = useState<RankedRequest[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [myRequests, setMyRequests] = useState<ServiceRequest[]>([]);
  const [activeJobFilter, setActiveJobFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Cancellation modal state
  const [cancellingRequestId, setCancellingRequestId] = useState<string | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const workers = await db.getWorkers();
      // Match current logged in user to worker record
      let matchedWorker = workers.find(
        (w) => w.user_id === currentUser.id || w.phone === currentUser.phone || w.id === currentUser.id
      );

      // Fallback: If no explicit worker profile matches, pick worker-1 for testing
      if (!matchedWorker && currentUser.role === 'Worker') {
        matchedWorker = workers[0];
      }

      setWorkerProfile(matchedWorker || null);

      const allRequests = await db.getServiceRequests();
      const allBookings = await db.getBookings();

      if (matchedWorker) {
        const ranked = matchingService.getRankedRequestsForWorker(
          matchedWorker,
          allRequests,
          allBookings
        );
        setRankedRequests(ranked);

        // Worker's assigned requests
        const assigned = allRequests.filter((r) => r.assignedWorkerId === matchedWorker.id);
        setMyRequests(assigned);

        // Worker's legacy bookings
        const workerBookings = allBookings.filter(
          (b) => b.worker_id === matchedWorker.id || b.worker_id === currentUser.id
        );
        setMyBookings(workerBookings);
      }
    } catch (e) {
      console.error('Error loading worker feed data:', e);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();

    // Listen to real-time local storage events
    const handleRefresh = () => loadData();
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
  }, [loadData]);

  // WORKER ACTION: ACCEPT REQUEST
  const handleAcceptRequest = async (requestId: string) => {
    if (!workerProfile) return;
    try {
      await db.acceptServiceRequest(requestId, workerProfile.id);
      showSuccess(t('workerFeed.acceptedSuccess', 'Request successfully accepted! You are assigned to this job.'));
      await loadData();
      setActiveMainTab('MY_JOBS');
    } catch (err: any) {
      showError(err?.code || 409, err?.message || t('workerFeed.alreadyClaimed', 'This service request was just accepted by another cooperative professional.'));
      await loadData();
    }
  };

  // WORKER ACTION: IGNORE REQUEST
  const handleIgnoreRequest = async (requestId: string) => {
    if (!workerProfile) return;
    try {
      await db.ignoreServiceRequest(requestId, workerProfile.id);
      showSuccess('Request deprioritized to the bottom of your feed.');
      await loadData();
    } catch (err: any) {
      showError(err?.code || 500, 'Failed to ignore request');
    }
  };

  // WORKER ACTION: REJECT REQUEST
  const handleRejectRequest = async (requestId: string) => {
    if (!workerProfile) return;
    try {
      await db.rejectServiceRequest(requestId, workerProfile.id);
      showSuccess('Request removed from your feed.');
      await loadData();
    } catch (err: any) {
      showError(err?.code || 500, 'Failed to reject request');
    }
  };

  // WORKER STATUS PROGRESSION (Assigned -> En Route -> Arrived -> In Progress -> Completed)
  const handleUpdateStatus = async (requestId: string, newStatus: ServiceRequestStatus) => {
    try {
      await db.updateServiceRequestStatus(requestId, newStatus);
      showSuccess(`Status updated to ${newStatus.replace('_', ' ')}`);
      await loadData();
    } catch (err: any) {
      showError(err?.code || 500, err?.message || 'Failed to update job status');
    }
  };

  // WORKER CANCELLATION
  const handleConfirmWorkerCancel = async () => {
    if (!cancellingRequestId || !workerProfile) return;
    setIsProcessing(true);
    try {
      const updated = await db.cancelServiceRequestByWorker(cancellingRequestId, workerProfile.id, cancellationReason || 'Worker schedule conflict');
      if (updated.penaltyApplied && updated.penaltyApplied > 0) {
        showSuccess(`Job cancelled. Notice: ₹${updated.penaltyApplied} cancellation fee applied as per 3-hour policy.`);
      } else {
        showSuccess('Job cancelled with 0 penalty. Re-broadcasted to available worker pool.');
      }
      setCancellingRequestId(null);
      setCancellationReason('');
      await loadData();
    } catch (err: any) {
      showError(err?.code || 500, err?.message || 'Failed to cancel job');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header & Main Tabs */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-600" />
            <span>Cooperative Dispatch & Job Board</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {workerProfile
              ? `Logged as ${workerProfile.name} • ${workerProfile.skill} • Pincodes: ${(workerProfile.pincodes || []).join(', ')}`
              : 'Managing active requests & broadcast problem feed'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveMainTab('FEED')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeMainTab === 'FEED'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Available Problem Feed ({rankedRequests.filter((r) => !r.isIgnored).length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMainTab('MY_JOBS')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeMainTab === 'MY_JOBS'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>My Active Jobs ({myRequests.length + myBookings.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: BROADCAST AVAILABLE PROBLEMS FEED */}
      {activeMainTab === 'FEED' && (
        <div className="space-y-4">
          <div className={`bg-gradient-to-r ${currentTheme.colors.headerGradient || 'from-slate-900 via-slate-800 to-emerald-950'} text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-white/10`}>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2 border border-white/10">
                <Zap className="w-3.5 h-3.5" />
                <span>Live Broadcast Dispatch</span>
              </div>
              <h3 className="text-lg font-black">{t('workerFeed.availableProblems', 'Available Requests & Problems')}</h3>
              <p className="text-xs text-slate-300 max-w-xl mt-1">
                {t('workerFeed.availableSubtitle', 'Broadcasted doorstep requests in your registered pincodes and trade.')} First artisan to accept wins the job.
              </p>
            </div>
          </div>

          {/* Feed Cards */}
          <div className="space-y-4">
            {rankedRequests.map(({ request, tier, hasConflict, conflictReason, isIgnored, canAccept }) => (
              <div
                key={request.id}
                className={`p-6 rounded-3xl border transition-all duration-200 bg-white shadow-xs flex flex-col justify-between gap-5 ${
                  tier === 1
                    ? 'border-red-400 bg-red-50/30'
                    : tier === 3
                    ? 'border-amber-300 opacity-90'
                    : tier === 4
                    ? 'border-slate-200 opacity-70 bg-slate-50'
                    : 'border-slate-200 hover:border-emerald-500'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Bar: Priority Badge + Amount */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {tier === 1 && (
                        <span className="px-3 py-1 bg-red-600 text-white text-[11px] font-black uppercase tracking-wider rounded-full flex items-center gap-1 animate-pulse">
                          <Zap className="w-3 h-3" />
                          <span>Emergency SOS</span>
                        </span>
                      )}
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-[11px] font-extrabold uppercase tracking-wider rounded-full">
                        {request.serviceCategoryId}
                      </span>
                      <span className="text-xs font-mono text-slate-400">#{request.id}</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Net Payout (0% Fee)</span>
                      <span className="text-lg font-black text-emerald-700">₹{request.amount}</span>
                    </div>
                  </div>

                  {/* Service Title & Problems */}
                  <div>
                    <h4 className="text-base font-extrabold text-slate-900">{request.serviceName}</h4>
                    
                    {/* Selected Problems Pills */}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(request.selectedProblems || []).map((probId) => (
                        <span
                          key={probId}
                          className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-xl"
                        >
                          {t(`services.problems.${probId}`, probId)}
                        </span>
                      ))}
                    </div>

                    {request.otherProblemDetails && (
                      <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700">
                        <span className="font-bold text-slate-900">Custom Problem Note: </span>
                        {request.otherProblemDetails}
                      </div>
                    )}
                  </div>

                  {/* Schedule & Location */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-600 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Service Date</div>
                        <div className="font-bold text-slate-900">{request.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Time Window</div>
                        <div className="font-bold text-slate-900">{request.timeSlotDisplay}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] text-slate-400 uppercase font-bold">Locality / Area</div>
                        <div className="font-bold text-slate-900">{request.locality} (PIN {request.pincode})</div>
                      </div>
                    </div>
                  </div>

                  {/* Conflict Notice if any */}
                  {hasConflict && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-bold">{t('workerFeed.conflictNotice', 'You already have a booking during this time and cannot apply.')}</span>
                    </div>
                  )}

                  {isIgnored && (
                    <div className="text-xs text-slate-500 italic flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>You previously ignored this request.</span>
                    </div>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {!isIgnored && (
                      <button
                        type="button"
                        onClick={() => handleIgnoreRequest(request.id)}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer transition flex items-center gap-1"
                      >
                        <EyeOff className="w-3.5 h-3.5" />
                        <span>{t('workerFeed.ignore', 'Ignore')}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRejectRequest(request.id)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-red-50 hover:border-red-200 text-slate-600 hover:text-red-600 text-xs font-bold cursor-pointer transition flex items-center gap-1"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      <span>{t('workerFeed.reject', 'Reject')}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={!canAccept}
                    onClick={() => handleAcceptRequest(request.id)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-xs font-bold shadow-md cursor-pointer transition flex items-center gap-1.5 disabled:cursor-not-allowed"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t('workerFeed.accept', 'Accept Request')}</span>
                  </button>
                </div>
              </div>
            ))}

            {rankedRequests.length === 0 && !loading && (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                <Radio className="w-12 h-12 text-slate-400 mx-auto" />
                <h4 className="text-base font-bold text-slate-800">No Open Requests In Feed</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {t('workerFeed.noAvailable', 'No new service requests matching your trade and pincodes at this moment.')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MY ACTIVE & ASSIGNED JOBS */}
      {activeMainTab === 'MY_JOBS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {myRequests.map((req) => (
              <div key={req.id} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-full uppercase">
                      Status: {req.requestStatus}
                    </span>
                    <span className="text-xs font-mono text-slate-400">#{req.id}</span>
                  </div>
                  <span className="text-base font-black text-emerald-700">₹{req.amount}</span>
                </div>

                <div>
                  <h4 className="text-base font-extrabold text-slate-900">{req.serviceName}</h4>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(req.selectedProblems || []).map((probId) => (
                      <span key={probId} className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">
                        {t(`services.problems.${probId}`, probId)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer Full Address:</span>
                    <span className="font-bold text-slate-900">{req.address}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Scheduled Window:</span>
                    <span className="font-bold text-slate-900">{req.date} ({req.timeSlotDisplay})</span>
                  </div>
                </div>

                {/* Progress Workflow Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCancellingRequestId(req.id)}
                    className="px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold cursor-pointer transition"
                  >
                    Cancel Assignment
                  </button>

                  <div className="flex items-center gap-2">
                    {req.requestStatus === 'ASSIGNED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(req.id, 'EN_ROUTE')}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Mark En Route</span>
                      </button>
                    )}
                    {req.requestStatus === 'EN_ROUTE' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(req.id, 'ARRIVED')}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        <span>Mark Arrived</span>
                      </button>
                    )}
                    {req.requestStatus === 'ARRIVED' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(req.id, 'IN_PROGRESS')}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Start Work</span>
                      </button>
                    )}
                    {req.requestStatus === 'IN_PROGRESS' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(req.id, 'COMPLETED')}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete & Release Escrow</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {myRequests.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
                <Briefcase className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-sm font-bold text-slate-800">No active assigned jobs</h4>
                <p className="text-xs text-slate-500">Go to the Available Problem Feed tab to accept customer requests.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CANCELLATION MODAL WITH 3-HOUR PENALTY POLICY */}
      {cancellingRequestId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-2.5 text-red-600 font-extrabold text-base">
              <AlertTriangle className="w-5 h-5" />
              <span>Cancel Assigned Job</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <div className="font-bold">Cooperative Cancellation Policy:</div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                <li>&gt; 3 hours before appointment: <b>No penalty (₹0)</b></li>
                <li>Within 3 hours before appointment: <b>₹100 penalty fee</b></li>
                <li>Emergency cancellation (&lt; 30 mins): <b>No penalty</b></li>
              </ul>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">Reason for cancellation *</label>
              <textarea
                rows={3}
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="e.g. Personal emergency, vehicle breakdown..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCancellingRequestId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmWorkerCancel}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md cursor-pointer transition disabled:opacity-50"
              >
                {isProcessing ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
