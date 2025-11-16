import { JourniumEvent, JourniumConfig, ConfigResponse, generateId, generateUuidv7, getCurrentTimestamp, fetchRemoteConfig, mergeConfigs } from '@journium/core';
import fetch from 'node-fetch';

export class JourniumNodeClient {
  private config!: JourniumConfig;
  private queue: JourniumEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private initialized: boolean = false;

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

    // Initialize asynchronously to fetch remote config
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      if (this.config.token) {
        if (this.config.debug) {
          console.log('Journium: Fetching remote configuration...');
        }
        
        const remoteConfigResponse = await fetchRemoteConfig(
          this.config.apiHost,
          this.config.token,
          this.config.configEndpoint,
          fetch
        );
        
        if (remoteConfigResponse && remoteConfigResponse.success) {
          // Preserve apiHost and token, merge everything else from remote
          const localOnlyConfig = {
            apiHost: this.config.apiHost,
            token: this.config.token,
            configEndpoint: this.config.configEndpoint,
          };
          
          this.config = {
            ...localOnlyConfig,
            ...remoteConfigResponse.config,
          };
          
          if (this.config.debug) {
            console.log('Journium: Remote configuration applied:', remoteConfigResponse.config);
          }
        } else {
          // Fallback to minimal defaults if remote config fails
          this.config = {
            ...this.config,
            debug: this.config.debug ?? false,
            flushAt: this.config.flushAt ?? 20,
            flushInterval: this.config.flushInterval ?? 10000,
          };
        }
      }
      
      this.initialized = true;
      
      // Start flush timer after configuration is finalized
      if (this.config.flushInterval && this.config.flushInterval > 0) {
        this.startFlushTimer();
      }
      
      if (this.config.debug) {
        console.log('Journium: Node client initialized with config:', this.config);
      }
    } catch (error) {
      console.warn('Journium: Failed to fetch remote config, using local config:', error);
      
      // Fallback to defaults
      this.config = {
        ...this.config,
        debug: this.config.debug ?? false,
        flushAt: this.config.flushAt ?? 20,
        flushInterval: this.config.flushInterval ?? 10000,
      };
      
      this.initialized = true;
      
      // Start with local config
      if (this.config.flushInterval && this.config.flushInterval > 0) {
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
        if (this.config.debug) {
          console.error('Journium: Auto-flush failed', error);
        }
      });
    }, this.config.flushInterval);
  }

  private async sendEvents(events: JourniumEvent[]): Promise<void> {
    if (!events.length) return;

    try {
      const response = await fetch(`${this.config.apiHost}/capture`, {
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

  track(event: string, properties: Record<string, any> = {}, distinctId?: string): void {
    // Don't track if SDK is not properly configured
    if (!this.config || !this.config.token || !this.config.apiHost) {
      return;
    }
    const journiumEvent: JourniumEvent = {
      uuid: generateUuidv7(),
      ingestion_key: this.config.token,
      client_timestamp: getCurrentTimestamp(),
      event,
      properties,
      distinct_id: distinctId || generateId(),
    };

    this.queue.push(journiumEvent);

    if (this.config.debug) {
      console.log('Journium: Event tracked', journiumEvent);
    }

    if (this.queue.length >= this.config.flushAt!) {
      this.flush().catch(error => {
        if (this.config.debug) {
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

  async destroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }
}