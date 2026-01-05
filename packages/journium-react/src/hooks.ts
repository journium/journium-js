import { useCallback, useEffect } from 'react';
import { useJournium } from './context';

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

export const useReset = () => {
  const { analytics } = useJournium();

  return useCallback(() => {
    if (analytics) {
      analytics.reset();
    }
  }, [analytics]);
};

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

export const useAutoTrackPageview = (
  dependencies: React.DependencyList = [],
  properties?: Record<string, unknown>
) => {
  const trackPageview = useTrackPageview();

  useEffect(() => {
    trackPageview(properties);
  }, [trackPageview, properties, ...dependencies]);
};

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

