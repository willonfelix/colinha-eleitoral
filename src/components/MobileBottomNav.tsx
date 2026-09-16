import React from 'react';
import { 
  Vote, 
  Printer, 
  PlusCircle, 
  Sliders, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';

interface MobileBottomNavProps {
  darkMode: boolean;
  onOpenUrnaSimulator: () => void;
  onOpenPrint: () => void;
  onNewCola: () => void;
  onOpenSettings: () => void;
  onScrollToTop: () => void;
  isSimulatorOpen?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  darkMode,
  onOpenUrnaSimulator,
  onOpenPrint,
  onNewCola,
  onOpenSettings,
  onScrollToTop,
}) => {
  return (
    <div
      id="mobile-bottom-navigation"
      className={`w-full sticky bottom-0 z-40 transition-colors border-t select-none ${
        darkMode
          ? 'bg-slate-900/95 border-slate-800/80 text-slate-300'
          : 'bg-white/95 border-slate-200/90 text-slate-700'
      } backdrop-blur-lg px-2 pt-1.5 pb-2 shadow-lg`}
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Tab 1: Santinho / Colinha */}
        <button
          id="tab-colinha"
          onClick={onScrollToTop}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl text-orange-600 dark:text-orange-400 hover:opacity-80 active:scale-95 transition cursor-pointer"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <Vote className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-black tracking-tight">Colinha</span>
        </button>

        {/* Tab 2: Treinar Urna */}
        <button
          id="tab-urna-sim"
          onClick={onOpenUrnaSimulator}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl hover:text-emerald-500 active:scale-95 transition cursor-pointer relative group"
        >
          <span className="absolute -top-1 right-1 text-[8px] font-black bg-emerald-500 text-white px-1 py-0.2 rounded-full shadow-xs">
            SIM
          </span>
          <div className="w-5 h-5 flex items-center justify-center">
            <span className="text-sm font-black">🗳️</span>
          </div>
          <span className="text-[10px] font-bold tracking-tight">Urna</span>
        </button>

        {/* Tab 3: Nova Cola (Center Floating Style Button) */}
        <button
          id="tab-new-cola"
          onClick={onNewCola}
          className="flex flex-col items-center justify-center -mt-3 active:scale-90 transition cursor-pointer"
          title="Criar nova colinha"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 border-2 border-white dark:border-slate-900">
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[9px] font-black tracking-tight mt-0.5 text-orange-600 dark:text-orange-400">Nova</span>
        </button>

        {/* Tab 4: Imprimir / Compartilhar */}
        <button
          id="tab-print"
          onClick={onOpenPrint}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl hover:text-orange-500 active:scale-95 transition cursor-pointer"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <Printer className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Imprimir</span>
        </button>

        {/* Tab 5: Ajustes & Segurança */}
        <button
          id="tab-settings"
          onClick={onOpenSettings}
          className="flex flex-col items-center justify-center gap-0.5 py-1 px-2.5 rounded-xl hover:text-orange-500 active:scale-95 transition cursor-pointer"
        >
          <div className="w-5 h-5 flex items-center justify-center">
            <Sliders className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Ajustes</span>
        </button>
      </div>

      {/* Modern Home Indicator Swipe Bar */}
      <div className="w-28 h-1 bg-slate-300 dark:bg-slate-700/80 rounded-full mx-auto mt-2"></div>
    </div>
  );
};
