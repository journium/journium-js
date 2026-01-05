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

### API Classes and Types

The main analytics class is `JourniumAnalytics`, available through the React hooks and context.

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

### Components

#### `<JourniumProvider>`
Provider component that initializes Journium analytics throughout your React application.

**Props:**
- `config: JourniumConfig` - Configuration object for Journium
  - `publishableKey: string` - Your Journium publishable key (required)
  - `apiHost?: string` - Custom API endpoint (optional, defaults to 'https://events.journium.app')
  - `options?: JourniumLocalOptions` - Local configuration options (optional)
- `children: ReactNode` - React children to wrap

### Hooks

#### `useTrackEvent()`
Returns a function to track custom events.

**Returns:** `(event: string, properties?: Record<string, unknown>) => void`
- `event: string` - Event name to track
- `properties?: Record<string, unknown>` - Optional event properties

#### `useIdentify()`
Returns a function to identify users.

**Returns:** `(distinctId: string, attributes?: Record<string, unknown>) => void`
- `distinctId: string` - Unique user identifier
- `attributes?: Record<string, unknown>` - Optional user attributes

#### `useReset()`
Returns a function to reset user identity (typically on logout).

**Returns:** `() => void`

#### `useTrackPageview()`
Returns a function to manually track pageview events.

**Returns:** `(properties?: Record<string, unknown>) => void`
- `properties?: Record<string, unknown>` - Optional pageview properties

#### `useAutoTrackPageview()`
Automatically tracks pageview when component mounts or dependencies change.

**Parameters:**
- `dependencies?: React.DependencyList` - Dependencies to watch for changes (defaults to empty array)
- `properties?: Record<string, unknown>` - Optional pageview properties

**Returns:** `void`

#### `useAutocapture()`
Returns functions to control automatic event capture.

**Returns:** `{ startAutocapture: () => void, stopAutocapture: () => void }`
- `startAutocapture()` - Enable automatic event capture
- `stopAutocapture()` - Disable automatic event capture

#### `useJournium()`
Returns the Journium context for advanced use cases.

**Returns:** `JourniumContextValue`
- `analytics: JourniumAnalytics | null` - The analytics instance
- `config: JourniumConfig | null` - The configuration object
- `effectiveOptions: JourniumLocalOptions | null` - The effective options (merged local and remote)

### Types

#### `JourniumConfig`
Configuration object for initializing Journium.

```typescript
interface JourniumConfig {
  publishableKey: string;
  apiHost?: string;
  options?: JourniumLocalOptions;
}
```

#### `JourniumLocalOptions`
Local configuration options that can be set on the client.

```typescript
interface JourniumLocalOptions {
  debug?: boolean;                    // Enable debug logging
  flushAt?: number;                   // Number of events before auto-flush
  flushInterval?: number;             // Flush interval in milliseconds
  autocapture?: boolean | AutocaptureOptions; // Auto-capture configuration
  autoTrackPageviews?: boolean;       // Automatic pageview tracking
  sessionTimeout?: number;            // Session timeout in milliseconds
  sampling?: {
    enabled?: boolean;
    rate?: number;
  };
  features?: {
    enableGeolocation?: boolean;
    enableSessionRecording?: boolean;
    enablePerformanceTracking?: boolean;
  };
}
```

#### `AutocaptureOptions`
Configuration for automatic event capture.

```typescript
interface AutocaptureOptions {
  captureClicks?: boolean;            // Capture click events
  captureFormSubmits?: boolean;       // Capture form submissions
  captureFormChanges?: boolean;       // Capture form field changes
  captureTextSelection?: boolean;     // Capture text selection events
  ignoreClasses?: string[];           // CSS classes to ignore
  ignoreElements?: string[];          // HTML elements to ignore
  captureContentText?: boolean;       // Capture element text content
}
```

#### `JourniumAnalytics`
The main analytics class instance available through hooks.

**Methods:**
- `track(event: string, properties?: Record<string, unknown>): void` - Track custom event
- `identify(distinctId: string, attributes?: Record<string, unknown>): void` - Identify user
- `reset(): void` - Reset user identity
- `capturePageview(properties?: Record<string, unknown>): void` - Track pageview
- `startAutocapture(): void` - Start automatic event capture
- `stopAutocapture(): void` - Stop automatic event capture
- `flush(): void` - Flush pending events immediately
- `getEffectiveOptions(): JourniumLocalOptions` - Get effective configuration