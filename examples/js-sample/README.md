# Journium JavaScript SDK Demo

A comprehensive vanilla JavaScript demonstration of the Journium analytics SDK, showcasing event tracking, pageview monitoring, and user interaction analytics in a modern single-page application.

This example includes **two implementations** to demonstrate both integration approaches:

1. **CDN/Script Tag** - `index.html` + `app.js` (No build step required)
2. **ES Modules** - `index-esm.html` + `app-esm.js` (Uses Vite bundler)

## 🚀 Quick Start

### Prerequisites

Before running the demo, build the Journium SDK:

```bash
# From the repository root
cd packages/journium-js
pnpm build
```

### Option 1: CDN Version (Uses Local Build)

```bash
# From examples/js-sample
npm install

# Start the development server
npm run dev
```

The demo will open at `http://localhost:3007`

> **Note**: The demo loads the SDK from `node_modules/@journium/js/dist/journium.min.js`, which is a workspace symlink to the local package. Make sure to build the SDK first!

### Option 2: ES Module Version (With Build)

```bash
# Install dependencies
npm install

# Start the Vite development server
npm run dev:esm
```

The demo will open at `http://localhost:3008`

### Build for Production

```bash
# Build the ES module version
npm run build

# Preview the production build
npm run preview
```

## 📊 What You'll Experience

### Core Features Demonstrated

- **🎯 Event Tracking**: Custom events with rich metadata
- **📄 Pageview Analytics**: SPA navigation tracking
- **👤 User Authentication**: Login/logout with proper user identification
- **🛍️ E-commerce Tracking**: Product views, cart additions
- **📝 Form Analytics**: Field interactions and submissions
- **⏱️ Session Tracking**: Real-time session duration
- **🔍 Debug Information**: Live analytics dashboard

### Interactive Elements

1. **Hero Section**
   - Primary and secondary CTA button tracking
   - User engagement measurement

2. **Feature Demo Cards**
   - Custom event tracking with counters
   - User interaction monitoring
   - E-commerce simulation

3. **Product Catalog**
   - Product view tracking
   - Add-to-cart events
   - Purchase simulation

4. **User Authentication**
   - Login/signup modal with form validation
   - Proper user identification using `identify()` API
   - Session persistence and logout functionality

5. **Contact Form**
   - Field-level interaction tracking
   - Form completion analytics
   - Submission success tracking

## 🛠️ Technical Implementation

### Architecture

```
js-sample/
├── index.html          # CDN version HTML
├── index-esm.html      # ES module version HTML
├── app.js              # CDN version logic
├── app-esm.js          # ES module version logic
├── styles.css          # Shared CSS styling
├── vite.config.js      # Vite configuration
├── package.json        # Dependencies and scripts
└── README.md           # This documentation
```

### Key Technologies

- **Vanilla JavaScript**: No frameworks, pure ES6+
- **Journium SDK**: Latest published version via npm
- **Vite**: Modern build tool for ES modules
- **Modern CSS**: Grid, Flexbox, CSS Variables
- **HTTP Server**: Simple development server for CDN version

## 📦 SDK Integration Methods

### Method 1: CDN / Script Tag (index.html)

Perfect for websites without build tools (Shopify, WordPress, static HTML):

> **Note**: This demo uses the local build from `../../packages/journium-js/dist/journium.min.js` for development. In production, use the jsDelivr CDN URL: `https://cdn.jsdelivr.net/npm/@journium/js@1/dist/journium.min.js`

