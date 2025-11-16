import { JourniumConfig, AutocaptureConfig } from '@journium/core';
import { JourniumClient } from './client';
import { PageviewTracker } from './pageview';
import { AutocaptureTracker } from './autocapture';

export class Journium {
  private client: JourniumClient;
  private pageviewTracker: PageviewTracker;
  private autocaptureTracker: AutocaptureTracker;
  private config: JourniumConfig;

  constructor(config: JourniumConfig) {
    this.config = config;
    this.client = new JourniumClient(config);
    this.pageviewTracker = new PageviewTracker(this.client);
    
    const autocaptureConfig = this.resolveAutocaptureConfig(config.autocapture);
    this.autocaptureTracker = new AutocaptureTracker(this.client, autocaptureConfig);
  }

  private resolveAutocaptureConfig(autocapture?: boolean | AutocaptureConfig): AutocaptureConfig {
    if (autocapture === false || autocapture === undefined) {
      return {
        captureClicks: false,
        captureFormSubmits: false,
        captureFormChanges: false,
        captureTextSelection: false,
      };
    }

    if (autocapture === true) {
      return {}; // Use default configuration
    }

    return autocapture;
  }

  track(event: string, properties?: Record<string, any>): void {
    this.client.track(event, properties);
  }

  capturePageview(properties?: Record<string, any>): void {
    this.pageviewTracker.capturePageview(properties);
  }

  startAutoCapture(): void {
    this.pageviewTracker.startAutoCapture();
    
    if (this.config.autocapture) {
      this.autocaptureTracker.start();
    }
  }

  stopAutoCapture(): void {
    this.pageviewTracker.stopAutoCapture();
    this.autocaptureTracker.stop();
  }

  // Aliases for consistency (deprecated - use startAutoCapture)
  /** @deprecated Use startAutoCapture() instead */
  startAutocapture(): void {
    this.startAutoCapture();
  }

  /** @deprecated Use stopAutoCapture() instead */
  stopAutocapture(): void {
    this.stopAutoCapture();
  }

  async flush(): Promise<void> {
    return this.client.flush();
  }

  destroy(): void {
    this.pageviewTracker.stopAutoCapture();
    this.autocaptureTracker.stop();
    this.client.destroy();
  }
}

export const init = (config: JourniumConfig): Journium => {
  return new Journium(config);
};

export default { init, Journium };