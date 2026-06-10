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

    // Check dismissal
    const dismissedAt = localStorage.getItem('cashy_pwa_prompt_dismissed_at');
    const isDismissed = dismissedAt && (Date.now() - Number(dismissedAt) < 7 * 24 * 60 * 60 * 1000);
    if (isDismissed) return false;

    // Check iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) || 
      (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    
    return isIOSDevice;
  });

  useEffect(() => {
    if (isStandalone) return;

    // Update standalone/ios state on mount if matchMedia listener changes, but usually static
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
    };

    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', handleDisplayModeChange);

    const dismissedAt = localStorage.getItem('cashy_pwa_prompt_dismissed_at');
    const isDismissed = dismissedAt && (Date.now() - Number(dismissedAt) < 7 * 24 * 60 * 60 * 1000);
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

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      mediaQuery.removeEventListener('change', handleDisplayModeChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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
      setShowPrompt(false);
    }
    
    setDeferredPrompt(null);
  };

  const dismissPrompt = () => {
    localStorage.setItem('cashy_pwa_prompt_dismissed_at', String(Date.now()));
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

