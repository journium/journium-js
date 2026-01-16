import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { JourniumAnalytics } from '@journium/js';
import { JourniumConfig, JourniumLocalOptions } from '@journium/core';

interface JourniumContextValue {
  analytics: JourniumAnalytics | null;
  config: JourniumConfig | null;
  effectiveOptions: JourniumLocalOptions | null;
}

const JourniumContext = createContext<JourniumContextValue | undefined>(undefined);

interface JourniumProviderProps {
  children: ReactNode;
  config: JourniumConfig;
}

export const JourniumProvider: React.FC<JourniumProviderProps> = ({
  children,
  config,
}) => {
  const [analytics, setAnalytics] = useState<JourniumAnalytics | null>(null);
  const [effectiveOptions, setEffectiveOptions] = useState<JourniumLocalOptions | null>(null);

  useEffect(() => {
    const analyticsInstance = new JourniumAnalytics(config);
    
    // Get effective options and check if autocapture is enabled
    const effective = analyticsInstance.getEffectiveOptions();
    setEffectiveOptions(effective);
    const autocaptureEnabled = effective.autocapture !== false;
    
    if (autocaptureEnabled) {
      analyticsInstance.startAutocapture();
    }
    
    setAnalytics(analyticsInstance);

    return () => {
      analyticsInstance.destroy();
      setAnalytics(null);
      setEffectiveOptions(null);
    };
  }, [config]);

  return (
    <JourniumContext.Provider value={{ analytics, config, effectiveOptions }}>
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