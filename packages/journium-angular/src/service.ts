import { Injectable, OnDestroy } from '@angular/core';
import { init } from '@journium/js';
import { JourniumConfig, JourniumLocalOptions } from '@journium/core';

type JourniumAnalyticsInstance = ReturnType<typeof init>;

/** Angular service wrapping the Journium analytics SDK. Inject via `JourniumModule` or `provideJournium()`. */
@Injectable()
export class JourniumService implements OnDestroy {
  private readonly analytics: JourniumAnalyticsInstance;

  constructor(config: JourniumConfig) {
    this.analytics = init(config);
  }

  /** Track a custom event with optional properties. */
  track(event: string, properties?: Record<string, unknown>): void {
    this.analytics.track(event, properties);
  }

  /** Associate the current session with a known user identity and optional attributes. */
  identify(distinctId: string, attributes?: Record<string, unknown>): void {
    this.analytics.identify(distinctId, attributes);
  }

  /** Clear the current identity, starting a new anonymous session. */
  reset(): void {
    this.analytics.reset();
  }

  /** Manually capture a $pageview event with optional custom properties. */
  capturePageview(properties?: Record<string, unknown>): void {
    this.analytics.capturePageview(properties);
  }

  /**
   * Manually start autocapture (pageview tracking + DOM event capture).
   * Under normal usage this is not needed — the SDK starts automatically on init.
   * Useful only if autocapture was explicitly stopped and needs to be restarted.
   */
  startAutocapture(): void {
    this.analytics.startAutocapture();
  }

  /** Stop autocapture — pauses pageview tracking and DOM event capture. */
  stopAutocapture(): void {
    this.analytics.stopAutocapture();
  }

  /** Return the currently active options (merged local + remote config). */
  getEffectiveOptions(): JourniumLocalOptions {
    return this.analytics.getEffectiveOptions();
  }

  /** Called by Angular when the service is destroyed. Tears down the analytics instance. */
  ngOnDestroy(): void {
    this.analytics.destroy();
  }
}
