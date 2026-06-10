import { usePWAInstall } from '../../hooks/usePWAInstall';
import { X, Download, Share, PlusSquare } from 'lucide-react';

export function PWAInstallPrompt() {
  const { isIOS, showPrompt, installApp, dismissPrompt } = usePWAInstall();

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-999 animate-in slide-in-from-bottom-5 duration-300">
      <div className="relative overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--background-primary)] shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-5 flex flex-col gap-4">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--border-brand)]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header with Close */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
              <Download size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-sm font-black text-[var(--text-primary)] leading-tight">Install Cashy Admin</h3>
              <p className="text-[11px] text-[var(--text-subtlest)] font-semibold mt-0.5">Offline access & quick launch</p>
            </div>
          </div>
          <button
            onClick={dismissPrompt}
            className="p-1 hover:bg-[var(--background-secondary)] rounded-lg text-[var(--text-subtlest)] hover:text-[var(--text-primary)] transition-colors border-none bg-transparent cursor-pointer"
            aria-label="Dismiss install prompt"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Body content */}
        <div className="text-xs text-[var(--text-subtle)] font-medium leading-relaxed">
          {isIOS ? (
            <div className="flex flex-col gap-3 bg-[var(--background-secondary)]/50 border border-[var(--border-subtle)] rounded-xl p-3">
              <p className="text-[11px] font-bold text-[var(--text-primary)]">To install on your iPhone / iPad:</p>
              <ol className="flex flex-col gap-2.5 list-none p-0 m-0 text-[11px] text-[var(--text-subtle)]">
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--background-primary)] border border-[var(--border-subtle)] text-[10px] font-bold">1</span>
                  <span>Tap the Share button <Share size={12} className="inline-block mx-0.5 text-blue-500" /> in Safari.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[var(--background-primary)] border border-[var(--border-subtle)] text-[10px] font-bold">2</span>
                  <span>Scroll down & tap <strong className="font-bold text-[var(--text-primary)]">Add to Home Screen</strong> <PlusSquare size={12} className="inline-block mx-0.5 text-gray-700" />.</span>
                </li>
              </ol>
            </div>
          ) : (
            <p>
              Add Cashy Admin to your home screen for full standalone experience, persistent session, and faster loading times.
            </p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-2 mt-1">
          {!isIOS ? (
            <button
              onClick={installApp}
              className="flex-1 h-9 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer border-none flex items-center justify-center gap-1.5"
            >
              <Download size={14} strokeWidth={2} />
              <span>Install App</span>
            </button>
          ) : null}
          <button
            onClick={dismissPrompt}
            className={`h-9 px-4 rounded-xl text-xs font-semibold border border-[var(--border-subtle)] bg-[var(--background-primary)] hover:bg-[var(--background-secondary)] transition-colors cursor-pointer text-[var(--text-subtle)] ${isIOS ? 'flex-1' : 'w-24'}`}
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
}
