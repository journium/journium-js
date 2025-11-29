# journium-js

[![npm version](https://badge.fury.io/js/journium-js.svg)](https://badge.fury.io/js/journium-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**The official Journium JavaScript SDK for web browsers**

Track events, pageviews, and user interactions with ease. Perfect for SPAs, vanilla JavaScript apps, and any web application.

## 🚀 Quick Start

### Installation

```bash
npm install journium-js
```

### Basic Usage

```javascript
import { init } from 'journium-js';

// Initialize Journium
const journium = init({
  token: 'your-journium-token',
  apiHost: 'https://your-journium-instance.com'
});

// Track events
journium.track('button_clicked', {
  button_name: 'signup',
  page: 'homepage'
});

// Track pageviews (optional - can be automatic)
journium.capturePageview();

// Start auto-capture - automatically enabled when calling startAutoCapture()
// Autocapture is enabled by default, but you need to start it:
journium.startAutoCapture();
```

## 📖 API Reference

### Initialization

#### `init(config: JourniumConfig)`

Initialize the Journium SDK with your configuration.

```javascript
const journium = init({
  token: 'your-journium-token',          // Required: Your project token
  apiHost: 'https://api.journium.com',   // Required: Your API endpoint
  debug: false,                          // Optional: Enable debug logs
  flushAt: 20,                          // Optional: Flush after N events
  flushInterval: 10000,                 // Optional: Flush interval (ms)
  autocapture: true,                    // Optional: (default: true) - set false to disable
  sessionTimeout: 1800000               // Optional: Session timeout (30m)
});
```

### Event Tracking

#### `journium.track(eventName, properties?)`

Track custom events with optional properties.

```javascript
// Simple event
journium.track('user_signup');

// Event with properties
journium.track('purchase_completed', {
  product_id: 'prod_123',
  amount: 29.99,
  currency: 'USD',
  category: 'digital',
  plan: 'premium'
});

// User action with context
journium.track('video_played', {
  video_id: 'intro-2024',
  video_length: 120,
  quality: '1080p',
  autoplay: false
});
```

#### `journium.capturePageview(properties?)`

Manually capture pageview events.

```javascript
// Simple pageview
journium.capturePageview();

// Pageview with custom properties
journium.capturePageview({
  section: 'pricing',
  experiment_variant: 'v2',
  user_plan: 'free'
});
```

### Auto-Capture

#### `journium.startAutoCapture()` / `journium.stopAutoCapture()`

Control automatic event capture for clicks, pageviews, and form interactions.

**Note:** Autocapture is enabled by default. You can disable it entirely with `autocapture: false` in your config, or control it programmatically:

```javascript
// Start capturing events automatically (autocapture is enabled by default)
journium.startAutoCapture();

// Stop automatic capture
journium.stopAutoCapture();

// Or disable entirely in configuration:
const journium = init({
  token: 'your-token',
  apiHost: 'your-api.com',
  autocapture: false  // Disables all autocapture functionality
});
```

Configure what gets auto-captured:

```javascript
const journium = init({
  token: 'your-token',
  apiHost: 'https://your-api.com',
  autocapture: {
    captureClicks: true,              // Track click events
    captureFormSubmits: true,         // Track form submissions
    captureFormChanges: false,        // Track form field changes
    captureTextSelection: false,      // Track text selections
    captureContentText: true,         // Include element text
    ignoreClasses: ['no-track'],      // CSS classes to ignore
    ignoreElements: ['input[type="password"]'] // Elements to ignore
  }
});
```

### Data Management

#### `journium.flush()`

Manually send queued events to the server.

```javascript
// Send all pending events immediately
await journium.flush();
```

#### `journium.destroy()`

Clean up the SDK and send any remaining events.

```javascript
// Cleanup before page unload
journium.destroy();
```

## 🏗️ Event Properties

### Automatic Properties

Journium automatically includes these properties with every event:

- `$device_id` - Unique device identifier
- `$session_id` - Current session ID
- `distinct_id` - User identifier
- `$current_url` - Current page URL
- `$pathname` - URL pathname
- `$browser` - Browser name (Chrome, Firefox, etc.)
- `$os` - Operating system (Windows, macOS, etc.)
- `$device_type` - Device type (desktop, mobile, tablet)
- `$lib_version` - SDK version
- `$platform` - Always "web"

### Custom Properties

Add any custom properties to track additional context:

```javascript
journium.track('feature_used', {
  // Your custom properties
  feature_name: 'dark_mode',
  user_plan: 'premium',
  user_role: 'admin',
  experiment_group: 'control',
  
  // Nested objects work too
  user_preferences: {
    theme: 'dark',
    language: 'en',
    timezone: 'UTC'
  }
});
```

## 🔧 Configuration Options

### Required Configuration

```javascript
{
  token: 'your-journium-token',        // Your project token from Journium
  apiHost: 'https://api.journium.com'  // Your Journium API endpoint
}
```

### Optional Configuration

```javascript
{
  debug: false,                        // Enable console logging
  flushAt: 20,                        // Send events after N events queued
  flushInterval: 10000,               // Send events every N milliseconds
  sessionTimeout: 1800000,            // Session timeout (30 minutes)
  configEndpoint: '/configs',         // Custom config endpoint
  autocapture: true                   // Default: true - set false to disable auto-capture
}
```

### Advanced Auto-Capture Configuration

```javascript
{
  autocapture: {
    captureClicks: true,              // Capture click events
    captureFormSubmits: true,         // Capture form submissions  
    captureFormChanges: false,        // Capture form field changes
    captureTextSelection: false,      // Capture text selection events
    captureContentText: true,         // Include element text content
    ignoreClasses: [                  // CSS classes to ignore
      'no-track',
      'sensitive-data',
      'admin-only'
    ],
    ignoreElements: [                 // CSS selectors to ignore
      'input[type="password"]',
      '.credit-card-input',
      '[data-private]'
    ]
  }
}
```

## 🔒 Privacy & Security

Journium is designed with privacy in mind:

- **No PII by default** - We don't automatically collect personally identifiable information
- **Configurable tracking** - Exclude sensitive elements and data
- **Secure transmission** - All data sent over HTTPS
- **Session-based** - Automatic session management without persistent user tracking

### Excluding Sensitive Data

```javascript
// Method 1: CSS classes
<button class="signup-btn no-track">Sign Up</button>

// Method 2: Configuration
const journium = init({
  token: 'your-token',
  apiHost: 'your-api.com',
  autocapture: {
    ignoreClasses: ['no-track', 'sensitive'],
    ignoreElements: ['input[type="password"]', '.credit-card']
  }
});
```

## 🌐 Browser Support

- ✅ **Chrome** 60+
- ✅ **Firefox** 55+  
- ✅ **Safari** 12+
- ✅ **Edge** 79+
- ✅ **Mobile browsers** (iOS Safari, Chrome Mobile)

## 📝 TypeScript Support

Full TypeScript support with complete type definitions:

```typescript
import { init, JourniumConfig, Journium } from 'journium-js';

const config: JourniumConfig = {
  token: 'your-token',
  apiHost: 'https://api.journium.com',
  debug: true
};

const journium: Journium = init(config);

// Type-safe event tracking
journium.track('user_action', {
  action_type: 'click',
  element_id: 'signup-button',
  timestamp: new Date().toISOString()
});
```

## 🔗 Related Packages

Part of the Journium JavaScript SDK ecosystem:

- **[@journium/react](https://npmjs.com/package/@journium/react)** - React integration with hooks and providers
- **[@journium/nextjs](https://npmjs.com/package/@journium/nextjs)** - Next.js integration with SSR support
- **[@journium/node](https://npmjs.com/package/@journium/node)** - Node.js server-side tracking
- **[@journium/core](https://npmjs.com/package/@journium/core)** - Core utilities and types

## 📖 Documentation

For complete documentation, guides, and examples:

- **[Documentation](https://docs.journium.app)** - Complete guides and API reference
- **[Getting Started](https://docs.journium.app/getting-started)** - Quick setup guide
- **[Examples](https://docs.journium.app/examples)** - Code examples and patterns

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/journium/journium-js/blob/main/CONTRIBUTING.md).

## 📄 License

MIT License - see [LICENSE](https://github.com/journium/journium-js/blob/main/LICENSE) file for details.

## 🆘 Support

- **📚 Docs**: [docs.journium.app](https://docs.journium.app)
- **🐛 Issues**: [GitHub Issues](https://github.com/journium/journium-js/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/journium/journium-js/discussions)
- **📧 Email**: support@journium.com