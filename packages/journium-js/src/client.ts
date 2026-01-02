import { JourniumEvent, JourniumConfig, JourniumLocalConfig, ConfigResponse, generateUuidv7, getCurrentTimestamp, fetchRemoteConfig, mergeConfigs, BrowserIdentityManager } from '@journium/core';

export class JourniumClient {
  private config!: JourniumConfig;
  private effectiveConfig!: JourniumLocalConfig;
  private queue: JourniumEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private initialized: boolean = false;
  private identityManager!: BrowserIdentityManager;
  private configStorageKey!: string;

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

    // Generate storage key for config caching
    this.configStorageKey = `jrnm_${config.publishableKey}_config`;

    // Generate default values
    const defaultConfig: JourniumLocalConfig = {
      debug: false,
      flushAt: 20,
      flushInterval: 10000,
      sessionTimeout: 30 * 60 * 1000, // 30 minutes
    };

    // Initialize effective config with local config taking precedence over defaults
    this.effectiveConfig = { ...defaultConfig };
    if (this.config.config) {
      this.effectiveConfig = mergeConfigs(this.config.config, defaultConfig);
    }

    // Initialize identity manager
    this.identityManager = new BrowserIdentityManager(this.effectiveConfig.sessionTimeout, this.config.publishableKey);

    // Initialize synchronously with cached config, fetch fresh config in background
    this.initializeSync();
    this.fetchRemoteConfigAsync();
  }

  private loadCachedConfig(): any | null {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    
    try {
      const cached = window.localStorage.getItem(this.configStorageKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      if (this.effectiveConfig?.debug) {
        console.warn('Journium: Failed to load cached config:', error);
      }
      return null;
    }
  }

  private saveCachedConfig(config: any): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    
    try {
      window.localStorage.setItem(this.configStorageKey, JSON.stringify(config));
    } catch (error) {
      if (this.effectiveConfig?.debug) {
        console.warn('Journium: Failed to save config to cache:', error);
      }
    }
  }

  private initializeSync(): void {
    // Step 1: Load cached remote config from localStorage (synchronous)
    const cachedRemoteConfig = this.loadCachedConfig();
    
    // Step 2: If no local config provided, use cached remote config
    if (!this.config.config && cachedRemoteConfig) {
      this.effectiveConfig = mergeConfigs(undefined, cachedRemoteConfig);
      
      if (this.effectiveConfig.debug) {
        console.log('Journium: Using cached remote configuration:', cachedRemoteConfig);
      }
    }
    
    // Step 3: Mark as initialized immediately - no need to wait for remote fetch
    this.initialized = true;
    
    // Step 4: Start flush timer immediately
    if (this.effectiveConfig.flushInterval && this.effectiveConfig.flushInterval > 0) {
      this.startFlushTimer();
    }
    
    if (this.effectiveConfig.debug) {
      console.log('Journium: Client initialized with effective config:', this.effectiveConfig);
    }
  }

  private async fetchRemoteConfigAsync(): Promise<void> {
    // Fetch fresh config in background
    if (this.config.publishableKey) {
      await this.fetchAndCacheRemoteConfig();
    }
  }

  private async fetchAndCacheRemoteConfig(): Promise<void> {
    try {
      if (this.effectiveConfig.debug) {
        console.log('Journium: Fetching remote configuration in background...');
      }
      
      const remoteConfigResponse = await fetchRemoteConfig(
        this.config.apiHost!,
        this.config.publishableKey
      );
      
      if (remoteConfigResponse && remoteConfigResponse.success) {
        // Save remote config to cache for next session
        this.saveCachedConfig(remoteConfigResponse.config);
        
        // Update effective config: local config (if provided) overrides fresh remote config
        if (!this.config.config) {
          // No local config provided, use fresh remote config
          this.effectiveConfig = mergeConfigs(undefined, remoteConfigResponse.config);
        } else {
          // Local config provided, merge it over fresh remote config
          this.effectiveConfig = mergeConfigs(this.config.config, remoteConfigResponse.config);
        }
        
        // Update session timeout if provided in fresh effective config
        if (this.effectiveConfig.sessionTimeout) {
          this.identityManager.updateSessionTimeout(this.effectiveConfig.sessionTimeout);
        }
        
        if (this.effectiveConfig.debug) {
          console.log('Journium: Background remote configuration applied:', remoteConfigResponse.config);
          console.log('Journium: New effective configuration:', this.effectiveConfig);
        }
      }
    } catch (error) {
      if (this.effectiveConfig.debug) {
        console.warn('Journium: Background remote config fetch failed:', error);
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
    }, this.effectiveConfig.flushInterval!);
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

      if (this.effectiveConfig.debug) {
        console.log('Journium: Successfully sent events', events);
      }
    } catch (error) {
      if (this.effectiveConfig.debug) {
        console.error('Journium: Failed to send events', error);
      }
      throw error;
    }
  }

  identify(distinctId: string, attributes: Record<string, any> = {}): void {
    // Don't identify if SDK is not properly configured
    if (!this.config || !this.config.publishableKey || !this.initialized) {
      if (this.effectiveConfig?.debug) {
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

    if (this.effectiveConfig.debug) {
      console.log('Journium: User identified', { distinctId, attributes, previousDistinctId });
    }
  }

  reset(): void {
    // Don't reset if SDK is not properly configured
    if (!this.config || !this.config.publishableKey || !this.initialized) {
      if (this.effectiveConfig?.debug) {
        console.warn('Journium: reset() call rejected - SDK not ready');
      }
      return;
    }

    // Reset identity in identity manager
    this.identityManager.reset();

    if (this.effectiveConfig.debug) {
      console.log('Journium: User identity reset');
    }
  }

  track(event: string, properties: Record<string, any> = {}): void {
    // Don't track if SDK is not properly configured
    if (!this.config || !this.config.publishableKey || !this.initialized) {
      if (this.effectiveConfig?.debug) {
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

    if (this.effectiveConfig.debug) {
      console.log('Journium: Event tracked', journiumEvent);
    }

    if (this.queue.length >= this.effectiveConfig.flushAt!) {
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
}