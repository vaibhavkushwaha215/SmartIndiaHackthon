import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../modules/auth';
import { LoginModal } from '../../modules/auth/LoginModal';
import { RoleBadge } from './Badge';
import {
  Wrench,
  CalendarDays,
  Shield,
  Activity,
  FileText,
  Globe,
  LogIn,
  LogOut,
  ChevronDown,
  Users,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../types';

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { t, i18n } = useTranslation();
  const { currentUser, currentRole, isAuthenticated, logout, switchRole, updateLanguage } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'hi' : 'en';
    updateLanguage(nextLang);
  };

  const navItems = [
    { id: 'booking', label: t('nav.electricians', 'Electricians'), icon: Wrench, roles: ['Customer', 'Worker', 'Admin'] },
    { id: 'my-bookings', label: t('nav.my_bookings', 'My Bookings'), icon: CalendarDays, roles: ['Customer', 'Admin'] },
    { id: 'worker-dashboard', label: t('nav.worker_dashboard', 'Worker Dashboard'), icon: Wrench, roles: ['Worker', 'Admin'] },
    { id: 'admin-dashboard', label: t('nav.admin_dashboard', 'Admin Portal'), icon: Shield, roles: ['Admin'] },
    { id: 'demand-forecast', label: t('nav.demand_forecast', 'Demand Forecast'), icon: Activity, roles: ['Admin', 'Worker', 'Customer'] },
    { id: 'logs', label: t('nav.logs', 'Audit Logs'), icon: FileText, roles: ['Admin'] },
  ];

  // Filter nav tabs according to current active view/role but allow browsing
  const visibleNavItems = navItems.filter((item) =>
    currentRole === 'Admin' ? true : item.roles.includes(currentRole)
  );

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        {/* Cooperative Top Bar Alert / Identity */}
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 text-white text-[11px] sm:text-xs py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="bg-amber-400 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
                COOP-V1
              </span>
              <span>Cooperative Gig-Services Protocol • Direct Worker Ownership & Escrow</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded transition font-semibold cursor-pointer"
                title="Change language"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{i18n.language === 'en' ? 'हिंदी (HI)' : 'English (EN)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Brand */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => onTabChange('booking')}
                className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
                      {t('app_name', 'SahyogSeva')}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.2 rounded-full">
                      सहयोग
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                    {t('app_tagline', 'Cooperative Gig-Services Platform')}
                  </p>
                </div>
              </button>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center space-x-1">
                {visibleNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onTabChange(item.id)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 font-extrabold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                      {item.id === 'demand-forecast' && (
                        <span className="bg-amber-100 text-amber-800 text-[9px] px-1 py-0.2 rounded font-bold">
                          AI
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Right Action Bar */}
            <div className="flex items-center gap-3">
              {/* Role Switcher Pill */}
              <div className="relative">
                <button
                  onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 border border-slate-200 transition cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline text-slate-500">{t('nav.switch_role')}:</span>
                  <RoleBadge role={currentRole} />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isRoleDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setIsRoleDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Select Demo Role
                      </div>
                      {(['Customer', 'Worker', 'Admin'] as UserRole[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => {
                            switchRole(r);
                            setIsRoleDropdownOpen(false);
                            if (r === 'Worker') onTabChange('worker-dashboard');
                            if (r === 'Admin') onTabChange('admin-dashboard');
                            if (r === 'Customer') onTabChange('booking');
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition cursor-pointer ${
                            currentRole === r ? 'font-bold bg-emerald-50 text-emerald-900' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <RoleBadge role={r} />
                            <span>{t(`roles.${r.toLowerCase()}`)}</span>
                          </div>
                          {currentRole === r && (
                            <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* User Avatar / Login */}
              {isAuthenticated && currentUser ? (
                <div className="flex items-center gap-2">
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full border border-emerald-300 object-cover"
                  />
                  <div className="hidden md:block text-left">
                    <div className="text-xs font-bold text-slate-900 truncate max-w-[100px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      +91 {currentUser.phone}
                    </div>
                  </div>
                  <button
                    onClick={() => logout()}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                    title={t('nav.logout')}
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t('nav.login')}</span>
                </button>
              )}

              {/* Mobile menu hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
                aria-label="Toggle navigation"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-1 animate-in slide-in-from-top-2">
            {visibleNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.id === 'demand-forecast' && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded font-bold">
                      AI Preview
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Login Modal */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </>
  );
};
