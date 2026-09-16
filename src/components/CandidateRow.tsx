import React, { useRef } from 'react';
import { Edit3, User, Sparkles } from 'lucide-react';
import { CandidateSlot } from '../types';
import { playKeyBeep, playCorrigeBeep } from '../utils/audio';

interface CandidateRowProps {
  slot: CandidateSlot;
  darkMode: boolean;
  soundEnabled: boolean;
  onUpdateDigits: (digits: string) => void;
  onEditCandidate: () => void;
}

export const CandidateRow: React.FC<CandidateRowProps> = ({
  slot,
  darkMode,
  soundEnabled,
  onUpdateDigits,
  onEditCandidate
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleDigitChange = (index: number, val: string) => {
    // Only accept numeric digits
    const cleaned = val.replace(/\D/g, '');
    if (!cleaned && val !== '') return;

    const currentDigits = slot.digits.padEnd(slot.digitsLength, ' ').split('');
    
    if (cleaned) {
      const char = cleaned.slice(-1);
      currentDigits[index] = char;
      const newDigits = currentDigits.join('').trimEnd();
      onUpdateDigits(newDigits);
      if (soundEnabled) playKeyBeep();

      // Auto advance to next box
      if (index < slot.digitsLength - 1) {
        inputRefs.current[index + 1]?.focus();
        inputRefs.current[index + 1]?.select();
      }
    } else {
      // Empty / backspace
      currentDigits[index] = ' ';
      const newDigits = currentDigits.join('').trimEnd();
      onUpdateDigits(newDigits);
      if (soundEnabled) playCorrigeBeep();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      const currentDigits = slot.digits.padEnd(slot.digitsLength, ' ').split('');
      if (currentDigits[index] === ' ' || !currentDigits[index]) {
        // move to previous
        if (index > 0) {
          e.preventDefault();
          inputRefs.current[index - 1]?.focus();
          const prevDigits = [...currentDigits];
          prevDigits[index - 1] = ' ';
          onUpdateDigits(prevDigits.join('').trimEnd());
          if (soundEnabled) playCorrigeBeep();
        }
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < slot.digitsLength - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  };

  const digitsArray = Array.from({ length: slot.digitsLength }).map((_, i) => slot.digits[i] || '');

  return (
    <div className="flex flex-col gap-1 w-full group/row">
      <div className="flex items-center justify-between gap-1 sm:gap-3 flex-nowrap">
        {/* Left side: Role Title + (Nome do Candidato) Label */}
        <div className="w-[105px] min-[370px]:w-[124px] sm:w-[138px] md:w-[152px] shrink-0 text-right pr-1 sm:pr-2 flex flex-col items-end justify-center">
          <div className="text-white font-black text-xs sm:text-sm md:text-base uppercase tracking-tight leading-tight drop-shadow-sm flex flex-col items-end">
            <span className="truncate max-w-full">{slot.roleName}</span>
            {slot.roleSubLabel && (
              <span className="text-[10px] sm:text-xs font-black text-amber-200 tracking-wider leading-none mt-0.5">
                {slot.roleSubLabel}
              </span>
            )}
          </div>
          {/* Label below title: (Nome do Candidato) */}
          <div className="mt-0.5 text-right w-full flex justify-end">
            {slot.candidateName ? (
              <span 
                title={slot.candidateName}
                className="text-[9px] min-[370px]:text-[10px] sm:text-[11px] font-extrabold text-amber-300 drop-shadow-sm leading-tight tracking-tight uppercase line-clamp-2"
              >
                ({slot.candidateName})
              </span>
            ) : (
              <span className="text-[8.5px] min-[370px]:text-[9.5px] sm:text-[10px] font-semibold text-white/70 italic leading-tight tracking-tight">
                (Nome do Candidato)
              </span>
            )}
          </div>
        </div>

        {/* Right side: White Digit Boxes */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 flex-nowrap">
          {digitsArray.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onFocus={(e) => e.target.select()}
              className={`w-7.5 h-10 min-[370px]:w-8 min-[370px]:h-11 sm:w-8.5 sm:h-11 md:w-9.5 md:h-12 text-center font-black text-lg min-[370px]:text-xl md:text-2xl rounded-sm sm:rounded shadow-md transition-all outline-none select-none shrink-0 ${
                darkMode
                  ? 'bg-slate-100 text-slate-900 border-2 border-slate-300 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/40'
                  : 'bg-white text-black border-2 border-white focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50'
              }`}
              placeholder=""
            />
          ))}

          {/* Quick Edit Candidate info button */}
          <button
            onClick={onEditCandidate}
            title="Editar detalhes do candidato (Nome, Partido, Foto)"
            className="opacity-60 hover:opacity-100 p-1 rounded-full text-white hover:bg-white/20 transition shrink-0"
          >
            <Edit3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>

      {/* Party Badge if present */}
      {slot.partyName && (
        <div className="flex items-center justify-end pr-7 gap-2 text-right -mt-0.5">
          <span className="text-[9px] sm:text-[10px] font-bold text-white/80 bg-black/30 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10">
            {slot.partyName}
          </span>
        </div>
      )}
    </div>
  );
};
