import { JourniumEvent, JourniumConfig, ConfigResponse, generateUuidv7, getCurrentTimestamp, fetchRemoteConfig, mergeConfigs, BrowserIdentityManager } from '@journium/shared';

export class JourniumClient {
  private config: JourniumConfig;
  private queue: JourniumEvent[] = [];
  private flushTimer: number | null = null;
  private initialized: boolean = false;
  private identityManager: BrowserIdentityManager;

  constructor(config: JourniumConfig) {
    // Preserve apiHost and applicationKey, set minimal defaults for others
    this.config = {
      apiHost: 'http://localhost:3001',
      ...config,
    };

    // Initialize identity manager
    this.identityManager = new BrowserIdentityManager(this.config.sessionTimeout);

    // Initialize asynchronously to fetch remote config
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      if (this.config.applicationKey) {
        if (this.config.debug) {
          console.log('Journium: Fetching remote configuration...');
        }
        
        const remoteConfigResponse = await fetchRemoteConfig(
          this.config.apiHost!,
          this.config.applicationKey,
          this.config.configEndpoint
        );
        
        if (remoteConfigResponse && remoteConfigResponse.success) {
          // Preserve apiHost and applicationKey, merge everything else from remote
          const localOnlyConfig = {
            apiHost: this.config.apiHost,
            applicationKey: this.config.applicationKey,
            configEndpoint: this.config.configEndpoint,
          };
          
          this.config = {
            ...localOnlyConfig,
            ...remoteConfigResponse.config,
          };

          // Update session timeout if provided in remote config
          if (remoteConfigResponse.config.sessionTimeout) {
            this.identityManager.updateSessionTimeout(remoteConfigResponse.config.sessionTimeout);
          }
          
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
        console.log('Journium: Client initialized with config:', this.config);
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

    this.flushTimer = window.setInterval(() => {
      this.flush();
    }, this.config.flushInterval!);
  }

  private async sendEvents(events: JourniumEvent[]): Promise<void> {
    if (!events.length) return;

    try {
      const response = await fetch(`${this.config.apiHost}/ingest_event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.applicationKey}`,
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

  track(event: string, properties: Record<string, any> = {}): void {
    const identity = this.identityManager.getIdentity();
    const userAgentInfo = this.identityManager.getUserAgentInfo();
    
    // Create standardized event properties
    const eventProperties = {
      $device_id: identity?.$device_id,
      distinct_id: identity?.distinct_id,
      $session_id: identity?.$session_id,
      $current_url: typeof window !== 'undefined' ? window.location.href : '',
      $pathname: typeof window !== 'undefined' ? window.location.pathname : '',
      ...userAgentInfo,
      $lib_version: '0.1.0', // TODO: Get from package.json
      $platform: 'web',
      ...properties, // User-provided properties override defaults
    };

    const journiumEvent: JourniumEvent = {
      uuid: generateUuidv7(),
      ingestion_key: this.config.applicationKey,
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