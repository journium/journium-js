# Journium JavaScript SDK Demo

A comprehensive vanilla JavaScript demonstration of the Journium analytics SDK, showcasing event tracking, pageview monitoring, and user interaction analytics in a modern single-page application.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The demo will open at `http://localhost:3007`

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
├── index.html          # Main HTML structure
├── styles.css          # Modern CSS styling
├── app.js             # Core application logic
├── package.json       # Dependencies and scripts
└── README.md          # This documentation
```

### Key Technologies

- **Vanilla JavaScript**: No frameworks, pure ES6+
- **Journium SDK**: Latest published version
- **Modern CSS**: Grid, Flexbox, CSS Variables
- **HTTP Server**: Simple development server

### SDK Integration

```javascript
// Initialize Journium
const journium = window.Journium.init({
    publishableKey: 'demo-js-publishable-key',
    apiHost: 'http://localhost:3006', // Optional: defaults to 'https://events.journium.app'
    config: {
        debug: true,
        autocapture: {
            captureClicks: true,
            captureFormSubmits: true,
            ignoreClasses: ['no-track']
        }
    }
});

// Track custom events
journium.track('button_clicked', {
    button_type: 'cta',
    page: 'home',
    user_segment: 'visitor'
});

// Track pageviews
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

## 🔧 Development

### Available Scripts

```bash
npm run dev     # Start development server on port 3007
npm run start   # Same as dev
npm run build   # No build step needed for vanilla JS
```

### Configuration

Edit the Journium configuration in `app.js`:

```javascript
const journium = window.Journium.init({
    publishableKey: 'your-actual-publishable-key',  // Replace with your publishable key
    apiHost: 'https://your-api.host',               // Optional: replace with your API host
    config: {
        debug: false,                               // Disable for production
        flushAt: 20,                               // Events before auto-flush
        flushInterval: 30000,                      // Flush interval in ms
    }
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

1. **SDK Not Loading**
   - Check `node_modules/@journium/js/dist/index.umd.js` exists
   - Verify script tag in `index.html`
   - Check browser console for errors

2. **Events Not Tracking**
   - Verify API host is accessible
   - Check publishable key configuration
   - Monitor browser network requests

3. **Development Server Issues**
   - Ensure port 3007 is available
   - Try `npm install` to reinstall dependencies
   - Check for Node.js version compatibility

### Debug Mode

Enable debug mode to see detailed logging:

```javascript
// In app.js
this.journium = window.Journium.init({
    debug: true,  // Enable debug logging
    // ... other config
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

## 📖 Learn More

- **[Journium Documentation](https://docs.journium.app)** - Complete guides
- **[JavaScript SDK](https://docs.journium.app/javascript)** - SDK documentation  
- **[GitHub Repository](https://github.com/journium/journium-js)** - Source code
- **[npm Package](https://npmjs.com/package/@journium/js)** - Package details

## 🤝 Contributing

This demo is part of the Journium JavaScript SDK examples. To contribute:

1. Fork the [main repository](https://github.com/journium/journium-js)
2. Create your feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - see the main repository for details.