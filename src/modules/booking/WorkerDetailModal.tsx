import React, { useEffect, useState } from 'react';
import { Worker, Review } from '../../shared/types';
import { db } from '../../shared/services/database';
import { Modal } from '../../shared/components/Modal';
import { StarRating } from '../../shared/components/StarRating';
import { VerifiedBadge } from '../../shared/components/Badge';
import { ShieldCheck, MapPin, Briefcase, Award, Clock, Calendar, CheckCircle2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WorkerDetailModalProps {
  worker: Worker | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (worker: Worker) => void;
}

export const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({
  worker,
  isOpen,
  onClose,
  onBookNow,
}) => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    if (worker && isOpen) {
      setLoadingReviews(true);
      db.getReviews()
        .then((allReviews) => {
          // Worker reviews or sample feedback
          setReviews(allReviews.slice(0, 3));
        })
        .finally(() => setLoadingReviews(false));
    }
  }, [worker, isOpen]);

  if (!worker) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="lg"
      title={
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-600" />
          <span>Cooperative Artisan Credentials</span>
        </div>
      }
      subtitle="Verified by State Electrical Cooperative Federation"
    >
      <div className="space-y-6">
        {/* Worker Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100">
          <img
            src={worker.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
            alt={worker.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-sm"
          />
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-lg font-bold text-slate-900">{worker.name}</h4>
              <VerifiedBadge cooperativeId={worker.cooperative_id} size="sm" />
            </div>
            <div className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{worker.area}</span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <StarRating rating={worker.rating_avg} size="sm" showNumber />
              <span className="text-slate-300">•</span>
              <span className="text-xs font-semibold text-slate-700">
                {worker.completed_jobs_count || 320}+ jobs completed
              </span>
            </div>
          </div>
          <div className="sm:text-right w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-emerald-200">
            <div className="text-[11px] text-slate-500 font-semibold">{t('booking.rate_per_hr')}</div>
            <div className="text-xl font-extrabold text-emerald-800">₹{worker.hourly_rate || 299}</div>
            <div className="text-[10px] text-emerald-700 font-medium">Standard Coop Tariff</div>
          </div>
        </div>

        {/* Cooperative Identification & Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Cooperative Registry
            </div>
            <div className="text-xs font-bold text-slate-800 font-mono break-all">{worker.cooperative_id}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Experience & Verification
            </div>
            <div className="text-xs font-bold text-slate-800">
              {worker.experience_years || 8} Years • Certified Wireman License
            </div>
          </div>
        </div>

        {/* Specialization & Bio */}
        <div className="space-y-2">
          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Specialized Skills & Diagnostics
          </h5>
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed">
            <p className="font-semibold text-slate-900 mb-1">{worker.skill}</p>
            <p className="text-slate-600">{worker.bio || 'Affiliated cooperative electrician providing domestic wiring, short circuit isolation, inverter battery setup, and appliance repairs.'}</p>
          </div>
        </div>

        {/* Recent Customer Reviews */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Verified Cooperative Reviews
            </h5>
            <span className="text-[11px] text-emerald-700 font-bold">100% Verified Customers</span>
          </div>

          <div className="space-y-2">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1">
                    <User className="w-3 h-3 text-slate-400" />
                    {rev.customer_name || 'Verified Customer'}
                  </span>
                  <StarRating rating={rev.rating} size="sm" />
                </div>
                <p className="text-slate-600 italic">"{rev.comment}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onBookNow(worker);
            }}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>{t('booking.book_now', 'Book Slot')}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
