export interface JourniumEvent {
  uuid: string;
  ingestion_key: string;
  client_timestamp: string;
  event: string;
  properties: Record<string, unknown>;
}

export interface AutocaptureOptions {
  captureClicks?: boolean;
  captureFormSubmits?: boolean;
  captureFormChanges?: boolean;
  captureTextSelection?: boolean;
  ignoreClasses?: string[];
  ignoreElements?: string[];
  captureContentText?: boolean;
}

export interface JourniumServerOptions {
  debug?: boolean;
  flushAt?: number;
  flushInterval?: number;
  autocapture?: boolean | AutocaptureOptions;
  autoTrackPageviews?: boolean;
  sessionTimeout?: number;
  [key: string]: unknown;
}

export interface ServerOptionsResponse {
  success: boolean;
  config: JourniumServerOptions;
  timestamp: string;
}

export interface JourniumLocalOptions {
  debug?: boolean;
  flushAt?: number;
  flushInterval?: number;
  autocapture?: boolean | AutocaptureOptions;
  autoTrackPageviews?: boolean;
  sessionTimeout?: number; // in milliseconds, defaults to 30 minutes
  [key: string]: unknown;
}

export interface JourniumConfig {
  publishableKey: string;
  apiHost?: string;
  options?: JourniumLocalOptions;
}

export interface PageviewProperties {
  $current_url?: string;
  $host?: string;
  $pathname?: string;
  $search?: string;
  $title?: string;
  $referrer?: string;
  [key: string]: unknown;
}