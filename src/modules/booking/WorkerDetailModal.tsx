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
  CheckCircle2,
  DollarSign,
  ArrowUpDown,
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
    helpfulVotes: 7,
    unhelpfulVotes: 0,
  },
  {
    id: 'rev-102',
    booking_id: 'bk-102',
    customer_name: 'Ananya Gupta',
    rating: 4.9,
    comment:
      'Excellent workmanship. Installed 4 modular switchboards and smart dimmers very neatly without leaving any plaster mess.',
    created_at: '2026-08-20T14:30:00Z',
    helpfulVotes: 20,
    unhelpfulVotes: 1,
  },
  {
    id: 'rev-103',
    booking_id: 'bk-103',
    customer_name: 'Deepak Saxena',
    rating: 4.9,
    comment:
      'Very professional behavior. Solved the 3-phase power imbalance within 35 minutes. Strongly recommend for heavy home appliance wiring.',
    created_at: '2026-08-19T11:20:00Z',
    helpfulVotes: 15,
    unhelpfulVotes: 0,
  },
  {
    id: 'rev-104',
    booking_id: 'bk-104',
    customer_name: 'Kavita Iyer',
    rating: 3,
    comment:
      'Good technical skill, but arrived 15 minutes later than the scheduled 10 AM slot due to heavy rain. Finished the job properly though.',
    created_at: '2026-08-15T09:15:00Z',
    helpfulVotes: 9,
    unhelpfulVotes: 3,
  },
  {
    id: 'rev-105',
    booking_id: 'bk-105',
    customer_name: 'Amitabh Joshi',
    rating: 2,
    comment:
      'Fixed the short circuit but did not carry spare 16A sockets, so had to buy from local hardware shop.',
    created_at: '2026-08-10T11:00:00Z',
    helpfulVotes: 12,
    unhelpfulVotes: 2,
  },
];

