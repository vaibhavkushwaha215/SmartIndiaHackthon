import React, { useState } from 'react';
import { ToastProvider } from './shared/components/Toast';
import { AuthProvider, useAuth } from './modules/auth';
import { Navbar, BottomNav } from './shared/components';

// Module Imports - Each can be independently mounted or removed
import { WorkerList, MyBookings } from './modules/booking';
import { WorkerDashboard } from './modules/worker-profile';
import { AdminDashboard } from './modules/admin-dashboard';
import { DemandForecast } from './modules/demand-forecast';
import { LogsViewer } from './modules/logging';

const MainLayout: React.FC = () => {
  const { currentRole } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('booking');

  // Render module view based on activeTab
  const renderActiveModule = () => {
    switch (activeTab) {
      case 'booking':
        return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
      case 'my-bookings':
        return <MyBookings />;
      case 'worker-dashboard':
        return <WorkerDashboard />;
      case 'admin-dashboard':
        return (
          <AdminDashboard
            onNavigateToForecast={() => setActiveTab('demand-forecast')}
            onNavigateToLogs={() => setActiveTab('logs')}
          />
        );
      case 'demand-forecast':
        return <DemandForecast />;
      case 'logs':
        return <LogsViewer />;
      default:
        return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-200">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 lg:pb-12">
        {renderActiveModule()}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Footer */}
      <footer className="hidden lg:block bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-semibold text-slate-700">
            <span>SahyogSeva (सहयोग सेवा)</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold">Cooperative Gig-Services Protocol</span>
          </div>
          <div className="text-slate-400">
            Verified Fair Wages • Escrow Protection • Standardized Error Protocol
          </div>
        </div>
      </footer>
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
