import React, { useState } from 'react';
import { Booking } from '../../shared/types';
import { useAuth } from '../auth';
import { useToast } from '../../shared/components/Toast';
import { Modal } from '../../shared/components/Modal';
import { StarRating } from '../../shared/components/StarRating';
import { db } from '../../shared/services/database';
import { logger } from '../../shared/services/logger';
import { ERROR_CODES } from '../../shared/constants/error-codes';
import { Star, MessageSquare, Award, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ReviewModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  booking,
  isOpen,
  onClose,
  onReviewSubmitted,
}) => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { showError, showSuccess } = useToast();

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('Punctual arrival, professional workmanship, and adhered to cooperative fair rates!');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await db.createReview({
        booking_id: booking.id,
        rating,
        comment: comment.trim(),
        customer_name: currentUser?.name || 'Verified Customer',
      });

      await logger.logReviewSubmitted(
        currentUser?.id || 'guest',
        booking.id,
        rating,
        201
      );

      showSuccess(t('booking.review_submitted', 'Thank you! Your cooperative review has been recorded.'));
      onClose();
      onReviewSubmitted();
    } catch (err: any) {
      showError(err.code || ERROR_CODES.BAD_REQUEST, err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title={
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <span>{t('booking.leave_review', 'Rate & Review Service')}</span>
        </div>
      }
      subtitle={`Booking #${booking.id} • ${booking.worker?.name || 'Electrician'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center py-2 bg-amber-50/60 rounded-xl border border-amber-200/60">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
            Your Rating for the Cooperative Artisan
          </label>
          <div className="flex justify-center">
            <StarRating rating={rating} maxStars={5} interactive size="lg" onChange={setRating} />
          </div>
          <span className="text-xs font-extrabold text-amber-700 mt-1 inline-block">
            {rating} of 5 Stars
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            Feedback Comment
          </label>
          <textarea
            required
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience (e.g. punctuality, safety compliance, problem diagnosis)..."
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
        </div>

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
            className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Submit Review</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </Modal>
  );
};
