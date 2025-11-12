import { JourniumConfig } from '@journium/shared';
export * from '@journium/shared';

declare class JourniumNodeClient {
    private config;
    private queue;
    private flushTimer;
    private initialized;
    constructor(config: JourniumConfig);
    private initialize;
    private startFlushTimer;
    private sendEvents;
    track(event: string, properties?: Record<string, any>, distinctId?: string): void;
    trackPageview(url: string, properties?: Record<string, any>, distinctId?: string): void;
    flush(): Promise<void>;
    destroy(): Promise<void>;
}

declare const init: (config: any) => JourniumNodeClient;
declare const _default: {
    init: (config: any) => JourniumNodeClient;
    JourniumNodeClient: typeof JourniumNodeClient;
};

export { JourniumNodeClient, _default as default, init };
