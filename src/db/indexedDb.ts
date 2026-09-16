import { ColinhaCard, SecuritySettings } from '../types';
import { CandidateRecord, INITIAL_CANDIDATES_LIST } from './candidatesData';

const DB_NAME = 'ColinhaEleitoralDB';
const DB_VERSION = 3;
const STORE_COLAS = 'colinhas';
const STORE_SETTINGS = 'settings';
const STORE_CANDIDATES = 'candidates';

export const DEFAULT_SLOTS_GERAL = (distrital: boolean = true, twoSenators: boolean = false) => [
  {
    id: 'dep_fed',
    roleId: 'deputado_federal' as const,
    roleName: 'Deputado(a)',
    roleSubLabel: 'Federal',
    digitsLength: 4,
    digits: '',
    candidateName: '',
    partyName: ''
  },
  {
    id: 'dep_est_dist',
    roleId: 'deputado_estadual_distrital' as const,
    roleName: 'Deputado(a)',
    roleSubLabel: distrital ? 'DISTRITAL' : 'ESTADUAL',
    digitsLength: 5,
    digits: '70234',
    candidateName: 'Laurício',
    candidateNickName: 'Radio Saúde',
    partyName: 'AVANTE 70'
  },
  {
    id: 'sen_1',
    roleId: 'senador_1' as const,
    roleName: 'Senador(a) 1',
    roleSubLabel: '',
    digitsLength: 3,
    digits: '',
    candidateName: '',
    partyName: ''
  },
  ...(twoSenators
    ? [
        {
          id: 'sen_2',
          roleId: 'senador_2' as const,
          roleName: 'Senador(a) 2',
          roleSubLabel: '',
          digitsLength: 3,
          digits: '',
          candidateName: '',
          partyName: ''
        }
      ]
    : []),
  {
    id: 'gov',
    roleId: 'governador' as const,
    roleName: 'Governador(a)',
    roleSubLabel: '',
    digitsLength: 2,
    digits: '',
    candidateName: '',
    partyName: ''
  },
  {
    id: 'pres',
    roleId: 'presidente' as const,
    roleName: 'Presidente',
    roleSubLabel: '',
    digitsLength: 2,
    digits: '',
    candidateName: '',
    partyName: ''
  }
];

export const DEFAULT_SLOTS_MUNICIPAL = () => [
  {
    id: 'ver',
    roleId: 'vereador' as const,
    roleName: 'Vereador(a)',
    roleSubLabel: 'Municipal',
    digitsLength: 5,
    digits: '',
    candidateName: '',
    partyName: ''
  },
  {
    id: 'pref',
    roleId: 'prefeito' as const,
    roleName: 'Prefeito(a)',
    roleSubLabel: 'Municipal',
    digitsLength: 2,
    digits: '',
    candidateName: '',
    partyName: ''
  }
];

export const INITIAL_DEFAULT_CARD: ColinhaCard = {
  id: 'card_principal',
  title: 'VOTE CERTO',
  subtitle: 'AVANTE COM 70234',
  electionType: 'geral',
  distritalMode: true,
  includeSecondSenator: false,
  slots: DEFAULT_SLOTS_GERAL(true, false),
  footerCandidateName: 'Laurício',
  footerSubtitle: 'Radio Saúde',
  partySlogan: 'Contratante: AVANTE CNPJ 07.531.074/0001-01 CNPJ CAND. 68.503.922/0001-55 - Tiragem: 3.000UN',
  createdAt: Date.now(),
  updatedAt: Date.now()
};

