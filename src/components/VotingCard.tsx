import React from 'react';
import { motion } from 'motion/react';
import { Radio } from 'lucide-react';
import { ColinhaCard, CandidateSlot } from '../types';
import { CandidateRow } from './CandidateRow';

interface VotingCardProps {
  card: ColinhaCard;
  darkMode: boolean;
  soundEnabled: boolean;
  onUpdateSlotDigits: (slotId: string, digits: string) => void;
  onEditSlot: (slot: CandidateSlot) => void;
  onUpdateCardSettings?: (updates: Partial<ColinhaCard>) => void;
  onOpenSimulator: () => void;
}

export const VotingCard: React.FC<VotingCardProps> = ({
  card,
  darkMode,
  soundEnabled,
  onUpdateSlotDigits,
  onEditSlot,
  onOpenSimulator
}) => {
  return (
    <div className="w-full h-full flex-1 flex flex-col items-center justify-stretch p-1 sm:p-2.5 min-h-0">
      {/* THE ACTUAL SANTINHO / VOTING CARD CONTAINER */}
      <motion.div
        layout
        className={`relative w-full h-full max-w-full sm:max-w-[440px] flex-1 flex flex-col justify-between rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border-2 transition-all ${
          darkMode 
            ? 'border-slate-700/80 bg-gradient-to-b from-[#18202c] to-[#0f141d]' 
            : 'border-orange-600/40 bg-gradient-to-b from-[#ff5e1a] via-[#f7520e] to-[#ea4707]'
        }`}
      >
        {/* TOP HEADER: Vibrant Cyan Sky Banner with VOTE CERTO */}
        <div className="relative w-full bg-gradient-to-r from-[#00b4db] via-[#0083b0] to-[#00b4db] pt-3 pb-2.5 sm:pt-4 sm:pb-3 px-4 text-center shadow-inner overflow-hidden border-b-2 border-white/20 shrink-0">
          {/* Subtle wave highlight overlay */}
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10 flex flex-col items-center">
            {/* Main Header Text */}
            <h2 className="text-2xl sm:text-4xl font-black text-[#ffffff] tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] uppercase font-sans">
              {card.title || 'VOTE CERTO'}
            </h2>
            
            {/* Subtitle / Party tag */}
            <div className="mt-0.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/95 text-slate-900 shadow-md">
              <span className="text-xs sm:text-sm font-extrabold text-orange-600 tracking-wide">
                {card.subtitle || 'AVANTE COM 70234'}
              </span>
            </div>
          </div>
        </div>

        {/* CARD BODY WITH ROWS OF CANDIDATE SLOTS */}
        <div className={`p-2.5 min-[380px]:p-3.5 sm:p-5 flex-1 h-full flex flex-col justify-between relative min-h-0 ${
          darkMode 
            ? 'bg-[#151c27] text-white' 
            : 'bg-gradient-to-b from-[#fa551e] to-[#f04810] text-white'
        }`}>
          {/* Side Legal disclaimer text along right margin (just like the original Santinho) */}
          <div className="absolute right-1 top-6 bottom-24 w-4 hidden sm:flex items-center justify-center opacity-40 hover:opacity-90 transition pointer-events-none">
            <span className="text-[8px] text-white tracking-tighter whitespace-nowrap rotate-90 transform origin-center font-mono">
              {card.partySlogan || 'Colinha Eleitoral Digital • 100% Offline & Seguro • TSE Conforme'}
            </span>
          </div>

          {/* Slots list */}
          <div className="flex flex-col justify-evenly flex-1 gap-2 min-[380px]:gap-3 sm:gap-4 my-1 sm:my-2 w-full">
            {card.slots.map((slot) => (
              <CandidateRow
                key={slot.id}
                slot={slot}
                darkMode={darkMode}
                soundEnabled={soundEnabled}
                onUpdateDigits={(digits) => onUpdateSlotDigits(slot.id, digits)}
                onEditCandidate={() => onEditSlot(slot)}
              />
            ))}
          </div>

          {/* FOOTER SECTION: Candidate name, Photo / Slogan */}
          <div className="mt-2 pt-2.5 sm:mt-3 sm:pt-3 border-t border-white/20 flex items-center justify-between gap-3 shrink-0">
            {/* Left: Avatar / Portrait touch */}
            <div className="flex items-center gap-2.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-white bg-slate-900/30 overflow-hidden shrink-0 flex items-center justify-center shadow-md">
                {card.footerPhotoUrl ? (
                  <img
                    src={card.footerPhotoUrl}
                    alt={card.footerCandidateName || 'Candidato'}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-amber-600 to-orange-400 flex items-center justify-center text-white font-black text-xl">
                    {(card.footerCandidateName || 'L')[0]}
                  </div>
                )}
              </div>

              {/* Center / Title: Laurício Radio Saúde */}
              <div className="flex flex-col">
                <div className="font-black text-lg sm:text-xl text-white tracking-tight leading-none drop-shadow-sm">
                  {card.footerCandidateName || 'Laurício'}
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-amber-200 tracking-wide flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-300" />
                  <span>{card.footerSubtitle || 'Radio Saúde'}</span>
                </div>
              </div>
            </div>

            {/* Right: Quick action buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={onOpenSimulator}
                className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-xs text-white text-xs font-bold border border-white/30 transition shadow-sm"
              >
                Simulador Urna
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
