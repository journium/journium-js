import { JourniumConfig, AutocaptureOptions, AutoTrackPageviewsOptions, JourniumLocalOptions } from '@journium/core';
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

  private resolvePageviewOptions(autoTrackPageviews?: boolean | AutoTrackPageviewsOptions): {
    enabled: boolean;
    trackSpaPageviews: boolean;
    captureInitialPageview: boolean;
  } {
    if (autoTrackPageviews === false) {
      return { enabled: false, trackSpaPageviews: false, captureInitialPageview: false };
    }
    if (autoTrackPageviews === true || autoTrackPageviews === undefined) {
      return { enabled: true, trackSpaPageviews: true, captureInitialPageview: true };
    }
    // object form implies enabled
    return {
      enabled: true,
      trackSpaPageviews: autoTrackPageviews.trackSpaPageviews !== false,
      captureInitialPageview: autoTrackPageviews.trackInitialPageview !== false,
    };
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

  /** Track a custom event with optional properties. */
  track(event: string, properties?: Record<string, unknown>): void {
    this.client.track(event, properties);
  }

  /** Associate the current session with a known user identity and optional attributes. */
  identify(distinctId: string, attributes?: Record<string, unknown>): void {
    this.client.identify(distinctId, attributes);
  }

  /** Clear the current identity, starting a new anonymous session. */
  reset(): void {
    this.client.reset();
  }

  /** Manually capture a $pageview event with optional custom properties. */
  capturePageview(properties?: Record<string, unknown>): void {
    this.pageviewTracker.capturePageview(properties);
  }

  /**
   * Manually start autocapture (pageview tracking + DOM event capture).
   * Under normal usage this is not needed — the SDK starts automatically on init.
   * Useful only if autocapture was explicitly stopped and needs to be restarted.
   */
  startAutocapture(): void {
    // Always check effective options (which may include remote options)
    const effectiveOptions = this.client.getEffectiveOptions();
    
    // Only start if effectiveOptions are actually loaded (non-empty)
    const hasOptions = effectiveOptions && Object.keys(effectiveOptions).length > 0;
    const { enabled: autoTrackPageviews, trackSpaPageviews, captureInitialPageview } = hasOptions
      ? this.resolvePageviewOptions(effectiveOptions.autoTrackPageviews)
      : { enabled: false, trackSpaPageviews: false, captureInitialPageview: false };

    const autocaptureEnabled = hasOptions
      ? effectiveOptions.autocapture !== false
      : false;

    // Update autocapture tracker options if they've changed
    const autocaptureOptions = this.resolveAutocaptureOptions(effectiveOptions.autocapture);
    this.autocaptureTracker.updateOptions(autocaptureOptions);

    if (autoTrackPageviews) {
      this.pageviewTracker.startAutoPageviewTracking(captureInitialPageview, trackSpaPageviews);
    }

    if (autocaptureEnabled) {
      this.autocaptureTracker.start();
    }

    this.autocaptureStarted = true;
  }

  /** Stop autocapture — pauses pageview tracking and DOM event capture. */
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
      const { enabled: autoTrackPageviews, trackSpaPageviews, captureInitialPageview } = this.resolvePageviewOptions(
        effectiveOptions.autoTrackPageviews
      );
      const autocaptureEnabled = effectiveOptions.autocapture !== false;

      // Update autocapture tracker options
      const autocaptureOptions = this.resolveAutocaptureOptions(effectiveOptions.autocapture);
      this.autocaptureTracker.updateOptions(autocaptureOptions);

      if (autoTrackPageviews) {
        this.pageviewTracker.startAutoPageviewTracking(captureInitialPageview, trackSpaPageviews);
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
    // If autocapture was never started before, this is the initial options application
    // (async init completed) — treat it like a page load and capture a pageview.
    // If it was already started, this is a periodic remote options update — only
    // re-register listeners without emitting a spurious pageview.
    const isFirstStart = !this.autocaptureStarted;

    if (this.autocaptureStarted) {
      this.pageviewTracker.stopAutocapture();
      this.autocaptureTracker.stop();
      this.autocaptureStarted = false;
    }

    const { enabled: autoTrackPageviews, trackSpaPageviews, captureInitialPageview } = this.resolvePageviewOptions(
      effectiveOptions.autoTrackPageviews
    );
    const autocaptureEnabled = effectiveOptions.autocapture !== false;

    const autocaptureOptions = this.resolveAutocaptureOptions(effectiveOptions.autocapture);
    this.autocaptureTracker.updateOptions(autocaptureOptions);

    if (autoTrackPageviews) {
      this.pageviewTracker.startAutoPageviewTracking(isFirstStart && captureInitialPageview, trackSpaPageviews);
    }

    if (autocaptureEnabled) {
      this.autocaptureTracker.start();
    }

    this.autocaptureStarted = autoTrackPageviews || autocaptureEnabled;
  }


  /** Flush all queued events to the ingestion endpoint immediately. */
  async flush(): Promise<void> {
    return this.client.flush();
  }

  /** Return the currently active options (merged local + remote config). */
  getEffectiveOptions() {
    return this.client.getEffectiveOptions();
  }

  /**
   * Register a callback to be notified when effective options change
   */
  onOptionsChange(callback: (options: JourniumLocalOptions) => void): () => void {
    return this.client.onOptionsChange(callback);
  }

  /** Tear down the analytics instance: stop all tracking, flush pending events, and release resources. */
  destroy(): void {
    this.pageviewTracker.stopAutocapture();
    this.autocaptureTracker.stop();
    if (this.unsubscribeOptionsChange) {
      this.unsubscribeOptionsChange();
    }
    this.client.destroy();
  }
}

/** Create and return a new JourniumAnalytics instance for the given config. */
export const init = (config: JourniumConfig): JourniumAnalytics => {
  return new JourniumAnalytics(config);
};

export default { init };