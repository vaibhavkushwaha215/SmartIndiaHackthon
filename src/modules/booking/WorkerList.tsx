import React, { useState, useEffect } from 'react';
import { Worker, Booking } from '../../shared/types';
import { db } from '../../shared/services/database';
import { StarRating } from '../../shared/components/StarRating';
import { VerifiedBadge } from '../../shared/components/Badge';
import { WorkerDetailModal } from './WorkerDetailModal';
import { BookingWizard } from './BookingWizard';
import { PaymentConfirmModal } from './PaymentConfirmModal';
import { HeroSection } from './HeroSection';
import { EmergencySOSBanner } from './EmergencySOSBanner';
import { HowItWorksSection } from './HowItWorksSection';
import {
  Search,
  MapPin,
  Wrench,
  Calendar,
  Filter,
  X,
  LayoutGrid,
  Zap,
  Droplets,
  Cpu,
  Hammer,
  Sparkles,
  Paintbrush,
  Trees,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SERVICE_CATEGORIES, ServiceCategoryKey } from '../../shared/config/services.config';
import { isFeatureEnabled } from '../../shared/config/features.config';

interface WorkerListProps {
  onNavigateToBookings: () => void;
}

const CATEGORY_ICONS: Record<string, any> = {
  LayoutGrid,
  Zap,
  Droplets,
  Cpu,
  Hammer,
  Sparkles,
  Paintbrush,
  Trees,
};

