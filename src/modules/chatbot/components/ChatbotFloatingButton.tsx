import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface ChatbotFloatingButtonProps {
  isOpen: boolean;
  onClick: () => void;
  unreadCount?: number;
}

export const ChatbotFloatingButton: React.FC<ChatbotFloatingButtonProps> = ({
  isOpen,
  onClick,
}) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-40 group">
      <button
        onClick={onClick}
        aria-label="Open Sahyog Assistant AI Chatbot"
        className="relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/30 cursor-pointer focus:outline-none focus:ring-4 focus:ring-emerald-500/30"
      >
        <Bot className="w-6 h-6 md:w-7 md:h-7 text-white group-hover:rotate-12 transition-transform duration-300" />
        
        {/* Glowing active indicator */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white"></span>
        </span>

        {/* Desktop Tooltip pointing right */}
        <div className="absolute left-16 px-3 py-1.5 rounded-xl bg-slate-900/95 backdrop-blur-md text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 hidden md:flex items-center gap-1.5 border border-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Ask Sahyog AI</span>
        </div>
      </button>
    </div>
  );
};
