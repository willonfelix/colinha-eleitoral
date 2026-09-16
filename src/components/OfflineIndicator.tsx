import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-banner"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600/95 text-white px-3.5 py-2 text-xs font-semibold shadow-lg shadow-amber-900/20 backdrop-blur-xs border border-amber-400/30 animate-pulse"
      role="status"
    >
      <WifiOff className="w-4 h-4 text-amber-100" />
      <span>Modo Offline Ativo — Todos os dados e santinhos salvos localmente</span>
    </div>
  );
};
