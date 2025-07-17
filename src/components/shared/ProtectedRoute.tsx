'use client';

import { useAuth } from '@/contexts/AuthProvider';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not logged in, redirect to login page
        router.push('/auth/login');
      } else if (requireAdmin && !user.is_admin) {
        // Logged in but not an admin, redirect to user home page
        router.push('/user');
      }
    }
  }, [user, loading, requireAdmin, router]);

  if (loading || (!user && !loading) || (requireAdmin && user && !user.is_admin)) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
};