const DEFAULT_SECURITY: SecuritySettings = {
  isPinEnabled: false,
  pinHash: '',
  pinLength: 4,
  autoLockMinutes: 5,
  biometricHint: false
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_COLAS)) {
        db.createObjectStore(STORE_COLAS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains(STORE_CANDIDATES)) {
        const candStore = db.createObjectStore(STORE_CANDIDATES, { keyPath: 'id' });
        candStore.createIndex('nr', 'nr_candidato', { unique: false });
        candStore.createIndex('cargo', 'ds_cargo', { unique: false });
        candStore.createIndex('nm', 'nm_candidato', { unique: false });
      } else {
        const tx = (event.target as IDBOpenDBRequest).transaction;
        if (tx) {
          const candStore = tx.objectStore(STORE_CANDIDATES);
          if (!candStore.indexNames.contains('cargo')) {
            candStore.createIndex('cargo', 'ds_cargo', { unique: false });
          }
        }
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function hashString(str: string): Promise<string> {
  if (!window.crypto || !window.crypto.subtle) {
    // Simple fallback hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return `hash_${hash}`;
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(str + '_colinha_salt_2026');
  const buffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function getAllColas(): Promise<ColinhaCard[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_COLAS, 'readonly');
      const store = tx.objectStore(STORE_COLAS);
      const request = store.getAll();

      request.onsuccess = () => {
        const results: ColinhaCard[] = request.result || [];
        if (results.length === 0) {
          // Initialize with default card if empty
          saveCola(INITIAL_DEFAULT_CARD).then(() => {
            resolve([INITIAL_DEFAULT_CARD]);
          });
        } else {
          resolve(results.sort((a, b) => b.updatedAt - a.updatedAt));
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [INITIAL_DEFAULT_CARD];
  }
}

export async function getCola(id: string): Promise<ColinhaCard | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_COLAS, 'readonly');
      const store = tx.objectStore(STORE_COLAS);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

export async function saveCola(cola: ColinhaCard): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_COLAS, 'readwrite');
    const store = tx.objectStore(STORE_COLAS);
    cola.updatedAt = Date.now();
    const request = store.put(cola);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteCola(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_COLAS, 'readwrite');
    const store = tx.objectStore(STORE_COLAS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getSecuritySettings(): Promise<SecuritySettings> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SETTINGS, 'readonly');
      const store = tx.objectStore(STORE_SETTINGS);
      const request = store.get('security');

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : DEFAULT_SECURITY);
      };
      request.onerror = () => resolve(DEFAULT_SECURITY);
    });
  } catch {
    return DEFAULT_SECURITY;
  }
}

export async function saveSecuritySettings(settings: SecuritySettings): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_SETTINGS, 'readwrite');
    const store = tx.objectStore(STORE_SETTINGS);
    const request = store.put({ key: 'security', value: settings });

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getPreference<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_SETTINGS, 'readonly');
      const store = tx.objectStore(STORE_SETTINGS);
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result ? request.result.value : defaultValue);
      };
      request.onerror = () => resolve(defaultValue);
    });
  } catch {
    return defaultValue;
  }
}

export async function savePreference<T>(key: string, value: T): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SETTINGS, 'readwrite');
      const store = tx.objectStore(STORE_SETTINGS);
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // ignore
  }
}

// ----------------------------------------------------
// CANDIDATES DATABASE METHODS (WITH DS_CARGO FILTERING)
// ----------------------------------------------------

/**
 * Normalizes and checks if candidate cargo matches the target role or cargo description.
 */
export function matchCargo(targetRoleOrCargo?: string, candidateCargo?: string): boolean {
  if (!targetRoleOrCargo || !candidateCargo) return true;
  const t = targetRoleOrCargo.trim().toUpperCase();
  const c = candidateCargo.trim().toUpperCase();

  if (t === c) return true;

  if (t.includes('FEDERAL') && c.includes('FEDERAL')) return true;
  if (t.includes('DISTRITAL') && c.includes('DISTRITAL')) return true;
  if (t.includes('ESTADUAL') && (c.includes('ESTADUAL') || c.includes('DISTRITAL'))) return true;
  if (t.includes('SENADOR') && c.includes('SENADOR')) return true;
  if (t.includes('GOVERNADOR') && c.includes('GOVERNADOR')) return true;
  if (t.includes('PRESIDENTE') && c.includes('PRESIDENTE')) return true;
  if (t.includes('PREFEITO') && c.includes('PREFEITO')) return true;
  if (t.includes('VEREADOR') && c.includes('VEREADOR')) return true;

  return false;
}

