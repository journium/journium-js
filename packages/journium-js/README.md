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
  options: {
    debug: true,                    // Enable debug logging
    flushAt: 10,                   // Send events after N events
    flushInterval: 5000,           // Send events every N milliseconds
    sessionTimeout: 1800000,       // Session timeout (30 minutes)
    autoTrackPageviews: true,        // Track pageview events (default: true)
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

### Functions

#### `init(config: JourniumConfig)`
Initializes and returns a new JourniumAnalytics instance.

**Parameters:**
- `config: JourniumConfig` - Configuration object for Journium
  - `publishableKey: string` - Your Journium publishable key (required)
  - `apiHost?: string` - Custom API endpoint (optional, defaults to 'https://events.journium.app')
  - `options?: JourniumLocalOptions` - Local configuration options (optional)

**Returns:** `JourniumAnalytics` - Analytics instance for tracking events

### JourniumAnalytics Instance Methods

#### `track(event: string, properties?: Record<string, unknown>): void`
Tracks custom events with optional properties.

**Parameters:**
- `event: string` - Event name to track
- `properties?: Record<string, unknown>` - Optional event properties

#### `identify(distinctId: string, attributes?: Record<string, unknown>): void`
Identifies a user and associates future events with their identity.

**Parameters:**
- `distinctId: string` - Unique user identifier
- `attributes?: Record<string, unknown>` - Optional user attributes

#### `reset(): void`
Resets user identity, typically called on logout.

**Returns:** `void`

#### `capturePageview(properties?: Record<string, unknown>): void`
Manually captures pageview events.

**Parameters:**
- `properties?: Record<string, unknown>` - Optional pageview properties

#### `startAutocapture(): void`
Starts automatic event capture for clicks, form interactions, and pageviews.

**Returns:** `void`

**Note:** Autocapture behavior is configured during initialization via the `autocapture` option.

#### `stopAutocapture(): void`
Stops automatic event capture.

**Returns:** `void`

#### `flush(): Promise<void>`
Manually sends all queued events to the server immediately.

**Returns:** `Promise<void>` - Promise that resolves when events are sent

#### `destroy(): void`
Cleans up the SDK, stops all tracking, and sends remaining events.

**Returns:** `void`

#### `getEffectiveOptions(): JourniumLocalOptions`
Returns the effective configuration options (merged local and remote options).

**Returns:** `JourniumLocalOptions` - Current effective configuration

### Types

#### `JourniumConfig`
Configuration object for initializing Journium.

```typescript
interface JourniumConfig {
  publishableKey: string;
  apiHost?: string;
  options?: JourniumLocalOptions;
}
```

#### `JourniumLocalOptions`
Local configuration options that can be set on the client.

```typescript
interface JourniumLocalOptions {
  debug?: boolean;                    // Enable debug logging
  flushAt?: number;                   // Number of events before auto-flush
  flushInterval?: number;             // Flush interval in milliseconds
  autocapture?: boolean | AutocaptureOptions; // Auto-capture configuration
  autoTrackPageviews?: boolean;       // Automatic pageview tracking
  sessionTimeout?: number;            // Session timeout in milliseconds
  sampling?: {
    enabled?: boolean;
    rate?: number;
  };
  features?: {
    enableGeolocation?: boolean;
    enableSessionRecording?: boolean;
    enablePerformanceTracking?: boolean;
  };
}
```

#### `AutocaptureOptions`
Configuration for automatic event capture.

```typescript
interface AutocaptureOptions {
  captureClicks?: boolean;            // Capture click events
  captureFormSubmits?: boolean;       // Capture form submissions
  captureFormChanges?: boolean;       // Capture form field changes
  captureTextSelection?: boolean;     // Capture text selection events
  ignoreClasses?: string[];           // CSS classes to ignore
  ignoreElements?: string[];          // HTML elements to ignore
  captureContentText?: boolean;       // Capture element text content
}
```

### Browser Support

- ✅ Modern browsers (ES2017+)
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+

### Bundle Formats

The package includes multiple build formats:

- **ESM**: `dist/index.esm.js` - For modern bundlers (webpack, Vite, Rollup)
- **CommonJS**: `dist/index.cjs` - For Node.js environments
- **UMD**: `dist/index.umd.js` - For browser `<script>` tags

#### UMD Usage

```html
<script src="node_modules/@journium/js/dist/index.umd.js"></script>
<script>
  const analytics = window.JourniumAnalytics.init({
    publishableKey: 'your-publishable-key'
  });
  analytics.track('page_loaded');
</script>
```