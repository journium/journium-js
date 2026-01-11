# @journium/js

[![npm version](https://badge.fury.io/js/@journium%2Fjs.svg)](https://badge.fury.io/js/@journium%2Fjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

The official Journium JavaScript SDK for web browsers. Track events, pageviews, and user interactions with ease.

---

## Getting Started

Learn how to use Journium to power your application:

- [Quick Start Guide](https://journium.app/docs/js)
- [Concepts](https://journium.app/docs/js/concepts)
- [SDK Reference](https://journium.app/docs/js)

### Prerequisites
- Modern browser (ES2017+)
- Node.js `>=18.17.0` or later
- An existing Journium application. [Create your account for free](https://dashboard.journium.app/sign-up?utm_source=github&utm_medium=journium_js).

## Installation

```bash
npm install @journium/js
```

## Usage

```javascript
import { init } from '@journium/js';

const journium = init({
  publishableKey: "your-publishable-key"
});

journium.track('button_clicked', {
  button_name: 'signup'
});
```

For more detailed examples and configuration options, visit the [Journium documentation](https://journium.app/docs/js/).

## Other SDKs

- [@journium/nextjs](https://www.npmjs.com/package/@journium/nextjs) - Next.js SDK
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
