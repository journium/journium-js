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
        publishableKey: 'your-journium-publishable-key'
      }}
    >
      <App />
    </JourniumProvider>
  );
}

export default Root;
```

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

```jsx
import React from 'react';
import { JourniumProvider } from '@journium/react';
import App from './App';

function Root() {
  return (
    <JourniumProvider
      config={{
        publishableKey: 'your-journium-publishable-key',
        apiHost: 'https://your-custom-instance.com', // Optional: defaults to 'https://events.journium.app'
        config: {
          debug: true,                    // Enable debug logging
          flushAt: 5,                    // Send events after N events
          flushInterval: 10000,          // Send events every N milliseconds
          sessionTimeout: 1800000,       // Session timeout (30 minutes)
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

## API Reference

### `<JourniumProvider>`
Provider component to initialize Journium throughout your React app.

```jsx
<JourniumProvider
  config={{
    publishableKey: 'your-journium-publishable-key',
    apiHost: 'https://events.journium.app', // Optional
    config: { /* optional local config */ }
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