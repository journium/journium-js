import React$1, { ReactNode } from 'react';
import { Journium } from 'journium-js';
export * from 'journium-js';
import { JourniumConfig, AutocaptureConfig } from '@journium/shared';

interface JourniumContextValue {
    journium: Journium | null;
}
interface JourniumProviderProps {
    children: ReactNode;
    config: JourniumConfig;
    autoCapture?: boolean;
}
declare const JourniumProvider: React$1.FC<JourniumProviderProps>;
declare const useJournium: () => JourniumContextValue;

declare const useTrackEvent: () => (event: string, properties?: Record<string, any>) => void;
declare const useTrackPageview: () => (properties?: Record<string, any>) => void;
declare const useAutoTrackPageview: (dependencies?: React.DependencyList, properties?: Record<string, any>) => void;
declare const useAutocapture: () => {
    startAutocapture: () => void;
    stopAutocapture: () => void;
};
declare const useAutoTrackClicks: (enabled?: boolean, config?: Partial<AutocaptureConfig>) => void;

export { JourniumProvider, useAutoTrackClicks, useAutoTrackPageview, useAutocapture, useJournium, useTrackEvent, useTrackPageview };
