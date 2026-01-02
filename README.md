# Journium JavaScript SDK

[![npm version](https://badge.fury.io/js/@journium%2Fjs.svg)](https://badge.fury.io/js/@journium%2Fjs)
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
| **`@journium/js`** | Core browser SDK | Vanilla JavaScript, SPAs |
| **`@journium/react`** | React integration | React applications with hooks |
| **`@journium/nextjs`** | Next.js integration | Next.js apps with SSR support |
| **`@journium/node`** | Node.js server SDK | Server-side tracking |
| **`@journium/core`** | Core SDK functionality | Identity, events, types & utilities |

## 🚀 Installation

Choose the package that fits your environment:

```bash
# For vanilla JavaScript/browser
npm install @journium/js

# For React applications
npm install @journium/react

# For Next.js applications  
npm install @journium/nextjs

# For Node.js servers
npm install @journium/node
```

## ⚡ Quick Start

Choose your environment and get started in minutes:

### Browser (Vanilla JavaScript)
```bash
npm install @journium/js
```
See **[@journium/js documentation](packages/journium-js/README.md)** for complete setup instructions.

### React Applications
```bash
npm install @journium/react
```
See **[@journium/react documentation](packages/journium-react/README.md)** for hooks and providers.

### Next.js Applications
```bash
npm install @journium/nextjs
```
See **[@journium/nextjs documentation](packages/journium-nextjs/README.md)** for SSR setup.

### Node.js Servers
```bash
npm install @journium/node
```
See **[@journium/node documentation](packages/journium-node/README.md)** for server-side tracking.

## 🔧 Configuration

All Journium SDKs share common configuration options. Each package README contains detailed configuration examples:

- **Core Options**: `publishableKey`, `apiHost`, debug settings
- **Auto-capture**: Click tracking, form interactions, pageviews
- **Privacy**: Data filtering and exclusion rules
- **Performance**: Batching, caching, and flush intervals

For detailed configuration guides, see the individual package documentation.

## 📖 API Reference

All Journium SDKs provide consistent core methods:

- **`track()`** - Track custom events with properties
- **`identify()`** - Identify users on login/signup  
- **`reset()`** - Reset user identity on logout
- **`capturePageview()`** - Manual pageview tracking
- **`startAutocapture()`** / **`stopAutocapture()`** - Control auto-tracking
- **`flush()`** - Send queued events immediately
- **`destroy()`** - Clean up the client

### Framework-Specific APIs

- **React**: `useJournium()`, `useTrackEvent()`, `useIdentify()`, `useReset()`
- **Next.js**: All React hooks plus SSR support and automatic route tracking
- **Node.js**: Server-side methods with `distinctId` parameter

See individual package documentation for detailed API references and examples.

## 🏗️ Event Properties

Journium automatically enriches events with device, session, and context information. You can add custom properties to track business-specific data.

**Automatic Properties**: Device ID, session ID, browser info, URL, platform details  
**Custom Properties**: Business metrics, user attributes, feature flags, A/B test variants

See package documentation for complete property lists and examples.

## 🔒 Privacy & Security

Journium is built with privacy-first principles:

- **No PII by default** - No automatic collection of personally identifiable information
- **Configurable tracking** - Granular control over what data is collected
- **Secure transmission** - All data sent over HTTPS with proper encryption
- **User consent integration** - Compatible with consent management platforms
- **Data minimization** - Collect only what you need for your use case

Configure privacy settings and data exclusion rules in each package's documentation.

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
│   ├── journium-js/         # Core browser SDK (@journium/js)
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
pnpm --filter @journium/js test

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