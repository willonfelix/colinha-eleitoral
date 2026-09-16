export type ElectionType = 'geral' | 'municipal';

export interface CandidateRecord {
  id: string;
  ds_cargo: string;
  nr_candidato: string;
  nm_candidato: string;
}

export interface CandidateSlot {
  id: string;
  roleId: 'deputado_federal' | 'deputado_estadual_distrital' | 'senador_1' | 'senador_2' | 'governador' | 'presidente' | 'prefeito' | 'vereador';
  roleName: string;
  roleSubLabel?: string; // e.g. "DISTRITAL" or "ESTADUAL"
  digitsLength: number;
  digits: string; // filled numbers e.g. "70234"
  candidateName?: string;
  candidateNickName?: string;
  partyName?: string;
  partyNumber?: string;
  notes?: string;
  photoUrl?: string;
}

export interface ColinhaCard {
  id: string;
  title: string;
  subtitle: string;
  electionType: ElectionType;
  distritalMode: boolean; // true for "Distrital", false for "Estadual"
  includeSecondSenator: boolean;
  slots: CandidateSlot[];
  footerCandidateName?: string;
  footerSubtitle?: string;
  footerPhotoUrl?: string;
  partySlogan?: string;
  createdAt: number;
  updatedAt: number;
}

export interface SecuritySettings {
  isPinEnabled: boolean;
  pinHash?: string; // SHA-256 hash or simple hashed string
  pinLength: number;
  autoLockMinutes: number; // 0 = immediate/on exit
  biometricHint?: boolean;
}

export interface AppState {
  currentCardId: string;
  isLocked: boolean;
  darkMode: boolean;
  soundEnabled: boolean;
}
