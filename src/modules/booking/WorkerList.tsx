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
import { Search, MapPin, Wrench, Calendar, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WorkerListProps {
  onNavigateToBookings: () => void;
}

export const WorkerList: React.FC<WorkerListProps> = ({ onNavigateToBookings }) => {
  const { t } = useTranslation();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('ALL');

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
    const matchesSearch =
      (worker.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker.skill || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker.area || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (worker.cooperative_id || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesArea = selectedArea === 'ALL' || worker.area === selectedArea;

    return matchesSearch && matchesArea;
  });

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

      {/* 2. Urgent Emergency SOS Banner */}
      <EmergencySOSBanner
        onBookEmergency={() => {
          if (workers.length > 0) setSelectedWorkerForBooking(workers[0]);
        }}
      />

      {/* 3. Search and Filters Bar */}
      <div id="services-grid" className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/80 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t('booking.search_placeholder', 'Search by area, specialty, or cooperative...')}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

      {/* 4. Verified Workers Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm animate-pulse space-y-4">
              <div className="flex gap-4">
                <div className="w-16 h-16 bg-slate-200 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-8 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 space-y-3">
          <Wrench className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Electricians Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords or select "All Neighborhoods".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredWorkers.map((worker) => (
            <div
              key={worker.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-emerald-200"
            >
              <div className="p-5 space-y-3.5">
                <div className="flex items-start gap-3.5">
                  <div className="relative">
                    <img
                      src={worker.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                      alt={worker.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-xs"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-emerald-700 transition-colors">
                        {worker.name}
                      </h3>
                      <VerifiedBadge cooperativeId={worker.cooperative_id} size="sm" />
                    </div>
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{worker.area}</span>
                    </div>
                    <div className="pt-0.5 flex items-center gap-2">
                      <StarRating rating={worker.rating_avg} size="sm" showNumber />
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {worker.completed_jobs_count || 180}+ jobs
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-2.5 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] font-mono text-slate-600 truncate">
                  <span className="font-bold text-emerald-800">Affiliation:</span> {worker.cooperative_id}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                  {worker.skill}
                </p>
              </div>

              <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase">Tariff</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-base font-extrabold text-slate-900">₹{worker.hourly_rate || 299}</span>
                    <span className="text-[10px] text-slate-500 font-medium">/hr</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedWorkerForDetail(worker)}
                    className="px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                  >
                    {t('booking.view_profile', 'Profile')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedWorkerForBooking(worker)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shadow-emerald-700/20 transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t('booking.book_now', 'Book')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 5. How It Works & Trust Proposition */}
      <HowItWorksSection />

      {/* Modals */}
      <WorkerDetailModal
        worker={selectedWorkerForDetail}
        isOpen={Boolean(selectedWorkerForDetail)}
        onClose={() => setSelectedWorkerForDetail(null)}
        onBookNow={(w) => {
          setSelectedWorkerForDetail(null);
          setSelectedWorkerForBooking(w);
        }}
      />

      <BookingWizard
        worker={selectedWorkerForBooking}
        isOpen={Boolean(selectedWorkerForBooking)}
        onClose={() => setSelectedWorkerForBooking(null)}
        onBookingSuccess={(booking) => {
          setSelectedWorkerForBooking(null);
          setConfirmedBooking(booking);
        }}
      />

      <PaymentConfirmModal
        booking={confirmedBooking}
        isOpen={Boolean(confirmedBooking)}
        onClose={() => setConfirmedBooking(null)}
        onViewBookings={() => {
          setConfirmedBooking(null);
          onNavigateToBookings();
        }}
      />
    </div>
  );
};