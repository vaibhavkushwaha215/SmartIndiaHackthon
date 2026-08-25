import React, { createContext, useContext, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { ErrorCode, formatErrorMessage } from '../constants/error-codes';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  code?: number | ErrorCode;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  showError: (code: ErrorCode, detail?: string) => void;
  showSuccess: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastItem = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      const duration = toast.duration || 4500;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const showError = useCallback(
    (code: ErrorCode, detail?: string) => {
      const formatted = formatErrorMessage(code, detail);
      showToast({
        type: 'error',
        code,
        title: `Error Code ${code}`,
        message: formatted,
        duration: 6000,
      });
    },
    [showToast]
  );

  const showSuccess = useCallback(
    (message: string, title = 'Success') => {
      showToast({
        type: 'success',
        title,
        message,
        duration: 4000,
      });
    },
    [showToast]
  );

  const showWarning = useCallback(
    (message: string, title = 'Warning') => {
      showToast({
        type: 'warning',
        title,
        message,
        duration: 4500,
      });
    },
    [showToast]
  );

  const showInfo = useCallback(
    (message: string, title = 'Information') => {
      showToast({
        type: 'info',
        title,
        message,
        duration: 4000,
      });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showError, showSuccess, showWarning, showInfo, removeToast }}>
      {children}
      {/* Toast Notification Portal */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto rounded-xl shadow-lg border p-4 flex items-start gap-3 transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-2 backdrop-blur-md ${
                isError
                  ? 'bg-rose-50/95 border-rose-200 text-rose-900 shadow-rose-900/10'
                  : isSuccess
                  ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-900/10'
                  : isWarning
                  ? 'bg-amber-50/95 border-amber-200 text-amber-900 shadow-amber-900/10'
                  : 'bg-indigo-50/95 border-indigo-200 text-indigo-900 shadow-indigo-900/10'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {isError && <XCircle className="w-5 h-5 text-rose-600" />}
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
                {!isError && !isSuccess && !isWarning && <Info className="w-5 h-5 text-indigo-600" />}
              </div>
              <div className="flex-1 text-sm">
                <div className="font-semibold text-xs tracking-wider uppercase opacity-80 flex items-center gap-1.5">
                  {toast.title}
                  {toast.code && (
                    <span className="bg-rose-200/80 text-rose-900 font-mono text-[10px] px-1.5 py-0.2 rounded font-bold">
                      #{toast.code}
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-slate-800 font-medium text-xs sm:text-sm break-words">{toast.message}</div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-black/5 transition"
                aria-label="Close notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
