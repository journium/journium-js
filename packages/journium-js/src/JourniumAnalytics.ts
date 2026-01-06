import { JourniumConfig, AutocaptureOptions } from '@journium/core';
import { JourniumClient } from './JourniumClient';
import { PageviewTracker } from './PageviewTracker';
import { AutocaptureTracker } from './autocapture';

export class JourniumAnalytics {
  private client: JourniumClient;
  private pageviewTracker: PageviewTracker;
  private autocaptureTracker: AutocaptureTracker;
  private config: JourniumConfig;
  private autocaptureEnabled: boolean;

  constructor(config: JourniumConfig) {
    this.config = config;
    this.client = new JourniumClient(config);
    this.pageviewTracker = new PageviewTracker(this.client);
    
    const autocaptureOptions = this.resolveAutocaptureOptions(config.options?.autocapture);
    this.autocaptureTracker = new AutocaptureTracker(this.client, autocaptureOptions);
    
    // Store resolved autocapture state for startAutocapture method
    this.autocaptureEnabled = config.options?.autocapture !== false;
  }

  private resolveAutocaptureOptions(autocapture?: boolean | AutocaptureOptions): AutocaptureOptions {
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

  track(event: string, properties?: Record<string, unknown>): void {
    this.client.track(event, properties);
  }

  identify(distinctId: string, attributes?: Record<string, unknown>): void {
    this.client.identify(distinctId, attributes);
  }

  reset(): void {
    this.client.reset();
  }

  capturePageview(properties?: Record<string, unknown>): void {
    this.pageviewTracker.capturePageview(properties);
  }

  startAutocapture(): void {
    // Check if automatic pageview tracking is enabled (defaults to true)
    const effectiveOptions = this.client.getEffectiveOptions();
    const autoTrackPageviews = effectiveOptions.autoTrackPageviews !== false;
    
    if (autoTrackPageviews) {
      this.pageviewTracker.startAutocapture();
    }
    
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

  getEffectiveOptions() {
    return this.client.getEffectiveOptions();
  }

  destroy(): void {
    this.pageviewTracker.stopAutocapture();
    this.autocaptureTracker.stop();
    this.client.destroy();
  }
}

export const init = (config: JourniumConfig): JourniumAnalytics => {
  return new JourniumAnalytics(config);
};

export default { init, JourniumAnalytics };