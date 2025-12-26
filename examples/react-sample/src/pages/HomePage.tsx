import React, { useState } from 'react';
import { useTrackEvent, useTrackPageview } from '@journium/react';

export function HomePage() {
  const trackEvent = useTrackEvent();
  const trackPageview = useTrackPageview();
  const [eventCount, setEventCount] = useState(0);
  const [pageviewCount, setPageviewCount] = useState(0);

  const handleButtonClick = () => {
    const newCount = eventCount + 1;
    setEventCount(newCount);
    trackEvent('button_clicked', {
      button_text: 'Track Event',
      click_count: newCount,
      timestamp: new Date().toISOString(),
      page: 'home'
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
      category: 'electronics',
      page: 'home'
    });
  };

  const handleFeatureClick = () => {
    trackEvent('feature_used', {
      feature_name: 'demo_feature',
      source: 'home_page',
      interaction_type: 'button_click',
      page: 'home'
    });
  };

  return (
    <div className="app-content">
      <div className="page-header">
        <h1>🏠 Home - Journium React SDK Demo</h1>
        <p>This demo shows automatic pageview tracking on route changes. Navigate between pages to see pageview events.</p>
      </div>

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
            
            <button onClick={handleFeatureClick} className="demo-button feature">
              Track Feature Usage
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
            <button className="demo-button" data-testid="autocapture-btn-home">
              Autocapture Button Home
            </button>
            
            <button className="demo-button cart" id="home-special-btn" aria-label="Special home button">
              Button with ID & Aria
            </button>
            
            <a href="#home" className="demo-button nav" onClick={(e) => e.preventDefault()}>
              Home Link Element
            </a>
            
            <button className="demo-button no-track">
              Ignored Button (no-track class)
            </button>
          </div>
        </section>

        <section className="demo-section info">
          <h2>📋 What's Happening on Home Page</h2>
          <ul>
            <li><strong>Auto Pageview:</strong> Automatically tracked when navigating to this page</li>
            <li><strong>Custom Events:</strong> Button clicks with page context</li>
            <li><strong>User Identification:</strong> Login/Signup properly identifies users with the identify API</li>
            <li><strong>Route Changes:</strong> Navigate to other pages to see automatic pageview tracking</li>
            <li><strong>Session Management:</strong> All events include session, device, and user IDs</li>
            <li><strong>Browser Detection:</strong> Events include browser, OS, and device type</li>
          </ul>
        </section>
      </main>
    </div>
  );
}