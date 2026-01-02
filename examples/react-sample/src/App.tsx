import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { JourniumProvider } from '@journium/react';
import { AuthProvider } from './components/AuthProvider';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { ProductsPage } from './pages/ProductsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import './App.css';

// Demo configuration - optimized for immediate event visibility
// For production, remove config object to use remote config
const journiumConfig = {
  publishableKey: 'client_abcdef1234567890abcdef1234567890',
  // apiHost defaults to 'https://events.journium.app'
  apiHost: 'http://localhost:3006', // For demo: Events monitor endpoint
  //apiHost: 'https://ingestion.bhushan-685.workers.dev',
  config: {
    debug: true,  // Always set locally - never configured remotely
    flushAt: 5,   // Send events immediately for demo purposes
    flushInterval: 1000,  // Also flush every 1 second for demo
    // autocapture: true by default - set to false to disable button/form tracking
  }
};

function App() {
  return (
    <JourniumProvider config={journiumConfig} /* autoCapture enabled by default */>
      <AuthProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </JourniumProvider>
  );
}

export default App;