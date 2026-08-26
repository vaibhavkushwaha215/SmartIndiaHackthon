import React from 'react';
import { ShieldCheck, Banknote, Clock, Award, Sparkles } from 'lucide-react';
import { useI18n } from '../i18n';

export const HowItWorksSection: React.FC = () => {
  const { t } = useI18n();

  const steps = [
    {
      step: '1',
      title: t('home.howItWorks.step1Title', 'Pick Service & Slot'),
      desc: t('home.howItWorks.step1Desc', 'Choose what you need fixed, select your preferred date & time slot, and set your home address.'),
    },
    {
      step: '2',
      title: t('home.howItWorks.step2Title', 'Verified Pro Arrives'),
      desc: t('home.howItWorks.step2Desc', 'Your neighborhood professional reaches your doorstep with standard tools. Share 4-digit code to start.'),
    },
    {
      step: '3',
      title: t('home.howItWorks.step3Title', 'Pay Cash After Work'),
      desc: t('home.howItWorks.step3Desc', 'Inspect completed work. Once 100% satisfied, pay via Cash or UPI directly with 30-day guarantee.'),
    },
  ];

  return (
    <div className="space-y-8 pt-6">
      {/* Dark Steps Card */}
      <div className="bg-[#091424] text-white rounded-3xl p-5 sm:p-8 md:p-12 shadow-xl border border-slate-800 space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-700/50">
            <Sparkles className="w-3 h-3" /> {t('home.howItWorks.badge', 'SEAMLESS & TRUSTWORTHY')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('home.howItWorks.title', 'How SahyogSeva Works For You')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            {t('home.howItWorks.subtitle', 'Designed specifically for local neighborhoods with 100% transparency and pay-after-service safety.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((s) => (
            <div key={s.step} className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-3 relative">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-sm border border-emerald-500/30">
                {s.step}
              </div>
              <h3 className="text-base font-bold text-white">{s.title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">25,000+</div>
          <div className="text-xs text-slate-500 font-medium">Bookings Completed</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">4.88 ★</div>
          <div className="text-xs text-slate-500 font-medium">Average Customer Rating</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">100%</div>
          <div className="text-xs text-slate-500 font-medium">Police & ID Verified</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">&lt; 30 Mins</div>
          <div className="text-xs text-slate-500 font-medium">Average SOS Response</div>
        </div>
      </div>

      {/* 4 Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs text-slate-900">100% Police Verified</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Aadhaar and criminal background verified local neighborhood pros.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Banknote className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs text-slate-900">Pay After Service</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Zero advance fee. Pay Cash or UPI directly after complete job satisfaction.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs text-slate-900">30-Min Rapid Response</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Emergency electricians and technicians available on-demand in your sector.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-xs text-slate-900">30-Day Service Guarantee</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Free rework or full inspection guarantee if any issue recurs within 30 days.
          </p>
        </div>
      </div>
    </div>
  );
};