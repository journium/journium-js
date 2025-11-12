import { JourniumConfig } from '@journium/shared';
export declare class JourniumClient {
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
//# sourceMappingURL=client.d.ts.map