import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Heart, Smartphone, Download, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const InstallAppFooterButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showHelperModal, setShowHelperModal] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    if ((window as any).deferredPWAInstallPrompt) {
      setDeferredPrompt((window as any).deferredPWAInstallPrompt);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      (window as any).deferredPWAInstallPrompt = e;
    };

    const capturedHandler = () => {
      if ((window as any).deferredPWAInstallPrompt) {
        setDeferredPrompt((window as any).deferredPWAInstallPrompt);
      }
    };

    const installedHandler = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      (window as any).deferredPWAInstallPrompt = null;
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('pwa-prompt-captured', capturedHandler);
    window.addEventListener('appinstalled', installedHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('pwa-prompt-captured', capturedHandler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    const promptEvent = deferredPrompt || (window as any).deferredPWAInstallPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        (window as any).deferredPWAInstallPrompt = null;
        setIsInstalled(true);
      }
    } else {
      setShowHelperModal(true);
    }
  };

  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <span>SahyogSeva App Installed</span>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={handleInstall}
        className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 transition hover:scale-[1.02] active:scale-95 cursor-pointer border border-emerald-400/30"
      >
        <Smartphone className="w-4 h-4 text-emerald-200" />
        <span>Install Android / PWA App</span>
        <Download className="w-3.5 h-3.5 ml-0.5 opacity-80" />
      </button>

      {/* Helper Modal if native prompt not directly dispatched */}
      {showHelperModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 text-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Install SahyogSeva App</h4>
                <p className="text-[11px] text-slate-400">Add to your phone home screen</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/60">
              <div className="font-semibold text-emerald-400">On Android (Chrome / Edge):</div>
              <div>1. Tap browser menu <strong>⋮ (three dots)</strong> in top right.</div>
              <div>2. Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</div>
              
              <div className="pt-2 font-semibold text-emerald-400 border-t border-slate-700/60">On iOS (Safari):</div>
              <div>1. Tap the <strong>Share</strong> button at bottom of screen.</div>
              <div>2. Tap <strong>"Add to Home Screen"</strong>.</div>
            </div>

            <button
              onClick={() => setShowHelperModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};

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

            {/* Install PWA Button */}
            <div className="pt-2">
              <InstallAppFooterButton />
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