export interface JourniumEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: number;
  distinct_id?: string;
  session_id?: string;
}

export interface JourniumConfig {
  apiKey: string;
  apiHost?: string;
  debug?: boolean;
  flushAt?: number;
  flushInterval?: number;
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