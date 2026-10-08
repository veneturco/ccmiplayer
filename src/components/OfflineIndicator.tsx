import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-surface-container-high border border-outline-variant/50 px-4 py-2.5 text-xs font-semibold text-on-surface shadow-2xl animate-bounce">
      <span className="material-symbols-outlined text-amber-400 text-lg">wifi_off</span>
      <span>Modo Offline — Utilizando caché e IndexedDB local.</span>
    </div>
  );
};
