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
  ShieldCheck,
  Activity,
  Globe,
  LogOut,
  ChevronRight,
  ChevronDown,
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

import { LanguageSelector, useI18n } from '../../modules/i18n';

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
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { t, language } = useI18n();
  const isHindi = language === 'hi';
  const { currentUser, currentRole, isSuperAdmin, logout, quickSwitchUser, switchRole } = useAuth();
  const { showSuccess } = useToast();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSwitchHovered, setIsSwitchHovered] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const navItems: NavItemConfig[] = [
    { id: 'services', label: t('nav.services', 'All Services'), icon: Wrench, roles: ['Customer', 'Worker', 'Admin', 'SuperAdmin'], featureKey: 'customerModule' },
    { id: 'my-bookings', label: t('nav.my_bookings', 'My Bookings'), icon: CalendarDays, roles: ['Customer', 'Admin', 'SuperAdmin'], featureKey: 'customerModule' },
    { id: 'worker-dashboard', label: t('nav.worker_dashboard', 'Worker Dashboard'), icon: Wrench, roles: ['Worker', 'Admin', 'SuperAdmin'], featureKey: 'workerModule' },
    { id: 'admin-dashboard', label: t('nav.admin_dashboard', 'Admin Portal'), icon: Shield, roles: ['Admin', 'SuperAdmin'], featureKey: 'adminModule' },
    { id: 'demand-forecast', label: t('nav.demand_forecast', 'Demand Forecast'), icon: Activity, roles: ['Admin', 'SuperAdmin'], featureKey: 'demandForecasting' },
    { id: 'settings', label: t('nav.settings', 'Settings'), icon: Settings, roles: ['Customer', 'Worker', 'Admin', 'SuperAdmin'] },
  ];

  const visibleNavItems = navItems.filter((item) => {
    // Feature flag check
    if (item.featureKey && !isFeatureEnabled(item.featureKey)) return false;
    // Role check
    return item.roles.includes(currentRole) || (isSuperAdmin && item.roles.includes('SuperAdmin'));
  });

  return (
    <>
      <header className="sticky top-0 z-40 bg-[var(--color-surface,white)]/95 backdrop-blur-md border-b border-[var(--color-border,#e2e8f0)] shadow-xs transition-colors duration-250">
        
        {/* Top Announcement Ribbon - ONLY on Homepage */}
        {activeTab === 'booking' && (
          <div className="hidden md:block bg-[var(--color-primary-dark,#0b3b2c)] text-white text-xs py-1.5 px-4 border-b border-white/10 transition-colors duration-250">
            <div className="max-w-7xl mx-auto flex flex-row items-center justify-between gap-1 text-left">
              <div className="flex items-center gap-2 font-medium">
                <span>🛡️ 100% Background & Police Verified Local Professionals</span>
                <span>•</span>
                <span>Zero Advance Payment • Pay Cash / UPI After Service</span>
              </div>
              <div className="flex items-center gap-3 font-semibold">
                <span className="text-emerald-300 flex items-center gap-1.5">
                  <PhoneCall className="w-3 h-3" />
                  Emergency 24x7: <strong>1800-SAHYOG</strong>
                </span>
              </div>
            </div>
          </div>
        )}

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
                    onClick={() => onTabChange(item.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-[var(--color-primary)] text-white shadow-xs'
                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-primary-light)]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[var(--color-primary)]'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Language Selector */}
              <LanguageSelector variant="dropdown" />

              {/* Quick Role Switcher Pill */}
              {currentUser && (
                <div className="hidden sm:block">
                  <RoleBadge role={currentRole} />
                </div>
              )}

              {/* User Profile / Login Button */}
              {!currentUser ? (
                <button
                  onClick={() => onTabChange('login')}
                  className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-xs shadow-xs transition cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t('nav.login', 'Sign In')}</span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[var(--color-surface,white)] hover:bg-[var(--color-primary-light)] border border-[var(--color-border)] transition cursor-pointer"
                    aria-label="User Account Menu"
                  >
                    <img
                      src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                      alt={currentUser?.name || 'User'}
                      className="w-7 h-7 rounded-full border border-[var(--color-primary)] object-cover"
                    />
                    <div className="hidden md:block text-left">
                      <div className="text-xs font-bold text-[var(--color-text)] leading-tight">
                        {currentUser?.name || 'Account'}
                      </div>
                      <div className="text-xs text-[var(--color-primary)] font-bold leading-none">
                        {currentUser?.role || 'Customer'}
                      </div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setIsSwitchHovered(false);
                        }}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-[var(--color-surface,white)] rounded-2xl shadow-2xl border border-[var(--color-border,#e2e8f0)] py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                        
                        {/* User Header */}
                        <div className="px-4 py-3 border-b border-[var(--color-border,#e2e8f0)] bg-[var(--color-bg,#f8fafc)] flex items-center gap-3">
                          <img
                            src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                            alt={currentUser?.name || 'User'}
                            className="w-10 h-10 rounded-full border-2 border-[var(--color-primary)] object-cover"
                          />
                          <div>
                            <div className="text-xs font-bold text-[var(--color-text)]">{currentUser?.name || 'User'}</div>
                            <div className="text-xs text-[var(--color-text-muted)] font-mono">+91 {currentUser?.phone || '9876543210'}</div>
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
                            className="w-full text-left px-4 py-2.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] flex items-center justify-between transition cursor-pointer font-medium"
                          >
                            <div className="flex items-center gap-2.5">
                              <Settings className="w-4 h-4 text-slate-400" />
                              <span>{t('accountMenu.settingsAndLanguage', 'Settings & Language')}</span>
                            </div>
                            <span className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary-light)] px-1.5 py-0.5 rounded uppercase">
                              {language}
                            </span>
                          </button>

                          {/* 2. Contact Us */}
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              setIsContactModalOpen(true);
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] flex items-center gap-2.5 transition cursor-pointer"
                          >
                            <PhoneCall className="w-4 h-4 text-slate-400" />
                            <span>{t('accountMenu.contactAndHelpline', 'Contact Us & Helpline')}</span>
                          </button>

                          {/* 3. Switch Account (Hover Flyout) */}
                          <div
                            className="relative"
                            onMouseEnter={() => setIsSwitchHovered(true)}
                            onMouseLeave={() => setIsSwitchHovered(false)}
                          >
                            <button
                              onClick={() => setIsSwitchHovered(!isSwitchHovered)}
                              className="w-full text-left px-4 py-2.5 text-xs text-[var(--color-text)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] flex items-center justify-between transition cursor-pointer font-semibold"
                            >
                              <div className="flex items-center gap-2.5">
                                <Users className="w-4 h-4 text-[var(--color-primary)]" />
                                <span>{t('accountMenu.switchAccount', 'Switch Account')}</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </button>

                            {/* Flyout Submenu */}
                            {isSwitchHovered && (
                              <div className="absolute right-full top-0 mr-1 w-56 bg-[var(--color-surface,white)] rounded-xl shadow-2xl border border-[var(--color-border,#e2e8f0)] py-1.5 z-40 animate-in fade-in slide-in-from-right-2">
                                <div className="px-3 py-1 text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">
                                  {t('accountMenu.switchProfile', 'Switch Account Profile')}
                                </div>

                                {/* Option 1: Customer (Ramesh Kumar) */}
                                <button
                                  onClick={async () => {
                                    await quickSwitchUser('user-cust-1');
                                    onTabChange('booking');
                                    setIsUserMenuOpen(false);
                                    setIsSwitchHovered(false);
                                    showSuccess(t('accountMenu.switchedTo', { name: 'Customer (Ramesh)' }));
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[var(--color-primary-light)] transition cursor-pointer ${
                                    currentRole === 'Customer' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold' : 'text-[var(--color-text)]'
                                  }`}
                                >
                                  <span>👤 {t('roles.customer', 'Customer')} (Ramesh)</span>
                                  {currentRole === 'Customer' && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />}
                                </button>

                                {/* Option 2: Worker (Rajesh Sharma) */}
                                <button
                                  onClick={async () => {
                                    await quickSwitchUser('user-work-1');
                                    onTabChange('worker-dashboard');
                                    setIsUserMenuOpen(false);
                                    setIsSwitchHovered(false);
                                    showSuccess(t('accountMenu.switchedTo', { name: 'Worker (Rajesh)' }));
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[var(--color-primary-light)] transition cursor-pointer ${
                                    currentRole === 'Worker' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold' : 'text-[var(--color-text)]'
                                  }`}
                                >
                                  <span className="flex items-center gap-1">
                                    ⚡ {t('roles.worker', 'Worker')} (Rajesh) <span className="text-[10px] text-[var(--color-primary)] font-bold bg-[var(--color-primary-light)] px-1 rounded">{t('common.verified', 'Verified')}</span>
                                  </span>
                                  {currentRole === 'Worker' && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />}
                                </button>

                                {/* Option 3: Admin */}
                                <button
                                  onClick={async () => {
                                    await quickSwitchUser('user-admin-1');
                                    onTabChange('admin-dashboard');
                                    setIsUserMenuOpen(false);
                                    setIsSwitchHovered(false);
                                    showSuccess(t('accountMenu.switchedTo', { name: 'Admin Portal' }));
                                  }}
                                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[var(--color-primary-light)] transition cursor-pointer ${
                                    currentRole === 'Admin' ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold' : 'text-[var(--color-text)]'
                                  }`}
                                >
                                  <span>🛡️ {t('nav.admin_dashboard', 'Admin Portal')}</span>
                                  {currentRole === 'Admin' && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />}
                                </button>
                              </div>
                            )}
                          </div>

                          {/* 4. Apply Now CTA (if not a worker) */}
                          {currentRole !== 'Worker' && (
                            <div className="p-2 border-t border-[var(--color-border)]">
                              <button
                                onClick={() => {
                                  setIsUserMenuOpen(false);
                                  onTabChange('apply-worker');
                                }}
                                className="w-full py-2 px-3 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white text-xs font-bold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                                <span>{t('accountMenu.notWorkerApply', 'Not a worker? Apply Now!')}</span>
                              </button>
                            </div>
                          )}

                          {/* 5. Log Out */}
                          <div className="border-t border-slate-100 pt-1">
                            <button
                              onClick={async () => {
                                setIsUserMenuOpen(false);
                                await logout();
                                showSuccess(t('accountMenu.loggedOutSuccess', 'Logged out successfully.'));
                                onTabChange('booking');
                              }}
                              className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer font-semibold"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                              <span>{t('accountMenu.logout', 'Log Out')}</span>
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
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
          >
            Close
          </button>
        </div>
      </Modal>
    </>
  );
};