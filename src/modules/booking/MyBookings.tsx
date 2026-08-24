import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus } from '../../shared/types';
import { useAuth } from '../auth';
import { db } from '../../shared/services/database';
import { StatusBadge } from '../../shared/components/Badge';
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
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const MyBookings: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, currentRole } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      // If Customer, filter by customerId, otherwise show all for Admin demo
      const filter = currentRole === 'Customer' && currentUser ? { customerId: currentUser.id } : undefined;
      const data = await db.getBookings(filter);
      setBookings(data);
    } catch (e) {
      console.error('Failed to load bookings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [currentUser, currentRole]);

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter === 'ALL') return true;
    return b.status === statusFilter;
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
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {bookings.length} Bookings
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track real-time status of your cooperative electrician visits and escrow protection.
          </p>
        </div>

        <button
          onClick={loadBookings}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['ALL', 'pending', 'confirmed', 'completed'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition whitespace-nowrap cursor-pointer ${
              statusFilter === st
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {st === 'ALL' ? 'All Bookings' : t(`status.${st}`, st)}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 animate-pulse h-32" />
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 space-y-3">
          <CalendarDays className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Bookings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {t('booking.my_bookings_empty', 'No bookings found yet. Explore verified electricians to book a service.')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all space-y-4"
            >
              {/* Header: ID, Date & Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    #{b.id}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Booked on {new Date(b.created_at).toLocaleDateString()}
                  </span>
                </div>
                <StatusBadge status={b.status} />
              </div>

              {/* Body: Worker Info & Slot Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: Electrician Details */}
                <div className="flex items-start gap-3">
                  <img
                    src={b.worker?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
                    alt={b.worker?.name || 'Worker'}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                  />
                  <div className="space-y-0.5">
                    <div className="text-sm font-bold text-slate-900">
                      {b.worker?.name || 'Assigned Cooperative Electrician'}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium">
                      {b.worker?.cooperative_id || 'Delhi Vidyut Sahyog'}
                    </div>
                    {b.worker?.phone && (
                      <div className="text-xs text-slate-500 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span className="font-mono">+91 {b.worker.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Date, Time & Address */}
                <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <CalendarDays className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{b.date}</span>
                    <span className="text-slate-300">•</span>
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{b.time_slot}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{b.address}</span>
                  </div>
                </div>
              </div>

              {/* Problem Description if provided */}
              {b.problem_description && (
                <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-600">
                  <span className="font-bold text-slate-700">Requirement: </span>
                  {b.problem_description}
                </div>
              )}

              {/* Review section / Action Footer */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs text-slate-500 font-medium">
                    Escrow Amount: <strong className="text-slate-900">₹{b.amount || 299}</strong>
                  </span>
                </div>

                {/* If completed and review exists -> Show rating badge */}
                {b.review ? (
                  <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200/80 text-xs">
                    <span className="font-bold text-amber-800">Your Review:</span>
                    <StarRating rating={b.review.rating} size="sm" />
                    <span className="text-slate-600 italic truncate max-w-[200px]">"{b.review.comment}"</span>
                  </div>
                ) : b.status === 'completed' ? (
                  <button
                    onClick={() => setReviewBooking(b)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                  >
                    <Star className="w-3.5 h-3.5 fill-white" />
                    <span>{t('booking.leave_review', 'Rate & Review')}</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 italic">
                    Review unlocks after electrician marks service as completed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        booking={reviewBooking}
        isOpen={Boolean(reviewBooking)}
        onClose={() => setReviewBooking(null)}
        onReviewSubmitted={loadBookings}
      />
    </div>
  );
};
