import React from 'react';
import { useAuth } from '../auth';
import { ShieldCheck, Banknote, Clock, Award, ArrowRight, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
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
  const isHindi = i18n.language === 'hi';

  const userName = currentUser?.name?.split(' ')[0] || (isHindi ? 'रमेश' : 'Ramesh');

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064e3b] via-[#0b3b2c] to-[#042f24] text-white p-8 sm:p-12 shadow-2xl border border-emerald-800/40">
      
      {/* Background Decorative Rings */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side: Content & Actions */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Neighborhood Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-600/40 text-xs font-semibold text-emerald-200 backdrop-blur-sm">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isHindi
                ? `सेवा क्षेत्र: ${selectedArea === 'ALL' ? 'समस्त क्षेत्र' : selectedArea} • सत्यापित स्थानीय विशेषज्ञ`
                : `Serving ${selectedArea === 'ALL' ? 'Indiranagar, Bengaluru' : selectedArea} • Verified Local Experts`}
            </span>
          </div>

          {/* Dynamic Welcome Heading */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {isHindi ? `नमस्ते, ${userName}!` : `Namaste, ${userName}!`} <br />
            <span className="text-emerald-300">
              {isHindi ? '30 मिनट में घर पर सेवा।' : 'Doorstep Services in 30 Minutes.'}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl leading-relaxed">
            {isHindi
              ? 'पृष्ठभूमि-सत्यापित इलेक्ट्रीशियन, तकनीशियन और घरेलू सहायक बुक करें। शून्य अग्रिम शुल्क — कार्य संतुष्टि के बाद ही नकद या UPI द्वारा भुगतान करें।'
              : 'Book background-verified electricians, plumbers, domestic helpers, carpenters & technicians. Pay zero advance — pay cash or UPI only after complete service.'}
          </p>

          {/* Action CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onExploreClick}
              className="px-6 py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-900/40 transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
            >
              <span>{isHindi ? 'सभी सेवाएं देखें' : 'Explore All Services'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onTrackClick}
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-sm transition cursor-pointer"
            >
              {isHindi ? 'सक्रिय बुकिंग ट्रैक करें' : 'Track Active Bookings'}
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-emerald-800/60 text-[11px] font-semibold text-emerald-100/90">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Police Verified Pros</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Cash on Delivery</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Rapid 30m Arrival</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>30-Day Guarantee</span>
            </div>
          </div>
        </div>

        {/* Right Side: Desktop Brand Banner & Illustration Card */}
        <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center p-6 rounded-2xl bg-black/20 border border-emerald-500/20 backdrop-blur-md text-center space-y-4">
          <img
            src="/assets/logos/logo-square.png"
            alt="SahyogSeva Logo"
            className="w-28 h-28 object-contain drop-shadow-xl animate-pulse"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          <div className="space-y-1">
            <div className="font-extrabold text-lg text-white tracking-wide">
              SahyogSeva Cooperative
            </div>
            <div className="text-xs text-emerald-300 font-semibold italic">
              {isHindi ? '"हम साथ हैं, सेवा के लिए"' : '"Together We Serve, Together We Rise"'}
            </div>
          </div>

          <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-600/40 px-3 py-1.5 rounded-full text-[11px] text-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Brokerage • 100% Escrow Protection</span>
          </div>
        </div>

      </div>
    </div>
  );
};