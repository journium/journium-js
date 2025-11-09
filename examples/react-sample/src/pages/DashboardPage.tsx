import React, { useState } from 'react';
import { useTrackEvent } from '@journium/react';
import { Link } from 'react-router-dom';

export function DashboardPage() {
  const trackEvent = useTrackEvent();
  const [viewCount, setViewCount] = useState(0);

  const handleViewMetrics = () => {
    const newCount = viewCount + 1;
    setViewCount(newCount);
    trackEvent('view_metrics', {
      action: 'dashboard_view',
      view_count: newCount,
      page: 'dashboard',
      component: 'metrics_section'
    });
  };

  const handleExportData = () => {
    trackEvent('export_data', {
      export_type: 'dashboard_data',
      format: 'csv',
      page: 'dashboard',
      timestamp: new Date().toISOString()
    });
  };

  return (
    <div className="app-content">
      <header>
        <h1>📊 Dashboard - Analytics Overview</h1>
        <nav style={{margin: '20px 0', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          <Link to="/" className="nav-link">🏠 Home</Link>
          <Link to="/dashboard" className="nav-link">📊 Dashboard</Link>
          <Link to="/profile" className="nav-link">👤 Profile</Link>
          <Link to="/settings" className="nav-link">⚙️ Settings</Link>
          <Link to="/products" className="nav-link">🛍️ Products</Link>
          <Link to="/analytics" className="nav-link">📈 Analytics</Link>
        </nav>
        <p>This page demonstrates automatic pageview tracking for the dashboard route.</p>
      </header>

      <main>
        <section className="demo-section">
          <h2>Dashboard Metrics</h2>
          <p>Interact with dashboard elements to track analytics events:</p>
          
          <div className="button-group">
            <button onClick={handleViewMetrics} className="demo-button">
              View Metrics ({viewCount})
            </button>
            
            <button onClick={handleExportData} className="demo-button">
              Export Data
            </button>
          </div>
        </section>

        <section className="demo-section">
          <h2>Dashboard Stats</h2>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', margin: '20px 0'}}>
            <div className="stat-card" style={{padding: '20px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center'}}>
              <h3>Total Users</h3>
              <p style={{fontSize: '2em', margin: '10px 0', color: '#007acc'}}>1,234</p>
              <button 
                className="demo-button" 
                onClick={() => trackEvent('view_stat', {stat_type: 'users', page: 'dashboard'})}
              >
                View Details
              </button>
            </div>
            
            <div className="stat-card" style={{padding: '20px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center'}}>
              <h3>Revenue</h3>
              <p style={{fontSize: '2em', margin: '10px 0', color: '#28a745'}}>$45,678</p>
              <button 
                className="demo-button" 
                onClick={() => trackEvent('view_stat', {stat_type: 'revenue', page: 'dashboard'})}
              >
                View Details
              </button>
            </div>
            
            <div className="stat-card" style={{padding: '20px', border: '1px solid #ddd', borderRadius: '8px', textAlign: 'center'}}>
              <h3>Conversion Rate</h3>
              <p style={{fontSize: '2em', margin: '10px 0', color: '#ffc107'}}>3.2%</p>
              <button 
                className="demo-button" 
                onClick={() => trackEvent('view_stat', {stat_type: 'conversion', page: 'dashboard'})}
              >
                View Details
              </button>
            </div>
          </div>
        </section>

        <section className="demo-section info">
          <h2>📊 Dashboard Page Events</h2>
          <ul>
            <li><strong>Page Load:</strong> Automatic pageview tracking for /dashboard route</li>
            <li><strong>Dashboard Events:</strong> Metrics viewing, data export tracking</li>
            <li><strong>Stat Interactions:</strong> Individual stat viewing events</li>
            <li><strong>Route Context:</strong> All events tagged with page: 'dashboard'</li>
          </ul>
        </section>
      </main>
    </div>
  );
}