import { useCallback, useEffect } from 'react';
import { useJournium } from './context';

export const useTrackEvent = () => {
  const { journium } = useJournium();

  return useCallback(
    (event: string, properties?: Record<string, any>) => {
      if (journium) {
        journium.track(event, properties);
      }
    },
    [journium]
  );
};

export const useIdentify = () => {
  const { journium } = useJournium();

  return useCallback(
    (distinctId: string, attributes?: Record<string, any>) => {
      if (journium) {
        journium.identify(distinctId, attributes);
      }
    },
    [journium]
  );
};

export const useReset = () => {
  const { journium } = useJournium();

  return useCallback(() => {
    if (journium) {
      journium.reset();
    }
  }, [journium]);
};

export const useTrackPageview = () => {
  const { journium } = useJournium();

  return useCallback(
    (properties?: Record<string, any>) => {
      if (journium) {
        journium.capturePageview(properties);
      }
    },
    [journium]
  );
};

export const useAutoTrackPageview = (
  dependencies: React.DependencyList = [],
  properties?: Record<string, any>
) => {
  const trackPageview = useTrackPageview();

  useEffect(() => {
    trackPageview(properties);
  }, dependencies);
};

export const useAutocapture = () => {
  const { journium } = useJournium();

  const startAutocapture = useCallback(() => {
    if (journium) {
      journium.startAutocapture();
    }
  }, [journium]);

  const stopAutocapture = useCallback(() => {
    if (journium) {
      journium.stopAutocapture();
    }
  }, [journium]);

  return { startAutocapture, stopAutocapture };
};

