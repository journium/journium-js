# @journium/react

[![npm version](https://badge.fury.io/js/%40journium%2Freact.svg)](https://badge.fury.io/js/@journium/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**React integration for Journium - Track events, pageviews, and user interactions in React applications**

The official React SDK for Journium providing hooks, providers, and components for seamless analytics integration in React applications.

## Installation

### npm
```bash
npm install @journium/react
```

### pnpm
```bash
pnpm add @journium/react
```

### yarn
```bash
yarn add @journium/react
```

## Basic Setup

### Environment Variables
First, create a `.env.local` file in your project root:

**Note:** For CRA projects, use `REACT_APP_` prefix:
```env
REACT_APP_JOURNIUM_PUBLISHABLE_KEY=your-actual-publishable-key-here
```

**Note:** For Vite projects, use `VITE_` prefix:
```env
VITE_JOURNIUM_PUBLISHABLE_KEY=your-actual-publishable-key-here
```

### Initialize Journium
Wrap your app with the `JourniumProvider` to enable analytics throughout your React application.

```jsx
import React from 'react';
import { JourniumProvider } from '@journium/react';
import App from './App';

function Root() {
  return (
    <JourniumProvider
      config={{
        publishableKey: process.env.REACT_APP_JOURNIUM_PUBLISHABLE_KEY!
      }}
    >
      <App />
    </JourniumProvider>
  );
}

export default Root;
```

**Vite Example:**
```jsx
// main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { JourniumProvider } from '@journium/react';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <JourniumProvider
      config={{
        publishableKey: import.meta.env.VITE_JOURNIUM_PUBLISHABLE_KEY!
      }}
    >
      <App />
    </JourniumProvider>
  </React.StrictMode>
);
```

**Vite .env file:**
```env
VITE_JOURNIUM_PUBLISHABLE_KEY=your-actual-publishable-key-here
```

**For Next.js applications, use the dedicated [`@journium/nextjs`](../journium-nextjs) package instead.**

### Track a Custom Event
Use the `useTrackEvent` hook to track custom events from any component.

```jsx
import React from 'react';
import { useTrackEvent } from '@journium/react';

function SignupButton() {
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

### Identify a User
Use the `useIdentify` hook to identify users when they log in or sign up.

```jsx
import React from 'react';
import { useIdentify } from '@journium/react';

function LoginForm() {
  const identify = useIdentify();

  const handleLogin = async (email, password) => {
    const user = await loginUser(email, password);
    
    identify(user.id, {
      name: user.name,
      email: user.email
    });
  };

  return (
    <form onSubmit={handleLogin}>
      {/* Login form fields */}
    </form>
  );
}
```

### Reset User Identity
Use the `useReset` hook to reset user identity when they log out.

```jsx
import React from 'react';
import { useReset } from '@journium/react';

function LogoutButton() {
  const reset = useReset();

  const handleLogout = async () => {
    await logoutUser();
    reset();
  };

  return <button onClick={handleLogout}>Log Out</button>;
}
```

## Advanced Setup
You can override default configurations and control autocapture:

**React/CRA Example:**
```jsx
import React from 'react';
import { JourniumProvider } from '@journium/react';
import App from './App';

function Root() {
  return (
    <JourniumProvider
      config={{
        publishableKey: process.env.REACT_APP_JOURNIUM_PUBLISHABLE_KEY!,
        apiHost: 'https://events.journium.app',
        options: {
          debug: process.env.REACT_APP_JOURNIUM_DEBUG === 'true',
          flushAt: 5,                    // Send events after N events
          flushInterval: 10000,          // Send events every N milliseconds
          sessionTimeout: 1800000,       // Session timeout (30 minutes)
          autoTrackPageviews: true,      // Automatically track pageview events (default: true)
          autocapture: {                 // Configure automatic event capture
            captureClicks: true,         // Track click events
            captureFormSubmits: true,    // Track form submissions
            captureFormChanges: false,   // Track form field changes
            ignoreClasses: ['no-track', 'sensitive'], // CSS classes to ignore
            ignoreElements: ['input[type="password"]'] // Elements to ignore
          }
        }
      }}
    >
      <App />
    </JourniumProvider>
  );
}

export default Root;
```

**Vite Example:**
```jsx
import React from 'react';
import { JourniumProvider } from '@journium/react';
import App from './App';

function Root() {
  return (
    <JourniumProvider
      config={{
        publishableKey: import.meta.env.VITE_JOURNIUM_PUBLISHABLE_KEY!,
        apiHost: 'https://events.journium.app',
        options: {
          debug: import.meta.env.VITE_JOURNIUM_DEBUG === 'true',
          flushAt: 5,
          flushInterval: 10000,
          sessionTimeout: 1800000,
          autoTrackPageviews: true,
          autocapture: {
            captureClicks: true,
            captureFormSubmits: true,
            captureFormChanges: false,
            ignoreClasses: ['no-track', 'sensitive'],
            ignoreElements: ['input[type="password"]']
          }
        }
      }}
    >
      <App />
    </JourniumProvider>
  );
}

export default Root;
```

## API Reference

### `<JourniumProvider>`
Provider component to initialize Journium throughout your React app.

```jsx
<JourniumProvider
  config={{
    publishableKey: process.env.REACT_APP_JOURNIUM_PUBLISHABLE_KEY!,
    apiHost: 'https://events.journium.app', // Optional
    options: { /* optional local options */ }
  }}
>
  <App />
</JourniumProvider>
```

### `useTrackEvent()`
Hook for tracking custom events with optional properties.

```jsx
import { useTrackEvent } from '@journium/react';

function Component() {
  const trackEvent = useTrackEvent();

  const handlePurchase = () => {
    trackEvent('purchase_completed', {
      product_id: 'prod_123',
      price: 29.99,
      currency: 'USD'
    });
  };

  return <button onClick={handlePurchase}>Buy Now</button>;
}
```

### `useIdentify()`
Hook for identifying users on login or signup.

```jsx
import { useIdentify } from '@journium/react';

function Component() {
  const identify = useIdentify();

  const handleLogin = (userId, userAttributes) => {
    identify(userId, userAttributes);
  };

  return <LoginForm onLogin={handleLogin} />;
}
```

### `useReset()`
Hook for resetting user identity on logout.

```jsx
import { useReset } from '@journium/react';

function Component() {
  const reset = useReset();

  const handleLogout = () => {
    reset();
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

### `useTrackPageview()`
Hook for manual pageview tracking.

```jsx
import { useTrackPageview } from '@journium/react';

function Component() {
  const trackPageview = useTrackPageview();

  const handleSpecialPageview = () => {
    trackPageview({
      page_type: 'modal',
      content_type: 'pricing_calculator'
    });
  };

  return <button onClick={handleSpecialPageview}>Track Modal View</button>;
}
```

### `useAutoTrackPageview()`
Hook for automatic pageview tracking when components mount or dependencies change.

```jsx
import { useAutoTrackPageview } from '@journium/react';

function ProductPage({ productId, category }) {
  // Tracks pageview when component mounts or productId changes
  useAutoTrackPageview([productId], {
    page_type: 'product_detail',
    product_id: productId,
    category: category
  });

  return <div>Product {productId}</div>;
}
```

### `useAutocapture()`
Hook for controlling automatic event capture.

```jsx
import { useAutocapture } from '@journium/react';

function ConsentBanner() {
  const { startAutocapture, stopAutocapture } = useAutocapture();

  const handleAccept = () => {
    startAutocapture();
  };

  const handleDecline = () => {
    stopAutocapture();
  };

  return (
    <div>
      <button onClick={handleAccept}>Accept</button>
      <button onClick={handleDecline}>Decline</button>
    </div>
  );
}
```

### `useJournium()`
Hook for direct access to the Journium instance for advanced use cases.

```jsx
import { useJournium } from '@journium/react';

function Component() {
  const { journium } = useJournium();

  const handleAdvancedTracking = () => {
    journium?.track('custom_event', { advanced: true });
    journium?.flush();
  };

  return <button onClick={handleAdvancedTracking}>Advanced Track</button>;
}
```