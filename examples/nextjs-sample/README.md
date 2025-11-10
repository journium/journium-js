# Journium Next.js Sample Application

This is a sample Next.js application demonstrating how to integrate the Journium analytics SDK with server-side rendering support and automatic route tracking.

## Features Demonstrated

- **NextJourniumProvider Setup**: Next.js-specific provider with SSR support
- **Automatic Route Tracking**: Pageviews tracked on navigation between pages
- **Custom Event Tracking**: Various types of events with rich metadata
- **E-commerce Tracking**: Product views, add to cart, and purchase events
- **Form Tracking**: Form field interactions and submissions
- **Social Media Tracking**: External link clicks
- **Multi-page Navigation**: Demonstrates route-based event tracking

## Running the Application

1. **Install dependencies** (from the workspace root):
   ```bash
   pnpm install
   ```

2. **Build the Journium packages**:
   ```bash
   pnpm dev
   ```

3. **Start the Next.js application**:
   ```bash
   cd examples/nextjs-sample
   pnpm dev
   ```

4. **Open your browser** to `http://localhost:3004`

## Application Structure

### Pages

1. **Home Page (`/`)**: Main demo page with various tracking examples
2. **Products Page (`/products`)**: E-commerce tracking with product catalog
3. **About Page (`/about`)**: Form tracking and social media interactions

### Key Components

- **_app.tsx**: Sets up `NextJourniumProvider` for the entire application
- **Individual Pages**: Each demonstrates different tracking scenarios

## Events Tracked

### Home Page
- Custom button clicks
- Add to cart events
- Newsletter signups
- File downloads
- Manual pageviews

### Products Page  
- Product view events (on hover)
- Add to cart with product details
- Purchase completion tracking
- Page metadata tracking

### About Page
- Form field interactions
- Form submission events
- Social media link clicks
- Documentation access tracking

## Configuration

The sample uses these Journium configuration options:

```typescript
const journiumConfig = {
  applicationKey: 'demo-api-key',        // Your application key
  apiHost: 'https://api.journium.io',  // API endpoint  
  debug: true,                   // Enable console logging
  flushAt: 10,                   // Batch size for events
  flushInterval: 30000           // Flush interval in milliseconds
};
```

## Next.js Specific Features

- **SSR Support**: Works with server-side rendering
- **Automatic Route Tracking**: Pageviews tracked on navigation
- **Static Generation**: Compatible with `getStaticProps` and `getServerSideProps`
- **Code Splitting**: Journium SDK loads efficiently with Next.js

## Navigation Features

Use the navigation links to see automatic route tracking:
- Navigate between pages to see automatic pageview events
- Each page tracks with route-specific metadata
- Browser back/forward navigation is also tracked

## Event Examples

### E-commerce Events
```typescript
trackEvent('add_to_cart', {
  product_id: 'prod_123',
  product_name: 'Sample Product', 
  price: 99.99,
  currency: 'USD',
  category: 'electronics'
});
```

### Form Tracking
```typescript
trackEvent('form_field_updated', {
  field_name: 'email',
  field_value_length: 15,
  form_type: 'contact'
});
```

### Custom Events
```typescript
trackEvent('newsletter_signup', {
  signup_method: 'homepage_form',
  source: 'nextjs_demo',
  user_segment: 'developer'
});
```

## Next Steps

- Replace the demo API key with your actual Journium API key
- Customize event properties to match your application's needs
- Add server-side event tracking if needed
- Implement user identification for personalized tracking
- Set up conversion funnels based on your business goals