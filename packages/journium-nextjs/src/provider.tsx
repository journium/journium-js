/**
 * @fileoverview Next.js Journium Provider - Client Component
 * 
 * This component is a client component because it uses:
 * - React Context API (createContext) via BaseJourniumProvider
 * - Next.js client hooks (usePathname, useSearchParams)
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
 * NOTE: The "use client" directive is NOT in this source file to avoid Rollup warnings.
 * It is added during the build process via the Rollup banner configuration.
 */

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

/**
 * Internal component that tracks route changes and automatically captures pageviews.
 * Uses Next.js navigation hooks which require client-side execution.
 */
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
 * @param props.trackRouteChanges - Whether to automatically track route changes (default: true).
 *                                 When enabled, pageviews are automatically captured when
 *                                 the route changes using Next.js App Router navigation.
 * 
 * @remarks
 * - This component uses React Context, so it must be a client component
 * - Uses Next.js navigation hooks (usePathname, useSearchParams) for route tracking
 * - Automatically reads NEXT_PUBLIC_JOURNIUM_PUBLISHABLE_KEY if config.publishableKey is not provided
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