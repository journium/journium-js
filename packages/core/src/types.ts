export interface JourniumEvent {
  uuid: string;
  ingestion_key: string;
  client_timestamp: string;
  event: string;
  properties: Record<string, unknown>;
}

export interface AutoTrackPageviewsOptions {
  trackSpaPageviews?: boolean;    // default: true — controls pushState/replaceState/popstate patching
  trackInitialPageview?: boolean; // default: true — controls whether the initial pageview is captured on load
}

export interface AutocaptureOptions {
  captureClicks?: boolean;
  captureFormSubmits?: boolean;
  captureFormChanges?: boolean;
  captureTextSelection?: boolean;
  ignoreClasses?: string[];
  ignoreElements?: string[];
  captureContentText?: boolean;
  dataAttributePrefixes?: string[];  // prefixes for data-* attrs to capture (default: ['jrnm-'])
  dataAttributeNames?: string[];     // exact data-* attr names to capture (default: ['data-testid', 'data-track'])
}

export interface JourniumServerOptions {
  debug?: boolean;
  flushAt?: number;
  flushInterval?: number;
  autocapture?: boolean | AutocaptureOptions;
  autoTrackPageviews?: boolean | AutoTrackPageviewsOptions;
  sessionTimeout?: number;
  ingestionPaused?: boolean;
  [key: string]: unknown;
}

export interface ServerOptionsResponse {
  config?: JourniumServerOptions;
  errorCode?: string;
  message?: string;
  status: 'success' | 'error';
}

export interface JourniumLocalOptions {
  debug?: boolean;
  flushAt?: number;
  flushInterval?: number;
  autocapture?: boolean | AutocaptureOptions;
  autoTrackPageviews?: boolean | AutoTrackPageviewsOptions;
  sessionTimeout?: number; // in milliseconds, defaults to 30 minutes
  /** @internal Used by framework SDKs (Angular, Next.js) to disable built-in pageview
   *  tracking without modifying autoTrackPageviews, so remote config can still override it. */
  _frameworkHandlesPageviews?: boolean;
  /** @internal SDK identifier in "package@version" format, e.g. "@journium/nextjs@1.2.0".
   *  Set automatically by each SDK package. */
  _sdkVersion?: string;
  [key: string]: unknown;
}

export interface JourniumConfig {
  publishableKey: string;
  apiHost?: string;
  options?: JourniumLocalOptions;
}

/** Page context fields shared by $pageview and $autocapture events. */
export interface PageContextProperties {
  $current_url?: string;
  $host?: string;
  $pathname?: string;
  $search?: string;
  $page_title?: string;
  $referrer?: string;
  [key: string]: unknown;
}

export interface PageviewProperties extends PageContextProperties {}

/** Base properties shared by all autocapture event types. */
export interface AutocaptureBaseProperties extends PageContextProperties {
  $event_type: 'click' | 'submit' | 'change' | 'text_selection';
  $element_tag?: string;
  $element_type?: string;
  $element_id?: string;
  $element_classes?: string[];
  $element_semantic_classes?: string[];
  $element_name?: string;
  $element_role?: string;
  $element_aria_label?: string;
  $element_data_testid?: string;
  $element_data_track?: string;
  $element_href?: string;
  $element_text?: string;
  $element_position?: { x: number; y: number; width: number; height: number };
  $parent_tag?: string;
  $parent_id?: string;
  $elements_chain?: string;
  $elements_chain_href?: string;
  $elements_chain_elements?: string[];
  $elements_chain_texts?: string[];
  $elements_chain_ids?: string[];
}