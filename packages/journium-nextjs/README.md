# @journium/nextjs

[![npm version](https://badge.fury.io/js/%40journium%2Fnextjs.svg)](https://badge.fury.io/js/@journium%2Fnextjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

The official Journium SDK for Next.js. Track events, pageviews, and user interactions with built-in support for both App Router and Pages Router.

---

## Getting Started

Learn how to use Journium in your Next.js application:

- [Quick Start Guide](https://journium.app/docs/next)
- [Concepts](https://journium.app/docs/next/concepts)
- [SDK Reference](https://journium.app/docs/next/hooks)

### Prerequisites
- Next.js 13.5.7 or later
- Node.js `>=18.17.0` or later
- An existing Journium application. [Create your account for free](https://dashboard.journium.app/sign-up?utm_source=github&utm_medium=journium_nextjs).

## Installation

```bash
npm install @journium/nextjs
```

## Usage

```tsx
import { NextJourniumProvider } from '@journium/nextjs';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <NextJourniumProvider
          config={{
            publishableKey: "your-publishable-key"
          }}
        >
          {children}
        </NextJourniumProvider>
      </body>
    </html>
  );
}
```

For more detailed examples, hooks, and configuration options, visit the [Journium documentation](https://journium.app/docs/next).

## Other SDKs

- [@journium/js](https://www.npmjs.com/package/@journium/js) - JavaScript SDK
- [@journium/react](https://www.npmjs.com/package/@journium/react) - React SDK

## Support

Need help? Reach out to us:

- 📖 Join our official community [Discord server](https://journium.app/discord)
- 🐛 [Issue Tracker](https://github.com/journium/journium-js/issues)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/journium/journium-js/blob/main/CONTRIBUTING.md) and [code of conduct](https://github.com/journium/journium-js/blob/main/CODE_OF_CONDUCT.md).


## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/journium/journium-js/blob/main/LICENSE) for more information.
