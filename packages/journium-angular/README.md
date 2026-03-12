# @journium/angular

[![npm version](https://badge.fury.io/js/%40journium%2Fangular.svg)](https://badge.fury.io/js/@journium/angular)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

The official Journium SDK for Angular. Track events, pageviews, and user interactions using Angular's dependency injection with service and provider APIs.

---

## Getting Started

Learn how to use Journium in your Angular application:

- [Quick Start Guide](https://journium.app/docs/angular)
- [Concepts](https://journium.app/docs/angular/concepts)
- [SDK Reference](https://journium.app/docs/angular/service)

### Prerequisites
- Angular 15.0.0 or later (see [Angular Version Compatibility](COMPATIBILITY.md))
- Node.js `>=20.9.0` or later
- An existing Journium application. [Create your account for free](https://dashboard.journium.app/sign-up?utm_source=github&utm_medium=journium_angular).

## Installation

```bash
npm install @journium/angular
```

## Usage

**Standalone API** (modern Angular, recommended):

```typescript
// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { provideJournium, withJourniumRouter } from '@journium/angular';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideJournium({
      publishableKey: 'your-publishable-key'
    }),
    withJourniumRouter(),   // optional — auto-tracks pageviews on navigation
  ]
});
```

**NgModule API** (legacy):

```typescript
// app.module.ts
import { NgModule } from '@angular/core';
import { JourniumModule } from '@journium/angular/ngmodule';

@NgModule({
  imports: [
    JourniumModule.forRoot({
      publishableKey: 'your-publishable-key'
    })
  ]
})
export class AppModule {}
```

**Injecting the service** in any component:

```typescript
// any.component.ts
import { Component } from '@angular/core';
import { JourniumService } from '@journium/angular';

@Component({ ... })
export class MyComponent {
  constructor(private journium: JourniumService) {}

  onButtonClick() {
    this.journium.track('button_click', { button: 'signup' });
  }
}
```

For more detailed examples and configuration options, visit the [Journium documentation](https://journium.app/docs/angular).

## Other SDKs

- [@journium/react](https://www.npmjs.com/package/@journium/react) - React SDK
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
