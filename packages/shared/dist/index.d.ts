interface JourniumEvent {
    uuid: string;
    ingestion_key: string;
    client_timestamp: string;
    event: string;
    properties: Record<string, any>;
    distinct_id?: string;
    session_id?: string;
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
interface RemoteConfig {
    debug?: boolean;
    flushAt?: number;
    flushInterval?: number;
    autocapture?: boolean | AutocaptureConfig;
    sessionTimeout?: number;
    sampling?: {
        enabled?: boolean;
        rate?: number;
    };
    features?: {
        enableGeolocation?: boolean;
        enableSessionRecording?: boolean;
        enablePerformanceTracking?: boolean;
    };
}
interface ConfigResponse {
    success: boolean;
    config: RemoteConfig;
    timestamp: string;
}
interface JourniumConfig {
    applicationKey: string;
    apiHost?: string;
    debug?: boolean;
    flushAt?: number;
    flushInterval?: number;
    autocapture?: boolean | AutocaptureConfig;
    configEndpoint?: string;
    sessionTimeout?: number;
}
interface PageviewProperties {
    $current_url?: string;
    $host?: string;
    $pathname?: string;
    $search?: string;
    $title?: string;
    $referrer?: string;
    [key: string]: any;
}

declare const generateId: () => string;
declare const generateUuidv7: () => string;
declare const getCurrentTimestamp: () => string;
declare const getCurrentUrl: () => string;
declare const getPageTitle: () => string;
declare const getReferrer: () => string;
declare const isBrowser: () => boolean;
declare const isNode: () => boolean;
declare const fetchRemoteConfig: (apiHost: string, applicationKey: string, configEndpoint?: string, fetchFn?: any) => Promise<any>;
declare const mergeConfigs: (localConfig: any, remoteConfig: any) => any;

interface BrowserIdentity {
    distinct_id: string;
    $device_id: string;
    $session_id: string;
    session_timestamp: number;
}
interface UserAgentInfo {
    $raw_user_agent: string;
    $browser: string;
    $os: string;
    $device_type: string;
}
declare class BrowserIdentityManager {
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

export { AutocaptureConfig, BrowserIdentity, BrowserIdentityManager, ConfigResponse, JourniumConfig, JourniumEvent, PageviewProperties, RemoteConfig, UserAgentInfo, fetchRemoteConfig, generateId, generateUuidv7, getCurrentTimestamp, getCurrentUrl, getPageTitle, getReferrer, isBrowser, isNode, mergeConfigs };
