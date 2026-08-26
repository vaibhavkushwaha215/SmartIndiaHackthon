import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../../shared/components/Toast';
import { UserPlus, User, Phone, Lock, MapPin, Building, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { useI18n } from '../i18n';
import { navigate } from '../../shared/services/router';

interface RegisterPageProps {
  onNavigateToLogin: () => void;
  onNavigateToApplyWorker: () => void;
  onRegisterSuccess?: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onNavigateToLogin,
  onNavigateToApplyWorker,
  onRegisterSuccess = () => {},
}) => {
  const { t } = useI18n();
  const { register } = useAuth();
  const { showError, showSuccess } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    city: 'New Delhi',
    area: '',
    pincode: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showError(400, t('auth.error_name', 'Please enter your full name'));
      return;
    }
    if (formData.phone.trim().length !== 10) {
      showError(102, t('auth.invalid_phone', 'Please enter a valid 10-digit mobile number'));
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      showError(400, t('auth.error_password', 'Password must be at least 6 characters long'));
      return;
    }
    if (formData.pincode && formData.pincode.length !== 6) {
      showError(304, t('auth.error_pincode', 'Pincode must be exactly 6 digits'));
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: 'Customer',
      });
      showSuccess(t('auth.register_success', 'Account created successfully!'));
      onRegisterSuccess();
    } catch (err: any) {
      const code = err.code || 103;
      showError(code, err.message || t('auth.register_failed', 'Registration failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-6 animate-in fade-in">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center mx-auto shadow-sm">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {t('auth.registerTitle', 'Create Customer Account')}
          </h2>
          <p className="text-xs text-slate-500">
            {t('auth.registerSubtitle', 'Join the ethical cooperative services platform')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t('auth.name_label', 'Full Name')} *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Ramesh Kumar"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t('auth.phone_label', '10-Digit Mobile Number')} *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="tel"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                placeholder="e.g. 9876543210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              {t('auth.password_label', 'Password')} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create secure password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                City / Region
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Neighborhood / Area
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="e.g. Indiranagar"
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-xs text-emerald-800 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('auth.charterBadge', '0% Commission Cooperative Charter')}</span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>{isSubmitting ? t('common.loading', 'Creating Account...') : t('common.submit', 'Register Customer Account')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Secondary Links */}
        <div className="pt-2 border-t border-slate-100 space-y-2.5 text-center text-xs">
          <div>
            <button
              onClick={onNavigateToLogin}
              className="font-bold text-indigo-700 hover:underline cursor-pointer"
            >
              {t('auth.haveAccount', 'Already have an account? Sign In →')}
            </button>
          </div>

          <div className="pt-1">
            <button
              onClick={() => {
                navigate('/');
              }}
              className="text-slate-400 hover:text-slate-600 text-xs font-semibold hover:underline cursor-pointer"
            >
              ← {t('common.returnHome', 'Return to Homepage')}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
