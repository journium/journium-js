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
  const { analytics, effectiveOptions } = useJournium();

  useEffect(() => {
    if (!analytics || !effectiveOptions) return;

    // Check if automatic pageview tracking is enabled (defaults to true)
    const autoTrackPageviews = effectiveOptions.autoTrackPageviews !== false;
    
    if (!autoTrackPageviews) return;

    const handleRouteChange = () => {
      analytics.capturePageview();
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, analytics, effectiveOptions]);

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