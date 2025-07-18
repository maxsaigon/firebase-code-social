'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: object | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session, status } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }

    if (session?.user) {
      setUser({
        id: session.user.id,
        email: session.user.email!,
        full_name: session.user.name || '',
        avatar_url: session.user.image || '',
        is_admin: session.user.isAdmin || false,
        status: (session.user.status || 'active') as 'active' | 'inactive' | 'suspended',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } else {
      setUser(null);
    }
    
    setLoading(false);
  }, [session, status]);

  const signIn = async (_email: string, _password: string) => {
    // NextAuth signIn is handled by the login page
    // This is just for compatibility
    throw new Error('Use NextAuth signIn');
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signOut: handleSignOut, 
      session 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};