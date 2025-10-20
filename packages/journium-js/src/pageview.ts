import { PageviewProperties, getCurrentUrl, getPageTitle, getReferrer } from '@journium/shared';
import { JourniumClient } from './client';

export class PageviewTracker {
  private client: JourniumClient;
  private lastUrl: string = '';

  constructor(client: JourniumClient) {
    this.client = client;
  }

  capturePageview(customProperties: Record<string, any> = {}): void {
    const currentUrl = getCurrentUrl();
    const url = new URL(currentUrl);

    const properties: PageviewProperties = {
      $current_url: currentUrl,
      $host: url.host,
      $pathname: url.pathname,
      $search: url.search,
      $title: getPageTitle(),
      $referrer: getReferrer(),
      ...customProperties,
    };

    this.client.track('$pageview', properties);
    this.lastUrl = currentUrl;
  }

  startAutoCapture(): void {
    this.capturePageview();

    if (typeof window !== 'undefined') {
      const originalPushState = window.history.pushState;
      const originalReplaceState = window.history.replaceState;

      window.history.pushState = (...args) => {
        originalPushState.apply(window.history, args);
        setTimeout(() => this.capturePageview(), 0);
      };

      window.history.replaceState = (...args) => {
        originalReplaceState.apply(window.history, args);
        setTimeout(() => this.capturePageview(), 0);
      };

      window.addEventListener('popstate', () => {
        setTimeout(() => this.capturePageview(), 0);
      });
    }
  }

  stopAutoCapture(): void {
    // In a real implementation, we'd need to store references to restore original methods
    // For now, this is a placeholder
  }
}