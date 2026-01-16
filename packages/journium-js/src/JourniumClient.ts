import { JourniumEvent, JourniumConfig, JourniumLocalOptions, generateUuidv7, getCurrentTimestamp, fetchRemoteOptions, mergeOptions, BrowserIdentityManager, Logger } from '@journium/core';

export class JourniumClient {
  private config!: JourniumConfig;
  private effectiveOptions!: JourniumLocalOptions;
  private queue: JourniumEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private initialized: boolean = false;
  private identityManager!: BrowserIdentityManager;
  private optionsStorageKey!: string;
  private disabled: boolean = false;
  private optionsChangeCallbacks: Set<(options: JourniumLocalOptions) => void> = new Set();

  constructor(config: JourniumConfig) {
    // Validate required configuration - put in disabled state if invalid
    if (!config.publishableKey || config.publishableKey.trim() === '') {
      this.disabled = true;
      Logger.setDebug(true);
      Logger.error('Journium: publishableKey is required but not provided or is empty. SDK will not function.');
      // Create minimal config to prevent crashes
      this.config = { publishableKey: '', apiHost: 'https://events.journium.app' };
      this.effectiveOptions = { debug: true };
      this.optionsStorageKey = 'jrnm_invalid_options';
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

    // Initialize Logger with debug setting
    Logger.setDebug(this.effectiveOptions.debug ?? false);

    // Initialize identity manager
    this.identityManager = new BrowserIdentityManager(this.effectiveOptions.sessionTimeout, this.config.publishableKey);

    // Initialize synchronously with cached config, fetch fresh config in background
    this.initializeSync();
    this.fetchRemoteOptionsAsync();
  }

  private loadCachedOptions(): JourniumLocalOptions | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    
    try {
      const cached = window.localStorage.getItem(this.optionsStorageKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      Logger.warn('Journium: Failed to load cached config:', error);
      return null;
    }
  }

  private saveCachedOptions(options: JourniumLocalOptions): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    
    try {
      window.localStorage.setItem(this.optionsStorageKey, JSON.stringify(options));
    } catch (error) {
      Logger.warn('Journium: Failed to save config to cache:', error);
    }
  }

  private initializeSync(): void {
    // Step 1: Load cached remote options from localStorage (synchronous)
    const cachedRemoteOptions = this.loadCachedOptions();
    
    // Step 2: Merge cached remote options with local options (if cached options exist)
    // Local options take precedence over cached remote options
    if (cachedRemoteOptions) {
      if (this.config.options) {
        // Merge: local options override cached remote options
        this.effectiveOptions = mergeOptions(cachedRemoteOptions, this.config.options);
        Logger.log('Journium: Using cached remote options merged with local options:', this.effectiveOptions);
      } else {
        // No local options, use cached remote options as-is
        this.effectiveOptions = cachedRemoteOptions;
        Logger.log('Journium: Using cached remote options:', cachedRemoteOptions);
      }
    }
    // If no cached options, effectiveOptions already has defaults merged with local options from constructor
    
    // Step 3: Mark as initialized immediately - no need to wait for remote fetch
    this.initialized = true;
    
    // Step 4: Start flush timer immediately
    if (this.effectiveOptions.flushInterval && this.effectiveOptions.flushInterval > 0) {
      this.startFlushTimer();
    }
    
    Logger.log('Journium: Client initialized with effective options:', this.effectiveOptions);
  }

  private async fetchRemoteOptionsAsync(): Promise<void> {
    // Fetch fresh config in background
    if (this.config.publishableKey) {
      await this.fetchAndCacheRemoteOptions();
    }
  }

  private async fetchAndCacheRemoteOptions(): Promise<void> {
    try {
      Logger.log('Journium: Fetching remote configuration in background...');
      
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
        
        Logger.log('Journium: Background remote options applied:', remoteOptionsResponse.config);
        Logger.log('Journium: New effective options:', this.effectiveOptions);
        
        // Update Logger debug setting with new options
        Logger.setDebug(this.effectiveOptions.debug ?? false);
        
        // Notify all registered callbacks about the options change
        this.notifyOptionsChange();
      }
    } catch (error) {
      Logger.warn('Journium: Background remote options fetch failed:', error);
    }
  }

  /**
   * Register a callback to be notified when effective options change (e.g., when remote options are fetched)
   */
  onOptionsChange(callback: (options: JourniumLocalOptions) => void): () => void {
    this.optionsChangeCallbacks.add(callback);
    // Return unsubscribe function
    return () => {
      this.optionsChangeCallbacks.delete(callback);
    };
  }

  private notifyOptionsChange(): void {
    this.optionsChangeCallbacks.forEach(callback => {
      try {
        callback(this.effectiveOptions);
      } catch (error) {
        Logger.warn('Journium: Error in options change callback:', error);
      }
    });
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

      Logger.log('Journium: Successfully sent events', events);
    } catch (error) {
      Logger.error('Journium: Failed to send events', error);
      throw error;
    }
  }

  identify(distinctId: string, attributes: Record<string, unknown> = {}): void {
    // Don't identify if SDK is not properly configured or disabled
    if (this.disabled || !this.config || !this.config.publishableKey || !this.initialized) {
      Logger.warn('Journium: identify() call rejected - SDK not ready or disabled');
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

    Logger.log('Journium: User identified', { distinctId, attributes, previousDistinctId });
  }

  reset(): void {
    // Don't reset if SDK is not properly configured or disabled
    if (this.disabled || !this.config || !this.config.publishableKey || !this.initialized) {
      Logger.warn('Journium: reset() call rejected - SDK not ready or disabled');
      return;
    }

    // Reset identity in identity manager
    this.identityManager.reset();

    Logger.log('Journium: User identity reset');
  }

  track(event: string, properties: Record<string, unknown> = {}): void {
    // Don't track if SDK is not properly configured or disabled
    if (this.disabled || !this.config || !this.config.publishableKey || !this.initialized) {
      Logger.warn('Journium: track() call rejected - SDK not ready or disabled');
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

    Logger.log('Journium: Event tracked', journiumEvent);

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