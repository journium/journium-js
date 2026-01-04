import { JourniumEvent, JourniumConfig, JourniumLocalOptions, OptionsResponse, generateUuidv7, getCurrentTimestamp, fetchRemoteOptions, mergeOptions, BrowserIdentityManager } from '@journium/core';

export class JourniumClient {
  private config!: JourniumConfig;
  private effectiveOptions!: JourniumLocalOptions;
  private queue: JourniumEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private initialized: boolean = false;
  private identityManager!: BrowserIdentityManager;
  private optionsStorageKey!: string;

  constructor(config: JourniumConfig) {
    // Validate required configuration
    if (!config.publishableKey) {
      console.error('Journium: publishableKey is required but not provided. SDK will not function.');
      return;
    }

    // Set default apiHost if not provided
    this.config = {
      ...config,
      apiHost: config.apiHost || 'https://events.journium.app'
    };

    // Generate storage key for options caching
    this.optionsStorageKey = `jrnm_${config.publishableKey}_options`;

    // Generate default values
    const defaultOptions: JourniumLocalOptions = {
      debug: false,
      flushAt: 20,
      flushInterval: 10000,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
    };

    // Initialize effective options with local options taking precedence over defaults
    this.effectiveOptions = { ...defaultOptions };
    if (this.config.options) {
      this.effectiveOptions = mergeOptions(defaultOptions, this.config.options);
    }

    // Initialize identity manager
    this.identityManager = new BrowserIdentityManager(this.effectiveOptions.sessionTimeout, this.config.publishableKey);

    // Initialize synchronously with cached config, fetch fresh config in background
    this.initializeSync();
    this.fetchRemoteOptionsAsync();
  }

  private loadCachedOptions(): any | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    
    try {
      const cached = window.localStorage.getItem(this.optionsStorageKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      if (this.effectiveOptions?.debug) {
        console.warn('Journium: Failed to load cached config:', error);
      }
      return null;
    }
  }

