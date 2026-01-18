/**
 * @fileoverview Next.js Journium Provider - Client Component
 * 
 * This component is a client component because it uses:
 * - React Context API (createContext) via BaseJourniumProvider
 * - Next.js client hooks (usePathname, useSearchParams for App Router, or useRouter for Pages Router)
 * - React hooks (useState, useEffect, useMemo)
 * 
 * IMPORTANT: The "use client" directive is added to the bundled output via Rollup
 * configuration (see rollup.config.mjs banner option). This ensures that Next.js
 * recognizes this as a client component when imported from the bundled package.
 * 
 * Consuming applications do NOT need to add "use client" directive themselves.
 * You can use NextJourniumProvider directly in server components (like layout.tsx)
 * and Next.js will automatically handle the client/server boundary.
 * 
 * Example usage in a server component:
 * ```tsx
 * // app/layout.tsx (server component - no "use client" needed)
 * import { NextJourniumProvider } from '@journium/nextjs';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <NextJourniumProvider>
 *           {children}
 *         </NextJourniumProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * Example usage in Pages Router:
 * ```tsx
 * // pages/_app.tsx
 * import { NextJourniumProvider } from '@journium/nextjs';
 * 
 * export default function App({ Component, pageProps }) {
 *   return (
 *     <NextJourniumProvider>
 *       <Component {...pageProps} />
 *     </NextJourniumProvider>
 *   );
 * }
 * ```
 * 
 * NOTE: The "use client" directive is NOT in this source file to avoid Rollup warnings.
 * It is added during the build process via the Rollup banner configuration.
 * 
 * ROUTER DETECTION: This component automatically detects whether you're using App Router
 * or Pages Router and uses the appropriate tracking mechanism. No configuration needed.
 */

import React, { ReactNode, useEffect, Suspense, useMemo, useState } from 'react';
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

/**
 * Internal component that tracks route changes and automatically captures pageviews.
 * Automatically detects and uses the appropriate Next.js router (App Router or Pages Router).
 * Uses dynamic imports to avoid build-time errors when next/navigation is not available.
 * Respects autoTrackPageviews setting from effective options.
 */
const RouteChangeTracker: React.FC<{ trackRouteChanges: boolean }> = ({ 
  trackRouteChanges 
}) => {
  const { analytics, effectiveOptions } = useJournium();
  const [routerType, setRouterType] = useState<'app' | 'pages' | null>(null);

  // Check if autoTrackPageviews is enabled 
  // Only enable if effectiveOptions are loaded and autoTrackPageviews is not explicitly false
  const autoTrackPageviewsEnabled = effectiveOptions && Object.keys(effectiveOptions).length > 0 
    ? effectiveOptions.autoTrackPageviews !== false 
    : false;

  useEffect(() => {
    if (!trackRouteChanges || !analytics || !autoTrackPageviewsEnabled) return;

    // Detect router type by attempting to import next/navigation
    // If it succeeds, we're using App Router; if it fails, we're using Pages Router
    import('next/navigation')
      .then((_navigation) => {
        // App Router detected - use usePathname and useSearchParams
        setRouterType('app');
      })
      .catch(() => {
        // Pages Router detected - will use next/router
        setRouterType('pages');
      });
  }, [trackRouteChanges, analytics, autoTrackPageviewsEnabled]);

  // Don't track if autoTrackPageviews is disabled
  if (!autoTrackPageviewsEnabled) {
    return null;
  }

  // App Router tracker component
  if (routerType === 'app') {
    return <AppRouterTracker trackRouteChanges={trackRouteChanges} />;
  }

  // Pages Router tracker component
  if (routerType === 'pages') {
    return <PagesRouterTracker trackRouteChanges={trackRouteChanges} />;
  }

  // Still detecting router type
  return null;
};

/**
 * App Router tracker - uses usePathname and useSearchParams from next/navigation
 * Uses dynamic import to avoid build errors in Pages Router, then creates a component
 * that properly calls the hooks at the top level.
 * Respects autoTrackPageviews setting from effective options.
 */
const AppRouterTracker: React.FC<{ trackRouteChanges: boolean }> = ({ trackRouteChanges }) => {
  const [TrackerComponent, setTrackerComponent] = useState<React.ComponentType<{ trackRouteChanges: boolean }> | null>(null);
  const { analytics, effectiveOptions } = useJournium();

  useEffect(() => {
    if (!analytics) return;

    // Dynamically import App Router hooks and create a component that uses them
    import('next/navigation')
      .then((nav) => {
        // Create a component that calls hooks at the top level (required by React)
        const TrackerImpl: React.FC<{ trackRouteChanges: boolean }> = ({ trackRouteChanges }) => {
          const pathname = nav.usePathname();
          const searchParams = nav.useSearchParams();
          const { analytics, effectiveOptions } = useJournium();

          // Check if autoTrackPageviews is enabled
          // Only enable if effectiveOptions are loaded and autoTrackPageviews is not explicitly false
          const autoTrackPageviewsEnabled = effectiveOptions && Object.keys(effectiveOptions).length > 0 
            ? effectiveOptions.autoTrackPageviews !== false 
            : false;

          useEffect(() => {
            if (!trackRouteChanges || !analytics || !autoTrackPageviewsEnabled) return;
            analytics.capturePageview();
          }, [pathname, searchParams, analytics, trackRouteChanges, autoTrackPageviewsEnabled]);

          return null;
        };
        setTrackerComponent(() => TrackerImpl);
      })
      .catch(() => {
        // Should not happen since we only render this when App Router is detected
        console.warn('Failed to load next/navigation hooks');
      });
  }, [analytics, effectiveOptions]);

  if (!TrackerComponent) return null;

  return <TrackerComponent trackRouteChanges={trackRouteChanges} />;
};

