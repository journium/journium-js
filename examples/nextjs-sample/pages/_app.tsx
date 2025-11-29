import type { AppProps } from 'next/app';
import { NextJourniumProvider } from '@journium/nextjs';
import '../styles/globals.css';

// Demo configuration - optimized for immediate event visibility
// For production, remove flushAt and flushInterval to use remote config
const journiumConfig = {
  token: 'client_abcdef1234567890abcdef1234567890',
  apiHost: 'http://localhost:3006',
  //apiHost: 'https://ingestion.bhushan-685.workers.dev',
  debug: true,  // Always set locally - never configured remotely
  flushAt: 1,   // Send events immediately for demo purposes
  flushInterval: 1000,  // Also flush every 1 second for demo
  // autocapture: true by default - set to false to disable button/form tracking
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextJourniumProvider config={journiumConfig} /* autoCapture enabled by default */>
      <Component {...pageProps} />
    </NextJourniumProvider>
  );
}