import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from './AuthProvider';
import { AuthModal } from './AuthModal';
import { useTrackEvent } from '@journium/nextjs';
import styles from '../styles/Header.module.css';

export function Header() {
  const { user, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const trackEvent = useTrackEvent();
  const router = useRouter();

  const handleLoginClick = () => {
    setAuthMode('login');
    setShowAuthModal(true);
    
    trackEvent('auth_button_clicked', {
      button_type: 'login',
      current_page: router.pathname,
      framework: 'nextjs'
    });
  };

  const handleSignupClick = () => {
    setAuthMode('signup');
    setShowAuthModal(true);
    
    trackEvent('auth_button_clicked', {
      button_type: 'signup',
      current_page: router.pathname,
      framework: 'nextjs'
    });
  };

  const handleLogout = () => {
    trackEvent('user_logged_out', {
      user_id: user?.id,
      current_page: router.pathname,
      framework: 'nextjs'
    });
    
    logout();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.left}>
          <Link href="/" className={styles.logo}>
            🚀 Journium Next.js Demo
          </Link>
          <nav className={styles.nav}>
            <Link href="/" className={router.pathname === '/' ? styles.active : ''}>
              Home
            </Link>
            <Link href="/products" className={router.pathname === '/products' ? styles.active : ''}>
              Products
            </Link>
            <Link href="/about" className={router.pathname === '/about' ? styles.active : ''}>
              About
            </Link>
          </nav>
        </div>

        <div className={styles.right}>
          {user ? (
            <div className={styles.userSection}>
              <span className={styles.greeting}>Hello, {user.name}!</span>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Logout
              </button>
            </div>
          ) : (
            <div className={styles.authButtons}>
              <button onClick={handleLoginClick} className={styles.loginBtn}>
                Login
              </button>
              <button onClick={handleSignupClick} className={styles.signupBtn}>
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