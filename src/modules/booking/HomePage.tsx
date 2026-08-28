import React from 'react';
import { HeroSection } from './HeroSection';
import { EmergencySOSBanner } from './EmergencySOSBanner';
import { HowItWorksSection } from './HowItWorksSection';
import {
  SERVICES_CATALOG,
} from '../../shared/config/services.config';
import { navigate } from '../../shared/services/router';
import {
  Wrench,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useI18n } from '../i18n';

interface HomePageProps {
  onNavigateToBookings: () => void;
}

/**
 * Deterministic 4-service preview: first 4 services where isPopular === true.
 * Falls back to the first 4 services in the catalog if fewer than 4 are popular.
 * Derived from SERVICES_CATALOG — single source of truth, no duplication.
 */
const PREVIEW_SERVICES = (() => {
  const popular = SERVICES_CATALOG.filter((s) => s.isPopular);
  if (popular.length >= 4) return popular.slice(0, 4);
  // Fallback: pad with remaining non-popular services to reach 4
  const remaining = SERVICES_CATALOG.filter((s) => !s.isPopular);
  return [...popular, ...remaining].slice(0, 4);
})();

/**
 * HomePage — Landing/dashboard page at `/`.
 * 
 * Focused on being a welcoming entry point rather than a full service directory.
 * Shows HeroSection, EmergencySOSBanner, a compact 4-service preview,
 * a "View All Services" CTA, and HowItWorksSection.
 * 
 * All service data is derived from SERVICES_CATALOG (no duplication).
 */
export const HomePage: React.FC<HomePageProps> = ({ onNavigateToBookings }) => {
  const { t } = useI18n();

  const handleBookService = (serviceId: string) => {
    navigate(`/book/${serviceId}`);
  };

  const handleViewAllServices = () => {
    navigate('/services');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 w-full">
      {/* 1. Hero Section */}
      <HeroSection
        selectedArea="ALL"
        onTrackClick={onNavigateToBookings}
        onExploreClick={handleViewAllServices}
      />

      {/* 2. Emergency SOS Banner */}
      <EmergencySOSBanner
        onBookEmergency={() => {
          const emergencyService = SERVICES_CATALOG.find((s) => s.category === 'ELECTRICAL') || SERVICES_CATALOG[0];
          handleBookService(emergencyService.id);
        }}
      />

      {/* 3. Service Preview Section — exactly 4 popular/representative services */}
      <div className="space-y-5">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 text-[var(--color-primary)] text-xs font-black tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('services.popularServices', 'Popular Services')}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--color-text,#0f172a)] tracking-tight">
              {t('services.allServices', 'All Services')}
            </h2>
          </div>
        </div>

        {/* 4-Service Preview Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {PREVIEW_SERVICES.map((service) => (
            <div
              key={service.id}
              className="group bg-[var(--color-surface,white)] hover:bg-[var(--color-bg,#f8fafc)] border border-[var(--color-border,#e2e8f0)] hover:border-[var(--color-primary)]/60 rounded-3xl p-6 transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-lg"
            >
              <div className="space-y-4">
                {/* Header: Category Tag & Rate */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-primary)] bg-[var(--color-primary-light)] border border-[var(--color-primary)]/20 px-3 py-1 rounded-full">
                    {service.category}
                  </span>
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--color-text-muted,#94a3b8)] block font-bold uppercase">{t('booking.rate_per_hr', 'Standard Rate')}</span>
                    <span className="text-xl font-black text-[var(--color-primary)]">₹{service.baseRate}</span>
                  </div>
                </div>

                {/* Service Name & Description */}
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[var(--color-text,#0f172a)] group-hover:text-[var(--color-primary)] transition-colors">
                    {service.nameEn}
                  </h3>
                  <p className="text-xs text-[var(--color-text-muted,#64748b)] mt-1.5 line-clamp-2 leading-relaxed">
                    {service.descriptionEn}
                  </p>
                </div>

                {/* Features & Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--color-border,#e2e8f0)]/60">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-secondary,#475569)] bg-[var(--color-bg,#f1f5f9)] px-2.5 py-1 rounded-xl">
                    <Clock className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>{service.durationEst}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--color-text-secondary,#475569)] bg-[var(--color-bg,#f1f5f9)] px-2.5 py-1 rounded-xl">
                    <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                    <span>{t('services.zeroBrokerage', '0% Brokerage')}</span>
                  </div>
                  {service.isPopular && (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>{t('services.popular', 'Popular')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button: Navigate to Dedicated Booking Page */}
              <div className="mt-6 pt-4 border-t border-[var(--color-border,#e2e8f0)]/60">
                <button
                  type="button"
                  onClick={() => handleBookService(service.id)}
                  className="w-full py-3 px-4 rounded-2xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-extrabold text-xs tracking-wide shadow-md transition flex items-center justify-center gap-2 cursor-pointer hover:scale-101"
                >
                  <Wrench className="w-4 h-4" />
                  <span>{t('wizard.selectService', 'Book Service Slot')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Services CTA */}
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={handleViewAllServices}
            className="group flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-[var(--color-surface,white)] hover:bg-[var(--color-primary-light)] border-2 border-[var(--color-primary)]/30 hover:border-[var(--color-primary)] text-[var(--color-primary)] font-extrabold text-sm shadow-xs hover:shadow-md transition-all cursor-pointer"
          >
            <span>{t('services.viewAllServices', 'View All Services')}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* 4. How It Works Section */}
      <HowItWorksSection />
    </div>
  );
};
