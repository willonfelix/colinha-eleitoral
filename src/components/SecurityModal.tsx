import React, { useState } from 'react';
import { Shield, ShieldCheck, Lock, KeyRound, Clock, X, Check, AlertTriangle } from 'lucide-react';
import { SecuritySettings } from '../types';
import { hashString } from '../db/indexedDb';

interface SecurityModalProps {
  settings: SecuritySettings;
  darkMode: boolean;
  onSave: (newSettings: SecuritySettings) => void;
  onClose: () => void;
}

export const SecurityModal: React.FC<SecurityModalProps> = ({
  settings,
  darkMode,
  onSave,
  onClose
}) => {
  const [isEnabled, setIsEnabled] = useState(settings.isPinEnabled);
  const [pinLength, setPinLength] = useState<number>(settings.pinLength || 4);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [autoLockMinutes, setAutoLockMinutes] = useState(settings.autoLockMinutes ?? 5);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isEnabled) {
      // Disabling PIN
      onSave({
        isPinEnabled: false,
        pinHash: '',
        pinLength: 4,
        autoLockMinutes: 5
      });
      onClose();
      return;
    }

    // If enabling or updating PIN
    if (newPin) {
      if (newPin.length !== pinLength) {
        setError(`O PIN deve ter exatamente ${pinLength} dígitos numéricos.`);
        return;
      }
      if (newPin !== confirmPin) {
        setError('A confirmação do PIN não confere com o novo PIN digitado.');
        return;
      }

      const hash = await hashString(newPin);
      onSave({
        isPinEnabled: true,
        pinHash: hash,
        pinLength,
        autoLockMinutes
      });
      setSuccess('Senha de segurança atualizada com sucesso!');
      setTimeout(() => onClose(), 1000);
    } else if (settings.isPinEnabled && settings.pinHash) {
      // Just updating settings like auto-lock
      onSave({
        ...settings,
        isPinEnabled: true,
        autoLockMinutes
      });
      onClose();
    } else {
      setError('Por favor, digite um PIN para ativar a proteção.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-2xl p-5 shadow-2xl border transition-all ${
          darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-500 flex items-center justify-center font-bold">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Segurança e Privacidade</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bloqueio por PIN para proteger suas anotações de voto
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-4 text-sm">
          {/* Enable PIN Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
            <div>
              <div className="font-bold flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-orange-500" />
                <span>Bloqueio por PIN</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Exige senha ao abrir o app no seu celular
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-orange-600"></div>
            </label>
          </div>

          {isEnabled && (
            <div className="space-y-3 p-3 rounded-xl border border-orange-500/20 bg-orange-500/5">
              {/* Length selector */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Tamanho do PIN
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPinLength(4)}
                    className={`py-1.5 rounded-lg font-bold text-xs border transition ${
                      pinLength === 4
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    4 Dígitos
                  </button>
                  <button
                    type="button"
                    onClick={() => setPinLength(6)}
                    className={`py-1.5 rounded-lg font-bold text-xs border transition ${
                      pinLength === 6
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    6 Dígitos
                  </button>
                </div>
              </div>

              {/* New PIN */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  {settings.isPinEnabled ? 'Novo PIN (deixe em branco para manter)' : 'Definir PIN'}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={pinLength}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder={`${'•'.repeat(pinLength)}`}
                  className={`w-full text-center text-xl tracking-widest px-3 py-2 rounded-lg border font-mono focus:ring-2 focus:ring-orange-500 outline-none ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              {/* Confirm PIN */}
              {newPin && (
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Confirmar Novo PIN
                  </label>
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={pinLength}
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                    placeholder={`${'•'.repeat(pinLength)}`}
                    className={`w-full text-center text-xl tracking-widest px-3 py-2 rounded-lg border font-mono focus:ring-2 focus:ring-orange-500 outline-none ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              )}

              {/* Auto lock time */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Tempo de Inatividade para Bloqueio
                </label>
                <select
                  value={autoLockMinutes}
                  onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg border text-xs font-semibold ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value={0}>Imediato (ao sair da tela)</option>
                  <option value={1}>1 minuto de inatividade</option>
                  <option value={5}>5 minutos de inatividade</option>
                  <option value={15}>15 minutos de inatividade</option>
                </select>
              </div>
            </div>
          )}

          {error && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-semibold flex items-center gap-1.5">
              <Check className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Privacy statement banner */}
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Garantia de Privacidade 100% Local</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Todos os seus registros eleitorais ficam gravados exclusivamente no banco de dados IndexedDB do seu navegador. Nenhum dado é enviado para a internet.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-md transition"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
