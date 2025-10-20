# Journium JavaScript SDK

A comprehensive JavaScript SDK for Journium analytics, supporting web browsers, React, Next.js, and Node.js environments.

## 📦 Packages

- **`journium-js`** - Core browser SDK
- **`@journium/react`** - React integration with hooks and context
- **`@journium/nextjs`** - Next.js integration with SSR support
- **`@journium/node`** - Node.js server-side SDK
- **`@journium/shared`** - Shared utilities and types

## 🚀 Quick Start

### Browser (Vanilla JS)
```javascript
import { init } from 'journium-js';

const journium = init({
  apiKey: 'your-api-key'
});

// Track pageview
journium.capturePageview();

// Track custom event
journium.track('button_clicked', { button_name: 'signup' });
```

### React
```jsx
import { JourniumProvider, useTrackEvent } from '@journium/react';

function App() {
  return (
    <JourniumProvider config={{ apiKey: 'your-api-key' }}>
      <MyComponent />
    </JourniumProvider>
  );
}

function MyComponent() {
  const track = useTrackEvent();
  
  return (
    <button onClick={() => track('button_clicked')}>
      Click me
    </button>
  );
}
```

### Next.js
```jsx
import { NextJourniumProvider } from '@journium/nextjs';

function MyApp({ Component, pageProps }) {
  return (
    <NextJourniumProvider config={{ apiKey: 'your-api-key' }}>
      <Component {...pageProps} />
    </NextJourniumProvider>
  );
}
```

### Node.js
```javascript
import { init } from '@journium/node';

const journium = init({
  apiKey: 'your-api-key'
});

journium.trackPageview('https://example.com/page');
journium.track('server_event', { user_id: 'user123' });
```

## 🛠 Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test

# Lint code
pnpm lint

# Format code
pnpm format
```

## 📋 Testing Checkpoints

1. **Phase 1**: ✅ Monorepo setup and build system
2. **Phase 2**: ✅ Core pageview tracking functionality  
3. **Phase 3**: ✅ Platform-specific packages (Web, React, Next.js, Node.js)
4. **Phase 4**: ✅ Testing framework and code quality tools

## 🏗 Architecture

Following PostHog's proven architecture:
- Monorepo with pnpm workspaces
- Turbo for build orchestration
- TypeScript for type safety
- Rollup for package bundling
- Jest for testing
- ESLint + Prettier for code quality

## 📄 License

MIT