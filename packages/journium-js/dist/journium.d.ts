import { JourniumConfig } from '@journium/shared';
export declare class Journium {
    private client;
    private pageviewTracker;
    private autocaptureTracker;
    private config;
    constructor(config: JourniumConfig);
    private resolveAutocaptureConfig;
    track(event: string, properties?: Record<string, any>): void;
    capturePageview(properties?: Record<string, any>): void;
    startAutoCapture(): void;
    stopAutoCapture(): void;
    startAutocapture(): void;
    stopAutocapture(): void;
    flush(): Promise<void>;
    destroy(): void;
}
export declare const init: (config: JourniumConfig) => Journium;
declare const _default: {
    init: (config: JourniumConfig) => Journium;
    Journium: typeof Journium;
};
export default _default;
//# sourceMappingURL=journium.d.ts.map