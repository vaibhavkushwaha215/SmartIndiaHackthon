import React from 'react';
import { Zap, ArrowRight } from 'lucide-react';
import { useI18n } from '../i18n';

interface EmergencySOSBannerProps {
  onBookEmergency: () => void;
}

export const EmergencySOSBanner: React.FC<EmergencySOSBannerProps> = ({ onBookEmergency }) => {
  const { t } = useI18n();

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border border-amber-300/90 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30">
          <Zap className="w-6 h-6 fill-white" />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full tracking-wider uppercase">
              {t('booking.emergencySosTitle', 'COOPERATIVE EMERGENCY DISPATCH')}
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              {t('booking.emergencySosSubtitle', '24/7 Priority Helpline for Electrical & Plumbing Hazards')}
            </span>
          </div>
          <p className="text-xs font-medium text-slate-600">
            {t('booking.emergencySosDesc', 'Immediate cooperative dispatch with 30-minute doorstep response in your neighborhood.')}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onBookEmergency}
        className="self-stretch sm:self-auto px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-md shadow-amber-600/30 transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap hover:scale-102"
      >
        <span>{t('booking.sosCall', 'Book Emergency Pro')}</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};