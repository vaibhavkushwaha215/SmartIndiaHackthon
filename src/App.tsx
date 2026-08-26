import React, { useState, useEffect } from 'react';
import { ToastProvider } from './shared/components/Toast';
import { AuthProvider, useAuth } from './modules/auth';
import { Navbar, BottomNav, PWAInstallBanner } from './shared/components';
import { Footer } from './shared/components/Footer';
import { isFeatureEnabled, useFeature } from './shared/config/features.config';
import { db } from './shared/services/database';
import { AlertTriangle, Wrench, ShieldCheck } from 'lucide-react';
import { ThemeProvider } from './shared/context/ThemeContext';
import { I18nProvider } from './modules/i18n';

// Module Imports
import { WorkerList, MyBookings, BookingPage } from './modules/booking';
import { WorkerDashboard, WorkerJobs, WorkerEarnings } from './modules/worker-profile';
import { AdminDashboard } from './modules/admin-dashboard';
import { LoginPage, RegisterPage, ApplyWorkerPage } from './modules/auth';
import { DemandForecast } from './modules/demand-forecast';
import { LogsViewer } from './modules/logging';
import { SettingsPage } from './modules/settings';
import { SuperAdminPortal, NotFound404, AdminUnauthorized } from './modules/superadmin';
import { SahyogAssistant } from './modules/chatbot';
import { getServiceById } from './shared/config/services.config';

