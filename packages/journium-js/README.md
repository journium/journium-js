# @journium/js

[![npm version](https://badge.fury.io/js/@journium%2Fjs.svg)](https://badge.fury.io/js/@journium%2Fjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**The official Journium JavaScript SDK for web browsers**

Track events, pageviews, and user interactions with ease. Perfect for SPAs, vanilla JavaScript apps, and any web application.

## Installation

### npm
```bash
npm install @journium/js
```

### pnpm
```bash
pnpm add @journium/js
```

### yarn
```bash
yarn add @journium/js
```

## Basic Setup

### Initialize Journium
Initialize the Journium SDK with your publishable key to start tracking events.

```javascript
import { init } from '@journium/js';

const journium = init({
  publishableKey: 'your-journium-publishable-key'
});
```

### Track a Custom Event
Track user actions and business events with custom properties.

```javascript
journium.track('button_clicked', {
  button_name: 'signup',
  page: 'homepage',
  user_type: 'visitor'
});
```

### Identify a User
Identify users when they log in or sign up to connect their actions across sessions.

```javascript
journium.identify('user_12345', {
  name: 'John Doe',
  email: 'john@example.com',
  plan: 'premium'
});
```

### Reset User Identity
Reset user identity when they log out to ensure privacy and accurate tracking.

```javascript
journium.reset();
```

## Advanced Setup

You can override default configurations:

```javascript
import { init } from '@journium/js';

const journium = init({
  publishableKey: 'your-journium-publishable-key',
  apiHost: 'https://your-custom-instance.com', // Optional: defaults to 'https://events.journium.app'
  config: {
    debug: true,                    // Enable debug logging
    flushAt: 10,                   // Send events after N events
    flushInterval: 5000,           // Send events every N milliseconds
    sessionTimeout: 1800000,       // Session timeout (30 minutes)
    autocapture: {                 // Configure automatic event capture
      captureClicks: true,         // Track click events
      captureFormSubmits: true,    // Track form submissions
      captureFormChanges: false,   // Track form field changes
      ignoreClasses: ['no-track'], // CSS classes to ignore
      ignoreElements: ['input[type="password"]'] // Elements to ignore
    }
  }
});

// Start automatic event capture
journium.startAutocapture();
```

## API Reference

### `init(config: JourniumConfig)`
Initialize the Journium SDK with your configuration.

```javascript
const journium = init({
  publishableKey: 'your-journium-publishable-key',
  apiHost: 'https://events.journium.app', // Optional
  config: { /* optional local config */ }
});
```

### `journium.track(eventName, properties?)`
Track custom events with optional properties.

```javascript
// Simple event
journium.track('feature_used');

// Event with properties
journium.track('purchase_completed', {
  product_id: 'prod_123',
  amount: 29.99,
  currency: 'USD'
});
```

### `journium.identify(distinctId, attributes?)`
Identify a user when they log in or sign up.

```javascript
journium.identify('user_12345', {
  name: 'John Doe',
  email: 'john@example.com',
  signup_date: '2024-01-15'
});
```

### `journium.reset()`
Reset user identity when they log out.

```javascript
journium.reset();
```

### `journium.capturePageview(properties?)`
Manually capture pageview events.

```javascript
// Simple pageview
journium.capturePageview();

// Pageview with custom properties
journium.capturePageview({
  section: 'pricing',
  experiment_variant: 'v2'
});
```

### `journium.startAutocapture()` / `journium.stopAutocapture()`
Control automatic event capture for clicks, pageviews, and form interactions.

```javascript
// Start automatic capture
journium.startAutocapture();

// Stop automatic capture
journium.stopAutocapture();
```

### `journium.flush()`
Manually send queued events to the server.

```javascript
await journium.flush();
```

### `journium.destroy()`
Clean up the SDK and send any remaining events.

```javascript
journium.destroy();
```