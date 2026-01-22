import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { init } from '@journium/js';
import { JourniumConfig, JourniumLocalOptions } from '@journium/core';

type JourniumAnalyticsInstance = ReturnType<typeof init>;

interface JourniumContextValue {
  analytics: JourniumAnalyticsInstance | null;
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
  const [analytics, setAnalytics] = useState<JourniumAnalyticsInstance | null>(null);
  const [effectiveOptions, setEffectiveOptions] = useState<JourniumLocalOptions | null>(null);

  useEffect(() => {
    const analyticsInstance = init(config);
    
    // Get initial effective options (may be empty during remote-first initialization)
    const initialEffective = analyticsInstance.getEffectiveOptions();
    setEffectiveOptions(initialEffective);
    
    // Don't start autocapture immediately with potentially empty options
    // Let the analytics instance handle autocapture after initialization completes
    setAnalytics(analyticsInstance);

    // Listen for options changes (when remote options are fetched)
    // The JourniumAnalytics will automatically start autocapture when initialization completes
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