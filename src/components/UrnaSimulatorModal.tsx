import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Check, Sparkles, Volume2 } from 'lucide-react';
import { ColinhaCard, CandidateSlot } from '../types';
import { playKeyBeep, playCorrigeBeep, playUrnaConfirmSound } from '../utils/audio';

interface UrnaSimulatorModalProps {
  card: ColinhaCard;
  darkMode: boolean;
  soundEnabled: boolean;
  onClose: () => void;
}

export const UrnaSimulatorModal: React.FC<UrnaSimulatorModalProps> = ({
  card,
  darkMode,
  soundEnabled,
  onClose
}) => {
  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);
  const [typedDigits, setTypedDigits] = useState('');
  const [isWhiteVote, setIsWhiteVote] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const currentSlot: CandidateSlot | undefined = card.slots[currentSlotIndex];

  const handleKeyPress = (num: string) => {
    if (isFinished || isWhiteVote) return;
    if (!currentSlot) return;

    if (typedDigits.length < currentSlot.digitsLength) {
      const next = typedDigits + num;
      setTypedDigits(next);
      if (soundEnabled) playKeyBeep();
    }
  };

  const handleCorrige = () => {
    if (soundEnabled) playCorrigeBeep();
    setTypedDigits('');
    setIsWhiteVote(false);
  };

  const handleBranco = () => {
    if (isFinished) return;
    if (soundEnabled) playKeyBeep();
    setTypedDigits('');
    setIsWhiteVote(true);
  };

  const handleConfirma = async () => {
    if (isFinished || !currentSlot) return;

    // Check if slot has required digits or is white vote
    if (typedDigits.length === currentSlot.digitsLength || isWhiteVote) {
      if (soundEnabled) {
        await playUrnaConfirmSound();
      }

      if (currentSlotIndex < card.slots.length - 1) {
        setCurrentSlotIndex((prev) => prev + 1);
        setTypedDigits('');
        setIsWhiteVote(false);
      } else {
        setIsFinished(true);
      }
    } else {
      // Slot not full, play corrige warning beep
      if (soundEnabled) playCorrigeBeep();
    }
  };

  const handleFillFromCola = () => {
    if (currentSlot && currentSlot.digits) {
      if (soundEnabled) playKeyBeep();
      setTypedDigits(currentSlot.digits.slice(0, currentSlot.digitsLength));
      setIsWhiteVote(false);
    }
  };

  const restartSimulation = () => {
    setCurrentSlotIndex(0);
    setTypedDigits('');
    setIsWhiteVote(false);
    setIsFinished(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-2xl bg-[#2b2e38] border-4 border-[#1f222b] rounded-3xl p-3 sm:p-6 text-white shadow-2xl relative my-auto select-none">
        {/* Header bar */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded bg-amber-500 text-slate-900 font-black text-xs uppercase tracking-wider">
              Simulador TSE
            </div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-200">
              Treino de Votação na Urna Eletrônica
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* URNA ELETRÔNICA INTERFACE (Screen on Left, Keypad on Right) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          {/* URNA SCREEN (LCD AREA) */}
          <div className="md:col-span-7 bg-[#f4f6f0] text-slate-900 rounded-xl p-4 sm:p-5 flex flex-col justify-between min-h-[300px] sm:min-h-[360px] border-4 border-slate-400 shadow-inner relative overflow-hidden font-sans">
            {isFinished ? (
              <div className="flex flex-col items-center justify-center flex-1 text-center animate-in zoom-in-95">
                <div className="text-6xl sm:text-7xl font-black tracking-widest text-slate-800 mb-2 font-mono">
                  FIM
                </div>
                <div className="text-base font-bold text-emerald-700 uppercase tracking-widest">
                  Votação Concluída com Sucesso!
                </div>
                <p className="text-xs text-slate-600 mt-2 max-w-xs">
                  Você treinou todos os votos da sua colinha eleitoral.
                </p>
                <button
                  onClick={restartSimulation}
                  className="mt-6 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reiniciar Simulação
                </button>
              </div>
            ) : (
              currentSlot && (
                <>
                  {/* Screen Header */}
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      SEU VOTO PARA
                    </div>
                    <div className="text-lg sm:text-xl font-black uppercase text-slate-900 leading-tight">
                      {currentSlot.roleName}{' '}
                      {currentSlot.roleSubLabel && (
                        <span className="text-orange-600">{currentSlot.roleSubLabel}</span>
                      )}
                    </div>
                  </div>

                  {/* Digits row on LCD */}
                  <div className="my-4">
                    {isWhiteVote ? (
                      <div className="text-center py-4 text-2xl sm:text-3xl font-black tracking-widest text-slate-700 border-2 border-dashed border-slate-400 bg-slate-200/50 rounded-lg animate-pulse">
                        VOTO EM BRANCO
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-700 uppercase">Número:</span>
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: currentSlot.digitsLength }).map((_, idx) => {
                            const val = typedDigits[idx] || '';
                            const isCurrentCursor = idx === typedDigits.length;
                            return (
                              <div
                                key={idx}
                                className={`w-8 h-11 sm:w-10 sm:h-13 bg-white border-2 flex items-center justify-center text-xl sm:text-2xl font-black text-slate-900 shadow-xs ${
                                  isCurrentCursor
                                    ? 'border-black animate-pulse ring-2 ring-amber-400'
                                    : 'border-slate-400'
                                }`}
                              >
                                {val}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Candidate Preview if filled matches cola */}
                    {typedDigits.length === currentSlot.digitsLength && (
                      <div className="mt-3 p-2 bg-slate-200/80 rounded border border-slate-300 text-xs">
                        <div className="font-extrabold text-slate-800">
                          Nome: {currentSlot.candidateName || 'Candidato Válido'}
                        </div>
                        <div className="font-semibold text-slate-600">
                          Partido: {currentSlot.partyName || 'Partido Registrado'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Screen Footer Instructions */}
                  <div className="border-t-2 border-slate-300 pt-2 text-[10px] text-slate-600 space-y-0.5 font-mono">
                    <div className="font-bold text-slate-700">Aperte a tecla:</div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-emerald-700">VERDE</span> para CONFIRMAR este voto
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-amber-700">LARANJA</span> para REINICIAR este voto
                    </div>
                  </div>
                </>
              )
            )}
          </div>

          {/* URNA KEYPAD AREA */}
          <div className="md:col-span-5 bg-[#1b1e26] rounded-xl p-3 sm:p-4 flex flex-col justify-between border-2 border-slate-700">
            {/* Quick pre-fill button */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Teclado Numérico
              </span>
              {currentSlot?.digits && !isFinished && (
                <button
                  onClick={handleFillFromCola}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 underline cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Preencher da Cola ({currentSlot.digits})
                </button>
              )}
            </div>

            {/* Numpad digits (1-9, 0) */}
            <div className="grid grid-cols-3 gap-2 my-auto">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeyPress(num)}
                  disabled={isFinished}
                  className="h-11 sm:h-12 bg-gradient-to-b from-[#2a2d36] to-[#1a1c22] hover:from-[#373a46] hover:to-[#22252e] active:scale-95 text-white font-black text-xl rounded-lg shadow-md border-t border-white/20 border-b-2 border-black flex items-center justify-center cursor-pointer transition disabled:opacity-50"
                >
                  {num}
                </button>
              ))}
              <div />
              <button
                onClick={() => handleKeyPress('0')}
                disabled={isFinished}
                className="h-11 sm:h-12 bg-gradient-to-b from-[#2a2d36] to-[#1a1c22] hover:from-[#373a46] hover:to-[#22252e] active:scale-95 text-white font-black text-xl rounded-lg shadow-md border-t border-white/20 border-b-2 border-black flex items-center justify-center cursor-pointer transition disabled:opacity-50"
              >
                0
              </button>
              <div />
            </div>

            {/* Action buttons (BRANCO, CORRIGE, CONFIRMA) */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-4 pt-2 border-t border-slate-700/80">
              <button
                onClick={handleBranco}
                disabled={isFinished}
                className="h-12 sm:h-13 bg-gradient-to-b from-white to-slate-200 hover:from-slate-100 hover:to-slate-300 active:scale-95 text-slate-900 font-black text-[11px] sm:text-xs uppercase rounded-lg shadow border-b-2 border-slate-400 flex items-center justify-center cursor-pointer transition disabled:opacity-50"
              >
                BRANCO
              </button>
              <button
                onClick={handleCorrige}
                disabled={isFinished}
                className="h-12 sm:h-13 bg-gradient-to-b from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 active:scale-95 text-white font-black text-[11px] sm:text-xs uppercase rounded-lg shadow border-b-2 border-orange-800 flex items-center justify-center cursor-pointer transition disabled:opacity-50"
              >
                CORRIGE
              </button>
              <button
                onClick={handleConfirma}
                disabled={isFinished}
                className="h-12 sm:h-14 bg-gradient-to-b from-emerald-500 to-green-700 hover:from-emerald-400 hover:to-green-600 active:scale-95 text-white font-black text-xs sm:text-sm uppercase rounded-lg shadow-lg border-b-3 border-green-900 flex items-center justify-center cursor-pointer transition disabled:opacity-50 -mt-1"
              >
                CONFIRMA
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
