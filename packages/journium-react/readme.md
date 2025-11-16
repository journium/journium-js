# @journium/react

[![npm version](https://badge.fury.io/js/%40journium%2Freact.svg)](https://badge.fury.io/js/@journium/react)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**React integration for Journium - Track events, pageviews, and user interactions in React applications**

The official React SDK for Journium providing hooks, providers, and components for seamless analytics integration in React applications.

## 🚀 Quick Start

### Installation

```bash
npm install @journium/react
```

### Basic Setup

Wrap your app with the `JourniumProvider`:

```jsx
import React from 'react';
import { JourniumProvider } from '@journium/react';
import App from './App';

function Root() {
  return (
    <JourniumProvider
      token="your-journium-token"
      apiHost="https://your-journium-instance.com"
      autocapture={true}
    >
      <App />
    </JourniumProvider>
  );
}

export default Root;
```

### Using the Hook

Track events anywhere in your components:

```jsx
import React from 'react';
import { useJournium } from '@journium/react';

function SignupButton() {
  const { track } = useJournium();

  const handleSignup = () => {
    track('signup_attempted', {
      source: 'homepage',
      plan: 'free'
    });
    // Your signup logic
  };

  return <button onClick={handleSignup}>Sign Up</button>;
}
```

## 📖 API Reference

### JourniumProvider

The main provider component that initializes Journium for your React app.

```jsx
<JourniumProvider
  token="your-token"                    // Required: Your project token
  apiHost="https://api.journium.com"    // Required: API endpoint
  debug={false}                         // Optional: Enable debug mode
  flushAt={20}                         // Optional: Flush after N events
  flushInterval={10000}                // Optional: Flush interval (ms)
  autocapture={true}                   // Optional: Enable auto-capture
  sessionTimeout={1800000}             // Optional: Session timeout (30m)
>
  <YourApp />
</JourniumProvider>
```

### useJournium Hook

Access Journium functionality throughout your React app:

```jsx
import { useJournium } from '@journium/react';

function MyComponent() {
  const { track, capturePageview, startAutoCapture, stopAutoCapture, flush } = useJournium();

  // Track events
  const handleClick = () => {
    track('button_clicked', { 
      button_id: 'cta-primary',
      page: 'pricing' 
    });
  };

  // Manual pageview
  const handleNavigate = () => {
    capturePageview({ 
      previous_page: '/home',
      user_type: 'premium' 
    });
  };

  // Control auto-capture
  const toggleTracking = () => {
    if (trackingEnabled) {
      stopAutoCapture();
    } else {
      startAutoCapture();
    }
  };

  return (
    <div>
      <button onClick={handleClick}>Track Click</button>
      <button onClick={handleNavigate}>Manual Pageview</button>
      <button onClick={toggleTracking}>Toggle Tracking</button>
    </div>
  );
}
```

## 🔧 Advanced Usage

### Form Tracking

Track form interactions and submissions:

```jsx
import { useJournium } from '@journium/react';

function ContactForm() {
  const { track } = useJournium();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    track('form_submitted', {
      form_name: 'contact',
      form_type: 'lead_generation',
      fields_filled: ['name', 'email', 'company']
    });
    
    // Submit form logic
  };

  const handleFieldChange = (field) => {
    track('form_field_changed', {
      form_name: 'contact',
      field_name: field
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="email" 
        onChange={() => handleFieldChange('email')}
        placeholder="Email"
      />
      <input 
        name="company" 
        onChange={() => handleFieldChange('company')}
        placeholder="Company"
      />
      <button type="submit">Send Message</button>
    </form>
  );
}
```

### E-commerce Tracking

Track purchase flows and product interactions:

```jsx
import { useJournium } from '@journium/react';

function ProductPage({ product }) {
  const { track } = useJournium();

  const handleAddToCart = () => {
    track('product_added_to_cart', {
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      price: product.price,
      currency: 'USD'
    });
  };

  const handlePurchase = (orderData) => {
    track('purchase_completed', {
      order_id: orderData.id,
      revenue: orderData.total,
      currency: 'USD',
      products: orderData.items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price
      }))
    });
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <p>${product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
    </div>
  );
}
```

### React Router Integration

Track page navigation automatically:

```jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useJournium } from '@journium/react';

function PageTracker() {
  const location = useLocation();
  const { capturePageview } = useJournium();

  useEffect(() => {
    capturePageview({
      path: location.pathname,
      search: location.search,
      referrer: document.referrer
    });
  }, [location, capturePageview]);

  return null;
}

// Add to your router setup
function App() {
  return (
    <Router>
      <PageTracker />
      <Routes>
        {/* Your routes */}
      </Routes>
    </Router>
  );
}
```

### Conditional Tracking

Control tracking based on user preferences or environment:

```jsx
import { useJournium } from '@journium/react';

function ConditionalTracker() {
  const { track, startAutoCapture, stopAutoCapture } = useJournium();
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    if (hasConsent) {
      startAutoCapture();
      track('tracking_consent_given');
    } else {
      stopAutoCapture();
    }
  }, [hasConsent, startAutoCapture, stopAutoCapture, track]);

  return (
    <div>
      <label>
        <input 
          type="checkbox" 
          checked={hasConsent}
          onChange={(e) => setHasConsent(e.target.checked)}
        />
        Allow analytics tracking
      </label>
    </div>
  );
}
```

### Custom Hook for User Actions

Create reusable tracking hooks:

```jsx
import { useJournium } from '@journium/react';

function useUserActions() {
  const { track } = useJournium();

  const trackSignup = (method, plan) => {
    track('user_signup', {
      signup_method: method,
      selected_plan: plan,
      timestamp: new Date().toISOString()
    });
  };

  const trackLogin = (method) => {
    track('user_login', {
      login_method: method,
      timestamp: new Date().toISOString()
    });
  };

  const trackFeatureUsed = (feature, context = {}) => {
    track('feature_used', {
      feature_name: feature,
      ...context,
      timestamp: new Date().toISOString()
    });
  };

  return {
    trackSignup,
    trackLogin,
    trackFeatureUsed
  };
}

// Usage in components
function LoginForm() {
  const { trackLogin } = useUserActions();

  const handleLogin = (method) => {
    trackLogin(method);
    // Login logic
  };

  return (
    <div>
      <button onClick={() => handleLogin('email')}>Login with Email</button>
      <button onClick={() => handleLogin('google')}>Login with Google</button>
    </div>
  );
}
```

## 🔒 Privacy & GDPR Compliance

### User Consent Management

```jsx
import { useState, useEffect } from 'react';
import { useJournium } from '@journium/react';

function PrivacyBanner() {
  const { startAutoCapture, stopAutoCapture, flush } = useJournium();
  const [showBanner, setShowBanner] = useState(true);

  const handleAccept = () => {
    localStorage.setItem('journium_consent', 'true');
    setShowBanner(false);
    startAutoCapture();
  };

  const handleDecline = () => {
    localStorage.setItem('journium_consent', 'false');
    setShowBanner(false);
    stopAutoCapture();
  };

  useEffect(() => {
    const consent = localStorage.getItem('journium_consent');
    if (consent === 'false') {
      stopAutoCapture();
      setShowBanner(false);
    } else if (consent === 'true') {
      startAutoCapture();
      setShowBanner(false);
    }
  }, [startAutoCapture, stopAutoCapture]);

  if (!showBanner) return null;

  return (
    <div className="privacy-banner">
      <p>We use analytics to improve your experience.</p>
      <button onClick={handleAccept}>Accept</button>
      <button onClick={handleDecline}>Decline</button>
    </div>
  );
}
```

### Excluding Sensitive Data

```jsx
<JourniumProvider
  token="your-token"
  apiHost="https://api.journium.com"
  autocapture={{
    captureClicks: true,
    captureFormSubmits: true,
    captureFormChanges: false,
    ignoreClasses: ['no-track', 'sensitive', 'pii'],
    ignoreElements: [
      'input[type="password"]',
      'input[type="email"]',
      '.credit-card-input',
      '[data-private]'
    ]
  }}
>
  <App />
</JourniumProvider>
```

## 📱 TypeScript Support

Full TypeScript support with complete type definitions:

```typescript
import { useJournium, JourniumConfig } from '@journium/react';

interface CustomEventProperties {
  product_id: string;
  category: string;
  price: number;
}

function TypedComponent() {
  const { track } = useJournium();

  const handlePurchase = () => {
    // Fully typed event tracking
    track('product_purchased', {
      product_id: 'prod_123',
      category: 'electronics',
      price: 299.99
    } as CustomEventProperties);
  };

  return <button onClick={handlePurchase}>Purchase</button>;
}

// Type-safe provider configuration
const config: JourniumConfig = {
  token: 'your-token',
  apiHost: 'https://api.journium.com',
  autocapture: {
    captureClicks: true,
    captureFormSubmits: true,
    ignoreClasses: ['no-track']
  }
};
```

## ⚡ Performance Optimization

### Lazy Loading

```jsx
import { lazy, Suspense } from 'react';

const JourniumProvider = lazy(() => import('@journium/react').then(module => ({
  default: module.JourniumProvider
})));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <JourniumProvider token="your-token" apiHost="https://api.journium.com">
        <YourApp />
      </JourniumProvider>
    </Suspense>
  );
}
```

### Event Batching

```jsx
import { useJournium } from '@journium/react';

function BatchedTracking() {
  const { track, flush } = useJournium();

  const handleMultipleActions = async () => {
    // Queue multiple events
    track('action_1', { step: 1 });
    track('action_2', { step: 2 });
    track('action_3', { step: 3 });
    
    // Force flush all queued events
    await flush();
  };

  return <button onClick={handleMultipleActions}>Complete Flow</button>;
}
```

## 🔗 Related Packages

Part of the Journium JavaScript SDK ecosystem:

- **[journium-js](https://npmjs.com/package/journium-js)** - Core JavaScript SDK for web browsers
- **[@journium/nextjs](https://npmjs.com/package/@journium/nextjs)** - Next.js integration with SSR support
- **[@journium/node](https://npmjs.com/package/@journium/node)** - Node.js server-side tracking
- **[@journium/core](https://npmjs.com/package/@journium/core)** - Core utilities and types

## 📖 Documentation

For complete documentation, guides, and examples:

- **[Documentation](https://docs.journium.app)** - Complete guides and API reference
- **[React Guide](https://docs.journium.app/react)** - React-specific documentation
- **[Examples](https://docs.journium.app/examples/react)** - React code examples and patterns

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/journium/journium-js/blob/main/CONTRIBUTING.md).

## 📄 License

MIT License - see [LICENSE](https://github.com/journium/journium-js/blob/main/LICENSE) file for details.

## 🆘 Support

- **📚 Docs**: [docs.journium.app](https://docs.journium.app)
- **🐛 Issues**: [GitHub Issues](https://github.com/journium/journium-js/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/journium/journium-js/discussions)
- **📧 Email**: support@journium.com