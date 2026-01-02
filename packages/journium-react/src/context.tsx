import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Journium } from '@journium/js';
import { JourniumConfig } from '@journium/core';

interface JourniumContextValue {
  journium: Journium | null;
}

const JourniumContext = createContext<JourniumContextValue>({ journium: null });

interface JourniumProviderProps {
  children: ReactNode;
  config: JourniumConfig;
}

export const JourniumProvider: React.FC<JourniumProviderProps> = ({
  children,
  config,
}) => {
  const [journium, setJournium] = useState<Journium | null>(null);

  useEffect(() => {
    const journiumInstance = new Journium(config);
    
    // Check if autocapture is enabled (defaults to true if not specified)
    const autocaptureEnabled = config.config?.autocapture !== false;
    
    if (autocaptureEnabled) {
      journiumInstance.startAutocapture();
    }
    
    setJournium(journiumInstance);

    return () => {
      journiumInstance.destroy();
      setJournium(null);
    };
  }, [config]);

  // Note: All pageview tracking is handled by startAutocapture() when autocapture=true
  // When autocapture=false, users should call capturePageview() manually as needed

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