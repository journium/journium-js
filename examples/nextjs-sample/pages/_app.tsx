import type { AppProps } from 'next/app';
import { NextJourniumProvider } from '@journium/nextjs';
import '../styles/globals.css';

const journiumConfig = {
  applicationKey: 'demo-api-key',
  apiHost: 'http://localhost:3006',
  debug: true,
  flushAt: 10,
  flushInterval: 30000,
  autocapture: true
};

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextJourniumProvider config={journiumConfig} autoCapture={true}>
      <Component {...pageProps} />
    </NextJourniumProvider>
  );
}