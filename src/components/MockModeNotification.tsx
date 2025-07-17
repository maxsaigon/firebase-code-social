'use client';

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function MockModeNotification() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    // Check if we're in mock mode by looking at console logs
    const checkMockMode = () => {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl === 'YOUR_SUPABASE_PROJECT_URL') {
        setIsMockMode(true);
        setIsVisible(true);
      }
    };

    checkMockMode();
  }, []);

  if (!isVisible || !isMockMode) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Card className="border-yellow-300 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-yellow-600">⚠️</div>
            <div className="flex-1">
              <h4 className="font-semibold text-yellow-800 mb-1">Mock Mode Active</h4>
              <p className="text-sm text-yellow-700 mb-3">
                Supabase is not configured. Using mock data for testing.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open('/SUPABASE_SETUP.md', '_blank')}
                  className="text-xs"
                >
                  Setup Guide
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsVisible(false)}
                  className="text-xs"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
