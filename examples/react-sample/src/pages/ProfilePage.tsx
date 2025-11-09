import React, { useState } from 'react';
import { useTrackEvent } from '@journium/react';
import { Link } from 'react-router-dom';

export function ProfilePage() {
  const trackEvent = useTrackEvent();
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Developer'
  });

  const handleUpdateProfile = () => {
    trackEvent('profile_update_attempted', {
      action: 'update_profile',
      page: 'profile',
      fields_changed: ['name', 'email'],
      timestamp: new Date().toISOString()
    });
  };

  const handleChangePassword = () => {
    trackEvent('password_change_attempted', {
      action: 'change_password',
      page: 'profile',
      security_level: 'high'
    });
  };

  const handleUploadAvatar = () => {
    trackEvent('avatar_upload_attempted', {
      action: 'upload_avatar',
      page: 'profile',
      file_type: 'image'
    });
  };

  return (
    <div className="app-content">
      <header>
        <h1>👤 Profile - User Account</h1>
        <nav style={{margin: '20px 0', display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
          <Link to="/" className="nav-link">🏠 Home</Link>
          <Link to="/dashboard" className="nav-link">📊 Dashboard</Link>
          <Link to="/profile" className="nav-link">👤 Profile</Link>
          <Link to="/settings" className="nav-link">⚙️ Settings</Link>
          <Link to="/products" className="nav-link">🛍️ Products</Link>
          <Link to="/analytics" className="nav-link">📈 Analytics</Link>
        </nav>
        <p>This page demonstrates user profile interactions and pageview tracking.</p>
      </header>

      <main>
        <section className="demo-section">
          <h2>Profile Information</h2>
          <div style={{margin: '20px 0', padding: '20px', border: '1px solid #ddd', borderRadius: '8px'}}>
            <div style={{marginBottom: '15px'}}>
              <label style={{display: 'block', fontWeight: 'bold', marginBottom: '5px'}}>Name:</label>
              <input 
                type="text" 
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                style={{width: '200px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
              />
            </div>
            <div style={{marginBottom: '15px'}}>
              <label style={{display: 'block', fontWeight: 'bold', marginBottom: '5px'}}>Email:</label>
              <input 
                type="email" 
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                style={{width: '200px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
              />
            </div>
            <div style={{marginBottom: '15px'}}>
              <label style={{display: 'block', fontWeight: 'bold', marginBottom: '5px'}}>Role:</label>
              <select 
                value={profileData.role}
                onChange={(e) => setProfileData({...profileData, role: e.target.value})}
                style={{width: '216px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc'}}
              >
                <option value="Developer">Developer</option>
                <option value="Designer">Designer</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
          
          <div className="button-group">
            <button onClick={handleUpdateProfile} className="demo-button">
              Update Profile
            </button>
            
            <button onClick={handleChangePassword} className="demo-button">
              Change Password
            </button>
            
            <button onClick={handleUploadAvatar} className="demo-button">
              Upload Avatar
            </button>
          </div>
        </section>

        <section className="demo-section">
          <h2>Account Actions</h2>
          <p>Profile-specific actions that generate analytics events:</p>
          
          <div className="button-group">
            <button 
              className="demo-button"
              onClick={() => trackEvent('view_activity_log', {page: 'profile', section: 'security'})}
            >
              View Activity Log
            </button>
            
            <button 
              className="demo-button"
              onClick={() => trackEvent('download_data', {page: 'profile', data_type: 'personal'})}
            >
              Download My Data
            </button>
            
            <button 
              className="demo-button"
              onClick={() => trackEvent('privacy_settings_viewed', {page: 'profile'})}
            >
              Privacy Settings
            </button>
          </div>
        </section>

        <section className="demo-section info">
          <h2>👤 Profile Page Events</h2>
          <ul>
            <li><strong>Page Load:</strong> Automatic pageview tracking for /profile route</li>
            <li><strong>Profile Updates:</strong> Form submission and field change tracking</li>
            <li><strong>Security Actions:</strong> Password changes, activity log views</li>
            <li><strong>Privacy Actions:</strong> Data downloads, privacy setting views</li>
            <li><strong>Form Autocapture:</strong> Form field changes captured automatically</li>
          </ul>
        </section>
      </main>
    </div>
  );
}