import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { AuthModal } from './AuthModal';
import { useTrackEvent } from '@journium/react';

export function Header() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const trackEvent = useTrackEvent();

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
    
    trackEvent('auth_button_clicked', {
      button_type: 'login',
      current_page: window.location.pathname
    });
  };

  const handleSignupClick = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
    
    trackEvent('auth_button_clicked', {
      button_type: 'signup',
      current_page: window.location.pathname
    });
  };

  const handleLogout = () => {
    trackEvent('user_logged_out', {
      user_id: user?.id,
      current_page: window.location.pathname
    });
    
    logout();
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1>📊 Journium React SDK Demo</h1>
          <nav className="main-nav">
            <Link to="/" className="nav-link">🏠 Home</Link>
            <Link to="/dashboard" className="nav-link">📊 Dashboard</Link>
            <Link to="/profile" className="nav-link">👤 Profile</Link>
            <Link to="/settings" className="nav-link">⚙️ Settings</Link>
            <Link to="/products" className="nav-link">🛍️ Products</Link>
            <Link to="/analytics" className="nav-link">📈 Analytics</Link>
          </nav>
        </div>

        <div className="header-right">
          {user ? (
            <div className="user-section">
              <span className="user-greeting">Hello, {user.name}!</span>
              <button onClick={handleLogout} className="logout-button">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button onClick={handleLoginClick} className="login-button">
                Login
              </button>
              <button onClick={handleSignupClick} className="signup-button">
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </header>
  );
}