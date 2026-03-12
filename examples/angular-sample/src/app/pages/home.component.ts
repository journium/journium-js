import { Component, signal } from '@angular/core';
import { JourniumService } from '@journium/angular';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="page-header">
      <h1>Home - Journium Angular SDK Demo</h1>
      <p>This demo shows how Journium integrates with Angular. Navigate between pages to see automatic pageview tracking via <code>withJourniumRouter()</code>.</p>
    </div>

    <section class="demo-section">
      <h2>Event Tracking</h2>
      <p>Click the buttons below to track different types of events using <code>JourniumService</code>:</p>
      <div class="button-group">
        <button class="demo-button" (click)="handleTrackEvent()">
          Track Custom Event ({{ eventCount() }})
        </button>
        <button class="demo-button purchase" (click)="handlePurchase()">
          Track Purchase Event
        </button>
        <button class="demo-button feature" (click)="handleFeatureUse()">
          Track Feature Usage
        </button>
      </div>
    </section>

    <section class="demo-section">
      <h2>Manual Pageview</h2>
      <p>Pageviews are automatically tracked on route changes via <code>withJourniumRouter()</code>. You can also track manually:</p>
      <button class="demo-button pageview" (click)="handlePageview()">
        Manual Pageview ({{ pageviewCount() }})
      </button>
    </section>

    <section class="demo-section info">
      <h2>What's Happening on the Home Page</h2>
      <ul>
        <li><strong>Auto Pageview:</strong> Tracked automatically on NavigationEnd via withJourniumRouter()</li>
        <li><strong>Custom Events:</strong> Sent via journiumService.track(event, properties)</li>
        <li><strong>User Identity:</strong> Set via journiumService.identify(distinctId, attributes)</li>
        <li><strong>Route Changes:</strong> Navigate to other pages to see automatic pageview tracking</li>
        <li><strong>Angular DI:</strong> JourniumService is injected via Angular's dependency injection</li>
      </ul>
    </section>
  `,
})
export class HomeComponent {
  eventCount = signal(0);
  pageviewCount = signal(0);

  constructor(private journium: JourniumService) {}

  handleTrackEvent(): void {
    const count = this.eventCount() + 1;
    this.eventCount.set(count);
    this.journium.track('button_clicked', {
      button_text: 'Track Event',
      click_count: count,
      page: 'home',
    });
  }

  handlePurchase(): void {
    this.journium.track('purchase_completed', {
      product_id: 'angular_demo_product',
      price: 49.99,
      currency: 'USD',
      page: 'home',
    });
  }

  handleFeatureUse(): void {
    this.journium.track('feature_used', {
      feature_name: 'angular_demo_feature',
      source: 'home_page',
      page: 'home',
    });
  }

  handlePageview(): void {
    const count = this.pageviewCount() + 1;
    this.pageviewCount.set(count);
    this.journium.capturePageview({
      page: 'home_manual',
      manual_pageview: true,
      pageview_count: count,
    });
  }
}
