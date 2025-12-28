export interface JourniumEvent {
  uuid: string;
  ingestion_key: string;
  client_timestamp: string;
  event: string;
  properties: Record<string, any>;
  distinct_id?: string;
  session_id?: string;
}

export interface AutocaptureConfig {
  captureClicks?: boolean;
  captureFormSubmits?: boolean;
  captureFormChanges?: boolean;
  captureTextSelection?: boolean;
  ignoreClasses?: string[];
  ignoreElements?: string[];
  captureContentText?: boolean;
}

export interface RemoteConfig {
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

export interface ConfigResponse {
  success: boolean;
  config: RemoteConfig;
  timestamp: string;
}

export interface JourniumConfig {
  token: string;
  apiHost: string;
  debug?: boolean;
  flushAt?: number;
  flushInterval?: number;
  autocapture?: boolean | AutocaptureConfig;
  sessionTimeout?: number; // in milliseconds, defaults to 30 minutes
}

export interface PageviewProperties {
  $current_url?: string;
  $host?: string;
  $pathname?: string;
  $search?: string;
  $title?: string;
  $referrer?: string;
  [key: string]: any;
}