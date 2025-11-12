import { JourniumConfig } from '@journium/shared';
export * from '@journium/shared';

declare class Journium {
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
declare const init: (config: JourniumConfig) => Journium;

declare class JourniumClient {
    private config;
    private queue;
    private flushTimer;
    private initialized;
    private identityManager;
    constructor(config: JourniumConfig);
    private initialize;
    private startFlushTimer;
    private sendEvents;
    track(event: string, properties?: Record<string, any>): void;
    flush(): Promise<void>;
    destroy(): void;
}

declare class PageviewTracker {
    private client;
    private lastUrl;
    constructor(client: JourniumClient);
    capturePageview(customProperties?: Record<string, any>): void;
    startAutoCapture(): void;
    stopAutoCapture(): void;
}

interface AutocaptureConfig {
    captureClicks?: boolean;
    captureFormSubmits?: boolean;
    captureFormChanges?: boolean;
    captureTextSelection?: boolean;
    ignoreClasses?: string[];
    ignoreElements?: string[];
    captureContentText?: boolean;
}
declare class AutocaptureTracker {
    private client;
    private config;
    private listeners;
    private isActive;
    constructor(client: JourniumClient, config?: AutocaptureConfig);
    start(): void;
    stop(): void;
    private addClickListener;
    private addFormSubmitListener;
    private addFormChangeListener;
    private addTextSelectionListener;
    private shouldIgnoreElement;
    private isFormElement;
    private getElementProperties;
    private getFormProperties;
    private getInputProperties;
    private getElementType;
    private getElementText;
    private getElementsChain;
    private isSafeInputType;
}

export { AutocaptureTracker, Journium, JourniumClient, PageviewTracker, init };