```html
<!-- Add this snippet to your HTML -->
<script>
!function(j,o,u,r,n,i,u,m){
    if(!o.__JV){
        window.journium=o;
        o._q=[];
        o._i=null;
        o.init=function(c,n){o._i=[c,n]};
        var methods="track identify reset capturePageview startAutocapture stopAutocapture flush getEffectiveOptions onOptionsChange destroy".split(" ");
        for(var k=0;k<methods.length;k++){
            !function(method){
                o[method]=function(){o._q.push([method].concat(Array.prototype.slice.call(arguments)));return o}
            }(methods[k])
        }
        o.__JV=1;
        (m=j.createElement("script")).type="text/javascript";
        m.async=!0;
        // For production, use: https://cdn.jsdelivr.net/npm/@journium/js@1/dist/journium.min.js
        m.src="https://cdn.jsdelivr.net/npm/@journium/js@1/dist/journium.min.js";
        (i=j.getElementsByTagName("script")[0]).parentNode.insertBefore(m,i);
    }
}(document,window.journium||[]);

// Initialize with your config
journium.init({
    publishableKey: 'your-publishable-key'
});
</script>

<script>
// Use the global journium object
journium.track('button_clicked', {
    button_type: 'cta',
    page: 'home'
});

journium.identify('user_123', {
    name: 'John Doe',
    email: 'john@example.com'
});
</script>
```

### Method 2: ES Modules / npm (index-esm.html)

For modern applications with build tools (Vite, Webpack, Rollup):

```bash
# Install the SDK
npm install @journium/js
```

```javascript
// Import the SDK
import { init } from '@journium/js';

// Initialize Journium
const journium = init({
    publishableKey: 'your-publishable-key'
});

// Track custom events
journium.track('button_clicked', {
    button_type: 'cta',
    page: 'home',
    user_segment: 'visitor'
});

// Track pageviews manually (if autoTrackPageviews is false)
journium.capturePageview({
    page_name: 'products',
    page_type: 'catalog'
});

// User identification (login)
journium.identify('user_123', {
    name: 'John Doe',
    email: 'john@example.com',
    plan: 'premium'
});

// Reset user identity (logout)
journium.reset();
```

## 📈 Analytics Features

### Event Types Tracked

1. **Navigation Events**
   - Page views with SPA routing
   - Session duration tracking
   - Page transition analytics

2. **User Interaction Events**
   - Button clicks with context
   - Form field interactions
   - Element hover tracking

3. **User Authentication Events**
   - User login and signup tracking
   - Identity management with `identify()` API
   - Session reset on logout

4. **E-commerce Events**
   - Product catalog browsing
   - Add-to-cart actions
   - Purchase simulations

5. **Form Events**
   - Field focus/blur tracking
   - Form completion analytics
   - Submission success rates

### Real-time Dashboard

The demo includes a live analytics dashboard showing:

- Total events tracked
- Page views count
- Session duration
- Event type counters
- Debug information

## 🎨 User Experience

### Design Features

- **Responsive Design**: Works on all devices
- **Modern UI**: Clean, professional interface
- **Interactive Feedback**: Real-time counter updates
- **Visual Indicators**: Event tracking notifications
- **Smooth Transitions**: Page navigation animations

### Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios
- Focus indicators

## 🔄 Comparison: CDN vs ES Modules

| Feature | CDN Version | ES Module Version |
|---------|-------------|-------------------|
| **Setup** | Copy/paste script tag | `npm install` + import |
| **Build Step** | ❌ Not required | ✅ Required (Vite) |
| **File Size** | ~30KB (minified) | ~25KB (tree-shaken) |
| **TypeScript** | Types available via CDN | Full type support |
| **HMR** | ❌ No | ✅ Yes (Vite) |
| **Tree Shaking** | ❌ No | ✅ Yes |
| **Best For** | Static sites, CMS platforms | Modern web apps, SPAs |
| **Example Use Cases** | Shopify, WordPress, HTML | React, Vue, Next.js apps |

## 🔧 Development

### Available Scripts

```bash
# CDN version (no build)
npm run dev     # Start HTTP server on port 3007
npm run start   # Alias for npm run dev

# ES Module version (with Vite)
npm run dev:esm # Start Vite dev server on port 3008
npm run build   # Build for production
npm run preview # Preview production build
```

### Configuration

#### CDN Version (`index.html`)

The SDK is loaded from `node_modules/@journium/js/dist/journium.min.js` (workspace symlink).

