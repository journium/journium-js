import React, { useState } from 'react';
import { JourniumProvider, useTrackEvent, useTrackPageview, useAutoTrackPageview } from '@journium/react';
import './App.css';

const journiumConfig = {
  apiKey: 'demo-api-key',
  apiHost: 'http://localhost:3001',
  debug: true,
  flushAt: 10,
  flushInterval: 30000,
  autocapture: {
    captureClicks: true,
    captureFormSubmits: true,
    captureFormChanges: true,
    captureTextSelection: false,
    ignoreClasses: ['no-track'],
    captureContentText: true
  }
};

function HomePage() {
  const trackEvent = useTrackEvent();
  const trackPageview = useTrackPageview();
  const [eventCount, setEventCount] = useState(0);
  const [pageviewCount, setPageviewCount] = useState(0);

  useAutoTrackPageview([], { page: 'home', component: 'HomePage' });

  const handleButtonClick = () => {
    const newCount = eventCount + 1;
    setEventCount(newCount);
    trackEvent('button_clicked', {
      button_text: 'Track Event',
      click_count: newCount,
      timestamp: new Date().toISOString()
    });
  };

  const handlePageviewClick = () => {
    const newCount = pageviewCount + 1;
    setPageviewCount(newCount);
    trackPageview({
      page: 'home_manual',
      manual_pageview: true,
      pageview_count: newCount
    });
  };

  const handlePurchaseClick = () => {
    trackEvent('purchase_completed', {
      product_id: 'sample_product_123',
      price: 29.99,
      currency: 'USD',
      quantity: 1,
      category: 'electronics'
    });
  };

  const handleSignupClick = () => {
    trackEvent('user_signup', {
      signup_method: 'email',
      source: 'demo_app',
      user_type: 'trial'
    });
  };

  return (
    <div className="app-content">
      <header>
        <h1>🚀 Journium React SDK Demo</h1>
        <p>This demo shows how to integrate Journium analytics into a React application.</p>
      </header>

      <main>
        <section className="demo-section">
          <h2>Event Tracking</h2>
          <p>Click the buttons below to track different types of events:</p>
          
          <div className="button-group">
            <button onClick={handleButtonClick} className="demo-button">
              Track Custom Event ({eventCount})
            </button>
            
            <button onClick={handlePurchaseClick} className="demo-button purchase">
              Track Purchase Event
            </button>
            
            <button onClick={handleSignupClick} className="demo-button signup">
              Track Signup Event
            </button>
          </div>
        </section>

        <section className="demo-section">
          <h2>Pageview Tracking</h2>
          <p>Pageviews are automatically tracked on route changes. You can also manually track them:</p>
          
          <button onClick={handlePageviewClick} className="demo-button pageview">
            Manual Pageview Track ({pageviewCount})
          </button>
        </section>

        <section className="demo-section">
          <h2>Autocapture Demo</h2>
          <p>The following elements will generate $autocapture events automatically when clicked:</p>
          
          <div className="button-group">
            <button className="demo-button" data-testid="autocapture-btn-1">
              Autocapture Button 1
            </button>
            
            <button className="demo-button cart" id="special-btn" aria-label="Special button">
              Button with ID & Aria
            </button>
            
            <a href="#" className="demo-button nav" onClick={(e) => e.preventDefault()}>
              Link Element
            </a>
            
            <button className="demo-button no-track">
              Ignored Button (no-track class)
            </button>
          </div>

          <div style={{marginTop: '20px'}}>
            <h3>Form Autocapture</h3>
            <form onSubmit={(e) => e.preventDefault()} style={{display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px'}}>
              <input 
                type="text" 
                placeholder="Your name" 
                name="name"
                style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
              />
              <input 
                type="email" 
                placeholder="Your email" 
                name="email"
                style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
              />
              <select name="country" style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}>
                <option value="">Select Country</option>
                <option value="us">United States</option>
                <option value="uk">United Kingdom</option>
                <option value="ca">Canada</option>
              </select>
              <button type="submit" className="demo-button submit">
                Submit Form (Autocaptured)
              </button>
            </form>
          </div>
        </section>

        <section className="demo-section info">
          <h2>📋 What's Happening</h2>
          <ul>
            <li><strong>Auto Pageview:</strong> Automatically tracked when this component mounts</li>
            <li><strong>Custom Events:</strong> Button clicks with custom properties</li>
            <li><strong>E-commerce Events:</strong> Purchase tracking with product details</li>
            <li><strong>User Events:</strong> Signup tracking with source attribution</li>
            <li><strong>Manual Pageviews:</strong> Programmatically triggered pageview events</li>
            <li><strong>$autocapture Events:</strong> Automatic tracking of button clicks and form interactions</li>
            <li><strong>Element Properties:</strong> Captures element IDs, classes, text content, and position</li>
            <li><strong>Form Tracking:</strong> Automatically tracks form submissions and field changes</li>
            <li><strong>Ignore Classes:</strong> Elements with "no-track" class are ignored</li>
          </ul>
          <p className="note">
            <strong>Note:</strong> Check your browser's developer console and the events monitor to see both manual and automatic events being tracked.
          </p>
        </section>
      </main>
    </div>
  );
}

function App() {
  return (
    <JourniumProvider config={journiumConfig} autoCapture={true}>
      <HomePage />
    </JourniumProvider>
  );
}

export default App;