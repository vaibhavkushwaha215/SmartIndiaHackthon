import React, { useState } from 'react';
import { useAuth } from '../auth';
import { ChatbotFloatingButton } from './components/ChatbotFloatingButton';
import { ChatbotPanel } from './components/ChatbotPanel';
import { ChatbotContext } from './types';

interface SahyogAssistantProps {
  currentPage?: string;
}

export const SahyogAssistant: React.FC<SahyogAssistantProps> = ({ currentPage = 'home' }) => {
  const { currentUser, currentRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Safe sanitized context (strictly non-sensitive)
  const safeContext: ChatbotContext = {
    currentRole: currentRole || 'Customer',
    currentPage: currentPage,
    userName: currentUser?.name || 'Guest User',
    servicesAvailable: ['Electrical', 'Plumbing', 'Appliance Repair', 'Carpentry', 'Painting', 'Cleaning', 'Pest Control'],
  };

  return (
    <>
      <ChatbotFloatingButton
        isOpen={isOpen}
        onClick={() => setIsOpen(true)}
      />

      <ChatbotPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        context={safeContext}
      />
    </>
  );
};
