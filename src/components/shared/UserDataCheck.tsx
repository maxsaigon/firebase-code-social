'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthProvider';
import { userUtils } from '@/lib/userUtils';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface UserDataCheckProps {
  children: React.ReactNode;
}

export const UserDataCheck = ({ children }: UserDataCheckProps) => {
  const { user, session, loading } = useAuth();
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsRepair, setNeedsRepair] = useState(false);

  const checkUserData = async () => {
    if (!session?.user || !user) return;

    setIsChecking(true);
    setError(null);

    try {
      const validation = await userUtils.validateUserData(session.user.id);
      
      if (!validation.isComplete) {
        setNeedsRepair(true);
        console.log('User data incomplete:', validation);
      }
    } catch (error) {
      console.error('Error checking user data:', error);
      setError('Failed to validate user data');
    } finally {
      setIsChecking(false);
    }
  };

  const repairUserData = async () => {
    if (!session?.user) return;

    setIsChecking(true);
    setError(null);

    try {
      const result = await userUtils.repairUserData(
        session.user.id,
        session.user.email!,
        session.user.user_metadata?.full_name
      );

      if (result.success) {
        setNeedsRepair(false);
        // Refresh the page to reload user data
        window.location.reload();
      } else {
        setError(result.error || 'Failed to repair user data');
      }
    } catch (error) {
      console.error('Error repairing user data:', error);
      setError('Failed to repair user data');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (session?.user && user) {
      checkUserData();
    }
  }, [session?.user, user, checkUserData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-2 text-sm text-gray-600">Checking user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertDescription className="text-center">
            <p className="mb-4">{error}</p>
            <Button onClick={repairUserData} variant="outline" size="sm">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (needsRepair) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert className="max-w-md">
          <AlertDescription className="text-center">
            <p className="mb-4">Your account setup is incomplete. Would you like to fix it now?</p>
            <div className="flex gap-2 justify-center">
              <Button onClick={repairUserData} size="sm">
                Fix Now
              </Button>
              <Button onClick={() => setNeedsRepair(false)} variant="outline" size="sm">
                Continue Anyway
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};