/**
 * Maps CandidateSlot roleId and roleSubLabel to the official TSE cargo string.
 */
export function getRoleCargoName(roleId: string, roleSubLabel?: string): string {
  switch (roleId) {
    case 'deputado_federal':
      return 'DEPUTADO FEDERAL';
    case 'deputado_estadual_distrital':
      return roleSubLabel?.toUpperCase().includes('ESTADUAL') ? 'DEPUTADO ESTADUAL' : 'DEPUTADO DISTRITAL';
    case 'senador_1':
    case 'senador_2':
      return 'SENADOR';
    case 'governador':
      return 'GOVERNADOR';
    case 'presidente':
      return 'PRESIDENTE';
    case 'prefeito':
      return 'PREFEITO';
    case 'vereador':
      return 'VEREADOR';
    default:
      return roleSubLabel ? `${roleId} ${roleSubLabel}`.toUpperCase() : roleId.toUpperCase();
  }
}

/**
 * Ensures the candidate table is seeded with the complete imported dataset with DS_CARGO.
 */
export async function seedCandidatesDatabase(forceReload: boolean = false): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      if (!db.objectStoreNames.contains(STORE_CANDIDATES)) {
        resolve();
        return;
      }
      const tx = db.transaction(STORE_CANDIDATES, 'readwrite');
      const store = tx.objectStore(STORE_CANDIDATES);

      const countReq = store.count();
      countReq.onsuccess = () => {
        // If empty, force requested, or outdated count, clear and seed all 629 records
        if (forceReload || countReq.result < INITIAL_CANDIDATES_LIST.length) {
          store.clear().onsuccess = () => {
            INITIAL_CANDIDATES_LIST.forEach((item, index) => {
              store.put({
                id: `cand_${item.ds_cargo}_${item.nr}_${index}`,
                ds_cargo: item.ds_cargo,
                nr_candidato: item.nr,
                nm_candidato: item.nome
              });
            });
            resolve();
          };
        } else {
          resolve();
        }
      };
      countReq.onerror = () => resolve();
    });
  } catch {
    // fallback gracefully
  }
}

/**
 * Lookup candidate by their number (NR_CANDIDATO) and cargo (DS_CARGO).
 * Prioritizes matching both the candidate number and cargo.
 */
export async function findCandidateByNumber(
  nr: string,
  targetRoleOrCargo?: string,
  targetLength?: number
): Promise<CandidateRecord | null> {
  const cleanNr = nr.replace(/\D/g, '').trim();
  if (!cleanNr) return null;

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      if (!db.objectStoreNames.contains(STORE_CANDIDATES)) {
        resolve(findInMemoryCandidate(cleanNr, targetRoleOrCargo, targetLength));
        return;
      }

      const tx = db.transaction(STORE_CANDIDATES, 'readonly');
      const store = tx.objectStore(STORE_CANDIDATES);
      const index = store.index('nr');
      const req = index.getAll(cleanNr);

      req.onsuccess = () => {
        const matches: CandidateRecord[] = req.result || [];
        if (matches.length > 0) {
          // 1. Prioritize match with both number and cargo
          if (targetRoleOrCargo) {
            const cargoMatch = matches.find((m) => matchCargo(targetRoleOrCargo, m.ds_cargo));
            if (cargoMatch) {
              resolve(cargoMatch);
              return;
            }
          }

          // 2. Prioritize match by target digits length if cargo filter didn't produce a match
          if (targetLength) {
            const lengthMatch = matches.find((m) => m.nr_candidato.length === targetLength);
            if (lengthMatch) {
              resolve(lengthMatch);
              return;
            }
          }

          // 3. Fallback to first match if no target cargo filter
          if (!targetRoleOrCargo) {
            resolve(matches[0]);
            return;
          }

          resolve(findInMemoryCandidate(cleanNr, targetRoleOrCargo, targetLength));
        } else {
          resolve(findInMemoryCandidate(cleanNr, targetRoleOrCargo, targetLength));
        }
      };

      req.onerror = () => {
        resolve(findInMemoryCandidate(cleanNr, targetRoleOrCargo, targetLength));
      };
    });
  } catch {
    return findInMemoryCandidate(cleanNr, targetRoleOrCargo, targetLength);
  }
}

