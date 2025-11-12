import { JourniumConfig } from '@journium/shared';
export declare class JourniumNodeClient {
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
//# sourceMappingURL=client.d.ts.map