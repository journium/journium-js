import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { JourniumService } from '@journium/angular';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="app-header">
      <div class="header-content">
        <div class="header-left">
          <h1>Journium Angular SDK Demo</h1>
          <nav class="main-nav">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">Home</a>
            <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">Dashboard</a>
            <a routerLink="/profile" routerLinkActive="active" class="nav-link">Profile</a>
            <a routerLink="/products" routerLinkActive="active" class="nav-link">Products</a>
          </nav>
        </div>
        <div class="header-right">
          @if (identified()) {
            <span class="user-status">Identified as demo-user-001</span>
            <button class="reset-btn" (click)="handleReset()">Reset Identity</button>
          } @else {
            <button class="identify-btn" (click)="handleIdentify()">Identify User</button>
          }
        </div>
      </div>
    </header>
  `,
})
export class HeaderComponent {
  identified = signal(false);

  constructor(private journium: JourniumService) {}

  handleIdentify(): void {
    this.journium.identify('demo-user-001', {
      name: 'Demo User',
      email: 'demo@example.com',
      plan: 'pro',
    });
    this.identified.set(true);
    this.journium.track('user_identified', { source: 'header_button' });
  }

  handleReset(): void {
    this.journium.reset();
    this.identified.set(false);
    this.journium.track('identity_reset', { source: 'header_button' });
  }
}
