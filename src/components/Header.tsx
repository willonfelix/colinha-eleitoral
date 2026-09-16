import React from 'react';
import { 
  Shield, 
  ShieldCheck, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  Printer, 
  Plus, 
  ChevronDown, 
  Vote, 
  Sparkles,
  Lock,
  FileDown
} from 'lucide-react';
import { ColinhaCard, SecuritySettings } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  colinhas: ColinhaCard[];
  currentCard: ColinhaCard;
  onSelectCola: (id: string) => void;
  onNewCola: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  securitySettings: SecuritySettings;
  onOpenSecurity: () => void;
  onLockApp: () => void;
  onOpenUrnaSimulator: () => void;
  onOpenPrint: () => void;
  onExportJson: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  colinhas,
  currentCard,
  onSelectCola,
  onNewCola,
  darkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
  securitySettings,
  onOpenSecurity,
  onLockApp,
  onOpenUrnaSimulator,
  onOpenPrint,
}) => {
  return (
    <header className={`w-full transition-colors duration-200 border-b ${
      darkMode ? 'bg-slate-900/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-800'
    } sticky top-0 z-30 backdrop-blur-md px-3 py-2.5 shadow-sm`}>
      <div className="w-full flex items-center justify-between gap-1.5 px-1">
        {/* Left: Brand & Cola Selector */}
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 font-black text-sm">
              ✓
            </div>
            <div className="leading-none">
              <span className="text-xs font-black tracking-tight bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent block">
                VOTE CERTO
              </span>
              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wide">
                Offline
              </span>
            </div>
          </div>

          {/* Cola dropdown selector */}
          <div className="relative group max-w-[145px] sm:max-w-[180px]">
            <select
              id="cola-selector"
              value={currentCard.id}
              onChange={(e) => {
                if (e.target.value === '__new__') {
                  onNewCola();
                } else {
                  onSelectCola(e.target.value);
                }
              }}
              className={`text-[11px] font-bold py-1 pl-2 pr-6 rounded-lg border appearance-none cursor-pointer transition-all truncate w-full ${
                darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750 focus:ring-1 focus:ring-orange-500'
                  : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 focus:ring-1 focus:ring-orange-500'
              }`}
            >
              {colinhas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
              <option value="__new__">+ Nova Cola...</option>
            </select>
            <ChevronDown className="w-3 h-3 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60" />
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          {/* PWA Install Button */}
          <PWAInstallButton variant="compact" />

          {/* Dark Mode toggle */}
          <button
            id="btn-toggle-darkmode"
            onClick={onToggleDarkMode}
            title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              darkMode 
                ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
          </button>

          {/* Sound toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            title={soundEnabled ? 'Som ativado' : 'Som mudo'}
            className={`p-1.5 rounded-lg border transition cursor-pointer ${
              soundEnabled
                ? darkMode
                  ? 'bg-amber-950/40 border-amber-800/60 text-amber-400'
                  : 'bg-amber-50 border-amber-200 text-amber-600'
                : darkMode
                  ? 'bg-slate-800 border-slate-700 text-slate-400'
                  : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>

          {/* Security PIN Fast Lock / Status */}
          {securitySettings.isPinEnabled && (
            <button
              id="btn-instant-lock"
              onClick={onLockApp}
              title="Bloquear aplicativo agora"
              className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white transition shadow-xs cursor-pointer active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
