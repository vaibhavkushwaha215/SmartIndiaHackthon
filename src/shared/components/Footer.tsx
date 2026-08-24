import React from 'react';
import { Phone, Mail, MapPin, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const Footer: React.FC = () => {
  const { i18n } = useTranslation();
  const isHindi = i18n.language === 'hi';

  return (
    <footer className="bg-[#091424] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand & About */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={isHindi ? "/assets/logos/logo-hi.png" : "/assets/logos/logo-en.png"}
                alt="SahyogSeva"
                className="h-10 object-contain brightness-125"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div className="font-extrabold text-xl text-white tracking-tight">
                SahyogSeva <span className="text-emerald-400 text-xs font-semibold">COMMUNITY</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Empowering local community professionals and providing homeowners with dependable, transparent, and fair-priced doorstep services.
            </p>

            <div className="space-y-2 text-xs text-slate-300 pt-2 font-medium">
              <div className="flex items-center gap-2 text-emerald-400">
                <Phone className="w-4 h-4" />
                <span>Helpline: <strong>1800-SAHYOG</strong> (9 AM - 10 PM)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Mail className="w-4 h-4" />
                <span>support@sahyogseva.coop</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4" />
                <span>Hyperlocal Operations across 10+ Major Metropolitan Hubs</span>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div className="space-y-3 text-xs">
            <h4 className="text-white font-bold tracking-wider uppercase text-[11px]">SERVICES</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="hover:text-emerald-400 transition cursor-pointer">Electrician & Wireman</li>
              <li className="hover:text-emerald-400 transition cursor-pointer">Plumber & Pipe Repairs</li>
              <li className="hover:text-emerald-400 transition cursor-pointer">Domestic Help & Maid</li>
              <li className="hover:text-emerald-400 transition cursor-pointer">Carpenter & Assembly</li>
              <li className="hover:text-emerald-400 transition cursor-pointer">AC & Appliance Repair</li>
            </ul>
          </div>

          {/* Specialized Care */}
          <div className="space-y-3 text-xs">
            <h4 className="text-white font-bold tracking-wider uppercase text-[11px]">SPECIALIZED CARE</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="hover:text-emerald-400 transition cursor-pointer">Home Deep Cleaning</li>
              <li className="hover:text-emerald-400 transition cursor-pointer">Painter & Wall Finish</li>
              <li className="hover:text-emerald-400 transition cursor-pointer">Pest Control Services</li>
              <li className="hover:text-emerald-400 transition cursor-pointer">Solar Inverter Setup</li>
            </ul>
          </div>

          {/* Popular Localities */}
          <div className="space-y-3 text-xs">
            <h4 className="text-white font-bold tracking-wider uppercase text-[11px]">POPULAR LOCALITIES</h4>
            <ul className="space-y-2 text-slate-400">
              <li className="hover:text-emerald-400 transition cursor-pointer">Indiranagar (Bengaluru)</li>
              <li className="hover:text-emerald-400 transition cursor-pointer">Koramangala (Bengaluru)</li>
              <li className="hover:text-emerald-400 transition cursor-pointer">Lajpat Nagar (South Delhi)</li>
              <li className="hover:text-emerald-400 transition cursor-pointer">Dwarka (West Delhi)</li>
              <li className="hover:text-emerald-400 transition cursor-pointer">Bandra West (Mumbai)</li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 SahyogSeva Community Services. Designed for local trust and fair empowerment.
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>Made for Indian Neighborhoods</span>
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};