import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useTrackEvent, useAutoTrackPageview } from '@journium/nextjs';
import styles from '../styles/Home.module.css';

export default function About() {
  const trackEvent = useTrackEvent();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  useAutoTrackPageview([], { 
    page: 'about', 
    route: '/about', 
    framework: 'nextjs'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    trackEvent('form_field_updated', {
      field_name: name,
      field_value_length: value.length,
      form_type: 'contact',
      page: 'about'
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    trackEvent('contact_form_submitted', {
      form_type: 'contact',
      has_name: !!formData.name,
      has_email: !!formData.email,
      has_message: !!formData.message,
      message_length: formData.message.length,
      page: 'about'
    });

    alert('Form submitted! (This is just a demo)');
    setFormData({ name: '', email: '', message: '' });
  };

  const handleSocialClick = (platform: string) => {
    trackEvent('social_link_clicked', {
      platform,
      page: 'about',
      link_type: 'external'
    });
  };

  const handleDocumentationClick = () => {
    trackEvent('documentation_accessed', {
      section: 'getting_started',
      page: 'about',
      user_intent: 'learn_more'
    });
  };

  return (
    <>
      <Head>
        <title>About - Journium Next.js Sample</title>
        <meta name="description" content="Learn about Journium SDK and event tracking" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>ℹ️ About Journium</h1>
          <p className={styles.description}>
            Learn more about Journium analytics and see form tracking in action.
          </p>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
        </header>

        <main className={styles.main}>
          <section className={styles.section}>
            <h2>What is Journium?</h2>
            <p>
              Journium is a powerful analytics platform that helps you understand user behavior 
              and track important events in your applications. With our JavaScript SDK, you can:
            </p>
            <ul>
              <li>Track custom events with rich metadata</li>
              <li>Monitor user interactions and engagement</li>
              <li>Analyze e-commerce activities and conversions</li>
              <li>Get insights into user journeys and funnels</li>
            </ul>
            
            <button 
              onClick={handleDocumentationClick}
              className={`${styles.button} ${styles.documentation}`}
            >
              View Documentation
            </button>
          </section>

          <section className={styles.section}>
            <h2>Contact Us</h2>
            <p>Interested in learning more? Fill out the form below:</p>
            
            <form onSubmit={handleFormSubmit} className={styles.contactForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Name:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={styles.formInput}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="message">Message:</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  rows={4}
                  required
                />
              </div>
              
              <button type="submit" className={`${styles.button} ${styles.submit}`}>
                Send Message
              </button>
            </form>
          </section>

          <section className={styles.section}>
            <h2>Connect With Us</h2>
            <div className={styles.buttonGroup}>
              <button 
                onClick={() => handleSocialClick('twitter')}
                className={`${styles.button} ${styles.social}`}
              >
                Twitter
              </button>
              <button 
                onClick={() => handleSocialClick('github')}
                className={`${styles.button} ${styles.social}`}
              >
                GitHub
              </button>
              <button 
                onClick={() => handleSocialClick('linkedin')}
                className={`${styles.button} ${styles.social}`}
              >
                LinkedIn
              </button>
            </div>
          </section>

          <section className={`${styles.section} ${styles.info}`}>
            <h2>📊 Form Tracking Features</h2>
            <ul>
              <li><strong>Field Interactions:</strong> Tracks when form fields are updated</li>
              <li><strong>Form Submission:</strong> Captures form completion with metadata</li>
              <li><strong>Social Engagement:</strong> Tracks social media link clicks</li>
              <li><strong>Content Interaction:</strong> Monitors documentation access</li>
            </ul>
          </section>
        </main>
      </div>
    </>
  );
}