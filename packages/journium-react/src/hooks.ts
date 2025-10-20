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