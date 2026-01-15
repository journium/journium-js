import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { JourniumAnalytics } from '@journium/js';
import { JourniumConfig, JourniumLocalOptions } from '@journium/core';

interface JourniumContextValue {
  analytics: JourniumAnalytics | null;
  config: JourniumConfig | null;
  effectiveOptions: JourniumLocalOptions | null;
}

const JourniumContext = createContext<JourniumContextValue>({ analytics: null, config: null, effectiveOptions: null });

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
    
    // Get initial effective options (may include cached remote options)
    const initialEffective = analyticsInstance.getEffectiveOptions();
    setEffectiveOptions(initialEffective);
    
    // Check if autocapture should be enabled based on initial effective options
    const autocaptureEnabled = initialEffective.autocapture !== false;
    
    if (autocaptureEnabled) {
      analyticsInstance.startAutocapture();
    }
    
    setAnalytics(analyticsInstance);

    // Listen for options changes (when remote options are fetched)
    // Note: JourniumAnalytics already handles restarting autocapture when options change
    // We just need to update the effectiveOptions state for consumers
    const unsubscribe = analyticsInstance.onOptionsChange((newOptions: JourniumLocalOptions) => {
      setEffectiveOptions(newOptions);
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
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