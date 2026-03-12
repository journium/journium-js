import { Component } from '@angular/core';
import { JourniumService } from '@journium/angular';

@Component({
  selector: 'app-profile',
  standalone: true,
  template: `
    <div class="page-header">
      <h1>Profile</h1>
      <p>User profile page demonstrating identify and track patterns.</p>
    </div>

    <section class="demo-section">
      <h2>Profile Actions</h2>
      <p>Track profile-related events:</p>
      <div class="button-group">
        <button class="demo-button" (click)="trackProfileEdit()">Edit Profile</button>
        <button class="demo-button feature" (click)="trackAvatarUpload()">Upload Avatar</button>
        <button class="demo-button purchase" (click)="trackPasswordChange()">Change Password</button>
      </div>
    </section>

    <section class="demo-section info">
      <h2>Identify Pattern</h2>
      <ul>
        <li><strong>journiumService.identify():</strong> Associate events with a specific user</li>
        <li><strong>Call on login:</strong> Identify the user as soon as they authenticate</li>
        <li><strong>journiumService.reset():</strong> Clear user identity on logout</li>
      </ul>
    </section>
  `,
})
export class ProfileComponent {
  constructor(private journium: JourniumService) {}

  trackProfileEdit(): void {
    this.journium.track('profile_edit_started', { page: 'profile' });
  }

  trackAvatarUpload(): void {
    this.journium.track('avatar_upload_initiated', { page: 'profile' });
  }

  trackPasswordChange(): void {
    this.journium.track('password_change_started', { page: 'profile' });
  }
}
