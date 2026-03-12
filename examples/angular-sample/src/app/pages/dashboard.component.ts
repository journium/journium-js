import { Component, OnInit } from '@angular/core';
import { JourniumService } from '@journium/angular';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="page-header">
      <h1>Dashboard</h1>
      <p>Analytics dashboard demonstrating automatic pageview tracking on navigation.</p>
    </div>

    <section class="demo-section">
      <h2>Dashboard Actions</h2>
      <p>Track dashboard-specific interactions:</p>
      <div class="button-group">
        <button class="demo-button" (click)="trackWidgetView()">View Widget</button>
        <button class="demo-button feature" (click)="trackExport()">Export Data</button>
        <button class="demo-button purchase" (click)="trackFilterChange()">Apply Filter</button>
      </div>
    </section>

    <section class="demo-section info">
      <h2>Angular Lifecycle + Journium</h2>
      <ul>
        <li><strong>ngOnInit:</strong> You can track page-specific events on component init</li>
        <li><strong>Constructor injection:</strong> JourniumService injected via Angular DI</li>
        <li><strong>Automatic pageview:</strong> withJourniumRouter() handles route tracking</li>
      </ul>
    </section>
  `,
})
export class DashboardComponent implements OnInit {
  constructor(private journium: JourniumService) {}

  ngOnInit(): void {
    this.journium.track('dashboard_viewed', { source: 'navigation' });
  }

  trackWidgetView(): void {
    this.journium.track('widget_viewed', { widget_type: 'analytics_chart', page: 'dashboard' });
  }

  trackExport(): void {
    this.journium.track('data_exported', { format: 'csv', page: 'dashboard' });
  }

  trackFilterChange(): void {
    this.journium.track('filter_applied', { filter_type: 'date_range', page: 'dashboard' });
  }
}