/**
 * Pages Router tracker - uses useRouter from next/router with route events
 * Note: useRouter from next/router is available in both App Router and Pages Router,
 * but router.events only works in Pages Router, so this component is only rendered
 * when Pages Router is detected.
 * Uses dynamic import to avoid build-time errors and ensure proper module resolution.
 * Respects autoTrackPageviews setting from effective options.
 */
const PagesRouterTracker: React.FC<{ trackRouteChanges: boolean }> = ({ trackRouteChanges }) => {
  const [TrackerComponent, setTrackerComponent] = useState<React.ComponentType<{ trackRouteChanges: boolean }> | null>(null);
  const { analytics, effectiveOptions } = useJournium();

  useEffect(() => {
    if (!analytics) return;

    // Dynamically import Pages Router hooks and create a component that uses them
    import('next/router')
      .then((routerModule) => {
        // Create a component that calls hooks at the top level (required by React)
        const TrackerImpl: React.FC<{ trackRouteChanges: boolean }> = ({ trackRouteChanges }) => {
          const router = routerModule.useRouter();
          const { analytics, effectiveOptions } = useJournium();

          // Check if autoTrackPageviews is enabled
          // Only enable if effectiveOptions are loaded and autoTrackPageviews is not explicitly false
          const autoTrackPageviewsEnabled = effectiveOptions && Object.keys(effectiveOptions).length > 0 
            ? effectiveOptions.autoTrackPageviews !== false 
            : false;

          useEffect(() => {
            if (!trackRouteChanges || !analytics || !autoTrackPageviewsEnabled) return;

            // Track initial pageview
            analytics.capturePageview();

            const handleRouteChange = () => {
              // Re-check autoTrackPageviews in case it changed
              const currentEffectiveOptions = analytics.getEffectiveOptions();
              const currentAutoTrackEnabled = currentEffectiveOptions && Object.keys(currentEffectiveOptions).length > 0
                ? currentEffectiveOptions.autoTrackPageviews !== false
                : false;
              if (currentAutoTrackEnabled) {
                analytics.capturePageview();
              }
            };

            router.events.on('routeChangeComplete', handleRouteChange);

            return () => {
              router.events.off('routeChangeComplete', handleRouteChange);
            };
          }, [router, analytics, trackRouteChanges, autoTrackPageviewsEnabled]);

          return null;
        };
        setTrackerComponent(() => TrackerImpl);
      })
      .catch(() => {
        // Should not happen since we only render this when Pages Router is detected
        console.warn('Failed to load next/router hooks');
      });
  }, [analytics, effectiveOptions]);

  if (!TrackerComponent) return null;

  return <TrackerComponent trackRouteChanges={trackRouteChanges} />;
};

/**
 * Next.js Journium Provider Component
 * 
 * A client component that wraps your Next.js application with Journium analytics.
 * This component is marked as a client component at the source level, so you can
 * use it directly in server components without adding "use client" yourself.
 * 
 * @example
 * ```tsx
 * // app/layout.tsx - Server component (no "use client" needed)
 * import { NextJourniumProvider } from '@journium/nextjs';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <NextJourniumProvider>
 *           {children}
 *         </NextJourniumProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 * 
 * @example
 * ```tsx
 * // With custom config
 * <NextJourniumProvider 
 *   config={{ publishableKey: 'pk_test_...' }}
 *   trackRouteChanges={true}
 * >
 *   {children}
 * </NextJourniumProvider>
 * ```
 * 
 * @param props - Component props
 * @param props.children - React children to wrap with the provider
 * @param props.config - Optional Journium configuration. If not provided, will use
 *                      NEXT_PUBLIC_JOURNIUM_PUBLISHABLE_KEY from environment variables.
 *                      If apiHost is not provided in config, will use NEXT_PUBLIC_JOURNIUM_API_HOST
 *                      from environment variables if available.
 * @param props.trackRouteChanges - Whether to automatically track route changes (default: true).
 *                                 When enabled, pageviews are automatically captured when
 *                                 the route changes using Next.js App Router navigation.
 * 
 * @remarks
 * - This component uses React Context, so it must be a client component
 * - Automatically detects and supports both App Router and Pages Router
 * - Uses Next.js navigation hooks (usePathname, useSearchParams) for App Router
 * - Uses Next.js router events (router.events) for Pages Router
 * - Automatically reads NEXT_PUBLIC_JOURNIUM_PUBLISHABLE_KEY if config.publishableKey is not provided
 * - Automatically reads NEXT_PUBLIC_JOURNIUM_API_HOST if config.apiHost is not provided
 * - Route change tracking is wrapped in Suspense to handle Next.js navigation state
 * 
 * @throws {Error} If NEXT_PUBLIC_JOURNIUM_PUBLISHABLE_KEY is not set and config.publishableKey is not provided
 */
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
    
    // Get apiHost from config if provided and non-empty, otherwise use env var if available
    const apiHost = (config?.apiHost && config.apiHost.trim())
      ? config.apiHost
      : (process.env.NEXT_PUBLIC_JOURNIUM_API_HOST && process.env.NEXT_PUBLIC_JOURNIUM_API_HOST.trim())
        ? process.env.NEXT_PUBLIC_JOURNIUM_API_HOST
        : undefined;
    
    // Merge config with env var (config takes precedence, but env var fills in missing values)
    return {
      publishableKey,
      ...(apiHost && { apiHost }),
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