Edit the inline script to configure:

```javascript
journium.init({
    publishableKey: 'your-actual-publishable-key',  // Replace with your key
    apiHost: 'https://events.journium.app',         // Optional: your API host
    options: {
        debug: false,                               // Disable for production
        flushAt: 20,                               // Events before auto-flush
        flushInterval: 30000,                      // Flush interval in ms
        autocapture: true,                         // Auto-capture clicks
        autoTrackPageviews: true                   // Auto-track pageviews
    }
});
```

> **How it works**: The `@journium/js` workspace dependency creates a symlink in `node_modules/@journium/js` → `../../packages/journium-js`, so `http-server` can serve the built SDK file.

#### ES Module Version (`app-esm.js`)

Edit the initialization in the file:

```javascript
import { init } from '@journium/js';

const journium = init({
    publishableKey: 'your-actual-publishable-key'
});
```

### Event Monitoring

To see events being tracked:

1. Open browser developer tools
2. Check the Console tab for event logs
3. Monitor Network tab for API calls
4. Use the debug dashboard in the footer

## 📱 Browser Support

- ✅ **Chrome** 60+
- ✅ **Firefox** 55+
- ✅ **Safari** 12+
- ✅ **Edge** 79+
- ✅ **Mobile browsers**

## 🔍 Troubleshooting

### Common Issues

1. **SDK Not Loading (CDN)**
   - Check browser console for network errors
   - Verify CDN URL is accessible
   - Check for Content Security Policy (CSP) restrictions

2. **SDK Not Loading (ES Module)**
   - Ensure `npm install` completed successfully
   - Check `node_modules/@journium/js` exists
   - Verify Vite is running without errors

3. **Events Not Tracking**
   - Verify API host is accessible
   - Check publishable key configuration
   - Monitor browser network requests in DevTools
   - Enable debug mode (see below)

4. **Development Server Issues**
   - Ensure ports 3007 or 3008 are available
   - Try `npm install` to reinstall dependencies
   - Check for Node.js version compatibility (14+)

### Debug Mode

Enable debug mode to see detailed logging:

**CDN Version:**
```javascript
journium.init({
    publishableKey: 'your-key',
    options: {
        debug: true  // Enable debug logging
    }
});
```

**ES Module Version:**
```javascript
import { init } from '@journium/js';

const journium = init({
    publishableKey: 'your-key',
    options: {
        debug: true  // Enable debug logging
    }
});
```

## 🚀 Deployment

To deploy this demo:

1. **Static Hosting**: Upload all files to your web server
2. **CDN Integration**: Use CDN links instead of local files
3. **Production Config**: Update publishableKey and API host
4. **SSL Certificate**: Ensure HTTPS for production

### Production Checklist

- [ ] Replace demo publishable key with production publishable key
- [ ] Update API host to production endpoint
- [ ] Disable debug mode
- [ ] Optimize images and assets
- [ ] Test on multiple devices/browsers

## 📚 Additional Documentation

- **[INTEGRATION.md](./INTEGRATION.md)** - Detailed integration guide comparing both methods
- **[Journium Documentation](https://journium.app/docs/js)** - Complete guides
- **[JavaScript SDK Reference](https://journium.app/docs/js)** - Full API documentation  
- **[GitHub Repository](https://github.com/journium/journium-js)** - Source code
- **[npm Package](https://npmjs.com/package/@journium/js)** - Package details

## 🎓 Examples in This Demo

Both implementations demonstrate:

- ✅ Custom event tracking with properties
- ✅ Automatic and manual pageview tracking
- ✅ User identification (login/signup)
- ✅ Session management and tracking
- ✅ E-commerce events (product views, cart additions)
- ✅ Form interaction tracking
- ✅ Real-time analytics dashboard
- ✅ Debug logging and monitoring

## 🤝 Contributing

This demo is part of the Journium JavaScript SDK examples. To contribute:

1. Fork the [main repository](https://github.com/journium/journium-js)
2. Create your feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see the main repository for details.