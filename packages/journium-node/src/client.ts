import { JourniumEvent, JourniumConfig, JourniumLocalOptions, ServerOptionsResponse, generateId, generateUuidv7, getCurrentTimestamp, fetchRemoteOptions, mergeOptions } from '@journium/core';
import fetch from 'node-fetch';

export class JourniumNodeClient {
  private config!: JourniumConfig;
  private effectiveOptions!: JourniumLocalOptions;
  private queue: JourniumEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private initialized: boolean = false;

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
      this.effectiveOptions = mergeOptions(this.config.options, defaultOptions);
    }

    // Initialize asynchronously to fetch remote config
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      if (this.config.publishableKey) {
        if (this.effectiveOptions.debug) {
          console.log('Journium: Fetching remote configuration...');
        }
        
        const remoteOptionsResponse = await fetchRemoteOptions(
          this.config.apiHost!,
          this.config.publishableKey,
          fetch as any
        );
        
        if (remoteOptionsResponse && remoteOptionsResponse.success) {
          // Update effective options: local options (if provided) overrides remote options
          if (!this.config.options) {
            // No local options provided, use remote options
            this.effectiveOptions = mergeOptions(undefined, remoteOptionsResponse.config);
          } else {
            // Local options provided, merge it over remote options
            this.effectiveOptions = mergeOptions(this.config.options, remoteOptionsResponse.config);
          }
          
          if (this.effectiveOptions.debug) {
            console.log('Journium: Remote options applied:', remoteOptionsResponse.config);
            console.log('Journium: Effective options:', this.effectiveOptions);
          }
        }
      }
      
      this.initialized = true;
      
      // Start flush timer after configuration is finalized
      if (this.effectiveOptions.flushInterval && this.effectiveOptions.flushInterval > 0) {
        this.startFlushTimer();
      }
      
      if (this.effectiveOptions.debug) {
        console.log('Journium: Node client initialized with effective options:', this.effectiveOptions);
      }
    } catch (error) {
      console.warn('Journium: Failed to fetch remote options, using local/default options:', error);
      
      this.initialized = true;
      
      // Start with effective config (already set in constructor)
      if (this.effectiveOptions.flushInterval && this.effectiveOptions.flushInterval > 0) {
        this.startFlushTimer();
      }
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush().catch(error => {
        if (this.effectiveOptions.debug) {
          console.error('Journium: Auto-flush failed', error);
        }
      });
    }, this.effectiveOptions.flushInterval);
  }

  private async sendEvents(events: JourniumEvent[]): Promise<void> {
    if (!events.length) return;

    try {
      const response = await fetch(`${this.config.apiHost}/capture`, {
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

  track(event: string, properties: Record<string, any> = {}, distinctId?: string): void {
    // Don't track if SDK is not properly configured
    if (!this.config || !this.config.publishableKey) {
      return;
    }
    const eventProperties = {
      distinct_id: distinctId || generateId(),
      ...properties,
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
      this.flush().catch(error => {
        if (this.effectiveOptions.debug) {
          console.error('Journium: Auto-flush failed', error);
        }
      });
    }
  }

  trackPageview(url: string, properties: Record<string, any> = {}, distinctId?: string): void {
    // Note: This manual pageview method should always work regardless of autoTrackPageviews setting
    // autoTrackPageviews only controls automatic pageview tracking, not explicit calls like this one

    const urlObj = new URL(url);
    
    const pageviewProperties = {
      $current_url: url,
      $host: urlObj.host,
      $pathname: urlObj.pathname,
      $search: urlObj.search,
      ...properties,
    };

    this.track('$pageview', pageviewProperties, distinctId);
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

  async destroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }
}