# @journium/react

[![npm version](https://badge.fury.io/js/%40journium%2Freact.svg)](https://badge.fury.io/js/@journium/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

The official Journium SDK for React. Track events, pageviews, and user interactions with built-in hooks and providers.

---

## Getting Started

Learn how to use Journium in your React application:

- [Quick Start Guide](https://journium.app/docs/react)
- [Concepts](https://journium.app/docs/react/concepts)
- [SDK Reference](https://journium.app/docs/react/hooks)

### Prerequisites
- React 18 or later
- Node.js `>=18.17.0` or later
- An existing Journium application. [Create your account for free](https://dashboard.journium.app/sign-up?utm_source=github&utm_medium=journium_react).

## Installation

```bash
npm install @journium/react
```

## Usage

```tsx
import { JourniumProvider } from '@journium/react';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <JourniumProvider
      config={{
        publishableKey: "your-publishable-key"
      }}
    >
      <App />
    </JourniumProvider>
  </React.StrictMode>
);
```

For more detailed examples, hooks, and configuration options, visit the [Journium documentation](https://journium.app/docs/react).

## Other SDKs

- [@journium/nextjs](https://www.npmjs.com/package/@journium/nextjs) - Next.js SDK
- [@journium/js](https://www.npmjs.com/package/@journium/js) - JavaScript SDK

## Support

Need help? Reach out to us:

- 📖 Join our official community [Discord server](https://journium.app/discord)
- 🐛 [Issue Tracker](https://github.com/journium/journium-js/issues)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/journium/journium-js/blob/main/CONTRIBUTING.md) and [code of conduct](https://github.com/journium/journium-js/blob/main/CODE_OF_CONDUCT.md).


## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/journium/journium-js/blob/main/LICENSE) for more information.

