import { JourniumEvent, JourniumConfig } from '@journium/shared';

export class JourniumClient {
  private config: JourniumConfig;
  private queue: JourniumEvent[] = [];
  private flushTimer: number | null = null;

  constructor(config: JourniumConfig) {
    this.config = {
      apiHost: 'http://localhost:3001',
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

  track(event: string, properties: Record<string, any> = {}): void {
    const journiumEvent: JourniumEvent = {
      event,
      properties,
      timestamp: Date.now(),
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