import React, { useEffect, useState } from 'react';
import { Booking } from '../../shared/types';
import { Modal } from '../../shared/components/Modal';
import { logger } from '../../shared/services/logger';
import { CheckCircle2, ShieldCheck, Download, Calendar, MapPin, ArrowRight, Wrench } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PaymentConfirmModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onViewBookings: () => void;
}

export const PaymentConfirmModal: React.FC<PaymentConfirmModalProps> = ({
  booking,
  isOpen,
  onClose,
  onViewBookings,
}) => {
  const { t } = useTranslation();
  const [mockTxnId, setMockTxnId] = useState('');

  useEffect(() => {
    if (booking && isOpen) {
      const txn = `TXN-COOP-${Date.now().toString().slice(-6)}-MOCK`;
      setMockTxnId(txn);

      // Log simulated payment event
      logger.logPaymentMock(
        booking.customer_id,
        booking.id,
        booking.amount || 299,
        true,
        200
      );
    }
  }, [booking, isOpen]);

  if (!booking) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2 text-emerald-800">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{t('booking.booking_success', 'Booking Confirmed Successfully!')}</span>
        </div>
      }
      subtitle="Cooperative Escrow Guarantee Active"
    >
      <div className="space-y-5">
        {/* Payment Success Hero */}
        <div className="text-center py-4 bg-emerald-50 rounded-2xl border border-emerald-200/80 space-y-2">
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md shadow-emerald-600/30 animate-bounce">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-base font-extrabold text-emerald-900">
            Payment Simulated & Held in Escrow
          </h4>
          <p className="text-xs text-emerald-700 max-w-xs mx-auto">
            {t('booking.payment_note', 'Prototype Mode: Funds are secured in cooperative reserve pool and disbursed upon service completion.')}
          </p>
        </div>

        {/* Transaction & Booking Receipt */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Transaction Reference</span>
            <span className="font-mono font-bold text-slate-800">{mockTxnId}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Booking ID</span>
            <span className="font-mono font-bold text-slate-800">#{booking.id}</span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Scheduled Date & Time</span>
            <span className="font-bold text-slate-800">
              {booking.date} ({booking.time_slot})
            </span>
          </div>

          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-slate-500 font-medium">Assigned Electrician</span>
            <span className="font-bold text-slate-800">{booking.worker?.name || 'Assigned Cooperative Artisan'}</span>
          </div>

          <div className="flex justify-between items-center pt-1 font-bold text-sm">
            <span className="text-slate-700">Total Escrow Amount</span>
            <span className="text-emerald-700">₹{booking.amount || 299}</span>
          </div>
        </div>

        {/* Cooperative Safety Notice */}
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-900">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <span>
            The artisan will arrive equipped with safety gear and testing tools. You can track status in <strong>My Bookings</strong>.
          </span>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onViewBookings();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{t('nav.my_bookings', 'View My Bookings')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Modal>
  );
};