export const WorkerList: React.FC<WorkerListProps> = ({ onNavigateToBookings }) => {
  const { t, i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryKey>('ALL');

  // Modals state
  const [selectedWorkerForDetail, setSelectedWorkerForDetail] = useState<Worker | null>(null);
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState<Worker | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const data = await db.getWorkers();
      setWorkers(data);
    } catch (e) {
      console.error('Failed to load workers:', e);
    } finally {
      setLoading(false);
    }
  };

  const areas = Array.from(new Set(workers.map((w) => w.area))).filter(Boolean);

  const filteredWorkers = workers.filter((worker) => {
    // 1. Text Search Filter
    const matchesSearch =
      (worker.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker.skill || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker.area || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker.cooperative_id || '').toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Area Filter
    const matchesArea = selectedArea === 'ALL' || worker.area === selectedArea;

    // 3. Category Filter
    let matchesCategory = true;
    if (selectedCategory !== 'ALL') {
      if (worker.category) {
        matchesCategory = worker.category === selectedCategory;
      } else {
        // Fallback skill keyword matching if category not explicit
        const skillLower = (worker.skill || '').toLowerCase();
        if (selectedCategory === 'ELECTRICAL') matchesCategory = skillLower.includes('electric') || skillLower.includes('wire');
        else if (selectedCategory === 'PLUMBING') matchesCategory = skillLower.includes('plumb') || skillLower.includes('pipe');
        else if (selectedCategory === 'APPLIANCE') matchesCategory = skillLower.includes('appliance') || skillLower.includes('ac') || skillLower.includes('geyser');
        else if (selectedCategory === 'CARPENTRY') matchesCategory = skillLower.includes('carpenter') || skillLower.includes('wood') || skillLower.includes('furniture');
        else if (selectedCategory === 'CLEANING') matchesCategory = skillLower.includes('clean') || skillLower.includes('sofa');
        else if (selectedCategory === 'PAINTING') matchesCategory = skillLower.includes('paint') || skillLower.includes('putty');
        else if (selectedCategory === 'PEST_GARDENING') matchesCategory = skillLower.includes('pest') || skillLower.includes('garden');
      }
    }

    return matchesSearch && matchesArea && matchesCategory;
  });

  const isFilterActive = searchTerm.trim().length > 0 || selectedArea !== 'ALL' || selectedCategory !== 'ALL';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* 1. Hero Banner with Namaste Greeting */}
      <HeroSection
        selectedArea={selectedArea}
        onExploreClick={() => {
          document.getElementById('services-grid')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onTrackClick={onNavigateToBookings}
      />

      {/* 2. Urgent Emergency SOS Banner (Feature Flag Guarded) */}
      {isFeatureEnabled('EMERGENCY_SOS') && (
        <EmergencySOSBanner
          onBookEmergency={() => {
            if (workers.length > 0) setSelectedWorkerForBooking(workers[0]);
          }}
        />
      )}

      {/* 3. Pluggable Service Category Bar (Dynamic from services.config.ts) */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {isHindi ? 'सेवा श्रेणियां' : 'Service Categories'}
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              {SERVICE_CATEGORIES.length - 1} Trades Active
            </span>
          </div>
          {selectedCategory !== 'ALL' && (
            <button
              onClick={() => setSelectedCategory('ALL')}
              className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
            >
              {isHindi ? 'सभी देखें' : 'View All'}
            </button>
          )}
        </div>

        {/* Horizontal Scrolling / Wrapping Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SERVICE_CATEGORIES.map((cat) => {
            const IconComponent = CATEGORY_ICONS[cat.iconName] || Wrench;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-800/20 scale-105'
                    : 'bg-slate-100 text-slate-900 border border-slate-200 hover:bg-slate-200'
                }`}
              >
                <IconComponent className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                <span>{isHindi ? cat.labelHi : cat.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Search & Interactive Filter Bar (Dynamic on typing) */}
      <div id="services-grid" className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('booking.search_placeholder', 'Search by area, specialty, or cooperative...')}
              className="w-full pl-10 pr-8 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Area Filter Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="ALL">{t('booking.filter_area', 'All Neighborhoods')}</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Filter Indicator */}
        {isFilterActive && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 animate-in fade-in slide-in-from-top-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-700">Filters Active:</span>
              {selectedCategory !== 'ALL' && (
                <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-medium border border-emerald-200">
                  Trade: {SERVICE_CATEGORIES.find((c) => c.key === selectedCategory)?.labelEn}
                </span>
              )}
              {searchTerm && (
                <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-medium border border-emerald-200">
                  Search: "{searchTerm}"
                </span>
              )}
              {selectedArea !== 'ALL' && (
                <span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-md font-medium border border-indigo-200">
                  Area: {selectedArea}
                </span>
              )}
              <span className="text-slate-400 font-mono">({filteredWorkers.length} found)</span>
            </div>

            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedArea('ALL');
                setSelectedCategory('ALL');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold hover:underline cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* 5. Verified Workers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse space-y-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-200 shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-3 bg-slate-200 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800">No Verified Professionals Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No technicians match your search or filter criteria in this area. Try clearing filters or switching trade categories.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedArea('ALL');
              setSelectedCategory('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-emerald-500/50"
            >
              <div className="space-y-3">
                {/* Header: Photo + Info */}
                <div className="flex items-start gap-3.5">
                  <img
                    src={worker.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${worker.id}`}
                    alt={worker.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                  />
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-bold text-slate-900 text-sm truncate">{worker.name}</p>
                      <VerifiedBadge cooperativeId={worker.cooperative_id} size="sm" />
                    </div>

                    <div className="text-xs text-emerald-800 font-semibold truncate bg-emerald-50/70 px-2 py-0.5 rounded-md inline-block">
                      {worker.cooperative_id}
                    </div>

                    <div className="flex items-center gap-2 pt-0.5">
                      <StarRating rating={worker.rating_avg} size="sm" showNumber />
                      <span className="text-xs text-slate-500 font-mono">
                        ({worker.completed_jobs_count || 0} jobs)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skill & Area */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium line-clamp-1">
                    <Wrench className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{worker.skill}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{worker.area}</span>
                  </div>
                </div>
              </div>

              {/* Pricing & Booking CTA */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <div className="text-xs text-slate-500 uppercase font-semibold">Standard Rate</div>
                  <div className="text-sm font-extrabold text-slate-900">
                    ₹{worker.hourly_rate || 299}
                    <span className="text-xs font-normal text-slate-500"> / hour</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setSelectedWorkerForDetail(worker)}
                    className="px-3 py-2 rounded-xl border border-[var(--color-border,#e2e8f0)] text-[var(--color-text)] hover:bg-[var(--color-primary-light)] text-xs font-bold transition cursor-pointer"
                  >
                    View
                  </button>

                  <button
                    onClick={() => setSelectedWorkerForBooking(worker)}
                    className="px-3.5 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold shadow-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 6. Cooperative Quality Assurance & How It Works */}
      <HowItWorksSection />

      {/* Modals */}
      {selectedWorkerForDetail && (
        <WorkerDetailModal
          worker={selectedWorkerForDetail}
          isOpen={Boolean(selectedWorkerForDetail)}
          onClose={() => setSelectedWorkerForDetail(null)}
          onBookNow={(w) => {
            setSelectedWorkerForDetail(null);
            setSelectedWorkerForBooking(w);
          }}
        />
      )}

      {selectedWorkerForBooking && (
        <BookingWizard
          worker={selectedWorkerForBooking}
          isOpen={Boolean(selectedWorkerForBooking)}
          onClose={() => setSelectedWorkerForBooking(null)}
          onBookingSuccess={(booking) => {
            setSelectedWorkerForBooking(null);
            setConfirmedBooking(booking);
          }}
        />
      )}

      {confirmedBooking && (
        <PaymentConfirmModal
          booking={confirmedBooking}
          isOpen={Boolean(confirmedBooking)}
          onClose={() => setConfirmedBooking(null)}
          onViewBookings={onNavigateToBookings}
        />
      )}
    </div>
  );
};