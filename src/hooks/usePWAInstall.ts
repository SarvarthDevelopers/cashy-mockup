import { useState, useEffect } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  });

  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    const userAgent = window.navigator.userAgent.toLowerCase();
    return /iphone|ipad|ipod/.test(userAgent) || 
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
  });

  const [showPrompt, setShowPrompt] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    // Check standalone
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (isStandaloneMode) return false;

    // Check if already installed
    const isInstalled = localStorage.getItem('cashy_pwa_installed') === 'true';
    if (isInstalled) return false;

    // Check dismissal
    const isDismissed = !!sessionStorage.getItem('cashy_pwa_prompt_dismissed_at');
    if (isDismissed) return false;

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) || 
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    
    return isIOSDevice;
  });

  useEffect(() => {
    // If running in standalone mode, mark PWA as installed and do not show the prompt
    if (isStandalone) {
      localStorage.setItem('cashy_pwa_installed', 'true');
      return;
    }

    // Check if already installed
    if (localStorage.getItem('cashy_pwa_installed') === 'true') {
      return;
    }

    // Update standalone state on mount if display mode changes
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      if (e.matches) {
        localStorage.setItem('cashy_pwa_installed', 'true');
        setShowPrompt(false);
      }
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    // Stop early if dismissed in current session
    const isDismissed = !!sessionStorage.getItem('cashy_pwa_prompt_dismissed_at');
    if (isDismissed) {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
      return;
    }

    // For Android/Chrome/Edge, listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // Listen to successful install event
    const handleAppInstalled = () => {
      localStorage.setItem('cashy_pwa_installed', 'true');
      setShowPrompt(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isStandalone]);

  const installApp = async () => {
    if (!deferredPrompt) return;

    // Trigger the native install prompt
    await deferredPrompt.prompt();

    // Wait for the user's choice
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install prompt');
      localStorage.setItem('cashy_pwa_installed', 'true');
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const dismissPrompt = () => {
    sessionStorage.setItem('cashy_pwa_prompt_dismissed_at', String(Date.now()));
    setShowPrompt(false);
  };

  return {
    isInstallable: !!deferredPrompt,
    isIOS,
    isStandalone,
    showPrompt,
    installApp,
    dismissPrompt,
  };
}

