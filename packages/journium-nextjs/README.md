# @journium/nextjs

[![npm version](https://badge.fury.io/js/%40journium%2Fnextjs.svg)](https://badge.fury.io/js/@journium/nextjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

**Next.js integration for Journium - SSR-ready analytics with automatic route tracking**

The official Next.js SDK for Journium providing SSR/SSG-compatible analytics, automatic route change tracking, and server-side utilities for Next.js applications.

## 🚀 Quick Start

### Installation

```bash
npm install @journium/nextjs
```

### Basic Setup

Wrap your app with the `NextJourniumProvider` in `pages/_app.tsx`:

```tsx
import type { AppProps } from 'next/app';
import { NextJourniumProvider } from '@journium/nextjs';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextJourniumProvider
      config={{
        token: 'your-journium-token',
        apiHost: 'https://your-journium-instance.com'
      }}
      autoCapture={true}
      trackRouteChanges={true}
    >
      <Component {...pageProps} />
    </NextJourniumProvider>
  );
}
```

### Using the Hook

Track events anywhere in your components (same as React):

```tsx
import { useJournium } from '@journium/nextjs';

function ProductPage() {
  const { track } = useJournium();

  const handlePurchase = () => {
    track('purchase_completed', {
      product_id: 'prod_123',
      amount: 29.99,
      currency: 'USD'
    });
  };

  return <button onClick={handlePurchase}>Buy Now</button>;
}
```

## 📖 API Reference

### NextJourniumProvider

The main provider component optimized for Next.js applications.

```tsx
<NextJourniumProvider
  config={{
    token: "your-token",              // Required: Your project token
    apiHost: "https://api.journium.com", // Required: API endpoint
    debug: false,                     // Optional: Enable debug mode
    flushAt: 20,                     // Optional: Flush after N events
    flushInterval: 10000,            // Optional: Flush interval (ms)
    sessionTimeout: 1800000          // Optional: Session timeout (30m)
  }}
  autoCapture={true}                 // Optional: Enable auto-capture
  trackRouteChanges={true}           // Optional: Track Next.js route changes
>
  <YourApp />
</NextJourniumProvider>
```

### Hook Usage

All React hooks are available and work the same way:

```tsx
import { useJournium, useIdentify, useReset } from '@journium/nextjs';

const { track, capturePageview, startAutoCapture, stopAutoCapture, flush } = useJournium();

// User identification hooks
const identify = useIdentify();
const reset = useReset();
```

### User Identification

#### Identifying Users on Login

Use the `useIdentify` hook to identify users when they log in:

```tsx
import { useIdentify } from '@journium/nextjs';

function LoginPage() {
  const identify = useIdentify();

  const handleLogin = async (email: string, password: string) => {
    try {
      const user = await loginUser(email, password);
      
      // Identify the user after successful login
      identify(user.id, {
        name: user.name,
        email: user.email
      });
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      // Handle login error
    }
  };

  return <LoginForm onSubmit={handleLogin} />;
}
```

#### Resetting User Identity on Logout

Use the `useReset` hook to clear user identity when they log out:

```tsx
import { useReset } from '@journium/nextjs';

function LogoutButton() {
  const reset = useReset();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutUser();
      
      // Reset user identity after successful logout
      reset();
      
      // Redirect to home page
      router.push('/');
    } catch (error) {
      // Handle logout error
    }
  };

  return <button onClick={handleLogout}>Log Out</button>;
}
```

### SSR Utilities

#### `isServerSide()`

Check if code is running on the server:

```tsx
import { isServerSide } from '@journium/nextjs';

function MyComponent() {
  if (isServerSide()) {
    // Server-side logic
    console.log('Running on server');
  } else {
    // Client-side logic
    console.log('Running in browser');
  }
}
```

#### `getPagePropsForSSR(context)`

Extract page properties during SSR for server-side tracking:

```tsx
import { GetServerSideProps } from 'next';
import { getPagePropsForSSR } from '@journium/nextjs';

export const getServerSideProps: GetServerSideProps = async (context) => {
  const pageProps = getPagePropsForSSR(context);
  
  // pageProps contains:
  // {
  //   $current_url: 'https://example.com/page',
  //   $host: 'example.com', 
  //   $pathname: '/page',
  //   $search: 'utm_source=google',
  //   $referrer: 'https://google.com'
  // }

  return {
    props: {
      journiumPageProps: pageProps
    }
  };
};
```

## 🔧 Next.js Specific Features

### Automatic Route Tracking

The provider automatically tracks Next.js route changes:

```tsx
<NextJourniumProvider
  config={{ /* your config */ }}
  trackRouteChanges={true} // Enabled by default
>
  <App />
</NextJourniumProvider>
```

This tracks:
- Page navigation via `next/link`
- Programmatic navigation via `router.push()`
- Back/forward button navigation
- Direct URL changes

### Environment Variables

Set up environment variables for different environments:

```bash
# .env.local
NEXT_PUBLIC_JOURNIUM_TOKEN=your_token_here
NEXT_PUBLIC_JOURNIUM_API_HOST=https://your-api.journium.com
```

```tsx
// pages/_app.tsx
<NextJourniumProvider
  config={{
    token: process.env.NEXT_PUBLIC_JOURNIUM_TOKEN!,
    apiHost: process.env.NEXT_PUBLIC_JOURNIUM_API_HOST!,
    debug: process.env.NODE_ENV === 'development'
  }}
>
  <Component {...pageProps} />
</NextJourniumProvider>
```

### Server-Side Rendering (SSR)

Track events during SSR for better analytics coverage:

```tsx
// pages/product/[id].tsx
import { GetServerSideProps } from 'next';
import { getPagePropsForSSR } from '@journium/nextjs';

interface Props {
  product: Product;
  journiumPageProps: any;
}

export default function ProductPage({ product, journiumPageProps }: Props) {
  const { track } = useJournium();

  useEffect(() => {
    // Track page view with SSR data
    track('product_viewed', {
      product_id: product.id,
      ...journiumPageProps
    });
  }, []);

  return <div>{/* Your component */}</div>;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const product = await getProduct(context.params?.id);
  const journiumPageProps = getPagePropsForSSR(context);

  return {
    props: {
      product,
      journiumPageProps
    }
  };
};
```

### Static Site Generation (SSG)

Works with static generation and incremental static regeneration:

```tsx
// pages/blog/[slug].tsx
import { GetStaticProps, GetStaticPaths } from 'next';
import { getPagePropsForSSR } from '@journium/nextjs';

export default function BlogPost({ post }: { post: Post }) {
  const { track } = useJournium();

  useEffect(() => {
    track('blog_post_viewed', {
      post_id: post.id,
      post_title: post.title,
      post_category: post.category
    });
  }, []);

  return <article>{/* Your blog post */}</article>;
}

export const getStaticProps: GetStaticProps = async (context) => {
  const post = await getPost(context.params?.slug);
  
  return {
    props: { post },
    revalidate: 60 // ISR
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getAllPosts();
  
  return {
    paths: posts.map(post => ({ params: { slug: post.slug } })),
    fallback: 'blocking'
  };
};
```

## 🛍️ E-commerce Examples

### Product Tracking

```tsx
// pages/product/[id].tsx
import { useJournium } from '@journium/nextjs';

function ProductPage({ product }: { product: Product }) {
  const { track } = useJournium();

  const handleAddToCart = () => {
    track('product_added_to_cart', {
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      currency: 'USD',
      category: product.category
    });
  };

  const handlePurchase = async () => {
    const order = await createOrder(product);
    
    track('purchase_completed', {
      order_id: order.id,
      revenue: order.total,
      currency: 'USD',
      products: [{
        product_id: product.id,
        quantity: 1,
        price: product.price
      }]
    });
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <p>${product.price}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <button onClick={handlePurchase}>Buy Now</button>
    </div>
  );
}
```

### Checkout Flow

```tsx
// pages/checkout.tsx
import { useJournium } from '@journium/nextjs';

function CheckoutPage() {
  const { track } = useJournium();

  const handleStepCompleted = (step: string) => {
    track('checkout_step_completed', {
      step_name: step,
      step_number: getStepNumber(step)
    });
  };

  const handleOrderCompleted = (order: Order) => {
    track('order_completed', {
      order_id: order.id,
      revenue: order.total,
      tax: order.tax,
      shipping: order.shipping,
      products: order.items.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.price
      }))
    });
  };

  return (
    <CheckoutForm 
      onStepCompleted={handleStepCompleted}
      onOrderCompleted={handleOrderCompleted}
    />
  );
}
```

## 🌐 API Routes Integration

Track events in API routes for server-side analytics:

```tsx
// pages/api/contact.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { init } from '@journium/node'; // Use Node.js SDK for API routes

const journium = init({
  token: process.env.JOURNIUM_TOKEN!,
  apiHost: process.env.JOURNIUM_API_HOST!
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, message } = req.body;
    
    // Track form submission on server
    journium.track('contact_form_submitted', {
      user_email: email,
      message_length: message.length,
      source: 'api_route',
      ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
    });

    // Process form...
    
    res.status(200).json({ success: true });
  }
}
```

### User Authentication API Routes

Handle user identification in authentication API routes:

```tsx
// pages/api/auth/login.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { init } from '@journium/node';

const journium = init({
  token: process.env.JOURNIUM_TOKEN!,
  apiHost: process.env.JOURNIUM_API_HOST!
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, password } = req.body;
    
    try {
      const user = await authenticateUser(email, password);
      
      // Track successful login attempt (not user identification)
      journium.track('login_attempt', {
        success: true,
        method: 'email',
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      }, user.id);
      
      // Note: User identification should be done on the client-side 
      // using the identify() method after successful login
      
      res.status(200).json({ user, success: true });
    } catch (error) {
      // Track failed login attempt
      journium.track('login_attempt', {
        success: false,
        method: 'email',
        error: error.message,
        ip: req.headers['x-forwarded-for'] || req.connection.remoteAddress
      });
      
      res.status(401).json({ error: 'Invalid credentials' });
    }
  }
}
```

## 🔒 Privacy & GDPR Compliance

### Conditional Loading

```tsx
// pages/_app.tsx
import { useState, useEffect } from 'react';
import { NextJourniumProvider } from '@journium/nextjs';

export default function App({ Component, pageProps }: AppProps) {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem('analytics_consent');
    setHasConsent(consent === 'true');
  }, []);

  if (hasConsent === null) {
    return <LoadingComponent />;
  }

  if (!hasConsent) {
    return (
      <div>
        <ConsentBanner onAccept={() => setHasConsent(true)} />
        <Component {...pageProps} />
      </div>
    );
  }

  return (
    <NextJourniumProvider
      config={{
        token: process.env.NEXT_PUBLIC_JOURNIUM_TOKEN!,
        apiHost: process.env.NEXT_PUBLIC_JOURNIUM_API_HOST!
      }}
    >
      <Component {...pageProps} />
    </NextJourniumProvider>
  );
}
```

### Data Exclusion

```tsx
<NextJourniumProvider
  config={{
    token: "your-token",
    apiHost: "https://api.journium.com",
    autocapture: {
      captureClicks: true,
      captureFormSubmits: true,
      captureFormChanges: false,
      ignoreClasses: ['no-track', 'sensitive', 'gdpr-exclude'],
      ignoreElements: [
        'input[type="password"]',
        'input[type="email"]',
        '[data-private]',
        '.payment-form'
      ]
    }
  }}
>
  <App />
</NextJourniumProvider>
```

## ⚡ Performance Optimization

### Code Splitting

```tsx
// pages/_app.tsx
import dynamic from 'next/dynamic';

const NextJourniumProvider = dynamic(
  () => import('@journium/nextjs').then(mod => mod.NextJourniumProvider),
  { ssr: false } // Load only on client-side
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextJourniumProvider
      config={{
        token: process.env.NEXT_PUBLIC_JOURNIUM_TOKEN!,
        apiHost: process.env.NEXT_PUBLIC_JOURNIUM_API_HOST!
      }}
    >
      <Component {...pageProps} />
    </NextJourniumProvider>
  );
}
```

### Conditional Loading by Environment

```tsx
// pages/_app.tsx
export default function App({ Component, pageProps }: AppProps) {
  const shouldLoadAnalytics = process.env.NODE_ENV === 'production' || 
                             process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true';

  if (!shouldLoadAnalytics) {
    return <Component {...pageProps} />;
  }

  return (
    <NextJourniumProvider
      config={{
        token: process.env.NEXT_PUBLIC_JOURNIUM_TOKEN!,
        apiHost: process.env.NEXT_PUBLIC_JOURNIUM_API_HOST!,
        debug: process.env.NODE_ENV === 'development'
      }}
    >
      <Component {...pageProps} />
    </NextJourniumProvider>
  );
}
```

## 📱 TypeScript Support

Full TypeScript support with Next.js-specific types:

```typescript
import { NextPage } from 'next';
import { useJournium } from '@journium/nextjs';

interface PageProps {
  product: Product;
}

const ProductPage: NextPage<PageProps> = ({ product }) => {
  const { track } = useJournium();

  const handleEvent = () => {
    track('product_interaction', {
      product_id: product.id,
      interaction_type: 'click',
      timestamp: new Date().toISOString()
    });
  };

  return <div onClick={handleEvent}>{product.name}</div>;
};

export default ProductPage;
```

## 🔗 Related Packages

Part of the Journium JavaScript SDK ecosystem:

- **[journium-js](https://npmjs.com/package/journium-js)** - Core JavaScript SDK for web browsers
- **[@journium/react](https://npmjs.com/package/@journium/react)** - React integration with hooks and providers
- **[@journium/node](https://npmjs.com/package/@journium/node)** - Node.js server-side tracking
- **[@journium/core](https://npmjs.com/package/@journium/core)** - Core utilities and types

## 📖 Documentation

For complete documentation, guides, and examples:

- **[Documentation](https://docs.journium.app)** - Complete guides and API reference
- **[Next.js Guide](https://docs.journium.app/nextjs)** - Next.js-specific documentation
- **[Examples](https://docs.journium.app/examples/nextjs)** - Next.js code examples and patterns

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](https://github.com/journium/journium-js/blob/main/CONTRIBUTING.md).

## 📄 License

MIT License - see [LICENSE](https://github.com/journium/journium-js/blob/main/LICENSE) file for details.

## 🆘 Support

- **📚 Docs**: [docs.journium.app](https://docs.journium.app)
- **🐛 Issues**: [GitHub Issues](https://github.com/journium/journium-js/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/journium/journium-js/discussions)
- **📧 Email**: support@journium.com