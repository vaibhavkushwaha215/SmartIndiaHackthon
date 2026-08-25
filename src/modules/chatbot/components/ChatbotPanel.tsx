import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, ChatbotContext } from '../types';
import { chatService } from '../services/gemini.service';
import { SUGGESTED_PROMPTS } from '../services/knowledgeEngine';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RotateCcw,
  User,
  ShieldCheck,
  ChevronDown,
  Info,
} from 'lucide-react';

interface ChatbotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  context?: ChatbotContext;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'msg-init',
  role: 'assistant',
  text: `👋 Namaste! I am your **SahyogSeva Assistant**.\n\nI can help you explore verified trade artisans, understand our 100% police verification guarantee, explain our 0% cooperative fee charter, or guide your bookings.\n\nHow can I help you today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const ChatbotPanel: React.FC<ChatbotPanelProps> = ({
  isOpen,
  onClose,
  context,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('sahyog_chat_history');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [INITIAL_MESSAGE];
  });

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    try {
      sessionStorage.setItem('sahyog_chat_history', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const reply = await chatService.generateResponse(query, context);
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        text: 'Sorry, I encountered a temporary connection issue. Please feel free to ask again or call 1800-SAHYOG for immediate assistance.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_MESSAGE]);
    sessionStorage.removeItem('sahyog_chat_history');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper to render basic markdown formatting (bold, bullet points) safely
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
      const isBullet = line.trim().startsWith('•') || line.trim().startsWith('-');
      const cleanLine = isBullet ? line.trim().substring(1).trim() : line;

      return (
        <div key={lIdx} className={isBullet ? 'flex items-start gap-1.5 ml-1 mt-0.5' : line ? 'mt-1' : 'h-1.5'}>
          {isBullet && <span className="text-emerald-700 font-black">•</span>}
          <span>
            {parts.map((part, pIdx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={pIdx} className="font-bold text-slate-900">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              if (part.startsWith('*') && part.endsWith('*')) {
                return (
                  <em key={pIdx} className="italic text-slate-600">
                    {part.slice(1, -1)}
                  </em>
                );
              }
              return part;
            })}
          </span>
        </div>
      );
    });
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-2 sm:right-6 z-50 w-[calc(100vw-1rem)] sm:w-96 max-w-sm max-h-[80vh] sm:max-h-[580px] h-[550px] bg-white rounded-3xl shadow-2xl border border-emerald-500/20 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
      
      {/* 1. Header */}
      <div className="bg-linear-to-r from-[#0b3b2c] via-emerald-900 to-teal-900 p-4 text-white flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shadow-inner">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-sm tracking-tight text-white">SahyogSeva Assistant</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="AI Ready"></span>
            </div>
            <p className="text-[11px] text-emerald-200/80 font-medium">Cooperative Community AI</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-200 transition cursor-pointer"
            title="Reset conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-emerald-200 transition cursor-pointer"
            title="Minimize Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Message History Container */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/70 text-xs">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 mb-1 text-[10px] font-bold shadow-xs">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[82%] p-3 rounded-2xl shadow-xs space-y-1 ${
                  isUser
                    ? 'bg-emerald-700 text-white rounded-br-xs'
                    : msg.isError
                    ? 'bg-rose-50 text-rose-800 border border-rose-200 rounded-bl-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-xs'
                }`}
              >
                <div className="leading-relaxed whitespace-pre-wrap">
                  {renderFormattedText(msg.text)}
                </div>
                <div
                  className={`text-[9px] text-right font-medium ${
                    isUser ? 'text-emerald-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {isUser && (
                <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 mb-1 text-[10px] font-bold shadow-xs">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}

        {/* Typing animation bubble */}
        {isTyping && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center shrink-0 text-[10px] font-bold">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="p-3 bg-white rounded-2xl rounded-bl-xs border border-slate-200 shadow-xs flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Suggested Prompt Chips */}
      {messages.length <= 2 && (
        <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => handleSendMessage(prompt.query)}
              className="px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold transition whitespace-nowrap cursor-pointer shrink-0"
            >
              {prompt.label}
            </button>
          ))}
        </div>
      )}

      {/* 4. Text Input & Send */}
      <div className="p-3 bg-white border-t border-slate-200 space-y-1.5">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isTyping}
            placeholder="Ask SahyogSeva Assistant..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 text-slate-800 placeholder:text-slate-400 font-medium"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isTyping}
            aria-label="Send message"
            className={`p-2.5 rounded-xl text-white transition flex items-center justify-center shadow-xs cursor-pointer ${
              inputQuery.trim() && !isTyping
                ? 'bg-emerald-700 hover:bg-emerald-800'
                : 'bg-slate-300 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[9px] text-slate-400 text-center font-medium">
          SahyogSeva AI provides guidance. Verify trade details before final booking.
        </p>
      </div>

    </div>
  );
};
