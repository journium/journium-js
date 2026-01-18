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

    // Start automatic autocapture immediately if initial options support it
    // This handles cached remote options or local options with autocapture enabled
    this.startAutocaptureIfEnabled(initialEffectiveOptions);
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
    
    // Only enable if effectiveOptions are loaded and autoTrackPageviews is not explicitly false
    const autoTrackPageviews = effectiveOptions && Object.keys(effectiveOptions).length > 0 
      ? effectiveOptions.autoTrackPageviews !== false 
      : false;
      
    const autocaptureEnabled = effectiveOptions && Object.keys(effectiveOptions).length > 0
      ? effectiveOptions.autocapture !== false
      : false;
    
    // Update autocapture tracker options if they've changed
    const autocaptureOptions = this.resolveAutocaptureOptions(effectiveOptions.autocapture);
    this.autocaptureTracker.updateOptions(autocaptureOptions);
    
    if (autoTrackPageviews) {
      this.pageviewTracker.startAutoPageviewTracking();
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
   * Automatically start autocapture if enabled in options
   * Handles both initial options and empty options during remote-first initialization
   */
  private startAutocaptureIfEnabled(effectiveOptions: JourniumLocalOptions): void {
    // Skip if autocapture was already started manually
    if (this.autocaptureStarted) {
      return;
    }

    // During remote-first initialization, effective options might be empty initially
    // Only auto-start if we have actual options loaded, not empty options
    const hasActualOptions = effectiveOptions && Object.keys(effectiveOptions).length > 0;
    
    if (hasActualOptions) {
      // Use same logic as manual startAutocapture() but only start automatically
      const autoTrackPageviews = effectiveOptions.autoTrackPageviews !== false;
      const autocaptureEnabled = effectiveOptions.autocapture !== false;
      
      // Update autocapture tracker options
      const autocaptureOptions = this.resolveAutocaptureOptions(effectiveOptions.autocapture);
      this.autocaptureTracker.updateOptions(autocaptureOptions);
      
      if (autoTrackPageviews) {
        this.pageviewTracker.startAutoPageviewTracking();
      }
      
      if (autocaptureEnabled) {
        this.autocaptureTracker.start();
      }
      
      if (autoTrackPageviews || autocaptureEnabled) {
        this.autocaptureStarted = true;
      }
    }
    // If options are empty (during initialization), wait for options change callback
  }

  /**
   * Handle effective options change (e.g., when remote options are fetched)
   */
  private handleOptionsChange(effectiveOptions: JourniumLocalOptions): void {
    // Stop current autocapture if it was already started
    if (this.autocaptureStarted) {
      this.pageviewTracker.stopAutocapture();
      this.autocaptureTracker.stop();
      this.autocaptureStarted = false;
    }
    
    // Evaluate if autocapture should be enabled with new options
    const autoTrackPageviews = effectiveOptions.autoTrackPageviews !== false;
    const autocaptureEnabled = effectiveOptions.autocapture !== false;
    
    // Update autocapture tracker options
    const autocaptureOptions = this.resolveAutocaptureOptions(effectiveOptions.autocapture);
    this.autocaptureTracker.updateOptions(autocaptureOptions);
    
    // Start autocapture based on new options (even if it wasn't started before)
    if (autoTrackPageviews) {
      this.pageviewTracker.startAutoPageviewTracking();
    }
    
    if (autocaptureEnabled) {
      this.autocaptureTracker.start();
    }
    
    this.autocaptureStarted = autoTrackPageviews || autocaptureEnabled;
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