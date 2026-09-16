import React, { useState } from 'react';
import { Plus, X, Sparkles, Vote } from 'lucide-react';
import { ColinhaCard, ElectionType } from '../types';
import { DEFAULT_SLOTS_GERAL, DEFAULT_SLOTS_MUNICIPAL } from '../db/indexedDb';

interface NewColaModalProps {
  darkMode: boolean;
  onSave: (newCard: ColinhaCard) => void;
  onClose: () => void;
}

export const NewColaModal: React.FC<NewColaModalProps> = ({
  darkMode,
  onSave,
  onClose
}) => {
  const [title, setTitle] = useState('VOTE CERTO');
  const [subtitle, setSubtitle] = useState('MINHA COLA');
  const [electionType, setElectionType] = useState<ElectionType>('geral');
  const [distritalMode, setDistritalMode] = useState(true);
  const [includeSecondSenator, setIncludeSecondSenator] = useState(false);
  const [footerCandidateName, setFooterCandidateName] = useState('');
  const [footerSubtitle, setFooterSubtitle] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const id = `cola_${Date.now()}`;
    const slots =
      electionType === 'geral'
        ? DEFAULT_SLOTS_GERAL(distritalMode, includeSecondSenator)
        : DEFAULT_SLOTS_MUNICIPAL();

    const newCard: ColinhaCard = {
      id,
      title: title.trim() || 'VOTE CERTO',
      subtitle: subtitle.trim(),
      electionType,
      distritalMode,
      includeSecondSenator,
      slots,
      footerCandidateName: footerCandidateName.trim(),
      footerSubtitle: footerSubtitle.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    onSave(newCard);
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
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">Criar Nova Colinha</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Gere um novo cartão para personalizar seus candidatos
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

        <form onSubmit={handleCreate} className="space-y-4 pt-4 text-sm">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
              Tipo de Eleição
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setElectionType('geral')}
                className={`py-2 rounded-xl font-bold text-xs border transition ${
                  electionType === 'geral'
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Eleições Gerais
                <span className="block text-[10px] font-normal opacity-80">
                  (Deputados, Senador, Gov, Pres)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setElectionType('municipal')}
                className={`py-2 rounded-xl font-bold text-xs border transition ${
                  electionType === 'municipal'
                    ? 'bg-orange-600 text-white border-orange-600'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Eleições Municipais
                <span className="block text-[10px] font-normal opacity-80">
                  (Prefeito, Vereador)
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
              Título do Cartão
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: VOTE CERTO"
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-orange-500 outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
              Subtítulo / Partido / Identificação
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ex: AVANTE 70 ou MINHA COLA OFICIAL"
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-orange-500 outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {electionType === 'geral' && (
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={distritalMode}
                  onChange={(e) => setDistritalMode(e.target.checked)}
                  className="rounded text-orange-500 focus:ring-orange-400"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Deputado Distrital (Distrito Federal)
                </span>
              </label>

              <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-850 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={includeSecondSenator}
                  onChange={(e) => setIncludeSecondSenator(e.target.checked)}
                  className="rounded text-orange-500 focus:ring-orange-400"
                />
                <span className="font-semibold text-slate-700 dark:text-slate-200">
                  Incluir 2º Senador
                </span>
              </label>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
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
              className="px-5 py-2 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-md transition cursor-pointer"
            >
              Criar Colinha
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
