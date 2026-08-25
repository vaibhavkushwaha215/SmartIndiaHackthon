import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface EmergencySOSBannerProps {
  onBookEmergency: () => void;
}

export const EmergencySOSBanner: React.FC<EmergencySOSBannerProps> = ({ onBookEmergency }) => {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/15 to-orange-500/10 border border-amber-300/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
          <Zap className="w-5 h-5 fill-white" />
        </div>
        <div className="space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wide uppercase">
              URGENT SOS SERVICE
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              {isHindi ? 'शॉर्ट सर्किट / पानी का रिसाव?' : 'Water Leak / Short Circuit?'}
            </span>
          </div>
          <p className="text-xs text-slate-600">
            {isHindi
              ? 'आपातकालीन तकनीशियन 30 मिनट के भीतर आपके पते पर भेजा जाएगा।'
              : 'Emergency technician dispatched within 30 minutes in your neighborhood.'}
          </p>
        </div>
      </div>

      <button
        onClick={onBookEmergency}
        className="self-stretch sm:self-auto px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold shadow-md shadow-amber-600/20 transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
      >
        <span>{isHindi ? 'आपातकालीन प्रो बुक करें' : 'Book Emergency Pro'}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};