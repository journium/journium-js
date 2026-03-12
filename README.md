# Journium JavaScript SDK

[![npm version](https://badge.fury.io/js/@journium%2Fjs.svg)](https://badge.fury.io/js/@journium%2Fjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Documentation](https://img.shields.io/badge/docs-journium.app/docs-blue.svg)](https://journium.app/docs)

A comprehensive JavaScript SDK for Journium analytics, providing seamless event tracking across web browsers, React, Next.js, and Node.js environments.

**📚 [Full Documentation](https://journium.app/docs) | 🚀 [Quick Start](#-quick-start) | 📦 [Installation](#-installation)**

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
| **`@journium/angular`** | Angular integration | Angular 15+ apps (standalone & NgModule) |
| **`@journium/core`** | Core SDK functionality | Identity, events, types & utilities |

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
# - React sample:    http://localhost:3005
# - Next.js sample:  http://localhost:3004
# - Angular sample:  http://localhost:3008
# - JS sample:       http://localhost:3007
# - Events monitor:  http://localhost:3006
```

### Project Structure

```
journium-js/
├── packages/
│   ├── journium-js/         # Core browser SDK (@journium/js)
│   ├── journium-react/      # React integration (@journium/react)
│   ├── journium-nextjs/     # Next.js integration (@journium/nextjs)
│   ├── journium-angular/    # Angular integration (@journium/angular)
│   └── core/                # Core SDK functionality (@journium/core)
├── examples/
│   ├── react-sample/        # React example app (port 3005)
│   ├── nextjs-sample/       # Next.js example app (port 3004)
│   ├── angular-sample/      # Angular example app (port 3008)
│   ├── js-sample/           # Vanilla JS example (port 3007)
│   └── events-monitor/      # Event debugging tool (port 3006)
└── basic-example.html       # Standalone HTML/CDN example
```

## 🧪 Testing

We use Jest for testing across all packages:

```bash
# Run all tests
pnpm test

# Run tests for a specific package
pnpm --filter @journium/js test
```

## 📝 Examples

Check out our example applications and guides:

**Local Examples:**
- **[React Sample](/examples/react-sample)** - Complete React app with Journium integration
- **[Next.js Sample](/examples/nextjs-sample)** - Next.js app showing SSR usage
- **[Angular Sample](/examples/angular-sample)** - Angular 15+ app with standalone and NgModule setup
- **[JS Sample](/examples/js-sample)** - Vanilla JavaScript integration
- **[Events Monitor](/examples/events-monitor)** - Debug tool for viewing events

**Online Guides:**
- **[Live Demo](https://journium.app/docs/demo)** - Interactive SDK demo
- **[Code Examples](https://journium.app/docs/examples)** - More integration examples
- **[Best Practices](https://journium.app/docs/best-practices)** - Implementation patterns

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

- **📚 Documentation**: [https://journium.app/docs](https://journium.app/docs)
- **🐛 Issues**: [GitHub Issues](https://github.com/journium/journium-js/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/journium/journium-js/discussions)
- **📧 Email**: support@journium.com

## 📖 Additional Documentation

For comprehensive guides, tutorials, and API references, visit **[journium.app/docs](https://journium.app/docs)**:

## 🗺️ Roadmap

- [ ] **Real-time events** - WebSocket support for real-time event streaming
- [ ] **Enhanced auto-capture** - More intelligent automatic event detection
- [ ] **A/B testing** - Native A/B testing capabilities
- [ ] **Mobile SDKs** - React Native, iOS, and Android support

---

**Made with ❤️ by the Journium team**