import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useIdentify, useReset } from '@journium/react';

interface User {
  id: string;
  name: string;
  email: string;
  company?: string;
  signupDate?: string;
  loginDate?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, company?: string, password?: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const identify = useIdentify();
  const reset = useReset();

  // Check for existing user session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('journium_react_demo_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // Re-identify user with Journium
        identify(parsedUser.id, {
          name: parsedUser.name,
          email: parsedUser.email,
          company: parsedUser.company,
          login_type: 'existing_session'
        });
      } catch (error) {
        console.error('Failed to restore user session:', error);
        localStorage.removeItem('journium_react_demo_user');
      }
    }
    setIsLoading(false);
  }, [identify]);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate login API call
    const simulatedUser = simulateLogin(email, password);
    
    if (simulatedUser) {
      setUser(simulatedUser);
      localStorage.setItem('journium_react_demo_user', JSON.stringify(simulatedUser));
      
      // Identify user with Journium SDK
      identify(simulatedUser.id, {
        name: simulatedUser.name,
        email: simulatedUser.email,
        company: simulatedUser.company,
        login_method: 'email',
        login_type: 'manual'
      });
      
      return true;
    }
    
    return false;
  };

  const signup = async (name: string, email: string, company?: string, password?: string): Promise<boolean> => {
    // Simulate signup API call
    const simulatedUser = simulateSignup(name, email, company, password);
    
    setUser(simulatedUser);
    localStorage.setItem('journium_react_demo_user', JSON.stringify(simulatedUser));
    
    // Identify user with Journium SDK
    identify(simulatedUser.id, {
      name: simulatedUser.name,
      email: simulatedUser.email,
      company: simulatedUser.company,
      signup_method: 'email',
      signup_date: simulatedUser.signupDate
    });
    
    return true;
  };

  const logout = () => {
    // Reset user identity in Journium SDK
    reset();
    
    setUser(null);
    localStorage.removeItem('journium_react_demo_user');
  };

  // Simulate login (replace with real API call)
  const simulateLogin = (email: string, password: string): User | null => {
    // For demo purposes, accept any email/password
    const userId = `user_${email.split('@')[0]}_${Date.now()}`;
    return {
      id: userId,
      name: email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'Demo User',
      email: email,
      company: 'Demo Company',
      loginDate: new Date().toISOString()
    };
  };

  // Simulate signup (replace with real API call)
  const simulateSignup = (name: string, email: string, company?: string, password?: string): User => {
    const userId = `user_${email.split('@')[0]}_${Date.now()}`;
    return {
      id: userId,
      name: name,
      email: email,
      company: company,
      signupDate: new Date().toISOString()
    };
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}