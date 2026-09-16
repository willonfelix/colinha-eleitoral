import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  getAllColas, 
  getCola, 
  saveCola, 
  deleteCola, 
  getSecuritySettings, 
  saveSecuritySettings, 
  getPreference, 
  savePreference, 
  hashString, 
  INITIAL_DEFAULT_CARD,
  seedCandidatesDatabase,
  findCandidateByNumber,
  getRoleCargoName
} from './db/indexedDb';
import { ColinhaCard, CandidateSlot, SecuritySettings } from './types';
import { Header } from './components/Header';
import { VotingCard } from './components/VotingCard';
import { CandidateDetailModal } from './components/CandidateDetailModal';
import { SecurityModal } from './components/SecurityModal';
import { PinLockScreen } from './components/PinLockScreen';
import { UrnaSimulatorModal } from './components/UrnaSimulatorModal';
import { PrintModal } from './components/PrintModal';
import { NewColaModal } from './components/NewColaModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MobileStatusBar } from './components/MobileStatusBar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileSettingsModal } from './components/MobileSettingsModal';
import { ShieldCheck, Plus, Sparkles } from 'lucide-react';

export default function App() {
  const [colinhas, setColinhas] = useState<ColinhaCard[]>([INITIAL_DEFAULT_CARD]);
  const [currentCardId, setCurrentCardId] = useState<string>(INITIAL_DEFAULT_CARD.id);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    isPinEnabled: false,
    pinLength: 4,
    autoLockMinutes: 5
  });
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [editingSlot, setEditingSlot] = useState<CandidateSlot | null>(null);
  const [showSecurityModal, setShowSecurityModal] = useState<boolean>(false);
  const [showUrnaSimulator, setShowUrnaSimulator] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [showNewColaModal, setShowNewColaModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);

  const lastActivityRef = useRef<number>(Date.now());
  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Initialize DB data
  useEffect(() => {
    async function loadData() {
      try {
        await seedCandidatesDatabase();
        const [loadedColas, loadedSecurity, savedDarkMode, savedSound, savedActiveId] = await Promise.all([
          getAllColas(),
          getSecuritySettings(),
          getPreference<boolean>('darkMode', false),
          getPreference<boolean>('soundEnabled', true),
          getPreference<string>('activeColaId', INITIAL_DEFAULT_CARD.id)
        ]);

        if (loadedColas && loadedColas.length > 0) {
          // If the default card still has previous default subtitle 'AVANTE 70', update it to 'AVANTE COM 70234'
          const updatedColas = loadedColas.map((c) => {
            if (c.subtitle === 'AVANTE 70') {
              const updated = { ...c, subtitle: 'AVANTE COM 70234', updatedAt: Date.now() };
              saveCola(updated).catch(console.error);
              return updated;
            }
            return c;
          });
          setColinhas(updatedColas);
          const activeExists = updatedColas.some((c) => c.id === savedActiveId);
          setCurrentCardId(activeExists ? savedActiveId : updatedColas[0].id);
        }

        setSecuritySettings(loadedSecurity);
        setDarkMode(savedDarkMode);
        setSoundEnabled(savedSound);

        // If PIN protection is enabled, start in locked state
        if (loadedSecurity.isPinEnabled && loadedSecurity.pinHash) {
          setIsLocked(true);
        }
      } catch (err) {
        console.error('Error loading data from IndexedDB:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Update HTML dark class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Inactivity auto-lock and visibility listener
  useEffect(() => {
    if (!securitySettings.isPinEnabled || !securitySettings.pinHash || isLocked) return;

    const recordActivity = () => {
      lastActivityRef.current = Date.now();
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (securitySettings.autoLockMinutes === 0) {
          setIsLocked(true);
        }
      }
    };

    const interval = setInterval(() => {
      if (securitySettings.autoLockMinutes > 0) {
        const idleMs = Date.now() - lastActivityRef.current;
        if (idleMs > securitySettings.autoLockMinutes * 60 * 1000) {
          setIsLocked(true);
        }
      }
    }, 15000);

    window.addEventListener('mousemove', recordActivity);
    window.addEventListener('keydown', recordActivity);
    window.addEventListener('touchstart', recordActivity);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('mousemove', recordActivity);
      window.removeEventListener('keydown', recordActivity);
      window.removeEventListener('touchstart', recordActivity);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [securitySettings, isLocked]);

  const currentCard = colinhas.find((c) => c.id === currentCardId) || colinhas[0] || INITIAL_DEFAULT_CARD;

  // Handler for digit updates
  const handleUpdateSlotDigits = useCallback(
    async (slotId: string, digits: string) => {
      const cleanDigits = digits.replace(/\s+/g, '');
      const targetSlot = currentCard.slots.find((s) => s.id === slotId);

      let newCandidateName = targetSlot?.candidateName || '';

      if (cleanDigits.length === 0) {
        newCandidateName = '';
      } else {
        const targetCargo = targetSlot ? getRoleCargoName(targetSlot.roleId, targetSlot.roleSubLabel) : undefined;
        const matched = await findCandidateByNumber(cleanDigits, targetCargo, targetSlot?.digitsLength);
        if (matched) {
          newCandidateName = matched.nm_candidato;
        }
      }

      const updatedSlots = currentCard.slots.map((s) =>
        s.id === slotId ? { ...s, digits, candidateName: newCandidateName } : s
      );
      const updatedCard: ColinhaCard = { ...currentCard, slots: updatedSlots };

      setColinhas((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
      await saveCola(updatedCard);
    },
    [currentCard]
  );

  // Handler for saving edited slot
  const handleSaveSlot = async (updatedSlot: CandidateSlot) => {
    const updatedSlots = currentCard.slots.map((s) => (s.id === updatedSlot.id ? updatedSlot : s));
    const updatedCard: ColinhaCard = { ...currentCard, slots: updatedSlots };

    setColinhas((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    await saveCola(updatedCard);
    setEditingSlot(null);
  };

  // Handler for card settings update (Distrital vs Estadual, 2 Senators, etc.)
  const handleUpdateCardSettings = async (updates: Partial<ColinhaCard>) => {
    const updatedCard: ColinhaCard = { ...currentCard, ...updates };
    setColinhas((prev) => prev.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    await saveCola(updatedCard);
  };

  // Switch card
  const handleSelectCola = async (id: string) => {
    setCurrentCardId(id);
    await savePreference('activeColaId', id);
  };

  // Create new cola
  const handleSaveNewCola = async (newCard: ColinhaCard) => {
    const updatedList = [newCard, ...colinhas];
    setColinhas(updatedList);
    setCurrentCardId(newCard.id);
    await saveCola(newCard);
    await savePreference('activeColaId', newCard.id);
    setShowNewColaModal(false);
  };

  // Toggle Dark Mode
  const handleToggleDarkMode = async () => {
    const next = !darkMode;
    setDarkMode(next);
    await savePreference('darkMode', next);
  };

  // Toggle Sound
  const handleToggleSound = async () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    await savePreference('soundEnabled', next);
  };

  // Save security settings
  const handleSaveSecurity = async (newSettings: SecuritySettings) => {
    setSecuritySettings(newSettings);
    await saveSecuritySettings(newSettings);
  };

  // Verify PIN for unlocking
  const handleVerifyPin = async (enteredPin: string): Promise<boolean> => {
    if (!securitySettings.pinHash) return true;
    const enteredHash = await hashString(enteredPin);
    return enteredHash === securitySettings.pinHash;
  };

  const handleScrollToTop = () => {
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-semibold tracking-wide">Carregando Colinha Segura...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="app-mobile-stage"
      className={`min-h-[100dvh] w-full flex items-center justify-center transition-colors duration-200 ${
        darkMode ? 'bg-slate-950 sm:bg-slate-900' : 'bg-slate-100 sm:bg-slate-200'
      }`}
    >
      {/* PIN LOCK SCREEN OVERLAY IF LOCKED */}
      {isLocked && (
        <PinLockScreen
          pinLength={securitySettings.pinLength || 4}
          onVerifyPin={handleVerifyPin}
          onUnlockSuccess={() => setIsLocked(false)}
          darkMode={darkMode}
          soundEnabled={soundEnabled}
        />
      )}

      {/* SMARTPHONE APP CONTAINER / MOBILE DEVICE FRAME */}
      <div
        id="mobile-phone-viewport"
        className={`w-full max-w-full sm:max-w-[430px] h-[100dvh] sm:h-auto sm:min-h-[850px] sm:max-h-[94dvh] sm:rounded-[44px] sm:border-[8px] sm:border-slate-800 sm:dark:border-slate-700 sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col relative transition-colors duration-200 ${
          darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
        }`}
      >
        {/* TOP STATUS BAR (Time, 5G, Wi-Fi, Battery, Dynamic Island) */}
        <MobileStatusBar darkMode={darkMode} />

        {/* TOP APP BAR HEADER */}
        <Header
          colinhas={colinhas}
          currentCard={currentCard}
          onSelectCola={handleSelectCola}
          onNewCola={() => setShowNewColaModal(true)}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          securitySettings={securitySettings}
          onOpenSecurity={() => setShowSecurityModal(true)}
          onLockApp={() => setIsLocked(true)}
          onOpenUrnaSimulator={() => setShowUrnaSimulator(true)}
          onOpenPrint={() => setShowPrintModal(true)}
          onExportJson={() => {}}
        />

        {/* MAIN SCROLLABLE MOBILE CONTENT AREA */}
        <main
          ref={mainScrollRef}
          className="flex-1 h-full overflow-y-auto overflow-x-hidden flex flex-col items-center justify-stretch px-1 sm:px-2 py-0.5 sm:py-2 scroll-smooth w-full"
        >
          <VotingCard
            card={currentCard}
            darkMode={darkMode}
            soundEnabled={soundEnabled}
            onUpdateSlotDigits={handleUpdateSlotDigits}
            onEditSlot={(slot) => setEditingSlot(slot)}
            onUpdateCardSettings={handleUpdateCardSettings}
            onOpenSimulator={() => setShowUrnaSimulator(true)}
          />
        </main>

        {/* STICKY BOTTOM MOBILE NAVIGATION BAR */}
        <MobileBottomNav
          darkMode={darkMode}
          onOpenUrnaSimulator={() => setShowUrnaSimulator(true)}
          onOpenPrint={() => setShowPrintModal(true)}
          onNewCola={() => setShowNewColaModal(true)}
          onOpenSettings={() => setShowSettingsModal(true)}
          onScrollToTop={handleScrollToTop}
          isSimulatorOpen={showUrnaSimulator}
        />

        {/* MODALS */}
        {editingSlot && (
          <CandidateDetailModal
            slot={editingSlot}
            darkMode={darkMode}
            onSave={handleSaveSlot}
            onClose={() => setEditingSlot(null)}
          />
        )}

        {showSecurityModal && (
          <SecurityModal
            settings={securitySettings}
            darkMode={darkMode}
            onSave={handleSaveSecurity}
            onClose={() => setShowSecurityModal(false)}
          />
        )}

        {showUrnaSimulator && (
          <UrnaSimulatorModal
            card={currentCard}
            darkMode={darkMode}
            soundEnabled={soundEnabled}
            onClose={() => setShowUrnaSimulator(false)}
          />
        )}

        {showPrintModal && (
          <PrintModal
            card={currentCard}
            darkMode={darkMode}
            onClose={() => setShowPrintModal(false)}
          />
        )}

        {showNewColaModal && (
          <NewColaModal
            darkMode={darkMode}
            onSave={handleSaveNewCola}
            onClose={() => setShowNewColaModal(false)}
          />
        )}

        {/* MOBILE SETTINGS & PREFERENCES DRAWER */}
        <MobileSettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          securitySettings={securitySettings}
          onOpenSecurity={() => setShowSecurityModal(true)}
          onLockApp={() => setIsLocked(true)}
          card={currentCard}
          onUpdateCardSettings={handleUpdateCardSettings}
        />

        {/* Offline Status Toast */}
        <OfflineIndicator />
      </div>
    </div>
  );
}
