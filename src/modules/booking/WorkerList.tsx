import React, { useState } from 'react';
import { HeroSection } from './HeroSection';
import { EmergencySOSBanner } from './EmergencySOSBanner';
import { HowItWorksSection } from './HowItWorksSection';
import {
  SERVICES_CATALOG,
  SERVICE_CATEGORIES,
  ServiceItem,
  ServiceCategoryKey,
} from '../../shared/config/services.config';
import { navigate } from '../../shared/services/router';
import {
  Search,
  Wrench,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  Zap,
  Droplets,
  Cpu,
  Hammer,
  Paintbrush,
  Trees,
} from 'lucide-react';
import { useI18n } from '../i18n';

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
  const { t } = useI18n();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryKey>('ALL');

  // Filter service catalog
  const filteredServices = SERVICES_CATALOG.filter((item) => {
    // 1. Category Filter
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
      return false;
    }

    // 2. Search Term Filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const matchName = item.nameEn.toLowerCase().includes(term) || item.nameHi.toLowerCase().includes(term);
      const matchDesc = item.descriptionEn.toLowerCase().includes(term);
      const matchCategory = item.category.toLowerCase().includes(term);
      return matchName || matchDesc || matchCategory;
    }

    return true;
  });

  const handleBookService = (serviceId: string) => {
    navigate(`/book/${serviceId}`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      {/* 1. Hero Section */}
      <HeroSection
        selectedArea="ALL"
        onTrackClick={onNavigateToBookings}
        onExploreClick={() => {
          const el = document.getElementById('services-catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* 2. Emergency SOS Banner */}
      <EmergencySOSBanner
        onBookEmergency={() => {
          const emergencyService = SERVICES_CATALOG.find((s) => s.category === 'ELECTRICAL') || SERVICES_CATALOG[0];
          handleBookService(emergencyService.id);
        }}
      />

      {/* 3. Main Services Catalog Section */}
      <div id="services-catalog-section" className="space-y-6 pt-2">
        
        {/* Section Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('services.tradesActive', { count: 14 })}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {t('services.allServices', 'Browse Cooperative Services')}
            </h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-xl">
              Choose your needed service, select what is wrong, and verified local professionals will be dispatched with standard cooperative pricing.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('booking.search_placeholder', 'Search services, wiring, leaks...')}
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition"
            />
          </div>
        </div>

        {/* Category Horizontal Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {SERVICE_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.iconName] || LayoutGrid;
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-md shadow-emerald-900/20'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 shadow-2xs'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t(cat.labelKey, cat.labelEn)}</span>
              </button>
            );
          })}
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group bg-white hover:bg-slate-50/50 border border-slate-200/90 hover:border-emerald-500/60 rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-lg"
            >
              <div className="space-y-4">
                {/* Header: Category Tag & Rate */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    {service.category}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-bold uppercase">Standard Rate</span>
                    <span className="text-xl font-black text-emerald-700">₹{service.baseRate}</span>
                  </div>
                </div>

                {/* Service Name & Description */}
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {service.nameEn}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {service.descriptionEn}
                  </p>
                </div>

                {/* Features & Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{service.durationEst}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-xl">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>0% Brokerage</span>
                  </div>
                  {service.isPopular && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>Popular</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button: Navigate to Dedicated Booking Page */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleBookService(service.id)}
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs tracking-wide shadow-md shadow-emerald-900/10 transition flex items-center justify-center gap-2 cursor-pointer hover:scale-101"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{t('wizard.selectService', 'Book Service Slot')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
            <Wrench className="w-12 h-12 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-800">No services found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No services match your search term or selected category. Try resetting the filter.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* 4. How It Works Section */}
      <HowItWorksSection />
    </div>
  );
};