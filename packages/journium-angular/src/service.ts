import { OnDestroy } from '@angular/core';
import { init } from '@journium/js';
import { JourniumConfig, JourniumLocalOptions } from '@journium/core';

type JourniumAnalyticsInstance = ReturnType<typeof init>;

export class JourniumService implements OnDestroy {
  private readonly analytics: JourniumAnalyticsInstance;

  constructor(config: JourniumConfig) {
    this.analytics = init(config);
  }

  track(event: string, properties?: Record<string, unknown>): void {
    this.analytics.track(event, properties);
  }

  identify(distinctId: string, attributes?: Record<string, unknown>): void {
    this.analytics.identify(distinctId, attributes);
  }

  reset(): void {
    this.analytics.reset();
  }

  capturePageview(properties?: Record<string, unknown>): void {
    this.analytics.capturePageview(properties);
  }

  startAutocapture(): void {
    this.analytics.startAutocapture();
  }

  stopAutocapture(): void {
    this.analytics.stopAutocapture();
  }

  getEffectiveOptions(): JourniumLocalOptions {
    return this.analytics.getEffectiveOptions();
  }

  ngOnDestroy(): void {
    this.analytics.destroy();
  }
}
