import { JourniumEvent, JourniumConfig, JourniumLocalConfig, ConfigResponse, generateId, generateUuidv7, getCurrentTimestamp, fetchRemoteConfig, mergeConfigs } from '@journium/core';
import fetch from 'node-fetch';

export class JourniumNodeClient {
  private config!: JourniumConfig;
  private effectiveConfig!: JourniumLocalConfig;
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

    // Initialize asynchronously to fetch remote config
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      if (this.config.publishableKey) {
        if (this.effectiveConfig.debug) {
          console.log('Journium: Fetching remote configuration...');
        }
        
        const remoteConfigResponse = await fetchRemoteConfig(
          this.config.apiHost!,
          this.config.publishableKey,
          fetch
        );
        
        if (remoteConfigResponse && remoteConfigResponse.success) {
          // Update effective config: local config (if provided) overrides remote config
          if (!this.config.config) {
            // No local config provided, use remote config
            this.effectiveConfig = mergeConfigs(undefined, remoteConfigResponse.config);
          } else {
            // Local config provided, merge it over remote config
            this.effectiveConfig = mergeConfigs(this.config.config, remoteConfigResponse.config);
          }
          
          if (this.effectiveConfig.debug) {
            console.log('Journium: Remote configuration applied:', remoteConfigResponse.config);
            console.log('Journium: Effective configuration:', this.effectiveConfig);
          }
        }
      }
      
      this.initialized = true;
      
      // Start flush timer after configuration is finalized
      if (this.effectiveConfig.flushInterval && this.effectiveConfig.flushInterval > 0) {
        this.startFlushTimer();
      }
      
      if (this.effectiveConfig.debug) {
        console.log('Journium: Node client initialized with effective config:', this.effectiveConfig);
      }
    } catch (error) {
      console.warn('Journium: Failed to fetch remote config, using local/default config:', error);
      
      this.initialized = true;
      
      // Start with effective config (already set in constructor)
      if (this.effectiveConfig.flushInterval && this.effectiveConfig.flushInterval > 0) {
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
        if (this.effectiveConfig.debug) {
          console.error('Journium: Auto-flush failed', error);
        }
      });
    }, this.effectiveConfig.flushInterval);
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

  track(event: string, properties: Record<string, any> = {}, distinctId?: string): void {
    // Don't track if SDK is not properly configured
    if (!this.config || !this.config.publishableKey) {
      return;
    }
    const journiumEvent: JourniumEvent = {
      uuid: generateUuidv7(),
      ingestion_key: this.config.publishableKey,
      client_timestamp: getCurrentTimestamp(),
      event,
      properties,
      distinct_id: distinctId || generateId(),
    };

    this.queue.push(journiumEvent);

    if (this.effectiveConfig.debug) {
      console.log('Journium: Event tracked', journiumEvent);
    }

    if (this.queue.length >= this.effectiveConfig.flushAt!) {
      this.flush().catch(error => {
        if (this.effectiveConfig.debug) {
          console.error('Journium: Auto-flush failed', error);
        }
      });
    }
  }

  trackPageview(url: string, properties: Record<string, any> = {}, distinctId?: string): void {
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