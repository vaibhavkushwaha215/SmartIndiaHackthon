import React, { useState } from 'react';
import { Worker, Booking } from '../../shared/types';
import { useAuth } from '../auth';
import { useToast } from '../../shared/components/Toast';
import { Modal } from '../../shared/components/Modal';
import { db } from '../../shared/services/database';
import { logger } from '../../shared/services/logger';
import { ERROR_CODES, createAppError } from '../../shared/constants/error-codes';
import { Calendar, Clock, MapPin, Wrench, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface BookingWizardProps {
  worker: Worker | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

const AVAILABLE_SLOTS = [
  '09:00 AM - 11:00 AM',
  '11:00 AM - 01:00 PM',
  '02:00 PM - 04:00 PM',
  '04:00 PM - 06:00 PM',
  '06:00 PM - 08:00 PM',
];

export const BookingWizard: React.FC<BookingWizardProps> = ({
  worker,
  isOpen,
  onClose,
  onBookingSuccess,
}) => {
  const { t } = useTranslation();
  const { currentUser, currentRole } = useAuth();
  const { showError } = useToast();

  // Tomorrow as default date string YYYY-MM-DD
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDateStr);
  const [timeSlot, setTimeSlot] = useState(AVAILABLE_SLOTS[0]);
  const [address, setAddress] = useState('Flat 204, Green Apartments, Main Road');
  const [problemDescription, setProblemDescription] = useState('Short circuit check and circuit breaker trip issue');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!worker) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const customerId = currentUser?.id || 'user-cust-1';

    // 1. Validation checks (Code 400)
    if (!address.trim()) {
      showError(ERROR_CODES.BAD_REQUEST, 'Please enter a valid service delivery address.');
      await logger.logError('BOOKING_VALIDATION', { code: ERROR_CODES.BAD_REQUEST, message: 'Missing address' }, customerId);
      setIsSubmitting(false);
      return;
    }

    try {
      // 2. Database create booking (handles Conflict 409 if slot already occupied)
      const newBooking = await db.createBooking({
        customer_id: customerId,
        worker_id: worker.id,
        date,
        time_slot: timeSlot,
        address: address.trim(),
        problem_description: problemDescription.trim(),
        amount: worker.hourly_rate || 299,
        status: 'confirmed',
      });

      // 3. Log booking created event
      await logger.logBookingCreated(
        customerId,
        worker.id,
        newBooking.id,
        201,
        `Slot scheduled on ${date} (${timeSlot}) with ${worker.name}`
      );

      onClose();
      onBookingSuccess(newBooking);
    } catch (err: any) {
      const code = err.code || ERROR_CODES.SERVER_ERROR;
      showError(code, err.message);
      await logger.logError('BOOKING_CREATION_FAILED', err, customerId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <span>{t('booking.book_now', 'Book Slot')} - {worker.name}</span>
        </div>
      }
      subtitle={`Cooperative Fair Tariff: ₹${worker.hourly_rate || 299}/hr • Escrow Protection`}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Worker Summary Banner */}
        <div className="flex items-center justify-between p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="flex items-center gap-3">
            <img
              src={worker.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
              alt={worker.name}
              className="w-10 h-10 rounded-xl object-cover border border-emerald-300"
            />
            <div>
              <div className="text-xs font-bold text-slate-900">{worker.name}</div>
              <div className="text-[11px] text-emerald-800 font-medium">{worker.area}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-extrabold text-emerald-900">₹{worker.hourly_rate || 299}</div>
            <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded font-bold">
              Cooperative Fixed
            </span>
          </div>
        </div>

        {/* Step 1: Date & Time Slot Selection */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            {t('booking.step_slot', '1. Choose Date & Time Slot')}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                {t('booking.select_date', 'Service Date')}
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                {t('booking.select_slot', 'Available Time Slot')}
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {AVAILABLE_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick slot pill selector */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {AVAILABLE_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTimeSlot(slot)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition cursor-pointer ${
                  timeSlot === slot
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Address & Problem Description */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-emerald-600" />
            {t('booking.step_address', '2. Service Address & Details')}
          </label>

          <div>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={t('booking.address_placeholder', 'Enter full street address...')}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">
              {t('booking.problem_label', 'Service Requirement / Issue Description')}
            </label>
            <textarea
              rows={2}
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder={t('booking.problem_placeholder', 'Describe what needs repair...')}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Prototype Escrow Guarantee Banner */}
        <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Cooperative Escrow Guarantee:</span> Next step simulates instant escrow confirmation.
            Workers receive fair guaranteed payout upon successful service completion.
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{t('booking.confirm_btn', 'Proceed to Confirmation')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </Modal>
  );
};
