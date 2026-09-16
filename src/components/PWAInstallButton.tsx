import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Share, PlusSquare, Smartphone, CheckCircle, X, HelpCircle } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'banner' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // If already running as standalone PWA, suppress button or render subtle indicator
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      {/* Install Button */}
      <button
        id="btn-pwa-install"
        onClick={handleInstallClick}
        title="Instalar Colinha Eleitoral no celular ou computador"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer ${
          variant === 'header'
            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-emerald-500/20 active:scale-95'
            : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'
        } ${className}`}
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span className="hidden sm:inline">Instalar App</span>
        <span className="sm:hidden">Instalar</span>
      </button>

      {/* Guide Modal for iOS or manual installation */}
      {showGuideModal && (
        <div
          id="pwa-install-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowGuideModal(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center text-white shadow-md shadow-orange-500/30 shrink-0">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black leading-tight">
                  Instalar Colinha Eleitoral
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Acesse direto pela tela inicial do seu celular ou PC, 100% offline.
                </p>
              </div>
            </div>

            {/* Platform instructions */}
            {isIOS ? (
              <div className="space-y-3 my-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 text-xs sm:text-sm">
                <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>📱 No iPhone / iPad (Safari):</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold shrink-0 mt-0.5">
                    1
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    Toque no botão de <strong>Compartilhar</strong> <Share className="inline w-3.5 h-3.5 mx-0.5" /> (na barra inferior do Safari).
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold shrink-0 mt-0.5">
                    2
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    Role a lista para baixo e selecione <strong>Adicionar à Tela de Início</strong> <PlusSquare className="inline w-3.5 h-3.5 mx-0.5" />.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold shrink-0 mt-0.5">
                    3
                  </span>
                  <p className="text-slate-600 dark:text-slate-300">
                    Toque em <strong>Adicionar</strong> no canto superior direito para concluir.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5 my-4 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 text-xs sm:text-sm">
                {isInstallable ? (
                  <div className="text-center py-2">
                    <p className="text-slate-600 dark:text-slate-300 mb-3">
                      Clique no botão abaixo para autorizar a instalação no seu dispositivo:
                    </p>
                    <button
                      onClick={async () => {
                        await install();
                        setShowGuideModal(false);
                      }}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Confirmar Instalação Agora
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      Instalação via Navegador (Chrome, Edge ou Android):
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold shrink-0 mt-0.5">
                        1
                      </span>
                      <p className="text-slate-600 dark:text-slate-300">
                        No Chrome do Android, toque no menu dos <strong>três pontinhos (⋮)</strong> no canto superior direito.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold shrink-0 mt-0.5">
                        2
                      </span>
                      <p className="text-slate-600 dark:text-slate-300">
                        Toque em <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong>.
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white text-[11px] font-bold shrink-0 mt-0.5">
                        3
                      </span>
                      <p className="text-slate-600 dark:text-slate-300">
                        No computador (PC/Mac), clique no ícone de <strong>instalar (computador com seta)</strong> na barra de endereços do navegador.
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Offline highlight */}
            <div className="flex items-center gap-2 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800/40">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Funciona totalmente sem sinal de internet na cabine de votação!</span>
            </div>

            {/* Bottom button */}
            <button
              onClick={() => setShowGuideModal(false)}
              className="mt-4 w-full rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
