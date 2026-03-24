import { useCallback, useEffect } from 'react';
import { useJournium } from './context';

/** Returns a stable callback for tracking custom events. */
export const useTrackEvent = () => {
  const { analytics } = useJournium();

  return useCallback(
    (event: string, properties?: Record<string, unknown>) => {
      if (analytics) {
        analytics.track(event, properties);
      }
    },
    [analytics]
  );
};

/** Returns a stable callback for identifying the current user. */
export const useIdentify = () => {
  const { analytics } = useJournium();

  return useCallback(
    (distinctId: string, attributes?: Record<string, unknown>) => {
      if (analytics) {
        analytics.identify(distinctId, attributes);
      }
    },
    [analytics]
  );
};

/** Returns a stable callback for resetting the current identity and starting a new anonymous session. */
export const useReset = () => {
  const { analytics } = useJournium();

  return useCallback(() => {
    if (analytics) {
      analytics.reset();
    }
  }, [analytics]);
};

/** Returns a stable callback for manually capturing a $pageview event. */
export const useTrackPageview = () => {
  const { analytics } = useJournium();

  return useCallback(
    (properties?: Record<string, unknown>) => {
      if (analytics) {
        analytics.capturePageview(properties);
      }
    },
    [analytics]
  );
};

/**
 * Automatically captures a $pageview whenever the given dependencies change.
 * Also fires once on mount. Useful for manual SPA route tracking when automatic
 * tracking is disabled.
 */
export const useAutoTrackPageview = (
  dependencies: React.DependencyList = [],
  properties?: Record<string, unknown>
) => {
  const trackPageview = useTrackPageview();

  useEffect(() => {
    trackPageview(properties);
  }, [trackPageview, properties, ...dependencies]);
};

/**
 * Returns `stopAutocapture` to pause DOM event capture and pageview tracking.
 * `startAutocapture` is also exposed for restarting after an explicit stop,
 * but under normal usage autocapture starts automatically on SDK init.
 */
export const useAutocapture = () => {
  const { analytics } = useJournium();

  const startAutocapture = useCallback(() => {
    if (analytics) {
      analytics.startAutocapture();
    }
  }, [analytics]);

  const stopAutocapture = useCallback(() => {
    if (analytics) {
      analytics.stopAutocapture();
    }
  }, [analytics]);

  return { startAutocapture, stopAutocapture };
};
