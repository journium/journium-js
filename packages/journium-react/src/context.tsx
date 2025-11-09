import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { Journium } from 'journium-js';
import { JourniumConfig } from '@journium/shared';

interface JourniumContextValue {
  journium: Journium | null;
}

const JourniumContext = createContext<JourniumContextValue>({ journium: null });

interface JourniumProviderProps {
  children: ReactNode;
  config: JourniumConfig;
  autoCapture?: boolean;
}

export const JourniumProvider: React.FC<JourniumProviderProps> = ({
  children,
  config,
  autoCapture = true,
}) => {
  console.log('----??>> inside JourniumProvider JourniumProvider config:', config);
  const journiumRef = useRef<Journium | null>(null);

  useEffect(() => {
    if (!journiumRef.current) {
      journiumRef.current = new Journium(config);
      
      if (autoCapture) {
        journiumRef.current.startAutoCapture();
      }
    }

    return () => {
      if (journiumRef.current) {
        journiumRef.current.destroy();
        journiumRef.current = null;
      }
    };
  }, [config, autoCapture]);

  // Auto-track pageviews on URL changes
  useEffect(() => {
    if (!journiumRef.current) return;

    // Track initial pageview
    const trackPageview = () => {
      if (journiumRef.current) {
        journiumRef.current.capturePageview({
          $current_url: window.location.href,
          $pathname: window.location.pathname,
          $search: window.location.search,
          $hash: window.location.hash,
          $title: document.title,
        });
      }
    };

    // Track initial pageview
    trackPageview();

    // Listen for navigation events
    const handlePopState = () => {
      trackPageview();
    };

    // Listen for pushState/replaceState (React Router navigation)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(...args) {
      originalPushState.apply(window.history, args);
      setTimeout(trackPageview, 0); // Use setTimeout to ensure DOM is updated
    };

    window.history.replaceState = function(...args) {
      originalReplaceState.apply(window.history, args);
      setTimeout(trackPageview, 0);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  return (
    <JourniumContext.Provider value={{ journium: journiumRef.current }}>
      {children}
    </JourniumContext.Provider>
  );
};

export const useJournium = (): JourniumContextValue => {
  const context = useContext(JourniumContext);
  if (!context) {
    throw new Error('useJournium must be used within a JourniumProvider');
  }
  return context;
};