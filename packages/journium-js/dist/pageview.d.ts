import { JourniumClient } from './client';
export declare class PageviewTracker {
    private client;
    private lastUrl;
    constructor(client: JourniumClient);
    capturePageview(customProperties?: Record<string, any>): void;
    startAutoCapture(): void;
    stopAutoCapture(): void;
}
//# sourceMappingURL=pageview.d.ts.map