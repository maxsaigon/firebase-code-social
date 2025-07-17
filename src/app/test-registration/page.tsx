'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authApi } from '@/api/authApi';
import { userUtils } from '@/lib/userUtils';
import { userMigration } from '@/lib/userMigration';
import { useAuth } from '@/contexts/AuthProvider';

export default function TestRegistrationPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Check if we're in mock mode (client-side check)
  const [isMockMode, setIsMockMode] = useState(false);
  
  useEffect(() => {
    // Check if we're in mock mode
    setIsMockMode(!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL');
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const testRegistration = async () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const result = await authApi.register(formData);
      setMessage(`Registration successful! User created: ${result.user?.email}`);
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        full_name: ''
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const validateCurrentUser = async () => {
    if (!user) {
      setError('No user logged in');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const validation = await userUtils.validateUserData(user.id);
      setMessage(`Validation result: Profile: ${validation.hasProfile}, Wallet: ${validation.hasWallet}, Complete: ${validation.isComplete}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Validation failed');
    } finally {
      setLoading(false);
    }
  };

  const repairCurrentUser = async () => {
    if (!user) {
      setError('No user logged in');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const result = await userUtils.repairUserData(user.id, user.email, user.full_name);
      setMessage(result.success ? 'User data repaired successfully' : `Repair failed: ${result.error}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Repair failed');
    } finally {
      setLoading(false);
    }
  };

  const generateMigrationReport = async () => {
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const report = await userMigration.generateReport();
      setMessage(`Migration Report:
Total Auth Users: ${report.totalAuthUsers}
Users without Profile: ${report.usersWithoutProfile}
Users without Wallet: ${report.usersWithoutWallet}
Complete Users: ${report.completeUsers}
Incomplete Users: ${report.incompleteUsers.length}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Report generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Registration Testing Page</h1>
        {isMockMode && (
          <Alert className="mb-4 border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <strong>Mock Mode:</strong> Testing with simulated data. 
              <a href="/SUPABASE_SETUP.md" target="_blank" className="underline ml-2">
                Setup Supabase →
              </a>
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        {/* Test Registration */}
        <Card>
          <CardHeader>
            <CardTitle>Test Registration</CardTitle>
            <CardDescription>
              Test the new frontend-handled registration system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="test@example.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
              />
            </div>
            <div>
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </div>
            <Button onClick={testRegistration} disabled={loading} className="w-full">
              {loading ? 'Testing...' : 'Test Registration'}
            </Button>
          </CardContent>
        </Card>

        {/* User Validation */}
        <Card>
          <CardHeader>
            <CardTitle>User Validation</CardTitle>
            <CardDescription>
              Check and repair current user data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-gray-600">
              Current User: {user ? user.email : 'Not logged in'}
            </div>
            <div className="space-y-2">
              <Button onClick={validateCurrentUser} disabled={loading || !user} className="w-full">
                {loading ? 'Validating...' : 'Validate Current User'}
              </Button>
              <Button onClick={repairCurrentUser} disabled={loading || !user} className="w-full" variant="outline">
                {loading ? 'Repairing...' : 'Repair Current User'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Migration Tools */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Migration Tools</CardTitle>
            <CardDescription>
              Tools for fixing existing users with incomplete data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={generateMigrationReport} disabled={loading} className="w-full">
              {loading ? 'Generating...' : 'Generate Migration Report'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Messages */}
      {message && (
        <Alert className="mt-6">
          <AlertDescription>
            <pre className="whitespace-pre-wrap text-sm">{message}</pre>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="mt-6" variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