function findInMemoryCandidate(
  cleanNr: string,
  targetRoleOrCargo?: string,
  targetLength?: number
): CandidateRecord | null {
  const matches = INITIAL_CANDIDATES_LIST.filter((c) => c.nr === cleanNr);
  if (matches.length === 0) return null;

  // 1. Cargo match
  if (targetRoleOrCargo) {
    const cargoMatch = matches.find((m) => matchCargo(targetRoleOrCargo, m.ds_cargo));
    if (cargoMatch) {
      return {
        id: `cand_${cargoMatch.ds_cargo}_${cargoMatch.nr}`,
        ds_cargo: cargoMatch.ds_cargo,
        nr_candidato: cargoMatch.nr,
        nm_candidato: cargoMatch.nome
      };
    }
  }

  // 2. Length match
  if (targetLength) {
    const lenMatch = matches.find((m) => m.nr.length === targetLength);
    if (lenMatch) {
      return {
        id: `cand_${lenMatch.ds_cargo}_${lenMatch.nr}`,
        ds_cargo: lenMatch.ds_cargo,
        nr_candidato: lenMatch.nr,
        nm_candidato: lenMatch.nome
      };
    }
  }

  // 3. Fallback
  if (!targetRoleOrCargo) {
    return {
      id: `cand_${matches[0].ds_cargo}_${matches[0].nr}`,
      ds_cargo: matches[0].ds_cargo,
      nr_candidato: matches[0].nr,
      nm_candidato: matches[0].nome
    };
  }

  return null;
}

/**
 * Retrieves all candidates from IndexedDB.
 */
export async function getAllCandidatesFromDb(): Promise<CandidateRecord[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      if (!db.objectStoreNames.contains(STORE_CANDIDATES)) {
        resolve(
          INITIAL_CANDIDATES_LIST.map((c, idx) => ({
            id: `cand_${c.ds_cargo}_${c.nr}_${idx}`,
            ds_cargo: c.ds_cargo,
            nr_candidato: c.nr,
            nm_candidato: c.nome
          }))
        );
        return;
      }
      const tx = db.transaction(STORE_CANDIDATES, 'readonly');
      const store = tx.objectStore(STORE_CANDIDATES);
      const req = store.getAll();
      req.onsuccess = () => {
        if (!req.result || req.result.length === 0) {
          resolve(
            INITIAL_CANDIDATES_LIST.map((c, idx) => ({
              id: `cand_${c.ds_cargo}_${c.nr}_${idx}`,
              ds_cargo: c.ds_cargo,
              nr_candidato: c.nr,
              nm_candidato: c.nome
            }))
          );
        } else {
          resolve(req.result);
        }
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return INITIAL_CANDIDATES_LIST.map((c, idx) => ({
      id: `cand_${c.ds_cargo}_${c.nr}_${idx}`,
      ds_cargo: c.ds_cargo,
      nr_candidato: c.nr,
      nm_candidato: c.nome
    }));
  }
}

/**
 * Searches candidates by name or number with optional cargo filter.
 */
export async function searchCandidates(query: string, targetCargo?: string): Promise<CandidateRecord[]> {
  const q = query.trim().toUpperCase();
  if (!q) return [];
  const all = await getAllCandidatesFromDb();
  return all.filter((c) => {
    const textMatch = c.nr_candidato.includes(q) || c.nm_candidato.toUpperCase().includes(q);
    if (!textMatch) return false;
    if (targetCargo) return matchCargo(targetCargo, c.ds_cargo);
    return true;
  });
}