  private saveCachedOptions(options: any): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    
    try {
      window.localStorage.setItem(this.optionsStorageKey, JSON.stringify(options));
    } catch (error) {
      if (this.effectiveOptions?.debug) {
        console.warn('Journium: Failed to save config to cache:', error);
      }
    }
  }

  private initializeSync(): void {
    // Step 1: Load cached remote options from localStorage (synchronous)
    const cachedRemoteOptions = this.loadCachedOptions();
    
    // Step 2: If no local options provided, use cached remote options
    if (!this.config.options && cachedRemoteOptions) {
      this.effectiveOptions = cachedRemoteOptions;
      
      if (this.effectiveOptions.debug) {
        console.log('Journium: Using cached remote options:', cachedRemoteOptions);
      }
    }
    
    // Step 3: Mark as initialized immediately - no need to wait for remote fetch
    this.initialized = true;
    
    // Step 4: Start flush timer immediately
    if (this.effectiveOptions.flushInterval && this.effectiveOptions.flushInterval > 0) {
      this.startFlushTimer();
    }
    
    if (this.effectiveOptions.debug) {
      console.log('Journium: Client initialized with effective options:', this.effectiveOptions);
    }
  }

  private async fetchRemoteOptionsAsync(): Promise<void> {
    // Fetch fresh config in background
    if (this.config.publishableKey) {
      await this.fetchAndCacheRemoteOptions();
    }
  }

  private async fetchAndCacheRemoteOptions(): Promise<void> {
    try {
      if (this.effectiveOptions.debug) {
        console.log('Journium: Fetching remote configuration in background...');
      }
      
      const remoteOptionsResponse = await fetchRemoteOptions(
        this.config.apiHost!,
        this.config.publishableKey
      );
      
      if (remoteOptionsResponse && remoteOptionsResponse.success) {
        // Save remote config to cache for next session
        this.saveCachedOptions(remoteOptionsResponse.config);
        
        // Update effective options: local options (if provided) overrides fresh remote options
        if (!this.config.options) {
          // No local options provided, use fresh remote options
          this.effectiveOptions = remoteOptionsResponse.config;
        } else {
          // Local options provided, merge it over fresh remote options
          this.effectiveOptions = mergeOptions(remoteOptionsResponse.config, this.config.options);
        }
        
        // Update session timeout if provided in fresh effective options
        if (this.effectiveOptions.sessionTimeout) {
          this.identityManager.updateSessionTimeout(this.effectiveOptions.sessionTimeout);
        }
        
        if (this.effectiveOptions.debug) {
          console.log('Journium: Background remote options applied:', remoteOptionsResponse.config);
          console.log('Journium: New effective options:', this.effectiveOptions);
        }
      }
    } catch (error) {
      if (this.effectiveOptions.debug) {
        console.warn('Journium: Background remote options fetch failed:', error);
      }
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    // Use universal setInterval (works in both browser and Node.js)
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.effectiveOptions.flushInterval!);
  }

  private async sendEvents(events: JourniumEvent[]): Promise<void> {
    if (!events.length) return;

    try {
      const response = await fetch(`${this.config.apiHost}/v1/ingest_event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.publishableKey}`,
        },
        body: JSON.stringify({
          events,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (this.effectiveOptions.debug) {
        console.log('Journium: Successfully sent events', events);
      }
    } catch (error) {
      if (this.effectiveOptions.debug) {
        console.error('Journium: Failed to send events', error);
      }
      throw error;
    }
  }

  identify(distinctId: string, attributes: Record<string, any> = {}): void {
    // Don't identify if SDK is not properly configured
    if (!this.config || !this.config.publishableKey || !this.initialized) {
      if (this.effectiveOptions?.debug) {
        console.warn('Journium: identify() call rejected - SDK not ready');
      }
      return;
    }

    // Call identify on identity manager to get previous distinct ID
    const { previousDistinctId } = this.identityManager.identify(distinctId, attributes);

    // Track $identify event with previous distinct ID
    const identifyProperties = {
      ...attributes,
      $anon_distinct_id: previousDistinctId,
    };

    this.track('$identify', identifyProperties);

    if (this.effectiveOptions.debug) {
      console.log('Journium: User identified', { distinctId, attributes, previousDistinctId });
    }
  }

  reset(): void {
    // Don't reset if SDK is not properly configured
    if (!this.config || !this.config.publishableKey || !this.initialized) {
      if (this.effectiveOptions?.debug) {
        console.warn('Journium: reset() call rejected - SDK not ready');
      }
      return;
    }

    // Reset identity in identity manager
    this.identityManager.reset();

    if (this.effectiveOptions.debug) {
      console.log('Journium: User identity reset');
    }
  }

  track(event: string, properties: Record<string, any> = {}): void {
    // Don't track if SDK is not properly configured
    if (!this.config || !this.config.publishableKey || !this.initialized) {
      if (this.effectiveOptions?.debug) {
        console.warn('Journium: track() call rejected - SDK not ready');
      }
      return;
    }
    const identity = this.identityManager.getIdentity();
    const userAgentInfo = this.identityManager.getUserAgentInfo();
    
    // Create standardized event properties
    const eventProperties = {
      $device_id: identity?.$device_id,
      distinct_id: identity?.distinct_id,
      $session_id: identity?.$session_id,
      $is_identified: identity?.$user_state === 'identified',
      $current_url: typeof window !== 'undefined' ? window.location.href : '',
      $pathname: typeof window !== 'undefined' ? window.location.pathname : '',
      ...userAgentInfo,
      $lib_version: '0.1.0', // TODO: Get from package.json
      $platform: 'web',
      ...properties, // User-provided properties override defaults
    };

    const journiumEvent: JourniumEvent = {
      uuid: generateUuidv7(),
      ingestion_key: this.config.publishableKey,
      client_timestamp: getCurrentTimestamp(),
      event,
      properties: eventProperties,
    };

    this.queue.push(journiumEvent);

    if (this.effectiveOptions.debug) {
      console.log('Journium: Event tracked', journiumEvent);
    }

    if (this.queue.length >= this.effectiveOptions.flushAt!) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    // Don't flush if SDK is not properly configured
    if (!this.config || !this.config.publishableKey) {
      return;
    }
    
    if (this.queue.length === 0) return;

    const events = [...this.queue];
    this.queue = [];

    try {
      await this.sendEvents(events);
    } catch (error) {
      this.queue.unshift(...events);
      throw error;
    }
  }

  destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }

  getEffectiveOptions(): JourniumLocalOptions {
    return this.effectiveOptions;
  }
}