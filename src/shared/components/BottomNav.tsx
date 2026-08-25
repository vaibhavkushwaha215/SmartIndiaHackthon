import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../modules/auth';
import { Wrench, CalendarDays, Shield, ShieldCheck, Activity, FileText, Settings } from 'lucide-react';
import { isFeatureEnabled, FeatureKey } from '../config/features.config';
import { UserRole } from '../types';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface BottomNavItem {
  id: string;
  label: string;
  icon: any;
  roles: UserRole[];
  featureKey?: FeatureKey;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const { currentRole, isSuperAdmin } = useAuth();

  const navItems: BottomNavItem[] = [
    { id: 'booking', label: t('nav.all_services', 'Services'), icon: Wrench, roles: ['Customer', 'Worker', 'Admin'], featureKey: 'customerModule' },
    { id: 'my-bookings', label: t('nav.my_bookings', 'Bookings'), icon: CalendarDays, roles: ['Customer', 'Admin'], featureKey: 'customerModule' },
    { id: 'worker-dashboard', label: t('nav.worker_dashboard', 'Worker'), icon: Wrench, roles: ['Worker', 'Admin'], featureKey: 'workerModule' },
    { id: 'admin-dashboard', label: t('nav.admin_dashboard', 'Admin'), icon: Shield, roles: ['Admin'], featureKey: 'adminModule' },
    { id: 'demand-forecast', label: t('nav.demand_forecast', 'Forecast'), icon: Activity, roles: ['Admin', 'Worker', 'Customer'], featureKey: 'demandForecasting' },
    { id: 'settings', label: t('nav.settings', 'Settings'), icon: Settings, roles: ['Customer', 'Worker', 'Admin'] },
  ];

  const visibleItems = navItems.filter((item) => {
    if (item.featureKey && !isFeatureEnabled(item.featureKey)) return false;
    return currentRole === 'Admin' ? true : item.roles.includes(currentRole);
  });

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 shadow-lg">
      <div className="flex items-center justify-around">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[50px] ${
                isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1 rounded-lg transition-colors ${
                  isActive ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs mt-0.5 leading-tight text-center">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
