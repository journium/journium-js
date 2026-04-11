import { PageviewProperties, getCurrentUrl, getPageTitle, getReferrer } from '@journium/core';
import { JourniumClient } from './JourniumClient';

export class PageviewTracker {
  private client: JourniumClient;
  private lastUrl: string = '';
  private originalPushState: typeof window.history.pushState | null = null;
  private originalReplaceState: typeof window.history.replaceState | null = null;
  private popStateHandler: (() => void) | null = null;

  constructor(client: JourniumClient) {
    this.client = client;
  }

  capturePageview(customProperties: PageviewProperties = {}): void {
    const currentUrl = getCurrentUrl();
    const url = new URL(currentUrl);

    const properties: PageviewProperties = {
      $current_url: currentUrl,
      $host: url.host,
      $pathname: url.pathname,
      $search: url.search,
      $page_title: getPageTitle(),
      $referrer: getReferrer(),
      $previous_url: this.lastUrl || '',
      $previous_pathname: this.lastUrl ? new URL(this.lastUrl).pathname : '',
      ...customProperties,
    };

    this.client.track('$pageview', properties);
    this.lastUrl = currentUrl;
  }

  /**
   * Start automatic autocapture for pageviews
   * @param captureInitialPageview - whether to fire a $pageview immediately on start (default: true).
   *   Pass false when restarting after a remote options update to avoid a spurious pageview.
   * @param patchHistory - whether to monkey-patch pushState/replaceState/popstate (default: true).
   *   Pass false when a framework-native router tracker (e.g. Next.js) owns SPA pageviews.
   */
  startAutoPageviewTracking(captureInitialPageview: boolean = true, patchHistory: boolean = true): void {
    if (captureInitialPageview) {
      this.capturePageview();
    }

    if (!patchHistory || typeof window === 'undefined') {
      return;
    }

    // Store original methods for cleanup
    this.originalPushState = window.history.pushState;
    this.originalReplaceState = window.history.replaceState;

    window.history.pushState = (...args) => {
      this.originalPushState!.apply(window.history, args);
      setTimeout(() => this.capturePageview(), 0);
    };

    window.history.replaceState = (...args) => {
      this.originalReplaceState!.apply(window.history, args);
      setTimeout(() => this.capturePageview(), 0);
    };

    this.popStateHandler = () => {
      setTimeout(() => this.capturePageview(), 0);
    };

    window.addEventListener('popstate', this.popStateHandler);
  }

  /**
   * Stop automatic autocapture for pageviews
   * @returns void
   */
  stopAutocapture(): void {
    if (typeof window !== 'undefined') {
      // Restore original methods
      if (this.originalPushState) {
        window.history.pushState = this.originalPushState;
        this.originalPushState = null;
      }

      if (this.originalReplaceState) {
        window.history.replaceState = this.originalReplaceState;
        this.originalReplaceState = null;
      }

      if (this.popStateHandler) {
        window.removeEventListener('popstate', this.popStateHandler);
        this.popStateHandler = null;
      }
    }
  }
}