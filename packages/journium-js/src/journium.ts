import { JourniumConfig } from '@journium/shared';
import { JourniumClient } from './client';
import { PageviewTracker } from './pageview';

export class Journium {
  private client: JourniumClient;
  private pageviewTracker: PageviewTracker;

  constructor(config: JourniumConfig) {
    this.client = new JourniumClient(config);
    this.pageviewTracker = new PageviewTracker(this.client);
  }

  track(event: string, properties?: Record<string, any>): void {
    this.client.track(event, properties);
  }

  capturePageview(properties?: Record<string, any>): void {
    this.pageviewTracker.capturePageview(properties);
  }

  startAutoCapture(): void {
    this.pageviewTracker.startAutoCapture();
  }

  stopAutoCapture(): void {
    this.pageviewTracker.stopAutoCapture();
  }

  async flush(): Promise<void> {
    return this.client.flush();
  }

  destroy(): void {
    this.pageviewTracker.stopAutoCapture();
    this.client.destroy();
  }
}

export const init = (config: JourniumConfig): Journium => {
  return new Journium(config);
};

export default { init, Journium };