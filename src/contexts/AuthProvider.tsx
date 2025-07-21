'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session on mount
    const checkSession = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: result.error || 'Login failed' };
      }

      const userData: User = {
        id: result.user.id,
        email: result.user.email,
        full_name: result.user.name || result.user.full_name,
        avatar_url: '',
        is_admin: result.user.isAdmin || result.user.is_admin,
        status: result.user.status,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setUser(userData);
      setToken(result.token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('token', result.token);

      return { success: true, redirectTo: result.redirectTo };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error: 'Network error occurred' };
    }
  };

  const signOut = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
    
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/auth/login';
  };

  const getAuthHeaders = (): Record<string, string> => {
    console.log('getAuthHeaders called, token:', token);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token,
      loading, 
      signIn, 
      signOut,
      getAuthHeaders
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  console.log('useAuth called, context:', context ? 'available' : 'not available');
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};