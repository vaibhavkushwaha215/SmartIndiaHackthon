import React, { useState, useEffect } from 'react';
import { ToastProvider } from './shared/components/Toast';
import { AuthProvider, useAuth } from './modules/auth';
import { Navbar, BottomNav, PWAInstallBanner } from './shared/components';
import { Footer } from './shared/components/Footer';
import { isFeatureEnabled, useFeature } from './shared/config/features.config';
import { db } from './shared/services/database';
import { AlertTriangle, Wrench, ShieldCheck } from 'lucide-react';
import { ThemeProvider } from './shared/context/ThemeContext';

// Module Imports
import { WorkerList, MyBookings } from './modules/booking';
import { WorkerDashboard, WorkerJobs, WorkerEarnings } from './modules/worker-profile';
import { AdminDashboard } from './modules/admin-dashboard';
import { LoginPage, RegisterPage, ApplyWorkerPage } from './modules/auth';
import { DemandForecast } from './modules/demand-forecast';
import { LogsViewer } from './modules/logging';
import { SettingsPage } from './modules/settings';
import { NotFound404, AdminUnauthorized } from './modules/superadmin';
import { SahyogAssistant } from './modules/chatbot';

function parseRouteFromLocation(): string {
  const path = window.location.pathname.toLowerCase().replace(/\/$/, '');
  const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '');

  const route = hash || path;
  if (route === 'superadmin') return 'superadmin';
  if (route === 'login' || route === 'signin' || route === 'sign-in') return 'login';
  if (route === 'register' || route === 'signup' || route === 'sign-up') return 'register';
  if (route === 'apply-worker' || route === 'apply' || route === 'join') return 'apply-worker';
  if (route === 'worker/jobs' || route === 'worker-jobs') return 'worker-jobs';
  if (route === 'worker/earnings' || route === 'worker-earnings') return 'worker-earnings';
  if (route === 'worker/dashboard' || route === 'worker-dashboard') return 'worker-dashboard';
  if (route === 'admin/workers' || route === 'admin-workers') return 'admin-workers';
  if (route === 'admin/analytics' || route === 'admin-analytics') return 'admin-analytics';
  if (route === 'admin/dashboard' || route === 'admin-dashboard') return 'admin-dashboard';
  if (route === 'my-bookings' || route === 'bookings') return 'my-bookings';
  if (route === 'demand-forecast') return 'demand-forecast';
  if (route === 'logs') return 'logs';
  if (route === 'settings') return 'settings';
  return 'booking';
}

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>(parseRouteFromLocation);
  const { currentUser, isSuperAdmin, currentRole } = useAuth();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');

  // Live URL hash/path listener for address bar changes
  useEffect(() => {
    const handleLocationChange = () => {
      setActiveTab(parseRouteFromLocation());
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Live subscription to maintenance status
  useEffect(() => {
    db.getSystemSettings().then((s) => {
      setIsMaintenance(s.maintenanceMode);
      setMaintenanceMsg(s.maintenanceMessage);
    });

    const handleSettingsUpdate = (e: any) => {
      if (e.detail) {
        setIsMaintenance(Boolean(e.detail.maintenanceMode));
        setMaintenanceMsg(e.detail.maintenanceMessage || '');
      }
    };

    window.addEventListener('sahyog:settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('sahyog:settings_updated', handleSettingsUpdate);
  }, []);

  const renderActiveModule = () => {
    switch (activeTab) {
      // SuperAdmin 3-Tier Security Gate (Unifies with standard layout)
      case 'superadmin':
        if (isSuperAdmin) {
          return <SettingsPage initialTab="superadmin" />;
        }
        if (currentRole === 'Admin') {
          return (
            <AdminUnauthorized
              onGoToAdmin={() => {
                window.location.hash = '#admin/dashboard';
                setActiveTab('admin-dashboard');
              }}
            />
          );
        }
        return (
          <NotFound404
            onGoHome={() => {
              window.location.hash = '';
              setActiveTab('booking');
            }}
          />
        );

      // Auth Routes
      case 'login':
        return (
          <LoginPage
            onNavigateToRegister={() => {
              window.location.hash = '#register';
              setActiveTab('register');
            }}
            onNavigateToApplyWorker={() => {
              window.location.hash = '#apply-worker';
              setActiveTab('apply-worker');
            }}
            onLoginSuccess={(role) => {
              if (role === 'Worker') {
                window.location.hash = '#worker/dashboard';
                setActiveTab('worker-dashboard');
              } else if (role === 'Admin' || role === 'SuperAdmin') {
                window.location.hash = '#admin/dashboard';
                setActiveTab('admin-dashboard');
              } else {
                window.location.hash = '';
                setActiveTab('booking');
              }
            }}
          />
        );

      case 'register':
        return (
          <RegisterPage
            onNavigateToLogin={() => {
              window.location.hash = '#login';
              setActiveTab('login');
            }}
            onNavigateToApplyWorker={() => {
              window.location.hash = '#apply-worker';
              setActiveTab('apply-worker');
            }}
            onRegisterSuccess={() => {
              window.location.hash = '';
              setActiveTab('booking');
            }}
          />
        );

      case 'apply-worker':
        return (
          <ApplyWorkerPage
            onNavigateToLogin={() => {
              window.location.hash = '#login';
              setActiveTab('login');
            }}
          />
        );

      // Worker Subroutes (Protected for Worker and Admin)
      case 'worker-dashboard':
        if (currentRole !== 'Worker' && currentRole !== 'Admin' && !isSuperAdmin) {
          return (
            <div className="p-8 text-center bg-white rounded-3xl border border-amber-200 space-y-3 max-w-md mx-auto my-8">
              <h3 className="font-extrabold text-slate-900">Worker Clearance Required</h3>
              <p className="text-xs text-slate-500">Sign in with a verified artisan account to access the Worker Command Center.</p>
              <button
                onClick={() => { window.location.hash = '#login'; setActiveTab('login'); }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Sign In to Worker Account
              </button>
            </div>
          );
        }
        return (
          <WorkerDashboard
            onNavigateToJobs={() => {
              window.location.hash = '#worker/jobs';
              setActiveTab('worker-jobs');
            }}
            onNavigateToEarnings={() => {
              window.location.hash = '#worker/earnings';
              setActiveTab('worker-earnings');
            }}
          />
        );

      case 'worker-jobs':
        if (currentRole !== 'Worker' && currentRole !== 'Admin' && !isSuperAdmin) {
          return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
        }
        return <WorkerJobs />;

      case 'worker-earnings':
        if (currentRole !== 'Worker' && currentRole !== 'Admin' && !isSuperAdmin) {
          return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
        }
        return <WorkerEarnings />;

      // Admin Subroutes (Protected for Admin and SuperAdmin)
      case 'admin-dashboard':
        if (currentRole !== 'Admin' && !isSuperAdmin) {
          return (
            <div className="p-8 text-center bg-white rounded-3xl border border-rose-200 space-y-3 max-w-md mx-auto my-8">
              <h3 className="font-extrabold text-slate-900">Admin Authorization Required</h3>
              <p className="text-xs text-slate-500">This area is reserved for cooperative administration staff.</p>
              <button
                onClick={() => { window.location.hash = ''; setActiveTab('booking'); }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Return to Safe Area
              </button>
            </div>
          );
        }
        return (
          <AdminDashboard
            initialSubTab="overview"
            onNavigateToForecast={() => setActiveTab('demand-forecast')}
            onNavigateToLogs={() => setActiveTab('logs')}
            onNavigateToSettings={() => {
              window.location.hash = '#settings';
              setActiveTab('settings');
            }}
          />
        );

      case 'admin-workers':
        if (currentRole !== 'Admin' && !isSuperAdmin) {
          return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
        }
        return (
          <AdminDashboard
            initialSubTab="workers"
            onNavigateToForecast={() => setActiveTab('demand-forecast')}
            onNavigateToLogs={() => setActiveTab('logs')}
            onNavigateToSettings={() => {
              window.location.hash = '#settings';
              setActiveTab('settings');
            }}
          />
        );

      case 'admin-analytics':
        if (currentRole !== 'Admin' && !isSuperAdmin) {
          return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
        }
        return (
          <AdminDashboard
            initialSubTab="analytics"
            onNavigateToForecast={() => setActiveTab('demand-forecast')}
            onNavigateToLogs={() => setActiveTab('logs')}
            onNavigateToSettings={() => {
              window.location.hash = '#settings';
              setActiveTab('settings');
            }}
          />
        );

      // Customer Directory & Booking
      case 'booking':
        if (!isFeatureEnabled('customerModule')) {
          return (
            <div className="p-12 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-200 shadow-xs max-w-lg mx-auto my-8">
              <Wrench className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="font-extrabold text-slate-900">Service Directory Offline</h3>
              <p className="text-xs text-slate-500 mt-1">
                The customer booking module is currently paused by platform operations.
              </p>
            </div>
          );
        }
        return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;

      case 'my-bookings':
        if (!isFeatureEnabled('customerModule')) return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
        return <MyBookings />;

      case 'demand-forecast':
        if (!isFeatureEnabled('demandForecasting')) return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
        return <DemandForecast />;

      case 'logs':
        if (!isFeatureEnabled('adminModule')) return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
        return <LogsViewer />;

      case 'settings':
        return <SettingsPage />;

      default:
        return <WorkerList onNavigateToBookings={() => setActiveTab('my-bookings')} />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg,#f8fafc)] text-[var(--color-text,#0f172a)] flex flex-col transition-colors duration-250">
      
      {/* Maintenance Mode Notice for Non-SuperAdmins */}
      {isMaintenance && !isSuperAdmin && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs font-bold shadow-md flex items-center justify-center gap-2 border-b border-amber-600 animate-in slide-in-from-top duration-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{maintenanceMsg || 'Platform maintenance in progress. Direct booking may be temporarily restricted.'}</span>
        </div>
      )}

      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-12">
        {renderActiveModule()}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <Footer />
      <PWAInstallBanner />
      {useFeature('chatbot') && <SahyogAssistant currentPage={activeTab} />}
    </div>
  );
};

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