export const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({
  worker,
  isOpen,
  onClose,
  onBookNow,
}) => {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState<'info' | 'skills' | 'experience' | 'tariff' | 'reviews'>('info');
  const [reviewSort, setReviewSort] = useState<'all' | 'positive' | 'helpful' | 'critical'>('all');
  const [reviews, setReviews] = useState<ReviewWithHelpful[]>(INITIAL_SAMPLE_REVIEWS);

  if (!worker) return null;

  const handleVote = (reviewId: string, type: 'up' | 'down') => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;

        if (r.userVoted === type) {
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

  // True Sorting Rules:
  const sortedReviews = [...reviews].sort((a, b) => {
    if (reviewSort === 'positive') {
      // Highest ratings first; if ratings equal, sort by highest helpful votes
      if (b.rating !== a.rating) return b.rating - a.rating;
      return (b.helpfulVotes - b.unhelpfulVotes) - (a.helpfulVotes - a.unhelpfulVotes);
    }
    if (reviewSort === 'helpful') {
      // Strictly on the basis of net upvotes
      const netA = a.helpfulVotes - a.unhelpfulVotes;
      const netB = b.helpfulVotes - b.unhelpfulVotes;
      return netB - netA;
    }
    if (reviewSort === 'critical') {
      // Lowest ratings first; if ratings equal, sort by highest helpful votes
      if (a.rating !== b.rating) return a.rating - b.rating;
      return (b.helpfulVotes - b.unhelpfulVotes) - (a.helpfulVotes - a.unhelpfulVotes);
    }
    // 'all': Default chronological
    return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
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
      maxWidth="5xl"
      title={
        <div className="flex items-center gap-2 text-slate-900">
          <Award className="w-5 h-5 text-emerald-600" />
          <span>Cooperative Artisan Credentials</span>
        </div>
      }
      subtitle="Verified by State Electrical Cooperative Federation • Zero Commission Model"
    >
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        
        {/* Left Side: Navigation Tabs */}
        <div className="md:w-56 shrink-0 flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 border-b md:border-b-0 md:border-r border-slate-100 pr-0 md:pr-6">
          <div className="hidden md:block text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">
            Quick Navigation
          </div>

          <button
            onClick={() => scrollToSection('info')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition whitespace-nowrap cursor-pointer flex items-center gap-2.5 ${
              activeSection === 'info'
                ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>Worker Info</span>
          </button>

          <button
            onClick={() => scrollToSection('skills')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition whitespace-nowrap cursor-pointer flex items-center gap-2.5 ${
              activeSection === 'skills'
                ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Wrench className="w-4 h-4 text-indigo-600" />
            <span>Skills & Diagnostics</span>
          </button>

          <button
            onClick={() => scrollToSection('experience')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition whitespace-nowrap cursor-pointer flex items-center gap-2.5 ${
              activeSection === 'experience'
                ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Experience & Verification</span>
          </button>

          <button
            onClick={() => scrollToSection('tariff')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition whitespace-nowrap cursor-pointer flex items-center gap-2.5 ${
              activeSection === 'tariff'
                ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Fair Tariff & Escrow</span>
          </button>

          <button
            onClick={() => scrollToSection('reviews')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold text-left transition whitespace-nowrap cursor-pointer flex items-center justify-between ${
              activeSection === 'reviews'
                ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Reviews</span>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
              {reviews.length}
            </span>
          </button>
        </div>

        {/* Right Side: Spacious Content */}
        <div className="flex-1 space-y-6 md:pr-2 pb-4 scroll-smooth">
          
          {/* Section 1: Worker Info */}
          <div id="modal-sec-info" className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200/80">
              <img
                src={worker.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'}
                alt={worker.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-sm shrink-0"
              />
              <div className="flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-xl font-extrabold text-slate-900">{worker.name}</h4>
                  <VerifiedBadge cooperativeId={worker.cooperative_id} size="sm" />
                </div>
                <div className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{worker.area}</span>
                </div>
                <div className="flex items-center gap-2.5 pt-1">
                  <StarRating rating={worker.rating_avg} size="sm" showNumber />
                  <span className="text-slate-300">•</span>
                  <span className="text-xs font-bold text-slate-700">
                    {worker.completed_jobs_count || 342}+ jobs completed
                  </span>
                </div>
              </div>
              <div className="sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-emerald-200">
                <div className="text-xs text-slate-500 font-semibold">{t('booking.rate_per_hr')}</div>
                <div className="text-2xl font-extrabold text-emerald-800">₹{worker.hourly_rate || 299}</div>
                <div className="text-[11px] text-emerald-700 font-bold">Standard Coop Tariff</div>
              </div>
            </div>
          </div>

          {/* Section 2: Skills & Diagnostics */}
          <div id="modal-sec-skills" className="space-y-2 pt-2 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-600" />
              Specialized Skills & Diagnostics
            </h5>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
              <p className="font-bold text-slate-900 text-sm">{worker.skill}</p>
              <p className="text-slate-600 leading-relaxed">
                {worker.bio || 'Affiliated cooperative master technician providing domestic wiring, short circuit isolation, inverter battery setup, and appliance repairs with standard testing gear.'}
              </p>
            </div>
          </div>

          {/* Section 3: Experience & Verification */}
          <div id="modal-sec-experience" className="space-y-2 pt-2 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Experience & Verification Credentials
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Cooperative Registry
                </div>
                <div className="text-xs font-bold text-slate-800 font-mono break-all">{worker.cooperative_id}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Licensed Experience
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {worker.experience_years || 9} Years • Certified Wireman License & Police Verified
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Fair Tariff & Escrow */}
          <div id="modal-sec-tariff" className="space-y-2 pt-2 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              Cooperative Fair-Tariff Protection
            </h5>
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero Advance Fee • Pay via Cash or UPI only after complete satisfaction.</span>
              </div>
              <p className="text-emerald-800 text-xs pl-6">
                All booking payments are backed by the Cooperative Escrow Pool with a 30-Day Workmanship Guarantee.
              </p>
            </div>
          </div>

          {/* Section 5: Verified Reviews with Positive / Helpful / Critical Sorting */}
          <div id="modal-sec-reviews" className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-500" />
                Verified Cooperative Reviews ({reviews.length})
              </h5>

              {/* Sorting Filter Chips */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase px-2 flex items-center gap-1">
                  <ArrowUpDown className="w-3 h-3" /> Sort:
                </span>
                {(['all', 'positive', 'helpful', 'critical'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setReviewSort(mode)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition cursor-pointer ${
                      reviewSort === mode
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {mode === 'all' ? 'All' : mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Sorted Reviews List */}
            <div className="space-y-3">
              {sortedReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 bg-white rounded-2xl border border-slate-200 text-xs space-y-2.5 shadow-2xs hover:border-slate-300 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-400" />
                      {rev.customer_name || 'Verified Customer'}
                    </span>
                    <StarRating rating={rev.rating} size="sm" showNumber />
                  </div>

                  <p className="text-slate-600 italic leading-relaxed text-xs sm:text-sm">"{rev.comment}"</p>

                  {/* Helpful Upvote & Downvote */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-400">
                    <span className="text-[11px] text-emerald-700 font-semibold">✓ Verified Cooperative Service</span>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-medium">Helpful?</span>
                      
                      {/* Upvote Button */}
                      <button
                        onClick={() => handleVote(rev.id, 'up')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer text-xs ${
                          rev.userVoted === 'up'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{rev.helpfulVotes}</span>
                      </button>

                      {/* Downvote Button */}
                      <button
                        onClick={() => handleVote(rev.id, 'down')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition cursor-pointer text-xs ${
                          rev.userVoted === 'down'
                            ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        <span>{rev.unhelpfulVotes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Modal Footer with Single Action */}
      <div className="pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => {
            onClose();
            onBookNow(worker);
          }}
          className="px-7 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-700/20 transition flex items-center gap-2 cursor-pointer hover:scale-105"
        >
          <Calendar className="w-4 h-4" />
          <span>{t('booking.book_now', 'Book Slot')}</span>
        </button>
      </div>
    </Modal>
  );
};