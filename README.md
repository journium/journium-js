# Journium JavaScript SDK

[![npm version](https://badge.fury.io/js/journium-js.svg)](https://badge.fury.io/js/journium-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Documentation](https://img.shields.io/badge/docs-docs.journium.app-blue.svg)](https://docs.journium.app)

A comprehensive JavaScript SDK for Journium analytics, providing seamless event tracking across web browsers, React, Next.js, and Node.js environments.

**📚 [Full Documentation](https://docs.journium.app) | 🚀 [Quick Start](#-quick-start) | 📦 [Installation](#-installation)**

## What is Journium?

Journium is a modern analytics platform that helps you understand user behavior and track important events in your applications. Our JavaScript SDK makes it easy to:

- 📊 **Track Events**: Capture custom events with rich properties
- 🔄 **Auto-Capture**: Automatically track pageviews, clicks, and form interactions  
- ⚡ **Performance**: Lightning-fast with localStorage caching and background sync
- 🌐 **Universal**: Works in browsers, React apps, Next.js, and Node.js servers
- 🛡️ **Privacy-First**: Built with user privacy and GDPR compliance in mind
- 📱 **Session Tracking**: Automatic session management and user identification

## 📦 Packages

This monorepo contains multiple packages optimized for different environments:

| Package | Description | Use Case |
|---------|-------------|----------|
| **`journium-js`** | Core browser SDK | Vanilla JavaScript, SPAs |
| **`@journium/react`** | React integration | React applications with hooks |
| **`@journium/nextjs`** | Next.js integration | Next.js apps with SSR support |
| **`@journium/node`** | Node.js server SDK | Server-side tracking |
| **`@journium/core`** | Core SDK functionality | Identity, events, types & utilities |

## 🚀 Installation

Choose the package that fits your environment:

```bash
# For vanilla JavaScript/browser
npm install journium-js

# For React applications
npm install @journium/react

# For Next.js applications  
npm install @journium/nextjs

# For Node.js servers
npm install @journium/node
```

## ⚡ Quick Start

### Browser (Vanilla JavaScript)

```javascript
import { init } from 'journium-js';

// Initialize with your configuration
const journium = init({
  token: 'your-journium-token',
  apiHost: 'https://your-journium-instance.com'
});

// Track a pageview (usually automatic)
journium.capturePageview();

// Track custom events
journium.track('button_clicked', {
  button_name: 'signup',
  page: 'homepage',
  user_type: 'visitor'
});

// Start auto-capture (tracks clicks, pageviews automatically)
journium.startAutoCapture();
```

### React

```jsx
import React from 'react';
import { JourniumProvider, useJournium } from '@journium/react';

// Wrap your app with the provider
function App() {
  return (
    <JourniumProvider 
      config={{ 
        token: 'your-journium-token',
        apiHost: 'https://your-journium-instance.com'
      }}
      autoCapture={true}
    >
      <HomePage />
    </JourniumProvider>
  );
}

// Use the hook in components
function HomePage() {
  const { journium } = useJournium();
  
  const handleSignup = () => {
    journium?.track('user_signup', {
      method: 'email',
      source: 'homepage_cta'
    });
  };
  
  return (
    <div>
      <h1>Welcome to My App</h1>
      <button onClick={handleSignup}>Sign Up</button>
    </div>
  );
}
```

### Next.js

```jsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { NextJourniumProvider } from '@journium/nextjs';

const journiumConfig = {
  token: 'your-journium-token',
  apiHost: 'https://your-journium-instance.com',
  debug: process.env.NODE_ENV === 'development'
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextJourniumProvider config={journiumConfig} autoCapture={true}>
      <Component {...pageProps} />
    </NextJourniumProvider>
  );
}
```

### Node.js

```javascript
import { init } from '@journium/node';

// Initialize the client
const journium = init({
  token: 'your-journium-token',
  apiHost: 'https://your-journium-instance.com'
});

// Track server-side events
journium.track('user_login', {
  user_id: 'user123',
  method: 'email',
  ip_address: req.ip
}, 'user123');

// Track pageviews
journium.trackPageview('https://example.com/dashboard', {
  user_id: 'user123',
  plan: 'premium'
}, 'user123');

// Make sure to flush before process exits
await journium.flush();
```

## 🔧 Configuration Options

### Core Configuration

```javascript
const config = {
  // Required
  token: 'your-journium-token',        // Your Journium project token
  apiHost: 'https://api.journium.com', // Your Journium API endpoint
  
  // Optional
  debug: false,                        // Enable debug logging
  flushAt: 20,                        // Number of events before auto-flush
  flushInterval: 10000,               // Auto-flush interval (ms)
  sessionTimeout: 1800000,            // Session timeout (30 minutes)
  configEndpoint: '/configs',         // Custom config endpoint
  
  // Auto-capture settings
  autocapture: true,                  // Enable auto-capture
  // OR configure specific auto-capture options:
  autocapture: {
    captureClicks: true,              // Auto-track click events
    captureFormSubmits: true,         // Auto-track form submissions
    captureFormChanges: false,        // Auto-track form field changes
    captureTextSelection: false,      // Auto-track text selections
    captureContentText: true,         // Include element text in events
    ignoreClasses: ['no-track'],      // CSS classes to ignore
    ignoreElements: ['input[type="password"]'] // Elements to ignore
  }
};
```

### Environment-Specific Options

**React/Next.js only:**
```jsx
<JourniumProvider 
  config={journiumConfig}
  autoCapture={true}          // Start auto-capture immediately
>
```

## 📖 API Reference

### Core Methods

#### `journium.track(eventName, properties, distinctId?)`

Track a custom event with optional properties.

```javascript
journium.track('purchase_completed', {
  product_id: 'prod_123',
  amount: 29.99,
  currency: 'USD',
  category: 'digital'
});
```

#### `journium.capturePageview(properties?)`

Manually capture a pageview event.

```javascript
journium.capturePageview({
  section: 'pricing',
  experiment_variant: 'v2'
});
```

#### `journium.startAutoCapture()` / `journium.stopAutoCapture()`

Control automatic event capture.

```javascript
journium.startAutoCapture();  // Start auto-tracking
journium.stopAutoCapture();   // Stop auto-tracking
```

#### `journium.flush()`

Manually flush queued events to the server.

```javascript
await journium.flush();
```

#### `journium.destroy()`

Clean up the client and flush remaining events.

```javascript
journium.destroy();
```

### React Hooks

#### `useJournium()`

Access the Journium instance in React components.

```jsx
const { journium } = useJournium();

// Track events
journium?.track('feature_used', { feature: 'dark_mode' });
```

## 🏗️ Event Properties

### Automatic Properties

Journium automatically includes these properties with every event:

- `$device_id` - Unique device identifier
- `$session_id` - Current session identifier  
- `distinct_id` - User identifier
- `$current_url` - Current page URL
- `$pathname` - URL pathname
- `$browser` - Browser name
- `$os` - Operating system
- `$device_type` - Device type (desktop/mobile/tablet)
- `$lib_version` - SDK version
- `$platform` - Platform (web/server)

### Custom Properties

Add your own properties to any event:

```javascript
journium.track('video_played', {
  video_id: 'intro-2024',
  video_length: 120,
  quality: '1080p',
  autoplay: false,
  user_plan: 'premium'
});
```

## 🔒 Privacy & Security

Journium is designed with privacy in mind:

- **No PII by default**: We don't automatically collect personally identifiable information
- **Configurable tracking**: Disable auto-capture or exclude sensitive elements
- **Secure transmission**: All data is sent over HTTPS
- **User consent**: Easy integration with consent management platforms
- **Data minimization**: Only collect what you need

### Excluding Sensitive Data

```javascript
// Exclude elements with specific classes
autocapture: {
  ignoreClasses: ['sensitive', 'pii'],
  ignoreElements: ['input[type="password"]', '.credit-card']
}
```

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/journium/journium-js.git
cd journium-js

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint and format
pnpm lint
pnpm format
```

### Development Server

```bash
# Start development servers for examples
pnpm dev

# This starts:
# - React sample: http://localhost:3005
# - Next.js sample: http://localhost:3004  
# - Events monitor: http://localhost:3006
```

### Project Structure

```
journium-js/
├── packages/
│   ├── journium-js/         # Core browser SDK
│   ├── journium-react/      # React integration
│   ├── journium-nextjs/     # Next.js integration
│   ├── journium-node/       # Node.js SDK
│   └── core/                # Core SDK functionality
├── examples/
│   ├── react-sample/        # React example app
│   ├── nextjs-sample/       # Next.js example app  
│   └── events-monitor/      # Event debugging tool
└── docs/                    # Documentation
```

## 🧪 Testing

We use Jest for testing across all packages:

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter journium-js test

# Run tests in watch mode
pnpm test:watch
```

## 📝 Examples

Check out our example applications and guides:

**Local Examples:**
- **[React Sample](/examples/react-sample)** - Complete React app with Journium integration
- **[Next.js Sample](/examples/nextjs-sample)** - Next.js app showing SSR usage
- **[Events Monitor](/examples/events-monitor)** - Debug tool for viewing events

**Online Guides:**
- **[Live Demo](https://docs.journium.app/demo)** - Interactive SDK demo
- **[Code Examples](https://docs.journium.app/examples)** - More integration examples
- **[Best Practices](https://docs.journium.app/best-practices)** - Implementation patterns

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribution Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and add tests
4. Run the test suite: `pnpm test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Resources

- **📚 Documentation**: [https://docs.journium.app](https://docs.journium.app)
- **🐛 Issues**: [GitHub Issues](https://github.com/journium/journium-js/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/journium/journium-js/discussions)
- **📧 Email**: support@journium.com

## 📖 Additional Documentation

For comprehensive guides, tutorials, and API references, visit **[docs.journium.app](https://docs.journium.app)**:

### 🔗 Quick Links
- **[Getting Started Guide](https://docs.journium.app/getting-started)** - Complete setup walkthrough
- **[API Reference](https://docs.journium.app/api)** - Detailed method documentation
- **[React Integration](https://docs.journium.app/integrations/react)** - React-specific guides
- **[Next.js Integration](https://docs.journium.app/integrations/nextjs)** - Next.js setup and SSR
- **[Node.js Server-Side](https://docs.journium.app/integrations/nodejs)** - Backend tracking
- **[Configuration](https://docs.journium.app/configuration)** - All configuration options
- **[Privacy & Compliance](https://docs.journium.app/privacy)** - GDPR, data handling

## 🗺️ Roadmap

- [ ] **Real-time events** - WebSocket support for real-time event streaming
- [ ] **Enhanced auto-capture** - More intelligent automatic event detection
- [ ] **Performance monitoring** - Built-in performance tracking
- [ ] **A/B testing** - Native A/B testing capabilities
- [ ] **Mobile SDKs** - React Native, iOS, and Android support

---

**Made with ❤️ by the Journium team**