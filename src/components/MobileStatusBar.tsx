import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Sparkles } from 'lucide-react';

interface MobileStatusBarProps {
  darkMode: boolean;
}

export const MobileStatusBar: React.FC<MobileStatusBarProps> = ({ darkMode }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div
      id="mobile-status-bar"
      className={`w-full px-5 pt-2.5 pb-1 flex items-center justify-between text-[11px] font-semibold select-none z-40 transition-colors ${
        darkMode ? 'bg-slate-900/90 text-slate-300' : 'bg-white/90 text-slate-700'
      }`}
    >
      {/* Current Real Time */}
      <span className="font-bold tracking-tight">{time || '09:41'}</span>

      {/* Dynamic Island / Speaker Pill Mockup */}
      <div className="hidden sm:flex items-center gap-1.5 bg-black px-3 py-1 rounded-full text-white shadow-inner">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        <span className="text-[9px] font-mono tracking-wider text-slate-300">VOTE CERTO</span>
      </div>

      {/* Connectivity & Battery indicators */}
      <div className="flex items-center gap-1.5 opacity-80">
        <span className="text-[10px] font-bold">5G</span>
        <Wifi className="w-3.5 h-3.5" />
        <BatteryMedium className="w-4 h-4" />
      </div>
    </div>
  );
};
