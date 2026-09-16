import React, { useState } from 'react';
import { 
  X, 
  Moon, 
  Sun, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  Shield, 
  Lock, 
  Sliders, 
  Settings2,
  RotateCcw, 
  Info, 
  Download,
  Smartphone,
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';
import { ColinhaCard, SecuritySettings } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface MobileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  securitySettings: SecuritySettings;
  onOpenSecurity: () => void;
  onLockApp: () => void;
  card: ColinhaCard;
  onUpdateCardSettings: (settings: Partial<ColinhaCard>) => void;
}

export const MobileSettingsModal: React.FC<MobileSettingsModalProps> = ({
  isOpen,
  onClose,
  darkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
  securitySettings,
  onOpenSecurity,
  onLockApp,
  card,
  onUpdateCardSettings,
}) => {
  const [copiedCola, setCopiedCola] = useState(false);

  if (!isOpen) return null;

  const handleCopyColaText = () => {
    const textLines = [
      `🗳️ MINHA COLA ELEITORAL - ${card.title} ${card.subtitle ? `(${card.subtitle})` : ''}`,
      '--------------------------------',
      ...card.slots.map((s) => {
        const num = s.digits.trim() || '[Em branco]';
        const cand = s.candidateName ? ` - ${s.candidateName}` : '';
        const role = s.roleSubLabel ? `${s.roleName} ${s.roleSubLabel}` : s.roleName;
        return `• ${role}: ${num}${cand}`;
      }),
      '--------------------------------',
      'Colinha Eleitoral Digital (100% Offline & Seguro)'
    ];

    navigator.clipboard.writeText(textLines.join('\n'));
    setCopiedCola(true);
    setTimeout(() => setCopiedCola(false), 2000);
  };

  const handleClearNumbers = () => {
    if (window.confirm('Deseja limpar todos os números digitados nesta colinha?')) {
      const clearedSlots = card.slots.map((s) => ({ ...s, digits: '' }));
      onUpdateCardSettings({ slots: clearedSlots });
    }
  };

  return (
    <div
      id="mobile-settings-drawer"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-[28px] sm:rounded-2xl p-5 shadow-2xl border-t sm:border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[88vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Swipe Handle Indicator for Mobile */}
        <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-sm">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Ajustes do Aplicativo</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Personalize seu santinho e preferências</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Group 1: Preferences */}
        <div className="space-y-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Aparência & Áudio
          </span>

          {/* Dark mode switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${darkMode ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-200 text-slate-700'}`}>
                {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold">Modo Escuro</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {darkMode ? 'Tema noturno ativado' : 'Tema claro ativado'}
                </div>
              </div>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                darkMode ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-200 text-slate-800'
              }`}
            >
              {darkMode ? 'Ativado' : 'Desativado'}
            </button>
          </div>

          {/* Sound toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${soundEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-200 text-slate-400'}`}>
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </div>
              <div>
                <div className="text-xs font-bold">Som da Urna Eletrônica</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {soundEnabled ? 'Bipes sonoros habilitados' : 'App silenciado'}
                </div>
              </div>
            </div>
            <button
              onClick={onToggleSound}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                soundEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              {soundEnabled ? 'Ligado' : 'Mudo'}
            </button>
          </div>
        </div>

        {/* Settings Group 2: Security */}
        <div className="space-y-3 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Segurança & Privacidade
          </span>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${securitySettings.isPinEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-200 text-slate-400'}`}>
                  {securitySettings.isPinEnabled ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-bold">Proteção por Senha PIN</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {securitySettings.isPinEnabled ? 'Bloqueio de tela ativado' : 'Acesso livre sem senha'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onOpenSecurity();
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-600 hover:bg-orange-500 text-white transition cursor-pointer"
              >
                Configurar
              </button>
            </div>

            {securitySettings.isPinEnabled && (
              <button
                onClick={() => {
                  onClose();
                  onLockApp();
                }}
                className="w-full mt-2 py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition"
              >
                <Lock className="w-3.5 h-3.5" />
                Bloquear Aplicativo Agora
              </button>
            )}
          </div>
        </div>

        {/* Settings Group 3: Ajustar Cargos da Colinha */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-1.5">
            <Settings2 className="w-4 h-4 text-orange-500" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Ajustar Cargos da Colinha
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-750 space-y-3">
            <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Ajuste as opções de votação conforme sua região e as regras da eleição:
            </div>

            <div className="space-y-2">
              {/* Modo Distrital (DF) */}
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 cursor-pointer hover:border-orange-400 transition">
                <div className="pr-3">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Modo Distrital (Distrito Federal - DF)
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Substitui &quot;Deputado Estadual&quot; por &quot;Deputado Distrital&quot; (24 deputados da CLDF)
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={card.distritalMode}
                  onChange={(e) => {
                    const isDist = e.target.checked;
                    const updatedSlots = card.slots.map((s) => {
                      if (s.roleId === 'deputado_estadual_distrital') {
                        return { ...s, roleSubLabel: isDist ? 'DISTRITAL' : 'ESTADUAL' };
                      }
                      return s;
                    });
                    onUpdateCardSettings({ distritalMode: isDist, slots: updatedSlots });
                  }}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400 cursor-pointer shrink-0"
                />
              </label>

              {/* Votar em 2 Senadores */}
              <label className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 cursor-pointer hover:border-orange-400 transition">
                <div className="pr-3">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Votar em 2 Senadores
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Habilita o segundo campo para eleição geral com renovação de 2/3 do Senado
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={card.includeSecondSenator}
                  onChange={(e) => {
                    const hasTwo = e.target.checked;
                    let newSlots = [...card.slots];
                    if (hasTwo && !newSlots.some((s) => s.roleId === 'senador_2')) {
                      const sen1Index = newSlots.findIndex((s) => s.roleId === 'senador_1');
                      const sen2Slot = {
                        id: 'sen_2',
                        roleId: 'senador_2',
                        roleName: 'Senador(a) 2',
                        digitsLength: 3,
                        digits: '',
                        candidateName: '',
                        partyName: ''
                      };
                      if (sen1Index >= 0) {
                        newSlots.splice(sen1Index + 1, 0, sen2Slot);
                      } else {
                        newSlots.push(sen2Slot);
                      }
                    } else if (!hasTwo) {
                      newSlots = newSlots.filter((s) => s.roleId !== 'senador_2');
                    }
                    onUpdateCardSettings({ includeSecondSenator: hasTwo, slots: newSlots });
                  }}
                  className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400 cursor-pointer shrink-0"
                />
              </label>
            </div>

            {/* Quick Actions for the Colinha */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center gap-2">
              <button
                onClick={handleCopyColaText}
                className="flex-1 py-2 px-2.5 rounded-lg bg-slate-200/90 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-650 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Copiar texto da colinha para a área de transferência"
              >
                {copiedCola ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCola ? 'Copiado!' : 'Copiar Texto da Colinha'}</span>
              </button>

              <button
                onClick={handleClearNumbers}
                className="py-2 px-3 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                title="Limpar todos os números digitados nesta colinha"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar Números</span>
              </button>
            </div>
          </div>
        </div>

        {/* PWA Install Promo */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-500/30 flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <div>
              <div className="text-xs font-extrabold text-orange-950 dark:text-orange-200">Instalar como Aplicativo</div>
              <div className="text-[10px] text-orange-800/80 dark:text-orange-300/80">Adicione à tela inicial do seu celular</div>
            </div>
          </div>
          <PWAInstallButton variant="compact" />
        </div>

        {/* Footer info */}
        <div className="text-center pt-2 text-[10px] text-slate-400 dark:text-slate-500 flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="w-3 h-3" />
            <span>Colinha Eleitoral • 100% Offline e Privado</span>
          </div>
          <span>Seus votos nunca saem do seu próprio celular.</span>
        </div>
      </div>
    </div>
  );
};
