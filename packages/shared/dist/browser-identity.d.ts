export interface BrowserIdentity {
    distinct_id: string;
    $device_id: string;
    $session_id: string;
    session_timestamp: number;
}
export interface UserAgentInfo {
    $raw_user_agent: string;
    $browser: string;
    $os: string;
    $device_type: string;
}
export declare class BrowserIdentityManager {
    private identity;
    private sessionTimeout;
    constructor(sessionTimeout?: number);
    private loadOrCreateIdentity;
    private saveIdentity;
    private isBrowser;
    getIdentity(): BrowserIdentity | null;
    updateSessionTimeout(timeoutMs: number): void;
    refreshSession(): void;
    getUserAgentInfo(): UserAgentInfo;
    private parseBrowser;
    private parseOS;
    private parseDeviceType;
}
//# sourceMappingURL=browser-identity.d.ts.map