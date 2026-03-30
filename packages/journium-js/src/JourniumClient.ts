import { JourniumEvent, JourniumConfig, JourniumServerOptions, JourniumLocalOptions, generateUuidv7, getCurrentTimestamp, fetchRemoteOptions, mergeOptions, BrowserIdentityManager, Logger } from '@journium/core';

export class JourniumClient {
  private static readonly REMOTE_OPTIONS_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

  private config!: JourniumConfig;
  private effectiveOptions!: JourniumLocalOptions;
  private queue: JourniumEvent[] = [];
  private stagedEvents: JourniumEvent[] = [];
  private flushTimer: ReturnType<typeof setInterval> | null = null;
  private remoteOptionsRefreshTimer: ReturnType<typeof setInterval> | null = null;
  private isRefreshing: boolean = false;
  private lastRemoteOptions: JourniumServerOptions | null = null;
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

      const remoteOptions = await this.fetchRemoteOptionsWithRetry();

      if (!remoteOptions) {
        Logger.error('Journium: Initialization failed - no remote config available');
        this.initializationFailed = true;
        return;
      }

      this.applyRemoteOptions(remoteOptions);
      Logger.log('Journium: Effective options after init:', this.effectiveOptions);

      this.initializationComplete = true;
      this.initializationFailed = false;

      this.processStagedEvents();

      if (this.effectiveOptions.flushInterval && this.effectiveOptions.flushInterval > 0) {
        this.startFlushTimer();
      }

      this.startRemoteOptionsRefreshTimer();

      Logger.log('Journium: Initialization complete');
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

    if (this.ingestionPaused) {
      Logger.warn(`Journium: Ingestion is paused — discarding ${this.stagedEvents.length} staged events`);
      this.stagedEvents = [];
      return;
    }

    Logger.log(`Journium: Processing ${this.stagedEvents.length} staged events`);

    for (const stagedEvent of this.stagedEvents) {
      this.queue.push({
        ...stagedEvent,
        properties: this.buildIdentityProperties(stagedEvent.properties),
      });
    }

    this.stagedEvents = [];

    Logger.log('Journium: Staged events processed and moved to main queue');

    if (this.queue.length >= this.effectiveOptions.flushAt!) {
      this.flush();
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.effectiveOptions.flushInterval!);
  }

  private startRemoteOptionsRefreshTimer(): void {
    // Clear any existing timer to prevent duplicate intervals
    if (this.remoteOptionsRefreshTimer) {
      clearInterval(this.remoteOptionsRefreshTimer);
      this.remoteOptionsRefreshTimer = null;
    }

    this.remoteOptionsRefreshTimer = setInterval(() => {
      this.refreshRemoteOptions();
    }, JourniumClient.REMOTE_OPTIONS_REFRESH_INTERVAL);

    Logger.log(`Journium: Scheduling remote options refresh every ${JourniumClient.REMOTE_OPTIONS_REFRESH_INTERVAL}ms`);
  }

  private async refreshRemoteOptions(): Promise<void> {
    if (this.isRefreshing) {
      Logger.log('Journium: Remote options refresh already in progress, skipping');
      return;
    }

    this.isRefreshing = true;
    Logger.log('Journium: Periodic remote options refresh triggered');

    try {
      const remoteOptions = await this.fetchRemoteOptionsWithRetry();

      if (!remoteOptions) {
        Logger.warn('Journium: Periodic remote options refresh failed, keeping current options');
        return;
      }

      const prevRemoteSnapshot = JSON.stringify(this.lastRemoteOptions);
      const prevFlushInterval = this.effectiveOptions.flushInterval;
      this.applyRemoteOptions(remoteOptions);

      if (prevRemoteSnapshot === JSON.stringify(this.lastRemoteOptions)) {
        Logger.log('Journium: Remote options unchanged after refresh, no update needed');
        return;
      }

      Logger.log('Journium: Remote options updated after refresh:', this.effectiveOptions);

      if (this.effectiveOptions.flushInterval !== prevFlushInterval) {
        if (this.effectiveOptions.flushInterval && this.effectiveOptions.flushInterval > 0) {
          this.startFlushTimer();
        } else if (this.flushTimer) {
          clearInterval(this.flushTimer);
          this.flushTimer = null;
        }
      }

      this.notifyOptionsChange();
    } catch (error) {
      Logger.error('Journium: Periodic remote options refresh encountered an error:', error);
    } finally {
      this.isRefreshing = false;
    }
  }

  private applyRemoteOptions(remoteOptions: JourniumServerOptions): void {
    this.lastRemoteOptions = remoteOptions;
    this.effectiveOptions = this.config.options
      ? mergeOptions(this.config.options, remoteOptions)
      : remoteOptions;
    this.saveCachedOptions(remoteOptions);
    if (this.effectiveOptions.sessionTimeout) {
      this.identityManager.updateSessionTimeout(this.effectiveOptions.sessionTimeout);
    }
    Logger.setDebug(this.effectiveOptions.debug ?? false);
  }

  private buildIdentityProperties(userProperties: Record<string, unknown> = {}): Record<string, unknown> {
    const identity = this.identityManager.getIdentity();
    const userAgentInfo = this.identityManager.getUserAgentInfo();
    return {
      $device_id: identity?.$device_id,
      distinct_id: identity?.distinct_id,
      $session_id: identity?.$session_id,
      $is_identified: identity?.$user_state === 'identified',
      $current_url: typeof window !== 'undefined' ? window.location.href : '',
      $pathname: typeof window !== 'undefined' ? window.location.pathname : '',
      ...userAgentInfo,
      $sdk_version: this.config.options?._sdkVersion ?? 'unknown',
      $platform: 'web',
      ...userProperties,
    };
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

    if (!this.initializationComplete) {
      if (this.initializationFailed) {
        Logger.warn('Journium: track() call rejected - initialization failed');
        return;
      }
      this.stagedEvents.push(journiumEvent);
      Logger.log('Journium: Event staged during initialization', journiumEvent);
      return;
    }

    if (this.ingestionPaused) {
      Logger.warn('Journium: Ingestion is paused — event dropped:', journiumEvent.event);
      return;
    }

    const eventWithIdentity: JourniumEvent = {
      ...journiumEvent,
      properties: this.buildIdentityProperties(properties),
    };

    this.queue.push(eventWithIdentity);
    Logger.log('Journium: Event tracked', eventWithIdentity);

    if (this.effectiveOptions.flushAt && this.queue.length >= this.effectiveOptions.flushAt) {
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
    if (this.remoteOptionsRefreshTimer) {
      clearInterval(this.remoteOptionsRefreshTimer);
      this.remoteOptionsRefreshTimer = null;
    }
    this.flush();
  }

  getEffectiveOptions(): JourniumLocalOptions {
    return this.effectiveOptions;
  }

  private get ingestionPaused(): boolean {
    return (this.effectiveOptions['ingestionPaused'] as boolean | undefined) === true;
  }
}