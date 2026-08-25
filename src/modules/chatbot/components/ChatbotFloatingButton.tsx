import React from 'react';
import { Bot, MessageSquare, Sparkles } from 'lucide-react';

interface ChatbotFloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export const ChatbotFloatingButton: React.FC<ChatbotFloatingButtonProps> = ({
  isOpen,
  onClick,
  unreadCount = 0,
}) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40 group">
      <button
        onClick={onClick}
        aria-label="Open SahyogSeva Assistant"
        className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[var(--color-primary-dark)] via-[var(--color-primary)] to-[var(--color-accent)] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/20 cursor-pointer"
      >
        <Bot className="w-7 h-7 text-white group-hover:rotate-12 transition-transform duration-300" />
        
        {/* Glow indicator */}
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border border-white"></span>
        </span>

        {/* Desktop Tooltip */}
        <div className="absolute right-16 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold whitespace-nowrap shadow-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 hidden md:flex items-center gap-1.5 border border-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>SahyogSeva Assistant</span>
        </div>
      </button>
    </div>
  );
};
