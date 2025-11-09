# Journium React Sample Application

This is a sample React application demonstrating how to integrate the Journium analytics SDK for event tracking.

## Features Demonstrated

- **JourniumProvider Setup**: Wrapping your app with the Journium context provider
- **Custom Event Tracking**: Button clicks with custom properties
- **E-commerce Events**: Purchase tracking with product details  
- **User Events**: Signup tracking with source attribution
- **Pageview Tracking**: Both automatic and manual pageview tracking
- **React Hooks**: Using `useTrackEvent`, `useTrackPageview`, and `useAutoTrackPageview`

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

4. **Open your browser** to `http://localhost:3000`

## Code Overview

### App.tsx
- Sets up the `JourniumProvider` with configuration
- Demonstrates various tracking hooks
- Shows different types of events (custom, e-commerce, user)

### Key Features
- **Auto Pageview Tracking**: Automatically tracks pageviews when component mounts
- **Interactive Demos**: Click buttons to see events being tracked
- **Debug Mode**: Console logging enabled to see events in browser DevTools

## Events Tracked

1. **Custom Events**: Button clicks with metadata
2. **E-commerce Events**: Purchase completion with product details
3. **User Events**: Signup events with attribution
4. **Pageview Events**: Both automatic and manual tracking

## Configuration

The sample uses these Journium configuration options:

```typescript
const journiumConfig = {
  applicationKey: 'demo-api-key',        // Your API key
  apiHost: 'https://api.journium.io',  // API endpoint
  debug: true,                   // Enable console logging
  flushAt: 10,                   // Batch size for events
  flushInterval: 30000           // Flush interval in milliseconds
};
```

## Next Steps

- Replace the demo API key with your actual Journium API key
- Customize event properties to match your application's needs
- Add more event tracking throughout your application
- Review the console output to understand what events are being sent