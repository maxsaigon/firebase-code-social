'use client';

import { useAuth } from '@/contexts/AuthProvider';
import { useEffect, useState } from 'react';

export default function AuthTestPage() {
  const auth = useAuth();
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    console.log('Auth context:', auth);
    console.log('getAuthHeaders type:', typeof auth.getAuthHeaders);
    console.log('getAuthHeaders function:', auth.getAuthHeaders);
    
    if (auth.getAuthHeaders) {
      try {
        const headers = auth.getAuthHeaders();
        setTestResult(`Headers: ${JSON.stringify(headers)}`);
      } catch (error) {
        setTestResult(`Error: ${error}`);
      }
    } else {
      setTestResult('getAuthHeaders is not available');
    }
  }, [auth]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      <div className="space-y-2">
        <p>Auth Loading: {auth.loading ? 'true' : 'false'}</p>
        <p>User: {auth.user ? auth.user.email : 'null'}</p>
        <p>Token: {auth.token ? 'exists' : 'null'}</p>
        <p>getAuthHeaders: {typeof auth.getAuthHeaders}</p>
        <p>Test Result: {testResult}</p>
      </div>
    </div>
  );
}
