import type { AppProps } from 'next/app';
import { NextJourniumProvider } from '@journium/nextjs';
import { AuthProvider } from '../components/AuthProvider';
import { Header } from '../components/Header';
import '../styles/globals.css';

// Demo configuration - optimized for immediate event visibility
// For production, remove config object to use remote config
const journiumConfig = {
  publishableKey: 'client_abcdef1234567890abcdef1234567890',
  // apiHost defaults to 'https://events.journium.app'
  apiHost: 'http://localhost:3006', // For demo: Events monitor endpoint
  //apiHost: 'https://ingestion.bhushan-685.workers.dev',
  options: {
    debug: true,  // Always set locally - never configured remotely
    flushAt: 1,   // Send events immediately for demo purposes
    flushInterval: 1000,  // Also flush every 1 second for demo
    // autocapture: true by default - set to false to disable button/form tracking
    // autoTrackPageviews: true by default - set to false to disable automatic route change tracking
  }
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextJourniumProvider config={journiumConfig}>
      <AuthProvider>
        <div className="app">
          <Header />
          <main className="main">
            <Component {...pageProps} />
          </main>
        </div>
      </AuthProvider>
    </NextJourniumProvider>
  );
}