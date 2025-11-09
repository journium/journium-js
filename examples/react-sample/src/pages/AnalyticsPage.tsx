import React, { useState } from 'react';
import { useTrackEvent } from '@journium/react';
import { Link } from 'react-router-dom';

export function AnalyticsPage() {
  const trackEvent = useTrackEvent();
  const [selectedMetric, setSelectedMetric] = useState('pageviews');
  const [dateRange, setDateRange] = useState('7d');

  const handleMetricChange = (metric: string) => {
    setSelectedMetric(metric);
    trackEvent('metric_selected', {
      metric_type: metric,
      previous_metric: selectedMetric,
      page: 'analytics'
    });
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    trackEvent('date_range_changed', {
      new_range: range,
      previous_range: dateRange,
      page: 'analytics'
    });
  };

  const handleGenerateReport = () => {
    trackEvent('report_generated', {
      metric_type: selectedMetric,
      date_range: dateRange,
      page: 'analytics',
      report_format: 'interactive'
    });
  };

  return (
    <div className="app-content">
      <header>
        <h1>📈 Analytics - Deep Dive Insights</h1>
        <nav style={{margin: '20px 0', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          <Link to="/" className="nav-link">🏠 Home</Link>
          <Link to="/dashboard" className="nav-link">📊 Dashboard</Link>
          <Link to="/profile" className="nav-link">👤 Profile</Link>
          <Link to="/settings" className="nav-link">⚙️ Settings</Link>
          <Link to="/products" className="nav-link">🛍️ Products</Link>
          <Link to="/analytics" className="nav-link">📈 Analytics</Link>
        </nav>
        <p>This page demonstrates analytics interactions and pageview tracking for the analytics section.</p>
      </header>

      <main>
        <section className="demo-section">
          <h2>Analytics Controls</h2>
          <div style={{display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center', margin: '20px 0'}}>
            <div>
              <label style={{display: 'block', fontWeight: 'bold', marginBottom: '5px'}}>Metric:</label>
              <select 
                value={selectedMetric}
                onChange={(e) => handleMetricChange(e.target.value)}
                style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
              >
                <option value="pageviews">Pageviews</option>
                <option value="users">Users</option>
                <option value="sessions">Sessions</option>
                <option value="events">Events</option>
                <option value="conversions">Conversions</option>
              </select>
            </div>
            
            <div>
              <label style={{display: 'block', fontWeight: 'bold', marginBottom: '5px'}}>Date Range:</label>
              <select 
                value={dateRange}
                onChange={(e) => handleDateRangeChange(e.target.value)}
                style={{padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            
            <button 
              onClick={handleGenerateReport}
              className="demo-button"
              style={{marginTop: '20px'}}
            >
              Generate Report
            </button>
          </div>
        </section>

        <section className="demo-section">
          <h2>Analytics Visualization</h2>
          <div style={{
            height: '200px', 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: '#f9f9f9',
            margin: '20px 0'
          }}>
            <p style={{color: '#666'}}>📊 Chart for {selectedMetric} over {dateRange}</p>
          </div>
          
          <div className="button-group">
            <button 
              className="demo-button"
              onClick={() => trackEvent('export_chart', {
                chart_type: selectedMetric,
                date_range: dateRange,
                page: 'analytics'
              })}
            >
              Export Chart
            </button>
            
            <button 
              className="demo-button"
              onClick={() => trackEvent('share_insights', {
                metric: selectedMetric,
                page: 'analytics'
              })}
            >
              Share Insights
            </button>
            
            <button 
              className="demo-button"
              onClick={() => trackEvent('create_alert', {
                metric: selectedMetric,
                page: 'analytics'
              })}
            >
              Create Alert
            </button>
          </div>
        </section>

        <section className="demo-section">
          <h2>Advanced Analytics</h2>
          <div className="button-group">
            <button 
              className="demo-button"
              onClick={() => trackEvent('funnel_analysis', {
                page: 'analytics',
                analysis_type: 'funnel'
              })}
            >
              Funnel Analysis
            </button>
            
            <button 
              className="demo-button"
              onClick={() => trackEvent('cohort_analysis', {
                page: 'analytics',
                analysis_type: 'cohort'
              })}
            >
              Cohort Analysis
            </button>
            
            <button 
              className="demo-button"
              onClick={() => trackEvent('retention_analysis', {
                page: 'analytics',
                analysis_type: 'retention'
              })}
            >
              Retention Analysis
            </button>
          </div>
        </section>

        <section className="demo-section info">
          <h2>📈 Analytics Page Events</h2>
          <ul>
            <li><strong>Page Load:</strong> Automatic pageview tracking for /analytics route</li>
            <li><strong>Metric Selection:</strong> Track which analytics metrics users view</li>
            <li><strong>Date Range Changes:</strong> Monitor how users explore different time periods</li>
            <li><strong>Report Generation:</strong> Track report creation with parameters</li>
            <li><strong>Advanced Analysis:</strong> Track usage of sophisticated analytics features</li>
            <li><strong>Export Actions:</strong> Monitor data export and sharing behaviors</li>
          </ul>
        </section>
      </main>
    </div>
  );
}