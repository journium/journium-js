import React, { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { JourniumProvider as BaseJourniumProvider, useJournium } from '@journium/react';
import { JourniumConfig } from '@journium/core';

interface NextJourniumProviderProps {
  children: ReactNode;
  config: JourniumConfig;
}

const RouteChangeTracker: React.FC = () => {
  const router = useRouter();
  const { journium, effectiveOptions } = useJournium();

  useEffect(() => {
    if (!journium || !effectiveOptions) return;

    // Check if automatic pageview tracking is enabled (defaults to true)
    const autoTrackPageviews = effectiveOptions.autoTrackPageviews !== false;
    
    if (!autoTrackPageviews) return;

    const handleRouteChange = () => {
      journium.capturePageview();
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, journium, effectiveOptions]);

  return null;
};

export const NextJourniumProvider: React.FC<NextJourniumProviderProps> = ({
  children,
  config,
}) => {
  return (
    <BaseJourniumProvider config={config}>
      <RouteChangeTracker />
      {children}
    </BaseJourniumProvider>
  );
};