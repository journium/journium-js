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
      config={{
        token: "your-journium-token",
        apiHost: "https://your-journium-instance.com",
        debug: true, // Optional: Enable debug logging
        flushAt: 5,  // Optional: Send events after 5 events
        flushInterval: 10000 // Optional: Send events every 10 seconds
      }}
      autoCapture={true} // Enables auto-pageview and click tracking
    >
      <App />
    </JourniumProvider>
  );
}

export default Root;
```

### Track Custom Events

Use the `useTrackEvent` hook to track custom events:

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
    // Your signup logic
  };

  return <button onClick={handleSignup}>Sign Up</button>;
}
```

## 📖 Tracking Hooks

### useTrackEvent - Track Custom Events

The primary hook for tracking custom business events:

```jsx
import { useTrackEvent } from '@journium/react';

function EcommerceComponent() {
  const trackEvent = useTrackEvent();

  const handlePurchase = () => {
    trackEvent('purchase_completed', {
      product_id: 'prod_123',
      price: 29.99,
      currency: 'USD',
      category: 'electronics'
    });
  };

  const handleAddToCart = () => {
    trackEvent('product_added_to_cart', {
      product_id: 'prod_123',
      quantity: 1,
      source: 'product_page'
    });
  };

  return (
    <div>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <button onClick={handlePurchase}>Buy Now</button>
    </div>
  );
}
```

### useTrackPageview - Manual Pageview Tracking

For tracking custom pageviews beyond automatic route tracking:

```jsx
import { useTrackPageview } from '@journium/react';

function CustomPageTracker() {
  const trackPageview = useTrackPageview();

  const handleSpecialPageview = () => {
    trackPageview({
      page_type: 'modal',
      content_type: 'pricing_calculator',
      user_segment: 'premium'
    });
  };

  return (
    <button onClick={handleSpecialPageview}>
      Track Modal View
    </button>
  );
}
```

### useAutoTrackPageview - Automatic Pageview on Mount

Automatically track pageviews when components mount or dependencies change:

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

function BlogPost({ postId }) {
  // Track pageview for blog posts
  useAutoTrackPageview([postId], {
    page_type: 'blog_post',
    post_id: postId,
    content_type: 'article'
  });

  return <article>Blog post content</article>;
}
```

## 🔧 Advanced Usage

### Form Tracking

Track form interactions and submissions:

```jsx
import { useTrackEvent } from '@journium/react';

