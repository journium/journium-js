import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useJournium } from '@journium/nextjs';
import styles from '../styles/Home.module.css';

export default function Home() {
  const { journium } = useJournium();
  const [eventCount, setEventCount] = useState(0);
  const [pageviewCount, setPageviewCount] = useState(0);

  const handleButtonClick = () => {
    const newCount = eventCount + 1;
    setEventCount(newCount);
    journium?.track('button_clicked', {
      button_text: 'Track Event',
      click_count: newCount,
      page: 'home',
      framework: 'nextjs',
      timestamp: new Date().toISOString()
    });
  };

  const handlePageviewClick = () => {
    const newCount = pageviewCount + 1;
    setPageviewCount(newCount);
    journium?.capturePageview({
      page: 'home_manual',
      manual_pageview: true,
      pageview_count: newCount,
      framework: 'nextjs'
    });
  };

  const handleAddToCartClick = () => {
    journium?.track('add_to_cart', {
      product_id: 'nextjs_product_456',
      product_name: 'Next.js Course',
      price: 99.99,
      currency: 'USD',
      category: 'education',
      quantity: 1
    });
  };

  const handleNewsletterSignup = () => {
    journium?.track('newsletter_signup', {
      signup_method: 'homepage_form',
      source: 'nextjs_demo',
      user_segment: 'developer'
    });
  };

  const handleDownloadClick = () => {
    journium?.track('file_download', {
      file_name: 'nextjs_guide.pdf',
      file_type: 'pdf',
      download_source: 'homepage',
      file_size: '2.5MB'
    });
  };

  return (
    <>
      <Head>
        <title>Journium Next.js Sample</title>
        <meta name="description" content="Journium Next.js SDK Demo Application" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            🚀 Journium Next.js SDK Demo
          </h1>
          <p className={styles.description}>
            This demo shows how to integrate Journium analytics into a Next.js application
            with SSR support and automatic route tracking.
          </p>
        </header>

        <main className={styles.main}>
          <section className={styles.section}>
            <h2>Event Tracking</h2>
            <p>Click the buttons below to track different types of events:</p>
            
            <div className={styles.buttonGroup}>
              <button onClick={handleButtonClick} className={styles.button}>
                Track Custom Event ({eventCount})
              </button>
              
              <button onClick={handleAddToCartClick} className={`${styles.button} ${styles.cart}`}>
                Track Add to Cart
              </button>
              
              <button onClick={handleNewsletterSignup} className={`${styles.button} ${styles.signup}`}>
                Track Newsletter Signup
              </button>
              
              <button onClick={handleDownloadClick} className={`${styles.button} ${styles.download}`}>
                Track File Download
              </button>
            </div>
          </section>

          <section className={styles.section}>
            <h2>Pageview & Navigation Tracking</h2>
            <p>Pageviews are automatically tracked on route changes. You can also manually track them:</p>
            
            <div className={styles.buttonGroup}>
              <button onClick={handlePageviewClick} className={`${styles.button} ${styles.pageview}`}>
                Manual Pageview Track ({pageviewCount})
              </button>
              
              <Link href="/products" className={`${styles.button} ${styles.nav}`}>
                Navigate to Products →
              </Link>
              
              <Link href="/about" className={`${styles.button} ${styles.nav}`}>
                Navigate to About →
              </Link>
            </div>
          </section>

          <section className={`${styles.section} ${styles.info}`}>
            <h2>📋 What's Happening</h2>
            <ul>
              <li><strong>Auto Route Tracking:</strong> Automatically tracks pageviews when navigating between pages</li>
              <li><strong>SSR Support:</strong> Works with server-side rendering and static generation</li>
              <li><strong>E-commerce Events:</strong> Add to cart tracking with product details</li>
              <li><strong>User Engagement:</strong> Newsletter signups and file downloads</li>
              <li><strong>Custom Events:</strong> Button clicks with custom properties</li>
              <li><strong>Manual Pageviews:</strong> Programmatically triggered pageview events</li>
            </ul>
            <p className={styles.note}>
              <strong>Note:</strong> Check your browser's developer console to see the events being tracked.
              Navigate between pages to see automatic route tracking in action.
            </p>
          </section>
        </main>
      </div>
    </>
  );
}