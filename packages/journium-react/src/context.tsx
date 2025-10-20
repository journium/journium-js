import React, { createContext, useContext, useEffect, useRef, ReactNode } from 'react';
import { Journium, JourniumConfig } from 'journium-js';

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
  console.log('----inside JourniumProvider JourniumProvider config:', config);
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