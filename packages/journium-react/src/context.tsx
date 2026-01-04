import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Journium } from '@journium/js';
import { JourniumConfig } from '@journium/core';

interface JourniumContextValue {
  journium: Journium | null;
  config: JourniumConfig | null;
  effectiveOptions: any | null;
}

const JourniumContext = createContext<JourniumContextValue>({ journium: null, config: null, effectiveOptions: null });

interface JourniumProviderProps {
  children: ReactNode;
  config: JourniumConfig;
}

export const JourniumProvider: React.FC<JourniumProviderProps> = ({
  children,
  config,
}) => {
  const [journium, setJournium] = useState<Journium | null>(null);
  const [effectiveOptions, setEffectiveOptions] = useState<any | null>(null);

  useEffect(() => {
    const journiumInstance = new Journium(config);
    
    // Get effective options and check if autocapture is enabled
    const effective = journiumInstance.getEffectiveOptions();
    setEffectiveOptions(effective);
    const autocaptureEnabled = effective.autocapture !== false;
    
    if (autocaptureEnabled) {
      journiumInstance.startAutocapture();
    }
    
    setJournium(journiumInstance);

    return () => {
      journiumInstance.destroy();
      setJournium(null);
      setEffectiveOptions(null);
    };
  }, [config]);

  return (
    <JourniumContext.Provider value={{ journium, config, effectiveOptions }}>
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