import { parseRouteFromLocation, navigate, AppRoute, getServiceIdFromUrl, getRequestIdFromUrl } from './shared/services/router';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppRoute>(parseRouteFromLocation);
  const { currentUser, isSuperAdmin, currentRole } = useAuth();
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  const isChatbotEnabled = useFeature('chatbot');

  const handleNavigate = (pathOrRoute: string) => {
    navigate(pathOrRoute);
  };

  // Live URL listener for popstate & hash changes
  useEffect(() => {
    const handleLocationChange = () => {
      setActiveTab(parseRouteFromLocation());
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
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

  // -------------------------------------------------------------
  // DEDICATED STANDALONE SUPERADMIN PORTAL (Strictly for SuperAdmin)
  // -------------------------------------------------------------
  if (activeTab === 'superadmin' && isSuperAdmin) {
    return (
      <SuperAdminPortal
        onExit={() => {
          handleNavigate('/');
        }}
      />
    );
  }

  const renderActiveModule = () => {
    switch (activeTab) {
      // SuperAdmin 3-Tier Security Gate
      case 'superadmin':
        if (currentRole === 'Admin') {
          return (
            <AdminUnauthorized
              onGoToAdmin={() => {
                handleNavigate('/admin/dashboard');
              }}
            />
          );
        }
        return (
          <NotFound404
            onGoHome={() => {
              handleNavigate('/');
            }}
          />
        );

      // Auth Routes
      case 'login':
        return (
          <LoginPage
            onNavigateToRegister={() => {
              handleNavigate('/register');
            }}
            onNavigateToApplyWorker={() => {
              handleNavigate('/apply-worker');
            }}
            onLoginSuccess={(role) => {
              if (role === 'Worker') {
                handleNavigate('/worker/dashboard');
              } else if (role === 'Admin') {
                handleNavigate('/admin/dashboard');
              } else if (role === 'SuperAdmin') {
                handleNavigate('/superadmin');
              } else {
                handleNavigate('/');
              }
            }}
          />
        );

      case 'register':
        return (
          <RegisterPage
            onNavigateToLogin={() => {
              handleNavigate('/login');
            }}
            onNavigateToApplyWorker={() => {
              handleNavigate('/apply-worker');
            }}
            onRegisterSuccess={() => {
              handleNavigate('/');
            }}
          />
        );

      case 'apply-worker':
        return (
          <ApplyWorkerPage
            onNavigateToLogin={() => {
              handleNavigate('/login');
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
                onClick={() => { handleNavigate('/login'); }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Sign In to Worker Account
              </button>
            </div>
          );
        }
        return (
          <WorkerDashboard
            onNavigateToJobs={() => {
              handleNavigate('/worker/jobs');
            }}
            onNavigateToEarnings={() => {
              handleNavigate('/worker/earnings');
            }}
          />
        );

      case 'worker-jobs':
        if (currentRole !== 'Worker' && currentRole !== 'Admin' && !isSuperAdmin) {
          return <WorkerList onNavigateToBookings={() => handleNavigate('/my-bookings')} />;
        }
        return <WorkerJobs />;

      case 'worker-earnings':
        if (currentRole !== 'Worker' && currentRole !== 'Admin' && !isSuperAdmin) {
          return <WorkerList onNavigateToBookings={() => handleNavigate('/my-bookings')} />;
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
                onClick={() => { handleNavigate('/'); }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
              >
                Return to Safe Area
              </button>
            </div>
          );
        }
        return (
          <AdminDashboard
            initialSubTab="overview"
            onNavigateToForecast={() => handleNavigate('/demand-forecast')}
            onNavigateToLogs={() => handleNavigate('/logs')}
          />
        );

      case 'admin-workers':
        if (currentRole !== 'Admin' && !isSuperAdmin) {
          return <WorkerList onNavigateToBookings={() => handleNavigate('/my-bookings')} />;
        }
        return (
          <AdminDashboard
            initialSubTab="workers"
            onNavigateToForecast={() => handleNavigate('/demand-forecast')}
            onNavigateToLogs={() => handleNavigate('/logs')}
          />
        );

      case 'admin-analytics':
        if (currentRole !== 'Admin' && !isSuperAdmin) {
          return <WorkerList onNavigateToBookings={() => handleNavigate('/my-bookings')} />;
        }
        return (
          <AdminDashboard
            initialSubTab="analytics"
            onNavigateToForecast={() => handleNavigate('/demand-forecast')}
            onNavigateToLogs={() => handleNavigate('/logs')}
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
        return <WorkerList onNavigateToBookings={() => handleNavigate('/my-bookings')} />;

      // Dedicated Routed Booking Experience (/book/:serviceId)
      case 'book-service': {
        const serviceId = getServiceIdFromUrl();
        const service = serviceId ? getServiceById(serviceId) : undefined;
        if (!service) {
          return <NotFound404 onGoHome={() => handleNavigate('/')} />;
        }
        return (
          <BookingPage
            service={service}
            onBackToServices={() => handleNavigate('/')}
            onBookingSuccess={(createdReq) => handleNavigate(`/bookings/${createdReq.id}`)}
          />
        );
      }

      // Dedicated Request Status View (/bookings/:requestId)
      case 'booking-status': {
        const requestId = getRequestIdFromUrl();
        return <MyBookings highlightedRequestId={requestId || undefined} />;
      }

      case 'my-bookings':
        if (!isFeatureEnabled('customerModule')) return <WorkerList onNavigateToBookings={() => handleNavigate('/my-bookings')} />;
        return <MyBookings />;

      case 'demand-forecast':
        if (currentRole !== 'Admin' && currentRole !== 'SuperAdmin' && !isSuperAdmin) {
          return <WorkerList onNavigateToBookings={() => handleNavigate('/my-bookings')} />;
        }
        if (!isFeatureEnabled('demandForecasting')) return <WorkerList onNavigateToBookings={() => handleNavigate('/my-bookings')} />;
        return <DemandForecast />;

      case 'logs':
        if (!isFeatureEnabled('adminModule')) return <WorkerList onNavigateToBookings={() => handleNavigate('/my-bookings')} />;
        return <LogsViewer />;

      case 'settings':
        return <SettingsPage />;

      case 'not-found':
      default:
        return <NotFound404 onGoHome={() => handleNavigate('/')} />;
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

      <Navbar activeTab={activeTab} onTabChange={handleNavigate} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24 lg:pb-12">
        {renderActiveModule()}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={handleNavigate} />
      <Footer />
      <PWAInstallBanner />
      {isChatbotEnabled && <SahyogAssistant currentPage={activeTab} />}
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <ToastProvider>
          <AuthProvider>
            <MainLayout />
          </AuthProvider>
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

export default App;