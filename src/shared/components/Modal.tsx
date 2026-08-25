import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl w-[92vw]',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200 overscroll-contain">
      <div className="min-h-full flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 py-4 sm:py-8">
        <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
        <div
          className={`relative w-full ${maxWidthClass} max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-100 transform animate-in zoom-in-95 duration-200 z-10 my-auto`}
          role="dialog"
          aria-modal="true"
        >
          {(title || subtitle) && (
            <div className="flex-shrink-0 px-5 sm:px-8 py-3.5 sm:py-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/95 rounded-t-3xl sticky top-0 z-20">
              <div className="min-w-0 pr-2">
                {title && <div className="text-base sm:text-xl font-bold text-slate-900 truncate sm:whitespace-normal">{title}</div>}
                {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate sm:whitespace-normal">{subtitle}</p>}
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-200/60 transition -mr-1 cursor-pointer flex-shrink-0"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <div className="overflow-y-auto flex-1 overscroll-contain p-4 sm:p-8 space-y-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};