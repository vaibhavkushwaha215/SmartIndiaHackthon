import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../../shared/components/Toast';
import { ShieldCheck, Phone, Lock, ArrowRight, UserPlus, Wrench, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LoginPageProps {
  onNavigateToRegister: () => void;
  onNavigateToApplyWorker: () => void;
  onLoginSuccess?: (role: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToRegister,
  onNavigateToApplyWorker,
  onLoginSuccess = () => {},
}) => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const { showError, showSuccess, showInfo } = useToast();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.trim().length !== 10) {
      showError(102, 'Please enter a valid 10-digit mobile number');
      return;
    }
    if (!password) {
      showError(400, 'Please enter your account password');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login({ phone: phone.trim(), password });
      showSuccess(`Welcome back, ${user.name}!`);
      onLoginSuccess(user.role);
    } catch (err: any) {
      const code = err.code || 101;
      showError(code, err.message || 'Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    showInfo(
      'Cooperative Password Recovery: In prototype mode, your password is saved in your local store or is standard demo format (e.g., customer123 / worker123 / admin123).',
      'Password Assistance'
    );
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 animate-in fade-in">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to SahyogSeva
          </h2>
          <p className="text-xs text-slate-500">
            Access verified community household services or artisan operations.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              10-Digit Mobile Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 9876543210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Demo passwords: <span className="font-mono text-emerald-700">customer123</span> · <span className="font-mono text-emerald-700">worker123</span> · <span className="font-mono text-emerald-700">admin123</span>
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Secondary Links */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5 text-center text-xs">
          <div className="flex items-center justify-center gap-1.5 text-[var(--color-text-secondary)]">
            <span>New customer?</span>
            <button
              onClick={onNavigateToRegister}
              className="font-bold text-[var(--color-primary)] hover:underline cursor-pointer flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Customer Account</span>
            </button>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-left">
            <div>
              <div className="font-bold text-slate-900">Are you a trade artisan?</div>
              <div className="text-[11px] text-slate-500">Join our verified cooperative provider network</div>
            </div>
            <button
              onClick={onNavigateToApplyWorker}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              <Wrench className="w-3 h-3 text-amber-300" />
              <span>Apply as Worker</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                window.location.hash = '';
                window.location.pathname = '/';
              }}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold hover:underline cursor-pointer"
            >
              ← Return to Home / Browse Services
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
