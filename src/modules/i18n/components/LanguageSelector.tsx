/**
 * SahyogSeva - LanguageSelector Component
 * 
 * Accessible, theme-aware language selector displaying native language names
 * without flags, supporting both dropdown and expanded list variants.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useI18n } from '../context/I18nContext';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { LanguageCode } from '../types';

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'inline' | 'chips';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'dropdown',
  className = '',
}) => {
  const { language, setLanguage, supportedLanguages, isMultilingualEnabled } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // If multilingual feature flag is OFF, do not render selector
  if (!isMultilingualEnabled) {
    return null;
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const currentLangObj = supportedLanguages.find((l) => l.code === language) || supportedLanguages[0];

  // Inline / Chips variant for Settings and modal views
  if (variant === 'chips' || variant === 'inline') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2.5 ${className}`} role="radiogroup" aria-label="Select interface language">
        {supportedLanguages.map((item) => {
          const isSelected = item.code === language;
          return (
            <button
              key={item.code}
              role="radio"
              aria-checked={isSelected}
              onClick={() => setLanguage(item.code)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 ${
                isSelected
                  ? 'bg-[var(--color-primary-light,#ecfdf5)] border-[var(--color-primary,#047857)] text-[var(--color-primary,#047857)] font-bold shadow-xs'
                  : 'bg-[var(--color-surface,#ffffff)] border-[var(--color-border,#cbd5e1)] text-[var(--color-text,#0f172a)] hover:border-[var(--color-primary,#047857)]'
              }`}
            >
              <div>
                <div className="text-xs font-black tracking-tight">{item.nativeName}</div>
                <div className="text-[10px] text-slate-500 font-medium">{item.name}</div>
              </div>
              {isSelected && <Check className="w-4 h-4 text-[var(--color-primary,#047857)] shrink-0" />}
            </button>
          );
        })}
      </div>
    );
  }

  // Compact Header / Navbar dropdown variant
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label="Select interface language"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--color-border,#cbd5e1)] bg-[var(--color-surface,#ffffff)] hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-[var(--color-text,#0f172a)] transition cursor-pointer shadow-2xs focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      >
        <Languages className="w-3.5 h-3.5 text-[var(--color-primary,#047857)] shrink-0" />
        <span className="font-semibold">{currentLangObj.nativeName}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-[var(--color-surface,#ffffff)] border border-[var(--color-border,#cbd5e1)] shadow-xl py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150"
        >
          <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
            Language / भाषा
          </div>
          {supportedLanguages.map((item) => {
            const isSelected = item.code === language;
            return (
              <button
                key={item.code}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setLanguage(item.code as LanguageCode);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-xs flex items-center justify-between transition cursor-pointer text-left ${
                  isSelected
                    ? 'bg-[var(--color-primary-light,#ecfdf5)] text-[var(--color-primary,#047857)] font-black'
                    : 'text-[var(--color-text,#0f172a)] hover:bg-slate-100 dark:hover:bg-slate-800 font-medium'
                }`}
              >
                <div>
                  <span className="font-bold text-xs">{item.nativeName}</span>
                  <span className="text-[10px] text-slate-400 ml-1.5">({item.name})</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[var(--color-primary,#047857)]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
