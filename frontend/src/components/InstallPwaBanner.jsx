import React, { useState, useEffect } from 'react';
import { HiDownload, HiX } from 'react-icons/hi';

export default function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user already dismissed banner this session
    const dismissed = sessionStorage.getItem('pwa_banner_dismissed');
    if (dismissed) return;

    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      console.log('Beverage Dealer PWA was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem('pwa_banner_dismissed', 'true');
  };

  if (!isVisible || isDismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-bounce-subtle">
      <div className="bg-slate-900/95 backdrop-blur-md text-white border border-indigo-500/30 rounded-2xl p-4 shadow-2xl shadow-indigo-900/40 flex items-center justify-between gap-3">
        <img
          src="/icon-192.png"
          alt="Beverage Dealer"
          className="w-12 h-12 rounded-xl object-cover border border-white/10 shadow-md"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white tracking-wide truncate">
            Install Beverage App
          </h4>
          <p className="text-xs text-slate-300 line-clamp-1">
            Fast, offline-ready & mobile app experience
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-md transition-all duration-150"
          >
            <HiDownload className="w-3.5 h-3.5" />
            Install
          </button>
          <button
            onClick={handleDismiss}
            aria-label="Dismiss banner"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <HiX className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
