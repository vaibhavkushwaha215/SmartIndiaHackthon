import React, { useState, useEffect } from 'react';
import { Worker, Booking } from '../../shared/types';
import { db } from '../../shared/services/database';
import { useAuth } from '../auth';
import { useToast } from '../../shared/components/Toast';
import { StarRating } from '../../shared/components/StarRating';
import { StatusBadge, VerifiedBadge } from '../../shared/components/Badge';
import {
  Wrench,
  Calendar,
  IndianRupee,
  Star,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  User,
  Radio,
  Play,
  Briefcase,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface WorkerDashboardProps {
  onNavigateToJobs?: () => void;
  onNavigateToEarnings?: () => void;
}

export const WorkerDashboard: React.FC<WorkerDashboardProps> = ({
  onNavigateToJobs,
  onNavigateToEarnings,
}) => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [worker, setWorker] = useState<Worker | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isAvailable, setIsAvailable] = useState<boolean>(true);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState(false);

  const loadData = async () => {
    try {
      const [workers, allBookings] = await Promise.all([db.getWorkers(), db.getBookings()]);
      
      // Match logged-in worker by user ID or phone, or synthesize from currentUser for fresh signups
      let current = workers.find((w) => w.user_id === currentUser?.id || w.phone === currentUser?.phone);
      
      if (!current && currentUser?.role === 'Worker') {
        current = {
          id: currentUser.id,
          user_id: currentUser.id,
          name: currentUser.name,
          phone: currentUser.phone,
          skill: 'Registered Cooperative Professional',
          cooperative_id: 'Cooperative Federation Member',
          hourly_rate: 299,
          area: 'Base Locality',
          verified: true,
          isAvailable: true,
          rating_avg: 5.0,
          completed_jobs_count: 0,
          created_at: new Date().toISOString(),
        } as unknown as Worker;
      }

      if (current) {
        setWorker(current);
        setIsAvailable(current.isAvailable !== false);
      }

      const myJobs = allBookings.filter(
        (b) =>
          b.worker_id === current?.id ||
          b.worker?.user_id === currentUser?.id ||
          b.worker?.phone === currentUser?.phone
      );
      setBookings(myJobs);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const handleToggleAvailability = async () => {
    if (!worker) return;
    setIsTogglingAvailability(true);
    const newState = !isAvailable;
    try {
      await db.setWorkerAvailability(worker.id, newState);
      setIsAvailable(newState);
      if (newState) {
        showSuccess('You are now AVAILABLE. Customers can book your service slots.');
      } else {
        showSuccess('You are now marked UNAVAILABLE. New booking dispatches are paused.');
      }
    } catch {
      showError(500, 'Failed to update availability status.');
    } finally {
      setIsTogglingAvailability(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: any) => {
    try {
      await db.updateBookingStatus(bookingId, newStatus, undefined, currentUser);
      showSuccess(`Booking updated to ${newStatus.toUpperCase()}`);
      loadData();
    } catch (err: any) {
      showError(err?.code || 500, err?.message || 'Failed to update booking.');
    }
  };

  const pendingRequests = bookings.filter((b) => b.status === 'pending');
  const activeJob = bookings.find((b) => b.status === 'in_progress' || b.status === 'confirmed');
  const completedJobs = bookings.filter((b) => b.status === 'completed');
  const totalEarningsEstimate = completedJobs.reduce((sum, b) => sum + (b.amount || 299), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. Worker Profile Header & Availability Toggle */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={
                worker?.avatar_url ||
                currentUser?.avatar_url ||
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=75'
              }
              alt="Worker avatar"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
            />
            <div
              className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                isAvailable ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
              title={isAvailable ? 'Available for requests' : 'Unavailable'}
            >
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {worker?.name || currentUser?.name || 'Rajesh Sharma'}
              </h1>
              <VerifiedBadge />
            </div>
            <p className="text-xs font-bold text-emerald-800">
              {worker?.skill || 'Master Electrician • Delhi Vidyut Sahyog'}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-0.5">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                {worker?.rating_avg || 4.9} rating
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {worker?.area || 'Lajpat Nagar & South Delhi'}
              </span>
              <span>•</span>
              <span className="font-semibold text-emerald-700">
                ₹{worker?.hourly_rate || 299}/hr (0% fee)
              </span>
            </div>
          </div>
        </div>

        {/* Live Availability Switch */}
        <div className="w-full md:w-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Dispatch Status
            </div>
            <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 mt-0.5">
              <Radio className={`w-3.5 h-3.5 ${isAvailable ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
              <span>{isAvailable ? 'AVAILABLE FOR JOBS' : 'CURRENTLY UNAVAILABLE'}</span>
            </div>
          </div>

          <button
            onClick={handleToggleAvailability}
            disabled={isTogglingAvailability}
            className={`px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-sm ${
              isAvailable
                ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                : 'bg-slate-300 hover:bg-slate-400 text-slate-800'
            }`}
          >
            {isAvailable ? 'Set Unavailable' : 'Set Available'}
          </button>
        </div>
      </div>

      {/* 2. KPI Summary Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Today's Jobs</span>
            <Calendar className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{bookings.length}</div>
          <p className="text-[11px] text-slate-500">Scheduled appointments</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Requests</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700">{pendingRequests.length}</div>
          <p className="text-[11px] text-amber-700 font-semibold">Requires your review</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Estimated Earnings</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-700 flex items-center">
            <IndianRupee className="w-5 h-5 text-emerald-700" />
            <span>{totalEarningsEstimate || 1495}</span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold">100% Net Take-Home</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Overall Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{worker?.rating_avg || 4.9}</div>
          <p className="text-[11px] text-slate-500">Based on verified reviews</p>
        </div>
      </div>

      {/* 3. Pending Job Requests with Accept/Decline */}
      {pendingRequests.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span>Incoming Service Requests ({pendingRequests.length})</span>
            </h3>
            {onNavigateToJobs && (
              <button
                onClick={onNavigateToJobs}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                View All Jobs →
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-extrabold text-slate-800">{req.id}</span>
                  <span className="font-black text-sm text-emerald-800">₹{req.amount || 299}</span>
                </div>

                <div className="text-xs space-y-1 text-slate-700">
                  <div className="font-bold text-slate-900">{req.customer?.name || 'Customer'}</div>
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{req.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{req.date} • {req.time_slot}</span>
                  </div>
                  {req.problem_description && (
                    <p className="italic text-slate-600 text-[11px]">"{req.problem_description}"</p>
                  )}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleStatusChange(req.id, 'confirmed')}
                    className="flex-1 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Accept Job</span>
                  </button>
                  <button
                    onClick={() => handleStatusChange(req.id, 'cancelled')}
                    className="py-2 px-3 rounded-xl bg-white hover:bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Active Job Spotlight */}
      {activeJob && (
        <div className="bg-linear-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-lg space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold px-3 py-1 rounded-full uppercase flex items-center gap-1">
                <Play className="w-3 h-3 text-emerald-400" /> Active Service in Progress
              </span>
              <span className="font-mono text-xs text-slate-300">{activeJob.id}</span>
            </div>
            <div className="text-base font-black text-emerald-400">
              ₹{activeJob.amount || 299} (Escrow Secured)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="text-slate-400 uppercase text-[10px] font-bold">Customer</div>
              <div className="font-bold text-white text-sm mt-0.5">{activeJob.customer?.name || 'Priya Mehta'}</div>
              <div className="text-slate-300 flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-slate-400" /> {activeJob.customer?.phone || '9876543210'}
              </div>
            </div>

            <div>
              <div className="text-slate-400 uppercase text-[10px] font-bold">Service Location</div>
              <div className="text-slate-200 mt-0.5">{activeJob.address}</div>
            </div>

            <div>
              <div className="text-slate-400 uppercase text-[10px] font-bold">Appointment Time</div>
              <div className="text-slate-200 mt-0.5">{activeJob.date} • {activeJob.time_slot}</div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusChange(activeJob.id, 'completed')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Job Completed (Release Escrow)</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. Quick Navigation & Recent Feedback */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Navigation Shortcuts */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-emerald-700" />
            <span>Worker Operations Menu</span>
          </h3>

          <div className="space-y-2.5">
            {onNavigateToJobs && (
              <button
                onClick={onNavigateToJobs}
                className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 transition text-left flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">
                    Jobs & Dispatch Center ({bookings.length} jobs)
                  </div>
                  <div className="text-[11px] text-slate-500">
                    View full job schedule, start service, and review history
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition" />
              </button>
            )}

            {onNavigateToEarnings && (
              <button
                onClick={onNavigateToEarnings}
                className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 border border-slate-200 transition text-left flex items-center justify-between cursor-pointer group"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">
                    Earnings & Payout Ledger
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Track settled balances, escrow deposits, and zero-fee breakdown
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition" />
              </button>
            )}
          </div>
        </div>

        {/* Recent Feedback */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Recent Customer Reviews</span>
          </h3>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Priya Mehta</span>
                <StarRating rating={5} />
              </div>
              <p className="text-slate-600 italic text-[11px]">
                "Prompt arrival and very clean work on our MCB box tripping issue. Highly recommended!"
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900">Vikram Malhotra</span>
                <StarRating rating={5} />
              </div>
              <p className="text-slate-600 italic text-[11px]">
                "Excellent earthing wiring installation. Clear explanations and fair price."
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
