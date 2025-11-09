import React, { useState } from 'react';
import { useTrackEvent } from '@journium/react';
import { Link } from 'react-router-dom';

export function SettingsPage() {
  const trackEvent = useTrackEvent();
  const [settings, setSettings] = useState({
    notifications: true,
    darkMode: false,
    analytics: true,
    newsletter: false
  });

  const handleSettingChange = (setting: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [setting]: value }));
    trackEvent('setting_changed', {
      setting_name: setting,
      new_value: value,
      previous_value: settings[setting as keyof typeof settings],
      page: 'settings'
    });
  };

  const handleSaveSettings = () => {
    trackEvent('settings_saved', {
      settings: { ...settings },
      page: 'settings',
      action: 'save_all'
    });
  };

  const handleResetSettings = () => {
    trackEvent('settings_reset', {
      page: 'settings',
      action: 'reset_to_defaults'
    });
  };

  return (
    <div className="app-content">
      <header>
        <h1>⚙️ Settings - Configuration</h1>
        <nav style={{margin: '20px 0', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          <Link to="/" className="nav-link">🏠 Home</Link>
          <Link to="/dashboard" className="nav-link">📊 Dashboard</Link>
          <Link to="/profile" className="nav-link">👤 Profile</Link>
          <Link to="/settings" className="nav-link">⚙️ Settings</Link>
          <Link to="/products" className="nav-link">🛍️ Products</Link>
          <Link to="/analytics" className="nav-link">📈 Analytics</Link>
        </nav>
        <p>This page demonstrates settings interactions and form autocapture capabilities.</p>
      </header>

      <main>
        <section className="demo-section">
          <h2>Application Settings</h2>
          <div style={{margin: '20px 0'}}>
            {Object.entries(settings).map(([key, value]) => (
              <div key={key} style={{
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '15px 0',
                borderBottom: '1px solid #eee'
              }}>
                <div>
                  <strong style={{textTransform: 'capitalize'}}>{key.replace(/([A-Z])/g, ' $1')}</strong>
                  <p style={{margin: '5px 0', color: '#666', fontSize: '0.9em'}}>
                    {key === 'notifications' && 'Receive push notifications'}
                    {key === 'darkMode' && 'Use dark theme'}
                    {key === 'analytics' && 'Allow analytics tracking'}
                    {key === 'newsletter' && 'Subscribe to newsletter'}
                  </p>
                </div>
                <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => handleSettingChange(key, e.target.checked)}
                    style={{marginRight: '10px'}}
                  />
                  <span style={{
                    width: '50px',
                    height: '25px',
                    backgroundColor: value ? '#007acc' : '#ccc',
                    borderRadius: '25px',
                    position: 'relative',
                    transition: 'background-color 0.3s'
                  }}>
                    <span style={{
                      width: '21px',
                      height: '21px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      position: 'absolute',
                      top: '2px',
                      left: value ? '27px' : '2px',
                      transition: 'left 0.3s'
                    }} />
                  </span>
                </label>
              </div>
            ))}
          </div>
          
          <div className="button-group">
            <button onClick={handleSaveSettings} className="demo-button">
              Save Settings
            </button>
            
            <button onClick={handleResetSettings} className="demo-button">
              Reset to Defaults
            </button>
          </div>
        </section>

        <section className="demo-section">
          <h2>Account Management</h2>
          <div className="button-group">
            <button 
              className="demo-button"
              onClick={() => trackEvent('export_data_requested', {page: 'settings'})}
            >
              Export Account Data
            </button>
            
            <button 
              className="demo-button"
              onClick={() => trackEvent('delete_account_viewed', {page: 'settings'})}
            >
              Delete Account
            </button>
            
            <button 
              className="demo-button"
              onClick={() => trackEvent('privacy_policy_viewed', {page: 'settings'})}
            >
              Privacy Policy
            </button>
          </div>
        </section>

        <section className="demo-section">
          <h2>Integration Settings</h2>
          <div style={{margin: '20px 0', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px'}}>
            <div style={{padding: '15px', border: '1px solid #ddd', borderRadius: '8px'}}>
              <h4>🔗 API Integration</h4>
              <p style={{fontSize: '0.9em', color: '#666'}}>Manage API keys and webhooks</p>
              <button 
                className="demo-button"
                onClick={() => trackEvent('api_settings_viewed', {page: 'settings', integration: 'api'})}
              >
                Configure API
              </button>
            </div>
            
            <div style={{padding: '15px', border: '1px solid #ddd', borderRadius: '8px'}}>
              <h4>📧 Email Integration</h4>
              <p style={{fontSize: '0.9em', color: '#666'}}>Email service configuration</p>
              <button 
                className="demo-button"
                onClick={() => trackEvent('email_settings_viewed', {page: 'settings', integration: 'email'})}
              >
                Configure Email
              </button>
            </div>
            
            <div style={{padding: '15px', border: '1px solid #ddd', borderRadius: '8px'}}>
              <h4>📱 Mobile App</h4>
              <p style={{fontSize: '0.9em', color: '#666'}}>Mobile app sync settings</p>
              <button 
                className="demo-button"
                onClick={() => trackEvent('mobile_settings_viewed', {page: 'settings', integration: 'mobile'})}
              >
                Configure Mobile
              </button>
            </div>
          </div>
        </section>

        <section className="demo-section info">
          <h2>⚙️ Settings Page Events</h2>
          <ul>
            <li><strong>Page Load:</strong> Automatic pageview tracking for /settings route</li>
            <li><strong>Setting Changes:</strong> Individual setting toggles with before/after values</li>
            <li><strong>Bulk Actions:</strong> Save all settings, reset to defaults</li>
            <li><strong>Account Management:</strong> Data export, account deletion requests</li>
            <li><strong>Integration Views:</strong> API, email, mobile configuration access</li>
            <li><strong>Form Autocapture:</strong> Checkbox changes captured automatically</li>
          </ul>
        </section>
      </main>
    </div>
  );
}