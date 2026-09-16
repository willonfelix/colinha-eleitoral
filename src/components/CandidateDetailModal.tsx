import React, { useState, useEffect } from 'react';
import { User, Sparkles, Image, Check, X, Trash2, Search } from 'lucide-react';
import { CandidateSlot } from '../types';
import { findCandidateByNumber, getRoleCargoName } from '../db/indexedDb';

interface CandidateDetailModalProps {
  slot: CandidateSlot | null;
  darkMode: boolean;
  onSave: (updatedSlot: CandidateSlot) => void;
  onClose: () => void;
}

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  slot,
  darkMode,
  onSave,
  onClose
}) => {
  if (!slot) return null;

  const [digits, setDigits] = useState(slot.digits);
  const [candidateName, setCandidateName] = useState(slot.candidateName || '');
  const [candidateNickName, setCandidateNickName] = useState(slot.candidateNickName || '');
  const [partyName, setPartyName] = useState(slot.partyName || '');
  const [notes, setNotes] = useState(slot.notes || '');
  const [photoUrl, setPhotoUrl] = useState(slot.photoUrl || '');
  const [matchedCandidate, setMatchedCandidate] = useState<{ nome: string; cargo: string } | null>(null);

  useEffect(() => {
    let active = true;
    async function checkNumber() {
      const clean = digits.replace(/\D/g, '');
      if (clean.length >= 2) {
        const targetCargo = getRoleCargoName(slot.roleId, slot.roleSubLabel);
        const found = await findCandidateByNumber(clean, targetCargo, slot.digitsLength);
        if (active) {
          if (found) {
            setMatchedCandidate({ nome: found.nm_candidato, cargo: found.ds_cargo });
            if (!candidateName) {
              setCandidateName(found.nm_candidato);
            }
          } else {
            setMatchedCandidate(null);
          }
        }
      } else {
        if (active) setMatchedCandidate(null);
      }
    }
    checkNumber();
    return () => {
      active = false;
    };
  }, [digits, slot.digitsLength, slot.roleId, slot.roleSubLabel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...slot,
      digits: digits.replace(/\D/g, '').slice(0, slot.digitsLength),
      candidateName,
      candidateNickName,
      partyName,
      notes,
      photoUrl
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={`w-full max-w-md rounded-2xl p-5 shadow-2xl border transition-all ${
          darkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold">
              {slot.roleName} {slot.roleSubLabel ? `(${slot.roleSubLabel})` : ''}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personalize o número e os dados do candidato
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {/* Digits Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
              Número do Candidato ({slot.digitsLength} dígitos)
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={slot.digitsLength}
              value={digits}
              onChange={(e) => setDigits(e.target.value.replace(/\D/g, ''))}
              placeholder={`Ex: ${'1'.repeat(slot.digitsLength)}`}
              className={`w-full text-center text-2xl font-black tracking-widest px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-orange-500 outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
            {matchedCandidate && (
              <div className="mt-2 flex items-center justify-between px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs">
                <div className="truncate mr-2">
                  <span className="opacity-80">[{matchedCandidate.cargo}]</span>{' '}
                  <strong className="font-bold">{matchedCandidate.nome}</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setCandidateName(matchedCandidate.nome)}
                  className="font-bold underline hover:opacity-80 shrink-0 text-emerald-700 dark:text-emerald-300"
                >
                  Preencher
                </button>
              </div>
            )}
          </div>

          {/* Candidate Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
              Nome de Urna / Candidato
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="Ex: Maria da Silva"
              className={`w-full px-3.5 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-orange-500 outline-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Party & Nickname */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                Partido / Sigla
              </label>
              <input
                type="text"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder="Ex: AVANTE 70"
                className={`w-full px-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-orange-500 outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
                Apelido / Slogan
              </label>
              <input
                type="text"
                value={candidateNickName}
                onChange={(e) => setCandidateNickName(e.target.value)}
                placeholder="Ex: Radio Saúde"
                className={`w-full px-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-orange-500 outline-none ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                }`}
              />
            </div>
          </div>

          {/* Notes / Lembrete */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-slate-700 dark:text-slate-300">
              Observações / Propostas
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Prioridade na área da saúde e transporte..."
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-semibold rounded-xl border transition ${
                darkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-bold text-white bg-orange-600 hover:bg-orange-500 rounded-xl shadow-md transition"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
