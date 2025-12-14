import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Journium } from 'journium-js';
import { JourniumConfig } from '@journium/core';

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
  const [journium, setJournium] = useState<Journium | null>(null);

  useEffect(() => {
    const journiumInstance = new Journium(config);
    
    if (autoCapture) {
      journiumInstance.startAutoCapture();
    }
    
    setJournium(journiumInstance);

    return () => {
      journiumInstance.destroy();
      setJournium(null);
    };
  }, [config, autoCapture]);

  // Note: All pageview tracking is handled by startAutoCapture() when autoCapture=true
  // When autoCapture=false, users should call capturePageview() manually as needed

  return (
    <JourniumContext.Provider value={{ journium }}>
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