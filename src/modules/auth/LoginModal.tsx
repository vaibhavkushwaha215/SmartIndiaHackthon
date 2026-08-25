import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../../shared/components/Toast';
import { Modal } from '../../shared/components/Modal';
import { UserRole } from '../../shared/types';
import { SEED_USERS } from '../../shared/data/seed-data';
import { LogIn, UserCheck, Wrench, Shield, ArrowRight, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthTab = 'login' | 'register';

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { login, register, quickSwitchUser } = useAuth();
  const { showError, showSuccess } = useToast();

  const [tab, setTab] = useState<AuthTab>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Customer');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setName('');
    setPhone('');
    setPassword('');
    setRole('Customer');
    setShowPassword(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await login({ phone, password });
      showSuccess(`${t('auth.logged_in_as', 'Logged in as')} ${user.name} (${user.role})`);
      resetForm();
      onClose();
    } catch (err: any) {
      showError(err.code || 500, err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const user = await register({ name, role, phone, password });
      showSuccess(`${t('auth.registered_as', 'Registered as')} ${user.name} (${user.role})`);
      resetForm();
      onClose();
    } catch (err: any) {
      showError(err.code || 500, err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (userId: string) => {
    try {
      const user = await quickSwitchUser(userId);
      showSuccess(`${t('auth.logged_in_as', 'Logged in as')} ${user.name} (${user.role})`);
      onClose();
    } catch (err: any) {
      showError(err.code || 500, err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <LogIn className="w-4 h-4" />
          </div>
          <span>{t('auth.title', 'SahyogSeva Access')}</span>
        </div>
      }
      subtitle={t('auth.subtitle', 'Sign in with your credentials or select a demo profile')}
      maxWidth="md"
    >
      {/* Quick Role Presets for Hackathon / Demo Testing */}
      <div className="mb-6">
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
          {t('auth.quick_login', '1-Click Demo Profiles')}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Customer preset */}
          <button
            type="button"
            onClick={() => handleQuickLogin(SEED_USERS[0].id)}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-100/70 text-indigo-900 transition text-center group cursor-pointer"
          >
            <UserCheck className="w-5 h-5 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold leading-tight">{SEED_USERS[0].name}</span>
            <span className="text-[10px] text-indigo-600 font-semibold">{t('roles.customer')}</span>
          </button>

          {/* Worker preset */}
          <button
            type="button"
            onClick={() => handleQuickLogin(SEED_USERS[2].id)}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-emerald-100 bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-900 transition text-center group cursor-pointer"
          >
            <Wrench className="w-5 h-5 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold leading-tight">{SEED_USERS[2].name}</span>
            <span className="text-[10px] text-emerald-600 font-semibold">{t('roles.worker')}</span>
          </button>

          {/* Admin preset */}
          <button
            type="button"
            onClick={() => handleQuickLogin(SEED_USERS[8].id)}
            className="flex flex-col items-center justify-center p-3 rounded-xl border border-purple-100 bg-purple-50/50 hover:bg-purple-100/70 text-purple-900 transition text-center group cursor-pointer"
          >
            <Shield className="w-5 h-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold leading-tight">{SEED_USERS[8].name}</span>
            <span className="text-[10px] text-purple-600 font-semibold">{t('roles.admin')}</span>
          </button>
        </div>
      </div>

      <div className="relative flex items-center justify-center mb-5">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
          {t('auth.or_sign_in', 'OR SIGN IN / REGISTER')}
        </span>
      </div>

      {/* Tab Switcher */}
      <div className="flex rounded-xl border border-slate-200 mb-5 overflow-hidden">
        <button
          type="button"
          onClick={() => { setTab('login'); resetForm(); }}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 ${
            tab === 'login'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          {t('auth.sign_in', 'Sign In')}
        </button>
        <button
          type="button"
          onClick={() => { setTab('register'); resetForm(); }}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 ${
            tab === 'register'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          {t('auth.register', 'Register')}
        </button>
      </div>

      {/* Login Form */}
      {tab === 'login' && (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              {t('auth.phone_label', '10-Digit Mobile Number')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">+91</span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              {t('auth.password_label', 'Password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Demo passwords: <span className="font-mono text-emerald-700">customer123</span> · <span className="font-mono text-emerald-700">worker123</span> · <span className="font-mono text-emerald-700">admin123</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{t('auth.sign_in_btn', 'Sign In')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Register Form */}
      {tab === 'register' && (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              {t('auth.role_label', 'Select Account Type')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['Customer', 'Worker'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`py-2 px-2 text-xs font-bold rounded-lg border transition text-center cursor-pointer ${
                    role === r
                      ? 'border-emerald-700 bg-emerald-700 text-white shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {t(`roles.${r.toLowerCase()}`, r)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              {t('auth.name_label', 'Full Name')}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              {t('auth.phone_label', '10-Digit Mobile Number')}
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-sm font-semibold text-slate-400">+91</span>
              <input
                type="tel"
                required
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="9876543210"
                className="w-full pl-12 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              {t('auth.password_label', 'Password')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {t('auth.password_hint', 'Minimum 6 characters')}
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-700/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('auth.register_btn', 'Create Account')}</span>
          </button>
        </form>
      )}
    </Modal>
  );
};
