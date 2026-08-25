import React from 'react';
import { useAuth } from '../auth';
import { useTheme } from '../../shared/context/ThemeContext';
import { ShieldCheck, Banknote, Clock, Award, ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface HeroSectionProps {
  selectedArea: string;
  onExploreClick: () => void;
  onTrackClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  selectedArea,
  onExploreClick,
  onTrackClick,
}) => {
  const { i18n } = useTranslation();
  const { currentUser } = useAuth();
  const { currentTheme } = useTheme();
  const isHindi = i18n.language === 'hi';

  const userName = currentUser?.name?.split(' ')[0] || (isHindi ? 'रमेश' : 'Ramesh');

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${currentTheme.colors.headerGradient || 'from-slate-950 via-slate-900 to-emerald-950'} text-white p-5 sm:p-8 md:p-12 shadow-2xl border border-white/10 transition-all duration-300`}>
      
      {/* Background Decorative Glows */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[var(--color-primary)]/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-[var(--color-accent)]/20 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Content & Actions */}
        <div className="lg:col-span-7 space-y-5 min-w-0">
          
          {/* Neighborhood Pill */}
          <div className="inline-flex max-w-full items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs font-semibold text-white/90 backdrop-blur-sm">
            <MapPin className="w-3.5 h-3.5 text-[var(--color-accent)] shrink-0" />
            <span className="truncate">
              {isHindi
                ? `सेवा क्षेत्र: ${selectedArea === 'ALL' ? 'Indiranagar, Bengaluru' : selectedArea} • सत्यापित स्थानीय विशेषज्ञ`
                : `Serving ${selectedArea === 'ALL' ? 'Indiranagar, Bengaluru' : selectedArea} • Verified Local Experts`}
            </span>
          </div>

          {/* Dynamic Welcome Heading */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight break-words">
            {isHindi ? `नमस्ते, ${userName}!` : `Namaste, ${userName}!`} <br />
            <span className="text-[var(--color-accent)]">
              {isHindi ? '30 मिनट में घर पर सेवा।' : 'Doorstep Services in 30 Minutes.'}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-white/80 max-w-xl leading-relaxed">
            {isHindi
              ? 'पृष्ठभूमि-सत्यापित इलेक्ट्रीशियन, तकनीशियन और घरेलू सहायक बुक करें। शून्य अग्रिम शुल्क — कार्य संतुष्टि के बाद ही नकद या UPI द्वारा भुगतान करें।'
              : 'Book background-verified electricians, plumbers, domestic helpers, carpenters & technicians. Pay zero advance — pay cash or UPI only after complete service.'}
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onExploreClick}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-primary)] text-slate-950 font-bold text-xs sm:text-sm shadow-lg transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <span>{isHindi ? 'सभी सेवाएं देखें' : 'Explore All Services'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onTrackClick}
              className="px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-sm transition cursor-pointer"
            >
              {isHindi ? 'सक्रिय बुकिंग ट्रैक करें' : 'Track Active Bookings'}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-6 border-t border-emerald-800/60 text-xs font-semibold text-emerald-100/90">
            <div className="flex items-center gap-1.5 min-w-0">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Police Verified</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <Banknote className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">Pay After Work</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">30m Arrival</span>
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <Award className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">30-Day Warranty</span>
            </div>
          </div>
        </div>

        {/* Right Side: Framed Cooperative Emblem Banner Card */}
        <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center p-6 rounded-2xl bg-black/25 border border-emerald-500/25 backdrop-blur-md text-center space-y-4 shadow-xl">
          <div className="bg-white p-3 rounded-2xl shadow-md">
            <img
              src="/assets/logos/logo-square.webp"
              alt="SahyogSeva Logo"
              className="w-24 h-24 object-contain"
              width={96}
              height={96}
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="space-y-1">
            <div className="font-extrabold text-lg text-white tracking-wide">
              SahyogSeva Cooperative
            </div>
            <div className="text-xs text-emerald-300 font-semibold italic">
              {isHindi ? '"हम साथ हैं, सेवा के लिए"' : '"Together We Serve, Together We Rise"'}
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-600/40 px-3 py-1.5 rounded-full text-xs text-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Brokerage • 100% Escrow Protection</span>
          </div>
        </div>

      </div>
    </div>
  );
};