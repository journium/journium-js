import { JourniumEvent, JourniumConfig, JourniumServerOptions, JourniumLocalOptions, generateUuidv7, getCurrentTimestamp, fetchRemoteOptions, mergeOptions, BrowserIdentityManager, Logger } from '@journium/core';

export class JourniumClient {
  private config!: JourniumConfig;
  private effectiveOptions!: JourniumLocalOptions;
  private queue: JourniumEvent[] = [];
  private stagedEvents: JourniumEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private initializationComplete: boolean = false;
  private initializationFailed: boolean = false;
  private identityManager!: BrowserIdentityManager;
  private optionsStorageKey!: string;
  private optionsChangeCallbacks: Set<(options: JourniumLocalOptions) => void> = new Set();

  constructor(config: JourniumConfig) {
    // Validate required configuration
    if (!config.publishableKey || config.publishableKey.trim() === '') {
      // Reject initialization with clear error
      const errorMsg = 'Journium: publishableKey is required but not provided or is empty. SDK cannot be initialized.';
      Logger.setDebug(true);
      Logger.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Set default apiHost if not provided
    this.config = {
      ...config,
      apiHost: config.apiHost || 'https://events.journium.app'
    };

    // Generate storage key for options caching
    this.optionsStorageKey = `jrnm_${config.publishableKey}_options`;

    // Initialize with minimal defaults for identity manager
    const fallbackSessionTimeout = 30 * 60 * 1000; // 30 minutes
    this.effectiveOptions = {}; // Will be set after remote config

    // Initialize Logger with local debug setting or false
    Logger.setDebug(this.config.options?.debug ?? false);

    // Initialize identity manager with fallback timeout
    this.identityManager = new BrowserIdentityManager(this.config.options?.sessionTimeout ?? fallbackSessionTimeout, this.config.publishableKey);

    // Initialize asynchronously - wait for remote config first
    this.initializeAsync();
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

  private async initializeAsync(): Promise<void> {
    try {
      Logger.log('Journium: Starting initialization - fetching fresh remote config...');
      
      // Step 1: Try to fetch fresh remote config with timeout and retry
      const remoteOptions = await this.fetchRemoteOptionsWithRetry();
      
      if (remoteOptions) {
        // Step 2: Cache the fresh remote config
        this.saveCachedOptions(remoteOptions);
        
        // Step 3: Merge local options over remote config (local overrides remote)
        if (this.config.options) {
          this.effectiveOptions = mergeOptions(this.config.options, remoteOptions);
          Logger.log('Journium: Using fresh remote config merged with local options:', this.effectiveOptions);
        } else {
          this.effectiveOptions = remoteOptions;
          Logger.log('Journium: Using fresh remote config:', this.effectiveOptions);
        }
      } else {
        // Step 4: Fallback to cached config if fresh fetch failed
        /* const cachedRemoteOptions = this.loadCachedOptions();
        
        if (cachedRemoteOptions) {
          if (this.config.options) {
            this.effectiveOptions = mergeOptions(this.config.options, cachedRemoteOptions);
            Logger.log('Journium: Fresh config failed, using cached remote config merged with local options:', this.effectiveOptions);
          } else {
            this.effectiveOptions = cachedRemoteOptions;
            Logger.log('Journium: Fresh config failed, using cached remote config:', this.effectiveOptions);
          }
        } else {
          // Step 5: No remote config and no cached config - initialization fails
          Logger.error('Journium: Initialization failed - no remote config available and no cached config found');
          this.initializationFailed = true;
          this.initializationComplete = false;
          return;
        } */

      }
      
      // Step 6: Update identity manager session timeout if provided
      if (this.effectiveOptions.sessionTimeout) {
        this.identityManager.updateSessionTimeout(this.effectiveOptions.sessionTimeout);
      }
      
      // Step 7: Update Logger debug setting
      Logger.setDebug(this.effectiveOptions.debug ?? false);
      
      // Step 8: Mark initialization as complete
      this.initializationComplete = true;
      this.initializationFailed = false;
      
      // Step 9: Process any staged events
      this.processStagedEvents();
      
      // Step 10: Start flush timer
      if (this.effectiveOptions.flushInterval && this.effectiveOptions.flushInterval > 0) {
        this.startFlushTimer();
      }
      
      Logger.log('Journium: Initialization complete with options:', this.effectiveOptions);
      
      // Step 11: Notify callbacks about options
      this.notifyOptionsChange();
      
    } catch (error) {
      Logger.error('Journium: Initialization failed:', error);
      this.initializationFailed = true;
      this.initializationComplete = false;
    }
  }

  private async fetchRemoteOptionsWithRetry(): Promise<JourniumServerOptions | null> {
    const maxRetries = 2;
    const timeoutMs = 15000; // 15 seconds
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        Logger.log(`Journium: Fetching remote config (attempt ${attempt}/${maxRetries})...`);
        
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), timeoutMs);
        });
        
        // Race fetch against timeout
        const fetchPromise = fetchRemoteOptions(
          this.config.apiHost!,
          this.config.publishableKey
        );
        
        const remoteOptionsResponse = await Promise.race([fetchPromise, timeoutPromise]);
        
        if (remoteOptionsResponse && remoteOptionsResponse.status === 'success') {
          Logger.log('Journium: Successfully fetched fresh remote config:', remoteOptionsResponse.config);
          return remoteOptionsResponse.config || null;
        } else if(remoteOptionsResponse && remoteOptionsResponse.status === 'error' && remoteOptionsResponse.errorCode === 'J_ERR_TENANT_NOT_FOUND'){
          Logger.error('Journium: Invalid publishableKey is being used.');
          return null;
        }{
          throw new Error('Remote config fetch unsuccessful');
        }
        
      } catch (error) {
        Logger.warn(`Journium: Remote config fetch attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          Logger.warn('Journium: All remote config fetch attempts failed, falling back to cached config');
          return null;
        }
        
        // Wait 1 second before retry (except on last attempt)
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
    
    return null;
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

  private processStagedEvents(): void {
    if (this.stagedEvents.length === 0) return;
    
    Logger.log(`Journium: Processing ${this.stagedEvents.length} staged events`);
    
    // Move staged events to main queue, adding identity properties now
    const identity = this.identityManager.getIdentity();
    const userAgentInfo = this.identityManager.getUserAgentInfo();
    
    for (const stagedEvent of this.stagedEvents) {
      // Add identity properties that weren't available during staging
      const eventWithIdentity: JourniumEvent = {
        ...stagedEvent,
        properties: {
          $device_id: identity?.$device_id,
          distinct_id: identity?.distinct_id,
          $session_id: identity?.$session_id,
          $is_identified: identity?.$user_state === 'identified',
          $current_url: typeof window !== 'undefined' ? window.location.href : '',
          $pathname: typeof window !== 'undefined' ? window.location.pathname : '',
          ...userAgentInfo,
          $lib_version: '0.1.0', // TODO: Get from package.json
          $platform: 'web',
          ...stagedEvent.properties, // Original properties override system properties
        },
      };
      
      this.queue.push(eventWithIdentity);
    }
    
    // Clear staged events
    this.stagedEvents = [];
    
    Logger.log('Journium: Staged events processed and moved to main queue');
    
    // Check if we should flush immediately
    if (this.queue.length >= this.effectiveOptions.flushAt!) {
      // console.log('1 Journium: Flushing events...'+JSON.stringify(this.effectiveOptions));
      this.flush();
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    // Use universal setInterval (works in both browser and Node.js)
    this.flushTimer = setInterval(() => {
      // console.log('2 Journium: Flushing events...'+JSON.stringify(this.effectiveOptions));
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
    // Don't identify if initialization failed
    if (this.initializationFailed) {
      Logger.warn('Journium: identify() call rejected - initialization failed');
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
    // Don't reset if initialization failed
    if (this.initializationFailed) {
      Logger.warn('Journium: reset() call rejected - initialization failed');
      return;
    }

    // Reset identity in identity manager
    this.identityManager.reset();

    Logger.log('Journium: User identity reset');
  }

  track(event: string, properties: Record<string, unknown> = {}): void {
    // Create minimal event without identity properties (will be added later if staging)
    const journiumEvent: JourniumEvent = {
      uuid: generateUuidv7(),
      ingestion_key: this.config.publishableKey,
      client_timestamp: getCurrentTimestamp(),
      event,
      properties: { ...properties }, // Only user properties for now
    };

    // Stage events during initialization, add to queue after initialization
    if (!this.initializationComplete) {
      // If initialization failed, reject events
      if (this.initializationFailed) {
        Logger.warn('Journium: track() call rejected - initialization failed');
        return;
      }
      
      this.stagedEvents.push(journiumEvent);
      Logger.log('Journium: Event staged during initialization', journiumEvent);
      return;
    }

    // If initialization failed, reject events
    if (this.initializationFailed) {
      Logger.warn('Journium: track() call rejected - initialization failed');
      return;
    }

    // Add identity properties for immediate events (after initialization)
    const identity = this.identityManager.getIdentity();
    const userAgentInfo = this.identityManager.getUserAgentInfo();
    
    const eventWithIdentity: JourniumEvent = {
      ...journiumEvent,
      properties: {
        $device_id: identity?.$device_id,
        distinct_id: identity?.distinct_id,
        $session_id: identity?.$session_id,
        $is_identified: identity?.$user_state === 'identified',
        $current_url: typeof window !== 'undefined' ? window.location.href : '',
        $pathname: typeof window !== 'undefined' ? window.location.pathname : '',
        ...userAgentInfo,
        $lib_version: '0.1.0', // TODO: Get from package.json
        $platform: 'web',
        ...properties, // User-provided properties override system properties
      },
    };

    this.queue.push(eventWithIdentity);
    Logger.log('Journium: Event tracked', eventWithIdentity);

    // Only flush if we have effective options (after initialization)
    if (this.effectiveOptions.flushAt && this.queue.length >= this.effectiveOptions.flushAt) {
      // console.log('3 Journium: Flushing events...'+JSON.stringify(this.effectiveOptions));
      this.flush();
    }
  }

  async flush(): Promise<void> {
    // Don't flush if initialization failed
    if (this.initializationFailed) {
      Logger.warn('Journium: flush() call rejected - initialization failed');
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