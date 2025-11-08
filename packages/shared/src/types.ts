export interface JourniumEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
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

export interface JourniumConfig {
  apiKey: string;
  apiHost?: string;
  debug?: boolean;
  flushAt?: number;
  flushInterval?: number;
  autocapture?: boolean | AutocaptureConfig;
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