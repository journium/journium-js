# Journium SDK Examples

This directory contains sample applications demonstrating how to integrate Journium analytics into your web applications.

## Available Examples

### 1. Events Monitor (`events-monitor/`)
A real-time event monitoring server that provides:
- **Event Ingestion API**: Receives events from Journium SDK samples
- **WebSocket Broadcasting**: Real-time event streaming to connected clients
- **Web Dashboard**: Beautiful UI for monitoring events with timestamps
- **Test Interface**: Send manual test events directly from the UI

**Purpose:**
- Mock production event ingestion server
- Real-time visualization of SDK events
- Debug and development tool for Journium integration

### 2. React Sample (`react-sample/`)
A complete React application showcasing:
- **JourniumProvider Setup**: Context provider configuration
- **Custom Event Tracking**: Button clicks, user interactions
- **E-commerce Events**: Purchase tracking, add to cart
- **Pageview Tracking**: Automatic and manual pageview events
- **React Hooks**: `useTrackEvent`, `useTrackPageview`, `useAutoTrackPageview`

**Features:**
- Interactive demo buttons for different event types
- Preconfigured to send events to the Events Monitor
- Comprehensive event examples with metadata

### 3. Vanilla JavaScript Sample (`js-sample/`)
A comprehensive vanilla JavaScript SPA demonstrating:
- **Pure JavaScript Integration**: No frameworks, just the core SDK
- **Single-Page Navigation**: SPA routing with pageview tracking
- **Interactive UI**: Modern, responsive design with real-time counters
- **Complete Event Coverage**: All major event types in one demo
- **Live Analytics Dashboard**: Real-time metrics and debug information

**Features:**
- Multi-page SPA (Home, Products, About, Contact)
- E-commerce product catalog with tracking
- Contact form with field-level analytics
- Session tracking and user engagement metrics
- Visual event counters and live dashboard

### 4. Next.js Sample (`nextjs-sample/`)
A multi-page Next.js application demonstrating:
- **NextJourniumProvider**: Next.js-specific provider with SSR support
- **Automatic Route Tracking**: Pageviews on navigation between pages
- **E-commerce Tracking**: Product catalog with detailed tracking
- **Form Interactions**: Contact forms with field-level tracking
- **Social Media Tracking**: External link click tracking

**Features:**
- Multiple pages (Home, Products, About)
- Server-side rendering support
- Complete e-commerce workflow tracking
- Preconfigured to send events to the Events Monitor

## Quick Start

### Prerequisites
1. Install dependencies from the workspace root:
   ```bash
   pnpm install
   ```

2. Build all Journium packages:
   ```bash
   pnpm build
   ```

### Complete Demo Setup (Recommended)

For the full experience with real-time event monitoring:

#### 1. Start the Events Monitor
```bash
# Start the events monitoring server
pnpm --filter journium-events-monitor start

# Open http://localhost:3006 in your browser
```

#### 2. Start a Demo Application
In another terminal, start any of the sample applications:

```bash
# Vanilla JavaScript Sample
pnpm --filter journium-js-sample start
# Open http://localhost:3007 in your browser

# React Sample
pnpm --filter journium-react-sample start
# Open http://localhost:3005 in your browser

# OR Next.js Sample  
pnpm --filter journium-nextjs-sample dev
# Open http://localhost:3004 in your browser
```

#### 3. Watch Events in Real-Time
1. **Arrange Windows**: Put the demo app and events monitor side by side
2. **Interact**: Click buttons, fill forms, navigate pages in the demo app
3. **Observe**: Watch events appear instantly in the events monitor dashboard
4. **Debug**: See complete event data including properties and timestamps

### Running Examples Individually

#### Events Monitor Only
```bash
pnpm --filter journium-events-monitor start
# Access dashboard at http://localhost:3006
```

#### JavaScript Sample Only
```bash
pnpm --filter journium-js-sample start
# App runs at http://localhost:3007
# Events logged to browser console
```

#### React Sample Only
```bash
pnpm --filter journium-react-sample start
# App runs at http://localhost:3005
# Events logged to browser console
```

#### Next.js Sample Only
```bash
pnpm --filter journium-nextjs-sample dev
# App runs at http://localhost:3004
# Events logged to browser console
```

## Event Types Demonstrated

### Custom Events
- Button clicks with metadata
- User interactions and engagement
- Feature usage tracking

### E-commerce Events
```typescript
// Add to cart
trackEvent('add_to_cart', {
  product_id: 'prod_123',
  product_name: 'Sample Product',
  price: 99.99,
  currency: 'USD'
});

// Purchase completion
trackEvent('purchase_completed', {
  product_id: 'prod_123',
  price: 99.99,
  payment_method: 'credit_card'
});
```

### User Events
```typescript
// User signup
trackEvent('user_signup', {
  signup_method: 'email',
  source: 'demo_app'
});

// Newsletter subscription
trackEvent('newsletter_signup', {
  signup_method: 'homepage_form'
});
```

### Form Events
```typescript
// Form field interactions
trackEvent('form_field_updated', {
  field_name: 'email',
  form_type: 'contact'
});

// Form submissions
trackEvent('contact_form_submitted', {
  form_type: 'contact',
  has_name: true,
  has_email: true
});
```

### Pageview Events
```typescript
// Automatic pageview tracking
useAutoTrackPageview([], { 
  page: 'home',
  section: 'main'
});

// Manual pageview tracking
const trackPageview = useTrackPageview();
trackPageview({ page: 'custom', manual: true });
```

## Configuration

Both examples use the same configuration structure:

```typescript
const journiumConfig = {
  publishableKey: 'demo-publishable-key',  // Replace with your publishable key
  apiHost: 'https://api.journium.io',      // API endpoint
  options: {
    debug: true,                   // Enable console logging
    flushAt: 10,                   // Batch size for events
    flushInterval: 30000           // Flush interval in milliseconds
  }
};
```

## Development Tips

1. **Debug Mode**: Set `debug: true` to see events in browser console
2. **Event Properties**: Use descriptive property names and include relevant metadata
3. **Pageview Tracking**: Let the SDK handle automatic pageviews, add manual ones for specific cases
4. **Error Handling**: The SDK handles network errors gracefully and retries failed requests

## Next Steps

1. **Replace Publishable Key**: Update the `publishableKey` in both examples with your actual Journium publishable key
2. **Customize Events**: Modify event names and properties to match your application's needs
3. **Add User Identification**: Implement user identification for personalized tracking
4. **Set Up Funnels**: Create conversion funnels based on your business goals
5. **Production Build**: Test with production builds to ensure everything works correctly

## API Documentation

For complete API documentation, visit: [Journium Documentation](https://docs.journium.io)

## Support

If you encounter any issues or have questions:
1. Check the browser console for debug information
2. Verify your publishable key is correct
3. Ensure all dependencies are properly installed
4. Review the example code for proper integration patterns