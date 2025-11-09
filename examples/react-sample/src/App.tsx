import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { JourniumProvider } from '@journium/react';
import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { ProductsPage } from './pages/ProductsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import './App.css';

const journiumConfig = {
  applicationKey: 'demo-api-key',
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

function App() {
  return (
    <JourniumProvider config={journiumConfig} autoCapture={true}>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </Router>
    </JourniumProvider>
  );
}

export default App;