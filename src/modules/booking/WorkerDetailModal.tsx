import React, { useState } from 'react';
import { Worker, Review } from '../../shared/types';
import { Modal } from '../../shared/components/Modal';
import { StarRating } from '../../shared/components/StarRating';
import { VerifiedBadge } from '../../shared/components/Badge';
import {
  ShieldCheck,
  MapPin,
  Clock,
  Calendar,
  User,
  ThumbsUp,
  ThumbsDown,
  Wrench,
  Award,
  Filter,
  CheckCircle2,
  Sparkles,
  Info,
  DollarSign,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WorkerDetailModalProps {
  worker: Worker | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (worker: Worker) => void;
}

interface ReviewWithHelpful extends Review {
  helpfulVotes: number;
  unhelpfulVotes: number;
  userVoted?: 'up' | 'down';
}

const INITIAL_SAMPLE_REVIEWS: ReviewWithHelpful[] = [
  {
    id: 'rev-101',
    booking_id: 'bk-101',
    customer_name: 'Ramesh Kumar',
    rating: 5,
    comment:
      'Arrived on time with proper cooperative ID badge and testing tools. Fixed the MCB tripping problem safely and charged strictly as per cooperative fair-price tariff!',
    created_at: '2026-08-22T17:00:00Z',
    helpfulVotes: 18,
    unhelpfulVotes: 1,
  },
  {
    id: 'rev-102',
    booking_id: 'bk-102',
    customer_name: 'Ananya Gupta',
    rating: 5,
    comment:
      'Excellent workmanship. Installed 4 modular switchboards and smart dimmers very neatly without leaving any plaster mess.',
    created_at: '2026-08-20T14:30:00Z',
    helpfulVotes: 12,
    unhelpfulVotes: 0,
  },
  {
    id: 'rev-103',
    booking_id: 'bk-103',
    customer_name: 'Deepak Saxena',
    rating: 4,
    comment:
      'Very professional behavior. Solved the 3-phase power imbalance within 35 minutes. Strongly recommend for heavy home appliance wiring.',
    created_at: '2026-08-19T11:20:00Z',
    helpfulVotes: 8,
    unhelpfulVotes: 1,
  },
  {
    id: 'rev-104',
    booking_id: 'bk-104',
    customer_name: 'Kavita Iyer',
    rating: 3,
    comment:
      'Good technical skill, but arrived 15 minutes later than the scheduled 10 AM slot due to heavy rain. Finished the job properly though.',
    created_at: '2026-08-15T09:15:00Z',
    helpfulVotes: 4,
    unhelpfulVotes: 2,
  },
];

export const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({
  worker,
  isOpen,
  onClose,
  onBookNow,
}) => {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  const [activeSection, setActiveSection] = useState<'info' | 'skills' | 'experience' | 'tariff' | 'reviews'>('info');
  const [reviewSort, setReviewSort] = useState<'all' | 'positive' | 'helpful' | 'critical'>('all');
  const [reviews, setReviews] = useState<ReviewWithHelpful[]>(INITIAL_SAMPLE_REVIEWS);

  if (!worker) return null;

  // Handle Review Helpful Upvote / Downvote
  const handleVote = (reviewId: string, type: 'up' | 'down') => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;

        if (r.userVoted === type) {
          // Undo vote
          return {
            ...r,
            userVoted: undefined,
            helpfulVotes: type === 'up' ? r.helpfulVotes - 1 : r.helpfulVotes,
            unhelpfulVotes: type === 'down' ? r.unhelpfulVotes - 1 : r.unhelpfulVotes,
          };
        }

        const prevUp = r.userVoted === 'up' ? 1 : 0;
        const prevDown = r.userVoted === 'down' ? 1 : 0;

        return {
          ...r,
          userVoted: type,
          helpfulVotes: r.helpfulVotes - prevUp + (type === 'up' ? 1 : 0),
          unhelpfulVotes: r.unhelpfulVotes - prevDown + (type === 'down' ? 1 : 0),
        };
      })
    );
  };

  // Filtered & Sorted Reviews
  const filteredReviews = reviews
    .filter((r) => {
      if (reviewSort === 'positive') return r.rating >= 4;
      if (reviewSort === 'critical') return r.rating <= 3;
      return true;
    })
    .sort((a, b) => {
      if (reviewSort === 'helpful') {
        const netA = a.helpfulVotes - a.unhelpfulVotes;
        const netB = b.helpfulVotes - b.unhelpfulVotes;
        return netB - netA;
      }
      return 0;
    });

  const scrollToSection = (section: 'info' | 'skills' | 'experience' | 'tariff' | 'reviews') => {
    setActiveSection(section);
    const element = document.getElementById(`modal-sec-${section}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="2xl"
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <Award className="w-5 h-5 text-emerald-600" />
          <span>Cooperative Artisan Credentials</span>
        </div>
      }
      subtitle="Verified by State Electrical Cooperative Federation • Zero Commission Model"
    >
      <div className="flex flex-col md:flex-row gap-6 max-h-[75vh] overflow-hidden">
        
        {/* Left Side: Navigation Anchor Tabs */}
        <div className="md:w-48 shrink-0 flex md:flex-col gap-1.5 overflow-x-auto pb-2 md:pb-0 border-b md:border-b-0 md:border-r border-slate-100 pr-0 md:pr-4">
          <div className="hidden md:block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            Quick Navigation
          </div>

          <button
            onClick={() => scrollToSection('info')}
            className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSection === 'info'
                ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Worker Info</span>
          </button>

          <button
            onClick={() => scrollToSection('skills')}
            className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSection === 'skills'
                ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Skills & Diagnostics</span>
          </button>

          <button
            onClick={() => scrollToSection('experience')}
            className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSection === 'experience'
                ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Experience & Verification</span>
          </button>

          <button
            onClick={() => scrollToSection('tariff')}
            className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition whitespace-nowrap cursor-pointer flex items-center gap-2 ${
              activeSection === 'tariff'
                ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Fair Tariff & Escrow</span>
          </button>

          <button
            onClick={() => scrollToSection('reviews')}
            className={`px-3 py-2 rounded-xl text-xs font-bold text-left transition whitespace-nowrap cursor-pointer flex items-center justify-between ${
              activeSection === 'reviews'
                ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span>Reviews</span>
            </div>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-full font-mono">
              {reviews.length}
            </span>
          </button>

          {/* Quick Book CTA in Sidebar */}
          <div className="hidden md:block pt-4 mt-auto">
            <button
              onClick={() => {
                onClose();
                onBookNow(worker);
              }}
              className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Slot</span>
            </button>
          </div>
        </div>

        {/* Right Side: Scrollable Section Content */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1 pb-4 scroll-smooth">
          
          {/* Section 1: Worker Info */}
          <div id="modal-sec-info" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80">
              <img
                src={worker.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
                alt={worker.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
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
          </div>

          {/* Section 2: Skills & Diagnostics */}
          <div id="modal-sec-skills" className="space-y-2 pt-2 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-emerald-600" />
              Specialized Skills & Diagnostics
            </h5>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <p className="font-semibold text-slate-900">{worker.skill}</p>
              <p className="text-slate-600 leading-relaxed">
                {worker.bio || 'Affiliated cooperative electrician providing domestic wiring, short circuit isolation, inverter battery setup, and appliance repairs.'}
              </p>
            </div>
          </div>

          {/* Section 3: Experience & Verification */}
          <div id="modal-sec-experience" className="space-y-2 pt-2 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              Experience & Verification Credentials
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Cooperative Registry
                </div>
                <div className="text-xs font-bold text-slate-800 font-mono break-all">{worker.cooperative_id}</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                  Licensed Experience
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {worker.experience_years || 8} Years • Certified Wireman License
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Fair Tariff & Escrow */}
          <div id="modal-sec-tariff" className="space-y-2 pt-2 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Cooperative Fair-Tariff Protection
            </h5>
            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Zero Advance Fee • Pay via Cash or UPI only after complete satisfaction.</span>
              </div>
              <p className="text-emerald-800 text-[11px] pl-6">
                All booking payments are backed by the Cooperative Escrow Pool with a 30-Day Workmanship Guarantee.
              </p>
            </div>
          </div>

          {/* Section 5: Verified Reviews with Positive / Helpful / Critical Sorting & Upvoting */}
          <div id="modal-sec-reviews" className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Verified Cooperative Reviews ({reviews.length})
              </h5>

              {/* Sorting Filter Chips */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['all', 'positive', 'helpful', 'critical'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setReviewSort(mode)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition cursor-pointer ${
                      reviewSort === mode
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {mode === 'all' ? 'All' : mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-3">
              {filteredReviews.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl">
                  No reviews match the selected filter.
                </div>
              ) : (
                filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-2 shadow-2xs hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        {rev.customer_name || 'Verified Customer'}
                      </span>
                      <StarRating rating={rev.rating} size="sm" />
                    </div>

                    <p className="text-slate-600 italic leading-relaxed">"{rev.comment}"</p>

                    {/* Helpful Upvote & Downvote Row */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
                      <span>Verified Cooperative Service</span>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500">Helpful?</span>
                        
                        {/* Upvote Button */}
                        <button
                          onClick={() => handleVote(rev.id, 'up')}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-md border transition cursor-pointer ${
                            rev.userVoted === 'up'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <ThumbsUp className="w-3 h-3" />
                          <span>{rev.helpfulVotes}</span>
                        </button>

                        {/* Downvote Button */}
                        <button
                          onClick={() => handleVote(rev.id, 'down')}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-md border transition cursor-pointer ${
                            rev.userVoted === 'down'
                              ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                              : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          <ThumbsDown className="w-3 h-3" />
                          <span>{rev.unhelpfulVotes}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Modal Action Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
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
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center gap-2 cursor-pointer hover:scale-105"
        >
          <Calendar className="w-4 h-4" />
          <span>{t('booking.book_now', 'Book Slot')}</span>
        </button>
      </div>
    </Modal>
  );
};