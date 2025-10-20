import { JourniumEvent, JourniumConfig, generateId } from '@journium/shared';
import fetch from 'node-fetch';

export class JourniumNodeClient {
  private config: JourniumConfig;
  private queue: JourniumEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(config: JourniumConfig) {
    this.config = {
      apiHost: 'https://api.journium.io',
      debug: false,
      flushAt: 20,
      flushInterval: 10000,
      ...config,
    };

    if (this.config.flushInterval && this.config.flushInterval > 0) {
      this.startFlushTimer();
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
          'Authorization': `Bearer ${this.config.apiKey}`,
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
    const journiumEvent: JourniumEvent = {
      event,
      properties,
      timestamp: Date.now(),
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