function ContactForm() {
  const trackEvent = useTrackEvent();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    trackEvent('form_submitted', {
      form_name: 'contact',
      form_type: 'lead_generation',
      fields_completed: ['name', 'email', 'company']
    });
    
    // Submit form logic
  };

  const handleFieldChange = (fieldName) => {
    trackEvent('form_field_completed', {
      form_name: 'contact',
      field_name: fieldName
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

### User Journey Tracking

Track multi-step user flows:

```jsx
import { useTrackEvent, useTrackPageview } from '@journium/react';

function OnboardingFlow({ step }) {
  const trackEvent = useTrackEvent();
  const trackPageview = useTrackPageview();

  useEffect(() => {
    // Track onboarding step pageview
    trackPageview({
      page_type: 'onboarding',
      step: step,
      flow: 'user_setup'
    });
  }, [step, trackPageview]);

  const handleStepComplete = () => {
    trackEvent('onboarding_step_completed', {
      step: step,
      time_spent: Date.now() - stepStartTime,
      completed_successfully: true
    });
  };

  const handleSkipStep = () => {
    trackEvent('onboarding_step_skipped', {
      step: step,
      reason: 'user_choice'
    });
  };

  return (
    <div>
      <h2>Step {step}</h2>
      <button onClick={handleStepComplete}>Complete Step</button>
      <button onClick={handleSkipStep}>Skip</button>
    </div>
  );
}
```

### Feature Usage Tracking

Create reusable tracking patterns:

```jsx
import { useTrackEvent } from '@journium/react';

// Custom hook for feature tracking
function useFeatureTracking() {
  const trackEvent = useTrackEvent();

  const trackFeatureUsed = (featureName, context = {}) => {
    trackEvent('feature_used', {
      feature_name: featureName,
      timestamp: new Date().toISOString(),
      ...context
    });
  };

  const trackFeatureDiscovered = (featureName, discoveryMethod) => {
    trackEvent('feature_discovered', {
      feature_name: featureName,
      discovery_method: discoveryMethod
    });
  };

  return { trackFeatureUsed, trackFeatureDiscovered };
}

// Usage in components
function AdvancedFeature() {
  const { trackFeatureUsed, trackFeatureDiscovered } = useFeatureTracking();

  const handleFeatureClick = () => {
    trackFeatureUsed('advanced_search', {
      search_type: 'filters',
      filter_count: 3
    });
  };

  return (
    <div>
      <button onClick={handleFeatureClick}>
        Use Advanced Search
      </button>
    </div>
  );
}
```

## 🔒 Privacy & GDPR Compliance

### User Consent Management

Control tracking based on user consent:

```jsx
import { useState, useEffect } from 'react';
import { useAutocapture } from '@journium/react';

function ConsentBanner() {
  const { startAutocapture, stopAutocapture } = useAutocapture();
  const [hasConsent, setHasConsent] = useState(null);

  useEffect(() => {
    const savedConsent = localStorage.getItem('tracking_consent');
    if (savedConsent === 'true') {
      setHasConsent(true);
      startAutocapture();
    } else if (savedConsent === 'false') {
      setHasConsent(false);
      stopAutocapture();
    }
  }, [startAutocapture, stopAutocapture]);

  const handleAccept = () => {
    setHasConsent(true);
    localStorage.setItem('tracking_consent', 'true');
    startAutocapture();
  };

  const handleDecline = () => {
    setHasConsent(false);
    localStorage.setItem('tracking_consent', 'false');
    stopAutocapture();
  };

  if (hasConsent !== null) return null;

  return (
    <div className="consent-banner">
      <p>We use analytics to improve your experience.</p>
      <button onClick={handleAccept}>Accept</button>
      <button onClick={handleDecline}>Decline</button>
    </div>
  );
}
```

### Excluding Sensitive Data

Configure autocapture to ignore sensitive elements:

```jsx
<JourniumProvider
  config={{
    token: "your-token",
    apiHost: "https://api.journium.com",
    autocapture: {
      captureClicks: true,
      captureFormSubmits: true,
      captureFormChanges: false,
      ignoreClasses: ['no-track', 'sensitive', 'pii'],
      ignoreElements: ['input[type="password"]', '.credit-card']
    }
  }}
>
  <App />
</JourniumProvider>
```

## 📱 TypeScript Support

Full TypeScript support with complete type definitions:

```typescript
import { useTrackEvent, JourniumConfig } from '@journium/react';

interface PurchaseEventProperties {
  product_id: string;
  category: string;
  price: number;
  currency: string;
}

function TypedComponent() {
  const trackEvent = useTrackEvent();

  const handlePurchase = (productData: PurchaseEventProperties) => {
    // Fully typed event tracking
    trackEvent('product_purchased', productData);
  };

  return <button onClick={handlePurchase}>Purchase</button>;
}
```

## 🔗 Available Hooks

| Hook | Purpose | Usage |
|------|---------|-------|
| `useTrackEvent()` | Track custom events | `trackEvent('event_name', properties)` |
| `useTrackPageview()` | Manual pageview tracking | `trackPageview(properties)` |
| `useAutoTrackPageview(deps, props)` | Automatic pageview on mount | Auto-tracks when deps change |
| `useAutocapture()` | Control autocapture | `{ startAutocapture, stopAutocapture }` |
| `useJournium()` | Direct Journium instance access | Advanced use cases only |

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