# @journium/js

[![npm version](https://badge.fury.io/js/@journium%2Fjs.svg)](https://badge.fury.io/js/@journium%2Fjs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

The official Journium JavaScript SDK for web browsers. Track events, pageviews, and user interactions with ease.

---

## Getting Started

Learn how to use Journium to power your application:

- [Quick Start Guide](https://journium.app/docs/js)
- [Concepts](https://journium.app/docs/js/concepts)
- [SDK Reference](https://journium.app/docs/js)

### Prerequisites
- Modern browser (ES2017+)
- An existing Journium application. [Create your account for free](https://dashboard.journium.app/sign-up?utm_source=github&utm_medium=journium_js).

## Installation Option 1: Via package manager

```bash
npm install @journium/js
```

## Usage

```javascript
import { init } from '@journium/js';

const journium = init({
  publishableKey: "your-publishable-key"
});
```

For more detailed examples and configuration options, visit the [Journium documentation](https://journium.app/docs/js/).

## Installation Option 2: Adding the JavaScript snippet to your HTML

For websites without module bundlers (Shopify, WordPress, static HTML), use the CDN version with a single global `journium` object.

### Script Tag

```html
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
        m.src="https://cdn.jsdelivr.net/npm/@journium/js@1/dist/journium.min.js";
        m.onerror=function(){console.warn("Journium: Failed to load SDK from CDN")};
        (i=j.getElementsByTagName("script")[0]).parentNode.insertBefore(m,i);
    }
}(document,window.journium||[]);

journium.init({ 
    publishableKey: 'YOUR_PUBLISHABLE_KEY'
});
</script>
```

### Usage Examples

```javascript
// Track events
journium.track('page_view', { page: 'home' });
journium.track('button_click', { button: 'signup' });

// Identify users  
journium.identify('user123', { 
    email: 'user@example.com',
    plan: 'pro' 
});
```

## Other SDKs

- [@journium/nextjs](https://www.npmjs.com/package/@journium/nextjs) - Next.js SDK
- [@journium/react](https://www.npmjs.com/package/@journium/react) - React SDK

## Support

Need help? Reach out to us:

- 📖 Join our official community [Discord server](https://journium.app/discord)
- 🐛 [Issue Tracker](https://github.com/journium/journium-js/issues)

## Contributing

We're open to all community contributions! If you'd like to contribute in any way, please read [our contribution guidelines](https://github.com/journium/journium-js/blob/main/CONTRIBUTING.md) and [code of conduct](https://github.com/journium/journium-js/blob/main/CODE_OF_CONDUCT.md).


## License

This project is licensed under the **MIT license**.

See [LICENSE](https://github.com/journium/journium-js/blob/main/LICENSE) for more information.
