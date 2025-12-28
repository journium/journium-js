import { JourniumEvent, JourniumConfig, ConfigResponse, generateUuidv7, getCurrentTimestamp, fetchRemoteConfig, mergeConfigs, BrowserIdentityManager } from '@journium/core';

export class JourniumClient {
  private config!: JourniumConfig;
  private queue: JourniumEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private initialized: boolean = false;
  private identityManager!: BrowserIdentityManager;
  private configStorageKey!: string;

  constructor(config: JourniumConfig) {
    // Validate required configuration
    if (!config.token) {
      console.error('Journium: token is required but not provided. SDK will not function.');
      return;
    }
    
    if (!config.apiHost) {
      console.error('Journium: apiHost is required but not provided. SDK will not function.');
      return;
    }

    this.config = config;

    // Generate storage key for config caching
    this.configStorageKey = `jrnm_${config.token}_config`;

    // Initialize identity manager
    this.identityManager = new BrowserIdentityManager(this.config.sessionTimeout, this.config.token);

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
      if (this.config.debug) {
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
      if (this.config.debug) {
        console.warn('Journium: Failed to save config to cache:', error);
      }
    }
  }

  private initializeSync(): void {
    // Step 1: Load cached config from localStorage (synchronous)
    const cachedConfig = this.loadCachedConfig();
    
    // Step 2: Apply cached config immediately, or use defaults
    const localOnlyConfig = {
      apiHost: this.config.apiHost,
      token: this.config.token,
      configEndpoint: this.config.configEndpoint,
    };
    
    if (cachedConfig) {
      // Use cached remote config
      this.config = {
        ...localOnlyConfig,
        ...cachedConfig,
      };
      
      if (this.config.debug) {
        console.log('Journium: Using cached configuration:', cachedConfig);
      }
    } else {
      // Use defaults for first-time initialization
      this.config = {
        ...this.config,
        debug: this.config.debug ?? false,
        flushAt: this.config.flushAt ?? 20,
        flushInterval: this.config.flushInterval ?? 10000,
      };
      
      if (this.config.debug) {
        console.log('Journium: No cached config found, using defaults');
      }
    }
    
    // Update session timeout from config
    if (this.config.sessionTimeout) {
      this.identityManager.updateSessionTimeout(this.config.sessionTimeout);
    }
    
    // Step 3: Mark as initialized immediately - no need to wait for remote fetch
    this.initialized = true;
    
    // Step 4: Start flush timer immediately
    if (this.config.flushInterval && this.config.flushInterval > 0) {
      this.startFlushTimer();
    }
    
    if (this.config.debug) {
      console.log('Journium: Client initialized and ready to track events');
    }
  }

  private async fetchRemoteConfigAsync(): Promise<void> {
    // Fetch fresh config in background
    if (this.config.token) {
      await this.fetchAndCacheRemoteConfig();
    }
  }

  private async fetchAndCacheRemoteConfig(): Promise<void> {
    try {
      if (this.config.debug) {
        console.log('Journium: Fetching remote configuration in background...');
      }
      
      const remoteConfigResponse = await fetchRemoteConfig(
        this.config.apiHost,
        this.config.token
      );
      
      if (remoteConfigResponse && remoteConfigResponse.success) {
        // Save to cache for next session
        this.saveCachedConfig(remoteConfigResponse.config);
        
        // Apply fresh config to current session
        const localOnlyConfig = {
          apiHost: this.config.apiHost,
          token: this.config.token,
          configEndpoint: this.config.configEndpoint,
        };
        
        this.config = {
          ...localOnlyConfig,
          ...remoteConfigResponse.config,
        };
        
        // Update session timeout if provided in fresh config
        if (remoteConfigResponse.config.sessionTimeout) {
          this.identityManager.updateSessionTimeout(remoteConfigResponse.config.sessionTimeout);
        }
        
        if (this.config.debug) {
          console.log('Journium: Background remote configuration applied:', remoteConfigResponse.config);
        }
      }
    } catch (error) {
      if (this.config.debug) {
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
    }, this.config.flushInterval!);
  }

  private async sendEvents(events: JourniumEvent[]): Promise<void> {
    if (!events.length) return;

    try {
      const response = await fetch(`${this.config.apiHost}/v1/ingest_event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.token}`,
        },
        body: JSON.stringify({
          events,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (this.config.debug) {
        console.log('Journium: Successfully sent events', events);
      }
    } catch (error) {
      if (this.config.debug) {
        console.error('Journium: Failed to send events', error);
      }
      throw error;
    }
  }

  identify(distinctId: string, attributes: Record<string, any> = {}): void {
    // Don't identify if SDK is not properly configured
    if (!this.config || !this.config.token || !this.config.apiHost || !this.initialized) {
      if (this.config?.debug) {
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

    if (this.config.debug) {
      console.log('Journium: User identified', { distinctId, attributes, previousDistinctId });
    }
  }

  reset(): void {
    // Don't reset if SDK is not properly configured
    if (!this.config || !this.config.token || !this.config.apiHost || !this.initialized) {
      if (this.config?.debug) {
        console.warn('Journium: reset() call rejected - SDK not ready');
      }
      return;
    }

    // Reset identity in identity manager
    this.identityManager.reset();

    if (this.config.debug) {
      console.log('Journium: User identity reset');
    }
  }

  track(event: string, properties: Record<string, any> = {}): void {
    // Don't track if SDK is not properly configured
    if (!this.config || !this.config.token || !this.config.apiHost || !this.initialized) {
      if (this.config?.debug) {
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
      ingestion_key: this.config.token,
      client_timestamp: getCurrentTimestamp(),
      event,
      properties: eventProperties,
    };

    this.queue.push(journiumEvent);

    if (this.config.debug) {
      console.log('Journium: Event tracked', journiumEvent);
    }

    if (this.queue.length >= this.config.flushAt!) {
      this.flush();
    }
  }

  async flush(): Promise<void> {
    // Don't flush if SDK is not properly configured
    if (!this.config || !this.config.token || !this.config.apiHost) {
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