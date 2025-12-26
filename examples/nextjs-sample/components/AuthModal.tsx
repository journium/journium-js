import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useTrackEvent } from '@journium/nextjs';
import styles from '../styles/AuthModal.module.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signup } = useAuth();
  const trackEvent = useTrackEvent();

  React.useEffect(() => {
    if (isOpen) {
      trackEvent('auth_modal_opened', {
        modal_type: mode,
        trigger: 'manual',
        framework: 'nextjs'
      });
    }
  }, [isOpen, mode, trackEvent]);

  React.useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let success = false;
      
      if (mode === 'login') {
        success = await login(formData.email, formData.password);
        
        trackEvent('login_attempt', {
          method: 'email',
          success,
          framework: 'nextjs'
        });
        
        if (success) {
          trackEvent('user_logged_in', {
            method: 'email',
            source: 'modal',
            framework: 'nextjs'
          });
        }
      } else {
        success = await signup(formData.name, formData.email, formData.company, formData.password);
        
        trackEvent('signup_attempt', {
          method: 'email',
          success,
          has_company: !!formData.company,
          framework: 'nextjs'
        });
        
        if (success) {
          trackEvent('user_signed_up', {
            method: 'email',
            source: 'modal',
            has_company: !!formData.company,
            framework: 'nextjs'
          });
        }
      }

      if (success) {
        onClose();
        setFormData({ name: '', email: '', company: '', password: '' });
      } else {
        setError('Authentication failed. Please try again.');
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    const newMode = mode === 'login' ? 'signup' : 'login';
    setMode(newMode);
    setError('');
    
    trackEvent('auth_modal_switch', {
      from_mode: mode,
      to_mode: newMode,
      framework: 'nextjs'
    });
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{mode === 'login' ? 'Login to Your Account' : 'Create New Account'}</h3>
          <button className={styles.close} onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'signup' && (
            <div className={styles.group}>
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className={styles.group}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {mode === 'signup' && (
            <div className={styles.group}>
              <label htmlFor="company">Company (Optional)</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                disabled={isSubmitting}
              />
            </div>
          )}

          <div className={styles.group}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button 
            type="submit" 
            className={styles.submit}
            disabled={isSubmitting}
          >
            {isSubmitting 
              ? (mode === 'login' ? 'Logging in...' : 'Creating account...') 
              : (mode === 'login' ? 'Login' : 'Create Account')
            }
          </button>

          <p className={styles.switch}>
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button type="button" className={styles.link} onClick={switchMode} disabled={isSubmitting}>
              {mode === 'login' ? 'Sign up' : 'Login'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}