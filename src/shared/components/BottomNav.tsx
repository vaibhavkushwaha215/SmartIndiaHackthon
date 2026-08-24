import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../modules/auth';
import { Wrench, CalendarDays, Shield, Activity, FileText } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const { currentRole } = useAuth();

  const navItems = [
    { id: 'booking', label: t('nav.electricians', 'Electricians'), icon: Wrench, roles: ['Customer', 'Worker', 'Admin'] },
    { id: 'my-bookings', label: t('nav.my_bookings', 'Bookings'), icon: CalendarDays, roles: ['Customer', 'Admin'] },
    { id: 'worker-dashboard', label: t('nav.worker_dashboard', 'Worker'), icon: Wrench, roles: ['Worker', 'Admin'] },
    { id: 'admin-dashboard', label: t('nav.admin_dashboard', 'Admin'), icon: Shield, roles: ['Admin'] },
    { id: 'demand-forecast', label: t('nav.demand_forecast', 'Forecast'), icon: Activity, roles: ['Admin', 'Worker', 'Customer'] },
    { id: 'logs', label: t('nav.logs', 'Logs'), icon: FileText, roles: ['Admin'] },
  ];

  const visibleItems = navItems.filter((item) =>
    currentRole === 'Admin' ? true : item.roles.includes(currentRole)
  );

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
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[56px] ${
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
              <span className="text-[10px] mt-0.5 leading-tight text-center">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
