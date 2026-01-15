import { JourniumConfig, AutocaptureOptions, JourniumLocalOptions } from '@journium/core';
import { JourniumClient } from './JourniumClient';
import { PageviewTracker } from './PageviewTracker';
import { AutocaptureTracker } from './AutocaptureTracker';

export class JourniumAnalytics {
  private client: JourniumClient;
  private pageviewTracker: PageviewTracker;
  private autocaptureTracker: AutocaptureTracker;
  private config: JourniumConfig;
  private autocaptureStarted: boolean = false;
  private unsubscribeOptionsChange?: () => void;

  constructor(config: JourniumConfig) {
    this.config = config;
    this.client = new JourniumClient(config);
    this.pageviewTracker = new PageviewTracker(this.client);
    
    // Initialize autocapture tracker with effective options (may include cached remote options)
    // This ensures we use the correct initial state even if cached remote options exist
    const initialEffectiveOptions = this.client.getEffectiveOptions();
    const initialAutocaptureOptions = this.resolveAutocaptureOptions(initialEffectiveOptions.autocapture);
    this.autocaptureTracker = new AutocaptureTracker(this.client, initialAutocaptureOptions);
    
    // Listen for options changes (e.g., when fresh remote options are fetched)
    this.unsubscribeOptionsChange = this.client.onOptionsChange((effectiveOptions) => {
      this.handleOptionsChange(effectiveOptions);
    });
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
    // Always check effective options (which may include remote options)
    const effectiveOptions = this.client.getEffectiveOptions();
    const autoTrackPageviews = effectiveOptions.autoTrackPageviews !== false;
    const autocaptureEnabled = effectiveOptions.autocapture !== false;
    
    // Update autocapture tracker options if they've changed
    const autocaptureOptions = this.resolveAutocaptureOptions(effectiveOptions.autocapture);
    this.autocaptureTracker.updateOptions(autocaptureOptions);
    
    if (autoTrackPageviews) {
      this.pageviewTracker.startAutocapture();
    }
    
    if (autocaptureEnabled) {
      this.autocaptureTracker.start();
    }
    
    this.autocaptureStarted = true;
  }

  stopAutocapture(): void {
    this.pageviewTracker.stopAutocapture();
    this.autocaptureTracker.stop();
    this.autocaptureStarted = false;
  }

  /**
   * Handle effective options change (e.g., when remote options are fetched)
   */
  private handleOptionsChange(effectiveOptions: JourniumLocalOptions): void {
    // If autocapture was already started, re-evaluate with new options
    if (this.autocaptureStarted) {
      // Stop current autocapture
      this.pageviewTracker.stopAutocapture();
      this.autocaptureTracker.stop();
      this.autocaptureStarted = false;
      
      // Re-evaluate if autocapture should be enabled with new options
      const autoTrackPageviews = effectiveOptions.autoTrackPageviews !== false;
      const autocaptureEnabled = effectiveOptions.autocapture !== false;
      
      // Update autocapture tracker options
      const autocaptureOptions = this.resolveAutocaptureOptions(effectiveOptions.autocapture);
      this.autocaptureTracker.updateOptions(autocaptureOptions);
      
      // Restart only if still enabled
      if (autoTrackPageviews) {
        this.pageviewTracker.startAutocapture();
      }
      
      if (autocaptureEnabled) {
        this.autocaptureTracker.start();
      }
      
      this.autocaptureStarted = autoTrackPageviews || autocaptureEnabled;
    }
  }


  async flush(): Promise<void> {
    return this.client.flush();
  }

  getEffectiveOptions() {
    return this.client.getEffectiveOptions();
  }

  /**
   * Register a callback to be notified when effective options change
   */
  onOptionsChange(callback: (options: JourniumLocalOptions) => void): () => void {
    return this.client.onOptionsChange(callback);
  }

  destroy(): void {
    this.pageviewTracker.stopAutocapture();
    this.autocaptureTracker.stop();
    if (this.unsubscribeOptionsChange) {
      this.unsubscribeOptionsChange();
    }
    this.client.destroy();
  }
}

export const init = (config: JourniumConfig): JourniumAnalytics => {
  return new JourniumAnalytics(config);
};

export default { init, JourniumAnalytics };