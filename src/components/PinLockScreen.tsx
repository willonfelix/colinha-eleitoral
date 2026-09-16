import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Delete, KeyRound, AlertCircle } from 'lucide-react';
import { playKeyBeep, playCorrigeBeep, playUrnaConfirmSound } from '../utils/audio';

interface PinLockScreenProps {
  pinLength: number;
  onVerifyPin: (pin: string) => Promise<boolean>;
  onUnlockSuccess: () => void;
  darkMode: boolean;
  soundEnabled: boolean;
}

export const PinLockScreen: React.FC<PinLockScreenProps> = ({
  pinLength,
  onVerifyPin,
  onUnlockSuccess,
  darkMode,
  soundEnabled
}) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [error, setError] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleDigitPress = (digit: string) => {
    if (enteredPin.length >= pinLength || verifying) return;
    if (soundEnabled) playKeyBeep();

    const newPin = enteredPin + digit;
    setEnteredPin(newPin);
    setError(false);

    if (newPin.length === pinLength) {
      submitPin(newPin);
    }
  };

  const handleDelete = () => {
    if (enteredPin.length > 0) {
      if (soundEnabled) playCorrigeBeep();
      setEnteredPin((prev) => prev.slice(0, -1));
      setError(false);
    }
  };

  const handleClear = () => {
    if (soundEnabled) playCorrigeBeep();
    setEnteredPin('');
    setError(false);
  };

  const submitPin = async (pin: string) => {
    setVerifying(true);
    const valid = await onVerifyPin(pin);
    setVerifying(false);

    if (valid) {
      if (soundEnabled) playUrnaConfirmSound();
      onUnlockSuccess();
    } else {
      if (soundEnabled) playCorrigeBeep();
      setError(true);
      setEnteredPin('');
    }
  };

  // Listen to keyboard digits
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) {
        handleDigitPress(e.key);
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (e.key === 'Escape') {
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enteredPin, pinLength, verifying]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 select-none ${
      darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-900 text-white'
    }`}>
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-orange-500 blur-3xl"></div>
      </div>

      <div className="relative z-10 w-full max-w-xs flex flex-col items-center text-center">
        {/* App Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xl shadow-orange-500/30 mb-4 animate-in zoom-in-95 duration-200">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-black tracking-tight mb-1">
          Colinha Protegida
        </h2>
        <p className="text-xs text-slate-400 mb-6">
          Digite seu PIN de segurança para acessar seus votos
        </p>

        {/* PIN Indicators */}
        <div className={`flex items-center justify-center gap-3 mb-6 ${
          error ? 'animate-shake' : ''
        }`}>
          {Array.from({ length: pinLength }).map((_, idx) => {
            const isFilled = idx < enteredPin.length;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all duration-150 ${
                  isFilled
                    ? 'bg-amber-400 scale-110 shadow-md shadow-amber-400/50'
                    : 'bg-slate-700/80 border border-slate-600'
                } ${error ? 'bg-rose-500 border-rose-500' : ''}`}
              />
            );
          })}
        </div>

        {error && (
          <div className="text-xs font-bold text-rose-400 flex items-center gap-1 mb-4 animate-bounce">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>PIN incorreto. Tente novamente.</span>
          </div>
        )}

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-[260px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigitPress(num)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 active:bg-orange-600 text-2xl font-bold border border-slate-700 transition shadow-md active:scale-95 flex items-center justify-center cursor-pointer"
            >
              {num}
            </button>
          ))}

          {/* Bottom row: Clear, 0, Backspace */}
          <button
            onClick={handleClear}
            className="h-14 rounded-2xl bg-slate-850 hover:bg-slate-800 text-xs font-bold text-slate-400 border border-slate-700/60 active:scale-95 flex items-center justify-center cursor-pointer"
          >
            Limpar
          </button>

          <button
            onClick={() => handleDigitPress('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 active:bg-orange-600 text-2xl font-bold border border-slate-700 transition shadow-md active:scale-95 flex items-center justify-center cursor-pointer"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700/60 active:scale-95 flex items-center justify-center cursor-pointer"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-8 text-[11px] text-slate-500 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Privacidade Total: Armazenado apenas no aparelho</span>
        </div>
      </div>
    </div>
  );
};
