import { JourniumConfig, AutocaptureConfig } from '@journium/core';
import { JourniumClient } from './client';
import { PageviewTracker } from './pageview';
import { AutocaptureTracker } from './autocapture';

export class Journium {
  private client: JourniumClient;
  private pageviewTracker: PageviewTracker;
  private autocaptureTracker: AutocaptureTracker;
  private config: JourniumConfig;
  private autocaptureEnabled: boolean;

  constructor(config: JourniumConfig) {
    this.config = config;
    this.client = new JourniumClient(config);
    this.pageviewTracker = new PageviewTracker(this.client);
    
    const autocaptureConfig = this.resolveAutocaptureConfig(config.config?.autocapture);
    this.autocaptureTracker = new AutocaptureTracker(this.client, autocaptureConfig);
    
    // Store resolved autocapture state for startAutocapture method
    this.autocaptureEnabled = config.config?.autocapture !== false;
  }

  private resolveAutocaptureConfig(autocapture?: boolean | AutocaptureConfig): AutocaptureConfig {
    if (autocapture === false) {
      return {
        captureClicks: false,
        captureFormSubmits: false,
        captureFormChanges: false,
        captureTextSelection: false,
      };
    }

    if (autocapture === true || autocapture === undefined) {
      return {}; // Use default configuration (enabled by default)
    }

    return autocapture;
  }

  track(event: string, properties?: Record<string, any>): void {
    this.client.track(event, properties);
  }

  identify(distinctId: string, attributes?: Record<string, any>): void {
    this.client.identify(distinctId, attributes);
  }

  reset(): void {
    this.client.reset();
  }

  capturePageview(properties?: Record<string, any>): void {
    this.pageviewTracker.capturePageview(properties);
  }

  startAutocapture(): void {
    this.pageviewTracker.startAutocapture();
    
    if (this.autocaptureEnabled) {
      this.autocaptureTracker.start();
    }
  }

  stopAutocapture(): void {
    this.pageviewTracker.stopAutocapture();
    this.autocaptureTracker.stop();
  }


  async flush(): Promise<void> {
    return this.client.flush();
  }

  destroy(): void {
    this.pageviewTracker.stopAutocapture();
    this.autocaptureTracker.stop();
    this.client.destroy();
  }
}

export const init = (config: JourniumConfig): Journium => {
  return new Journium(config);
};

export default { init, Journium };