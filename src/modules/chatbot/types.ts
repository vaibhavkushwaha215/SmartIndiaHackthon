export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: string;
  isError?: boolean;
}

export interface ChatbotContext {
  currentRole?: string;
  currentPage?: string;
  userName?: string;
  servicesAvailable?: string[];
  activeBookingsCount?: number;
}

export interface ChatSuggestion {
  id: string;
  label: string;
  query: string;
}
