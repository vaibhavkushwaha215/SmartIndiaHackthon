import React, { useState } from 'react';
import { ToastProvider } from './shared/components/Toast';
import { AuthProvider } from './modules/auth';
import { Navbar, BottomNav } from './shared/components';
import { Footer } from './shared/components/Footer';

// Module Imports
import { WorkerList, MyBookings } from './modules/booking';
import { WorkerDashboard } from './modules/worker-profile';
import { AdminDashboard } from './modules/admin-dashboard';
import { DemandForecast } from './modules/demand-forecast';
import { LogsViewer } from './modules/logging';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('booking');

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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {renderActiveModule()}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Rich Dark Footer */}
      <Footer />
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