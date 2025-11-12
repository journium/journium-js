import { AutocaptureConfig } from '@journium/shared';
export declare const useTrackEvent: () => (event: string, properties?: Record<string, any>) => void;
export declare const useTrackPageview: () => (properties?: Record<string, any>) => void;
export declare const useAutoTrackPageview: (dependencies?: React.DependencyList, properties?: Record<string, any>) => void;
export declare const useAutocapture: () => {
    startAutocapture: () => void;
    stopAutocapture: () => void;
};
export declare const useAutoTrackClicks: (enabled?: boolean, config?: Partial<AutocaptureConfig>) => void;
//# sourceMappingURL=hooks.d.ts.map