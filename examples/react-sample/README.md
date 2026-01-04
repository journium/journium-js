# Journium React Sample Application

This is a sample React application demonstrating how to integrate the Journium analytics SDK for event tracking.

## Features Demonstrated

- **JourniumProvider Setup**: Wrapping your app with the Journium context provider
- **User Authentication**: Login/signup with proper user identification using `useIdentify` and `useReset` hooks
- **Custom Event Tracking**: Button clicks with custom properties
- **E-commerce Events**: Purchase tracking with product details  
- **Pageview Tracking**: Both automatic and manual pageview tracking
- **React Hooks**: Using `useTrackEvent`, `useTrackPageview`, `useIdentify`, `useReset`, and `useAutoTrackPageview`

## Running the Application

1. **Install dependencies** (from the workspace root):
   ```bash
   pnpm install
   ```

2. **Build the Journium packages**:
   ```bash
   pnpm dev
   ```

3. **Start the React application**:
   ```bash
   cd examples/react-sample
   pnpm start
   ```

4. **Open your browser** to `http://localhost:3005`

## Code Overview

### App.tsx
- Sets up the `JourniumProvider` with configuration
- Integrates `AuthProvider` for user authentication
- Demonstrates various tracking hooks
- Shows different types of events (custom, e-commerce, authentication)

### Key Features
- **Auto Pageview Tracking**: Automatically tracks pageviews when component mounts
- **Interactive Demos**: Click buttons to see events being tracked
- **Debug Mode**: Console logging enabled to see events in browser DevTools

## Events Tracked

1. **Authentication Events**: Login, signup, and logout using proper user identification
2. **Custom Events**: Button clicks with metadata
3. **E-commerce Events**: Purchase completion with product details
4. **Feature Usage Events**: User interaction tracking
4. **Pageview Events**: Both automatic and manual tracking

## Authentication Features

This sample demonstrates proper user identification using the Journium SDK:

### Login/Signup
- Uses the `useIdentify()` hook to properly identify users
- Tracks authentication events (`user_logged_in`, `user_signed_up`)
- Persists user sessions in localStorage

### User Identification
```typescript
import { useIdentify } from '@journium/react';

const identify = useIdentify();

// When user logs in
identify('user_123', {
  name: 'John Doe',
  email: 'john@example.com',
  company: 'Acme Inc'
});
```

### Logout
- Uses the `useReset()` hook to clear user identity
- Tracks logout events
- Generates new anonymous distinct ID

```typescript
import { useReset } from '@journium/react';

const reset = useReset();

// When user logs out
reset();
```

## Configuration

The sample uses these Journium configuration options:

```typescript
const journiumConfig = {
  publishableKey: 'demo-publishable-key',     // Your publishable key
  apiHost: 'https://api.journium.io',         // API endpoint (optional)
  options: {
    debug: true,                              // Enable console logging
    flushAt: 10,                             // Batch size for events
    flushInterval: 30000                     // Flush interval in milliseconds
  }
};
```

## Next Steps

- Replace the demo publishable key with your actual Journium publishable key
- Customize event properties to match your application's needs
- Add more event tracking throughout your application
- Review the console output to understand what events are being sent