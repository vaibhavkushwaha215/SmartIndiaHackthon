import React, { useState } from 'react';
import { ToastProvider } from './shared/components/Toast';
import { AuthProvider } from './modules/auth';
import { Navbar, BottomNav, PWAInstallBanner } from './shared/components';
import { Footer } from './shared/components/Footer';
import { isFeatureEnabled } from './shared/config/features.config';

// Module Imports
import { WorkerList, MyBookings } from './modules/booking';
import { WorkerDashboard } from './modules/worker-profile';
import { AdminDashboard } from './modules/admin-dashboard';
import { DemandForecast } from './modules/demand-forecast';
import { LogsViewer } from './modules/logging';
import { SettingsPage } from './modules/settings';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('booking');

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'booking':
        if (!isFeatureEnabled('BOOKING_SYSTEM')) return <div className="p-8 text-center text-slate-500 font-medium">Booking module is currently disabled.</div>;
        return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
      case 'my-bookings':
        if (!isFeatureEnabled('MY_BOOKINGS')) return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
        return <MyBookings />;
      case 'worker-dashboard':
        if (!isFeatureEnabled('WORKER_DASHBOARD')) return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
        return <WorkerDashboard />;
      case 'admin-dashboard':
        if (!isFeatureEnabled('ADMIN_PORTAL')) return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
        return (
          <AdminDashboard
            onNavigateToForecast={() => setActiveTab('demand-forecast')}
            onNavigateToLogs={() => setActiveTab('logs')}
          />
        );
      case 'demand-forecast':
        if (!isFeatureEnabled('DEMAND_FORECAST')) return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
        return <DemandForecast />;
      case 'logs':
        if (!isFeatureEnabled('AUDIT_LOGS')) return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
        return <LogsViewer />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-200">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-12">
        {renderActiveModule()}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Footer />
      <PWAInstallBanner />
    </div>
  );
};

import { ThemeProvider } from './shared/context/ThemeContext';

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainLayout />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;