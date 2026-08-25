import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../../shared/types';
import { db } from '../../shared/services/database';
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
  Filter,
} from 'lucide-react';

export const WorkerJobs: React.FC = () => {
  const { currentUser } = useAuth();
  const { showSuccess, showError } = useToast();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBookingForAction, setSelectedBookingForAction] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<'START' | 'COMPLETE' | 'CANCEL' | null>(null);

  const loadWorkerBookings = async () => {
    try {
      const all = await db.getBookings();
      // Match by worker user ID or worker phone
      const myJobs = all.filter(
        (b) =>
          b.worker_id === currentUser?.id ||
          b.worker?.user_id === currentUser?.id ||
          b.worker?.phone === currentUser?.phone
      );
      setBookings(myJobs);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    loadWorkerBookings();
  }, [currentUser]);

  const handleStatusChange = async (booking: Booking, newStatus: BookingStatus) => {
    try {
      await db.updateBookingStatus(booking.id, newStatus, booking.amount || 299, currentUser);
      showSuccess(`Job ${booking.id} updated to ${newStatus.toUpperCase()}`);
      setSelectedBookingForAction(null);
      setActionType(null);
      await loadWorkerBookings();
    } catch (err: any) {
      showError(err?.code || 500, err?.message || 'Failed to update job status.');
    }
  };

  const filteredJobs = bookings.filter((job) => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'pending'
        ? job.status === 'pending'
        : activeFilter === 'in_progress'
        ? job.status === 'in_progress'
        : activeFilter === 'completed'
        ? job.status === 'completed'
        : activeFilter === 'accepted'
        ? job.status === 'confirmed' || job.status === 'accepted'
        : true;

    const matchesSearch =
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.address.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const FILTER_TABS = [
    { id: 'all', label: 'All Jobs', count: bookings.length },
    { id: 'pending', label: 'Pending Requests', count: bookings.filter((b) => b.status === 'pending').length },
    { id: 'accepted', label: 'Accepted', count: bookings.filter((b) => b.status === 'confirmed' || b.status === 'accepted').length },
    { id: 'in_progress', label: 'In Progress', count: bookings.filter((b) => b.status === 'in_progress').length },
    { id: 'completed', label: 'Completed', count: bookings.filter((b) => b.status === 'completed').length },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-700" />
            <span>Assigned Jobs & Service Orders</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your incoming customer appointments, track dispatch lifecycle, and confirm task completion.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer, ID, or area..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:ring-2 focus:ring-emerald-600"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              activeFilter === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${
                activeFilter === tab.id ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Jobs Grid / List */}
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-2">
          <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
          <h3 className="font-bold text-sm text-slate-700">No jobs found in this section</h3>
          <p className="text-xs text-slate-400">
            When customers in your service area book your trade, appointments will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 hover:border-emerald-200 transition"
            >
              {/* Top Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-extrabold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                    {job.id}
                  </span>
                  <StatusBadge status={job.status} />
                </div>

                <div className="text-sm font-black text-emerald-800 flex items-center">
                  <IndianRupee className="w-3.5 h-3.5" />
                  <span>{job.amount || 299}</span>
                </div>
              </div>

              {/* Customer & Location */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <User className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{job.customer?.name || 'Priya Mehta'}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 font-semibold">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{job.customer?.phone || '9876543210'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{job.address}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.date} • {job.time_slot}</span>
                </div>

                {job.problem_description && (
                  <p className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 text-[11px] italic">
                    "{job.problem_description}"
                  </p>
                )}
              </div>

              {/* Action Buttons based on Status */}
              <div className="pt-2 border-t border-slate-100 flex gap-2">
                {job.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(job, 'confirmed')}
                      className="flex-1 py-2 px-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Accept Job</span>
                    </button>
                    <button
                      onClick={() => handleStatusChange(job, 'cancelled')}
                      className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </>
                )}

                {(job.status === 'confirmed' || job.status === 'accepted') && (
                  <button
                    onClick={() => handleStatusChange(job, 'in_progress')}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Service (In Progress)</span>
                  </button>
                )}

                {job.status === 'in_progress' && (
                  <button
                    onClick={() => handleStatusChange(job, 'completed')}
                    className="w-full py-2 px-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Service Completed (Release Escrow)</span>
                  </button>
                )}

                {job.status === 'completed' && (
                  <div className="w-full py-2 text-center text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] rounded-xl">
                    ✓ Completed & Payment Settled
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
