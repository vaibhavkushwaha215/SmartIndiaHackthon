import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './shared/i18n/i18n';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for PWA installability
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('[SahyogSeva PWA] New content available.');
  },
  onOfflineReady() {
    console.log('[SahyogSeva PWA] App ready to work offline.');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
