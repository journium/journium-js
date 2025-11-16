import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { JourniumProvider as BaseJourniumProvider, useJournium } from '@journium/react';
import { JourniumConfig } from '@journium/core';

interface NextJourniumProviderProps {
  children: ReactNode;
  config: JourniumConfig;
  autoCapture?: boolean;
  trackRouteChanges?: boolean;
}

const RouteChangeTracker: React.FC<{ trackRouteChanges: boolean }> = ({ 
  trackRouteChanges 
}) => {
  const router = useRouter();
  const { journium } = useJournium();

  useEffect(() => {
    if (!trackRouteChanges || !journium) return;

    const handleRouteChange = () => {
      journium.capturePageview();
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, journium, trackRouteChanges]);

  return null;
};

export const NextJourniumProvider: React.FC<NextJourniumProviderProps> = ({
  children,
  config,
  autoCapture = true, // Made consistent with React provider
  trackRouteChanges = true,
}) => {
  return (
    <BaseJourniumProvider config={config} autoCapture={autoCapture}>
      <RouteChangeTracker trackRouteChanges={trackRouteChanges} />
      {children}
    </BaseJourniumProvider>
  );
};