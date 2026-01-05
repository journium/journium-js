import React, { ReactNode, useEffect, Suspense, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { JourniumProvider as BaseJourniumProvider, useJournium } from '@journium/react';
import { JourniumConfig } from '@journium/core';

interface NextJourniumProviderProps {
  children: ReactNode;
  config?: JourniumConfig;
  trackRouteChanges?: boolean;
}

/**
 * Gets the publishable key from environment variable or throws an error if not found.
 * This function throws an error when called if the env var is missing, which will
 * fail the app at runtime when the component renders.
 */
function getPublishableKeyFromEnv(): string {
  const key = process.env.NEXT_PUBLIC_JOURNIUM_PUBLISHABLE_KEY;
  
  if (!key) {
    throw new Error(
      'NEXT_PUBLIC_JOURNIUM_PUBLISHABLE_KEY environment variable is required. ' +
      'Please set it in your .env.local file or environment variables. ' +
      'Example: NEXT_PUBLIC_JOURNIUM_PUBLISHABLE_KEY=pk_test_your_key_here'
    );
  }
  
  return key;
}

const RouteChangeTracker: React.FC<{ trackRouteChanges: boolean }> = ({ 
  trackRouteChanges 
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { analytics } = useJournium();

  useEffect(() => {
    if (!trackRouteChanges || !analytics) return;

    analytics.capturePageview();
  }, [pathname, searchParams, analytics, trackRouteChanges]);

  return null;
};

export const NextJourniumProvider: React.FC<NextJourniumProviderProps> = ({
  children,
  config,
  trackRouteChanges = true,
}) => {
  // Build the final config: merge provided config with env var (env var as fallback)
  const finalConfig = useMemo<JourniumConfig>(() => {
    // Get publishableKey from config if provided and non-empty, otherwise use env var
    const publishableKey = (config?.publishableKey && config.publishableKey.trim()) 
      ? config.publishableKey 
      : getPublishableKeyFromEnv();
    
    // Merge config with env var (config takes precedence, but env var fills in missing publishableKey)
    return {
      publishableKey,
      ...(config?.apiHost && { apiHost: config.apiHost }),
      ...(config?.options && { options: config.options }),
    };
  }, [config]);

  return (
    <BaseJourniumProvider config={finalConfig}>
      <Suspense fallback={null}>
        <RouteChangeTracker trackRouteChanges={trackRouteChanges} />
      </Suspense>
      {children}
    </BaseJourniumProvider>
  );
};