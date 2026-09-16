import React from 'react';
import { X, Printer, Download, Share2, Sparkles, Check } from 'lucide-react';
import { ColinhaCard } from '../types';

interface PrintModalProps {
  card: ColinhaCard;
  darkMode: boolean;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({ card, darkMode, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className={`w-full max-w-lg rounded-2xl p-4 sm:p-6 shadow-2xl border transition-all ${
        darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold">Imprimir Cartão de Votação (Santinho)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              O TSE permite levar a "colinha" em papel para a cabine de votação.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE CARD PREVIEW */}
        <div className="flex justify-center my-3">
          <div
            id="printable-card"
            className="w-full max-w-[340px] rounded-xl overflow-hidden shadow-lg border-2 border-orange-500 bg-[#fa551e] text-white print:shadow-none print:border-black print:text-black print:bg-white"
          >
            {/* Top banner */}
            <div className="bg-[#0099cc] p-3 text-center print:bg-slate-200 print:text-black">
              <h2 className="text-2xl font-black tracking-wider uppercase text-white print:text-black">
                {card.title || 'VOTE CERTO'}
              </h2>
              <div className="text-xs font-bold text-orange-200 print:text-slate-700">
                {card.subtitle || 'COLA ELEITORAL'}
              </div>
            </div>

            {/* Slots */}
            <div className="p-3.5 space-y-2.5">
              {card.slots.map((slot) => {
                const digitsArray = Array.from({ length: slot.digitsLength }).map(
                  (_, i) => slot.digits[i] || ''
                );
                return (
                  <div key={slot.id} className="flex items-center justify-between gap-2">
                    <div className="text-right flex-1 pr-1">
                      <div className="text-xs font-black uppercase leading-tight">
                        {slot.roleName}
                      </div>
                      {slot.roleSubLabel && (
                        <div className="text-[10px] font-bold text-amber-200 print:text-slate-600">
                          {slot.roleSubLabel}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {digitsArray.map((d, i) => (
                        <div
                          key={i}
                          className="w-7 h-9 bg-white text-black font-black text-lg flex items-center justify-center rounded-xs shadow-xs border border-slate-300 print:border-black"
                        >
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="bg-black/20 p-2.5 text-center text-[10px] font-mono opacity-80 border-t border-white/20 print:text-black print:border-black">
              {card.footerCandidateName && (
                <div className="font-bold text-white print:text-black text-xs mb-0.5">
                  {card.footerCandidateName} {card.footerSubtitle ? `(${card.footerSubtitle})` : ''}
                </div>
              )}
              <span>Colinha Eleitoral Digital • Impresso com segurança</span>
            </div>
          </div>
        </div>

        {/* Print Buttons */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
              darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Agora</span>
          </button>
        </div>
      </div>
    </div>
  );
};
