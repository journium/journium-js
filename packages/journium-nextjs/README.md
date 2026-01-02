# @journium/nextjs

[![npm version](https://badge.fury.io/js/%40journium%2Fnextjs.svg)](https://badge.fury.io/js/@journium%2Fnextjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**Next.js integration for Journium - Track events, pageviews, and user interactions in Next.js applications**

The official Next.js SDK for Journium providing SSR support, automatic route tracking, and React hooks optimized for Next.js applications.

## Installation

### npm
```bash
npm install @journium/nextjs
```

### pnpm
```bash
pnpm add @journium/nextjs
```

### yarn
```bash
yarn add @journium/nextjs
```

## Basic Setup

### Initialize Journium
Wrap your app with the `NextJourniumProvider` in your `_app.tsx` to enable analytics throughout your Next.js application.

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { NextJourniumProvider } from '@journium/nextjs';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextJourniumProvider
      config={{
        publishableKey: 'your-journium-publishable-key'
      }}
    >
      <Component {...pageProps} />
    </NextJourniumProvider>
  );
}
```

### Track a Custom Event
Use the `useTrackEvent` hook to track custom events from any component or page.

```tsx
import { useTrackEvent } from '@journium/nextjs';

function ProductPage() {
  const trackEvent = useTrackEvent();

  const handlePurchase = () => {
    trackEvent('purchase_started', {
      product_id: 'prod_123',
      page: 'product_detail',
      value: 29.99
    });
  };

  return <button onClick={handlePurchase}>Buy Now</button>;
}
```

### Identify a User
Use the `useIdentify` hook to identify users when they log in or sign up.

```tsx
import { useIdentify } from '@journium/nextjs';

function LoginPage() {
  const identify = useIdentify();

  const handleLogin = async (credentials) => {
    const user = await authenticateUser(credentials);
    
    identify(user.id, {
      name: user.name,
      email: user.email,
      plan: user.plan
    });
  };

  return (
    <LoginForm onSubmit={handleLogin} />
  );
}
```

### Reset User Identity
Use the `useReset` hook to reset user identity when they log out.

```tsx
import { useReset } from '@journium/nextjs';

function Header() {
  const reset = useReset();

  const handleLogout = async () => {
    await logoutUser();
    reset();
    router.push('/');
  };

  return <button onClick={handleLogout}>Sign Out</button>;
}
```

## Advanced Setup

You can override default configurations and control route tracking:

```tsx
// pages/_app.tsx
import type { AppProps } from 'next/app';
import { NextJourniumProvider } from '@journium/nextjs';

const journiumConfig = {
  publishableKey: 'your-journium-publishable-key',
  apiHost: 'https://your-custom-instance.com', // Optional: defaults to 'https://events.journium.app'
  config: {
    debug: process.env.NODE_ENV === 'development',
    flushAt: 10,                   // Send events after N events
    flushInterval: 5000,           // Send events every N milliseconds  
    sessionTimeout: 1800000,       // Session timeout (30 minutes)
    autocapture: {                 // Configure automatic event capture
      captureClicks: true,         // Track click events
      captureFormSubmits: true,    // Track form submissions
      captureFormChanges: false,   // Track form field changes
      ignoreClasses: ['no-track'], // CSS classes to ignore
      ignoreElements: ['input[type="password"]'] // Elements to ignore
    }
  }
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextJourniumProvider 
      config={journiumConfig}
      trackRouteChanges={true} // Optional: Track Next.js route changes (default: true)
    >
      <Component {...pageProps} />
    </NextJourniumProvider>
  );
}
```

## API Reference

### `<NextJourniumProvider>`
Provider component to initialize Journium throughout your Next.js app with SSR support.

```tsx
<NextJourniumProvider
  config={{
    publishableKey: 'your-journium-publishable-key',
    apiHost: 'https://events.journium.app', // Optional
    config: { /* optional local config */ }
  }}
  trackRouteChanges={true} // Optional: automatic route tracking
>
  <Component {...pageProps} />
</NextJourniumProvider>
```

### `useTrackEvent()`
Hook for tracking custom events with optional properties.

```tsx
import { useTrackEvent } from '@journium/nextjs';

function Component() {
  const trackEvent = useTrackEvent();

  const handleSignup = () => {
    trackEvent('user_signup', {
      method: 'email',
      source: 'landing_page',
      plan: 'free'
    });
  };

  return <button onClick={handleSignup}>Sign Up</button>;
}
```

### `useIdentify()`
Hook for identifying users on login or signup.

```tsx
import { useIdentify } from '@journium/nextjs';

function Component() {
  const identify = useIdentify();

  const handleUserLogin = (userId, userAttributes) => {
    identify(userId, userAttributes);
  };

  return <AuthForm onLogin={handleUserLogin} />;
}
```

### `useReset()`
Hook for resetting user identity on logout.

```tsx
import { useReset } from '@journium/nextjs';

function Component() {
  const reset = useReset();

  const handleLogout = () => {
    reset();
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### `useTrackPageview()`
Hook for manual pageview tracking beyond automatic route tracking.

```tsx
import { useTrackPageview } from '@journium/nextjs';

function Component() {
  const trackPageview = useTrackPageview();

  const handleModalView = () => {
    trackPageview({
      page_type: 'modal',
      modal_name: 'checkout',
      step: 'payment'
    });
  };

  return <button onClick={handleModalView}>Open Checkout</button>;
}
```

### `useAutoTrackPageview()`
Hook for automatic pageview tracking when components mount or dependencies change.

```tsx
import { useAutoTrackPageview } from '@journium/nextjs';

function ProductPage({ productId }) {
  // Tracks pageview when component mounts or productId changes
  useAutoTrackPageview([productId], {
    page_type: 'product',
    product_id: productId,
    framework: 'nextjs'
  });

  return <div>Product {productId}</div>;
}
```

### `useJournium()`
Hook for direct access to the Journium instance for advanced use cases.

```tsx
import { useJournium } from '@journium/nextjs';

function Component() {
  const { journium } = useJournium();

  const handleComplexTracking = () => {
    journium?.track('custom_event', { complex: true });
    journium?.capturePageview({ manual: true });
    journium?.startAutocapture();
  };

  return <button onClick={handleComplexTracking}>Complex Track</button>;
}
```

### Server-Side Rendering (SSR) Support

The Next.js SDK automatically handles SSR scenarios and provides utilities for server-side tracking:

```tsx
// pages/api/track.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Server-side tracking logic
  // Note: Use @journium/node for server-side tracking
  res.status(200).json({ success: true });
}
```

### Route Change Tracking

Automatic pageview tracking for Next.js route changes is enabled by default. Customize with:

```tsx
<NextJourniumProvider
  config={journiumConfig}
  trackRouteChanges={false} // Disable automatic route tracking
>
  <Component {...pageProps} />
</NextJourniumProvider>
```