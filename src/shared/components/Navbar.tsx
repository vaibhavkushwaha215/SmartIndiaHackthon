import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../modules/auth';
import { LoginModal } from '../../modules/auth/LoginModal';
import { RoleBadge } from './Badge';
import { Modal } from './Modal';
import { useToast } from './Toast';
import {
  Wrench,
  CalendarDays,
  Shield,
  Activity,
  Globe,
  LogOut,
  ChevronRight,
  Users,
  Menu,
  MapPin,
  Settings,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  Send,
  LogIn,
} from 'lucide-react';
import { UserRole } from '../types';
import { isFeatureEnabled, FeatureKey } from '../config/features.config';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItemConfig {
  id: string;
  label: string;
  icon: any;
  roles: UserRole[];
  featureKey?: FeatureKey;
  isAllServices?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { t, i18n } = useTranslation();
  const { currentUser, currentRole, logout, quickSwitchUser, switchRole, updateLanguage } = useAuth();
  const { showSuccess } = useToast();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSwitchHovered, setIsSwitchHovered] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isApplyWorkerModalOpen, setIsApplyWorkerModalOpen] = useState(false);

  // Application form state
  const [applicantName, setApplicantName] = useState('');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [applicantSkill, setApplicantSkill] = useState('Electrician & Wireman');
  const [applicantArea, setApplicantArea] = useState('Indiranagar, Bengaluru');

  const isHindi = i18n.language === 'hi';

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    updateLanguage(nextLang);
  };

  const handleAllServicesClick = () => {
    onTabChange('booking');
    setTimeout(() => {
      const el = document.getElementById('services-grid');
      el?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  };

  const handleWorkerApplication = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccess(
      isHindi
        ? 'सहकारी आवेदन प्राप्त हुआ! हमारी सत्यापन टीम 24 घंटे में संपर्क करेगी।'
        : 'Application submitted! Cooperative verification team will contact you within 24 hours.'
    );
    setIsApplyWorkerModalOpen(false);
  };

  const navItems: NavItemConfig[] = [
    { id: 'booking', label: isHindi ? 'सभी सेवाएं' : 'All Services', icon: Wrench, roles: ['Customer', 'Worker', 'Admin'], featureKey: 'BOOKING_SYSTEM', isAllServices: true },
    { id: 'my-bookings', label: t('nav.my_bookings', 'My Bookings'), icon: CalendarDays, roles: ['Customer', 'Admin'], featureKey: 'MY_BOOKINGS' },
    { id: 'worker-dashboard', label: t('nav.worker_dashboard', 'Worker Dashboard'), icon: Wrench, roles: ['Worker', 'Admin'], featureKey: 'WORKER_DASHBOARD' },
    { id: 'admin-dashboard', label: t('nav.admin_dashboard', 'Admin Portal'), icon: Shield, roles: ['Admin'], featureKey: 'ADMIN_PORTAL' },
    { id: 'demand-forecast', label: t('nav.demand_forecast', 'Demand Forecast'), icon: Activity, roles: ['Admin', 'Worker', 'Customer'], featureKey: 'DEMAND_FORECAST' },
    { id: 'settings', label: isHindi ? 'सेटिंग्स' : 'Settings', icon: Settings, roles: ['Customer', 'Worker', 'Admin'] },
  ];

  const visibleNavItems = navItems.filter((item) => {
    // Feature flag check
    if (item.featureKey && !isFeatureEnabled(item.featureKey)) return false;
    // Role check
    return currentRole === 'Admin' ? true : item.roles.includes(currentRole);
  });

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        
        {/* Top Announcement Ribbon - Hidden on small displays / PWA mobile screens */}
        <div className="hidden md:block bg-[#0b3b2c] text-emerald-100 text-xs py-1.5 px-4 border-b border-emerald-800">
          <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-1 text-left">
            <div className="flex items-center gap-2 font-medium">
              <span>🛡️ 100% Background & Police Verified Local Professionals</span>
              <span>•</span>
              <span>Zero Advance Payment • Pay Cash / UPI After Service</span>
            </div>
            <div className="flex items-center gap-3 font-semibold">
              <span className="text-emerald-300">
                Emergency 24x7: <strong>1800-SAHYOG</strong>
              </span>
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded text-white transition cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isHindi ? 'English (EN)' : 'हिंदी (HI)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Clean Logo without "Community" Tag */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => onTabChange('booking')}
                className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
              >
                {/* Desktop: Horizontal Logo */}
                <img
                  src={isHindi ? "/assets/logos/logo-hi.webp" : "/assets/logos/logo-en.webp"}
                  alt="SahyogSeva"
                  className="hidden sm:block h-10 object-contain"
                  width={200}
                  height={40}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />

                {/* Mobile: Square Emblem */}
                <img
                  src="/assets/logos/logo-square.webp"
                  alt="SahyogSeva"
                  className="sm:hidden w-10 h-10 object-contain rounded-lg"
                  width={40}
                  height={40}
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </button>

              {/* Neighborhood Selector */}
              <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-xs text-slate-700 font-semibold border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <div>
                <div className="text-xs text-slate-400 uppercase font-bold">NEIGHBORHOOD</div>
                  <div className="leading-tight text-xs font-bold">Indiranagar, Bengaluru</div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {visibleNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.isAllServices) {
                        handleAllServicesClick();
                      } else {
                        onTabChange(item.id);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Mobile Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="md:hidden flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs transition cursor-pointer"
                title="Toggle Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-700" />
                <span>{isHindi ? 'EN' : 'HI'}</span>
              </button>

              {/* Quick Role Switcher Pill */}
              {currentUser && (
                <div className="hidden sm:block">
                  <RoleBadge role={currentRole} />
                </div>
              )}

              {/* User Profile / Login Button */}
              {!currentUser ? (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isHindi ? 'साइन इन करें' : 'Sign In'}</span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 transition cursor-pointer"
                    aria-label="User Account Menu"
                  >
                    <img
                      src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={currentUser?.name || 'User'}
                      className="w-7 h-7 rounded-full border border-emerald-400 object-cover"
                    />
                    <div className="hidden md:block text-left">
                      <div className="text-xs font-bold text-slate-900 leading-tight">
                        {currentUser?.name || 'Account'}
                      </div>
                      <div className="text-xs text-emerald-700 font-bold leading-none">
                        {currentUser?.role || 'Customer'}
                      </div>
                    </div>
                    <Menu className="w-4 h-4 text-slate-600 ml-1" />
                  </button>

                  {/* Hamburger / User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsSwitchHovered(false);
                        }}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                        
                        {/* User Header */}
                        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                          <img
                            src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={currentUser?.name || 'User'}
                            className="w-10 h-10 rounded-full border-2 border-emerald-500 object-cover"
                          />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{currentUser?.name || 'User'}</div>
                            <div className="text-xs text-slate-500 font-mono">+91 {currentUser?.phone || '9876543210'}</div>
                            <RoleBadge role={currentRole} className="mt-1 inline-block text-xs py-0" />
                          </div>
                        </div>

                        <div className="py-1">
                          {/* 1. Settings (Navigates to Settings Page) */}
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              onTabChange('settings');
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between transition cursor-pointer font-medium"
                          >
                            <div className="flex items-center gap-2.5">
                              <Settings className="w-4 h-4 text-slate-400" />
                              <span>{isHindi ? 'सेटिंग्स और भाषा' : 'Settings & Language'}</span>
                            </div>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                              {isHindi ? 'HI' : 'EN'}
                            </span>
                          </button>

                          {/* 2. Contact Us */}
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setIsContactModalOpen(true);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition cursor-pointer"
                          >
                            <PhoneCall className="w-4 h-4 text-slate-400" />
                            <span>{isHindi ? 'संपर्क और हेल्पलाइन' : 'Contact Us & Helpline'}</span>
                          </button>

                          {/* 3. Switch Account (Hover Flyout) */}
                          <div
                            className="relative"
                            onMouseEnter={() => setIsSwitchHovered(true)}
                            onMouseLeave={() => setIsSwitchHovered(false)}
                          >
                            <button
                              onClick={() => setIsSwitchHovered(!isSwitchHovered)}
                              className="w-full text-left px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center justify-between transition cursor-pointer font-semibold"
                            >
                              <div className="flex items-center gap-2.5">
                                <Users className="w-4 h-4 text-indigo-600" />
                                <span>{isHindi ? 'खाता बदलें' : 'Switch Account'}</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            {/* Flyout Submenu */}
                            {isSwitchHovered && (
                              <div className="absolute right-full top-0 mr-1 w-56 bg-white rounded-xl shadow-2xl border border-slate-100 py-1.5 z-40 animate-in fade-in slide-in-from-right-2">
                                <div className="px-3 py-1 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                  {isHindi ? 'प्रोफ़ाइल चुनें' : 'Switch Account Profile'}
                                </div>

                                {/* Option 1: Customer (Ramesh Kumar) */}
                                <button
                                  onClick={async () => {
                                    await quickSwitchUser('user-cust-1');
                                    onTabChange('booking');
                                    setIsUserMenuOpen(false);
                                    setIsSwitchHovered(false);
                                    showSuccess('Switched to Customer: Ramesh Kumar');
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                                    currentRole === 'Customer' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                                  }`}
                                >
                                  <span>👤 Customer (Ramesh)</span>
                                  {currentRole === 'Customer' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                </button>

                                {/* Option 2: Worker (Rajesh Sharma) */}
                                <button
                                  onClick={async () => {
                                    await quickSwitchUser('user-work-1');
                                    onTabChange('worker-dashboard');
                                    setIsUserMenuOpen(false);
                                    setIsSwitchHovered(false);
                                    showSuccess('Switched to Worker: Rajesh Sharma');
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                                    currentRole === 'Worker' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                                  }`}
                                >
                                  <span className="flex items-center gap-1">
                                    ⚡ Worker (Rajesh) <span className="text-xs text-emerald-700 font-bold bg-emerald-100 px-1 rounded">Verified</span>
                                  </span>
                                  {currentRole === 'Worker' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                </button>

                                {/* Option 3: Admin */}
                                <button
                                  onClick={async () => {
                                    await quickSwitchUser('user-admin-1');
                                    onTabChange('admin-dashboard');
                                    setIsUserMenuOpen(false);
                                    setIsSwitchHovered(false);
                                    showSuccess('Switched to Admin Portal');
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                                    currentRole === 'Admin' ? 'bg-emerald-50 text-emerald-900 font-bold' : 'text-slate-700'
                                  }`}
                                >
                                  <span>🛡️ Admin Portal</span>
                                  {currentRole === 'Admin' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* 4. Apply Now CTA (if not a worker) */}
                          {currentRole !== 'Worker' && (
                            <div className="p-2 border-t border-slate-100">
                              <button
                                onClick={() => {
                                  setIsUserMenuOpen(false);
                                  setIsApplyWorkerModalOpen(true);
                                }}
                                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>{isHindi ? 'कारीगर बनें? आवेदन करें!' : 'Not a worker? Apply Now!'}</span>
                              </button>
                            </div>
                          )}

                          {/* 5. Log Out */}
                          <div className="border-t border-slate-100 pt-1">
                            <button
                              onClick={async () => {
                                setIsUserMenuOpen(false);
                                await logout();
                                showSuccess(isHindi ? 'सफलतापूर्वक लॉग आउट किया गया।' : 'Logged out successfully.');
                                onTabChange('booking');
                              }}
                              className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer font-semibold"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>{isHindi ? 'लॉग आउट' : 'Log Out'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Contact Us Modal */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="SahyogSeva Cooperative Support & Helpline"
        subtitle="24x7 Emergency Assistance & Member Grievance Cell"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-slate-700">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-sm">
              <PhoneCall className="w-4 h-4 text-emerald-700" />
              <span>Toll-Free Helpline: 1800-SAHYOG (1800-724964)</span>
            </div>
            <p className="text-emerald-800">
              Immediate response for electrical short circuits, water leaks, and cooperative escort disputes.
            </p>
          </div>

          <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div><strong>Email Support:</strong> help@sahyogseva.coop</div>
            <div><strong>WhatsApp Helpline:</strong> +91 98765 00000</div>
            <div><strong>Operating Hours:</strong> 24 Hours Emergency Dispatch • 9:00 AM - 10:00 PM General Help</div>
          </div>

          <button
            onClick={() => setIsContactModalOpen(false)}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Apply as Worker Modal */}
      <Modal
        isOpen={isApplyWorkerModalOpen}
        onClose={() => setIsApplyWorkerModalOpen(false)}
        title="Join SahyogSeva Cooperative as an Artisan"
        subtitle="Direct worker ownership, 100% fair wages, zero commission, and escrow payouts."
        maxWidth="md"
      >
        <form onSubmit={handleWorkerApplication} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={applicantName}
              onChange={(e) => setApplicantName(e.target.value)}
              placeholder="e.g. Vikram Sharma"
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">10-Digit Mobile Number</label>
            <input
              type="tel"
              required
              maxLength={10}
              value={applicantPhone}
              onChange={(e) => setApplicantPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="9820011223"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Skill & Trade</label>
            <select
              value={applicantSkill}
              onChange={(e) => setApplicantSkill(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            >
              <option value="Electrician & Wireman">Electrician & Wireman (ITI Certified)</option>
              <option value="Plumber & Pipe Specialist">Plumber & Pipe Specialist</option>
              <option value="AC & Appliance Repair">AC & Appliance Repair</option>
              <option value="Carpenter & Woodwork">Carpenter & Woodwork</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Operating City / Area</label>
            <input
              type="text"
              required
              value={applicantArea}
              onChange={(e) => setApplicantArea(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Cooperative Membership Request</span>
          </button>
        </form>
      </Modal>

      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};