import { useCallback, useEffect } from 'react';
import { useJournium } from './context';
import { AutocaptureConfig } from '@journium/core';

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

export const useAutoTrackClicks = (
  enabled: boolean = true,
  config?: Partial<AutocaptureConfig>
) => {
  const { journium } = useJournium();

  useEffect(() => {
    if (journium && enabled) {
      // Use startAutoCapture for consistency (includes both pageview + clicks)
      journium.startAutoCapture();
      return () => {
        journium.stopAutoCapture();
      };
    }
    return undefined;
  }, [journium, enabled]);
};