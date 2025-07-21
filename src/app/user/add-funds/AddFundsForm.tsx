'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CreditCard, Bitcoin, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthProvider';
import StripePaymentForm from './StripePaymentForm';
import CryptoPaymentForm from './CryptoPaymentForm';

interface PaymentConfig {
  stripe?: {
    publishableKey: string;
  };
  crypto?: {
    supportedCurrencies: Array<{
      currency: string;
      name: string;
      network: string;
    }>;
  };
}

export default function AddFundsForm() {
  const { toast } = useToast();
  const { getAuthHeaders } = useAuth();
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<PaymentConfig>({});
  const [activeTab, setActiveTab] = useState('stripe');

  useEffect(() => {
    loadPaymentConfig();
  }, []);

  const loadPaymentConfig = async () => {
    try {
      setLoading(true);
      
      // Load Stripe config
      const stripeResponse = await fetch('/api/payments/stripe/config', {
        headers: getAuthHeaders()
      });
      const stripeResult = await stripeResponse.json();
      
      // Load crypto config
      const cryptoResponse = await fetch('/api/payments/crypto/config', {
        headers: getAuthHeaders()
      });
      const cryptoResult = await cryptoResponse.json();

      const newConfig: PaymentConfig = {};

      if (stripeResult.success) {
        newConfig.stripe = {
          publishableKey: stripeResult.publishableKey
        };
      }

      if (cryptoResult.success) {
        newConfig.crypto = {
          supportedCurrencies: cryptoResult.supportedCurrencies
        };
      }

      setConfig(newConfig);

      // Set default tab based on available payment methods
      if (newConfig.stripe) {
        setActiveTab('stripe');
      } else if (newConfig.crypto?.supportedCurrencies.length) {
        setActiveTab('crypto');
      }

    } catch (error) {
      console.error('Failed to load payment config:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment configuration',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const hasStripe = !!config.stripe;
  const hasCrypto = !!(config.crypto?.supportedCurrencies?.length);

  if (!hasStripe && !hasCrypto) {
    return (
      <Alert>
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          No payment methods are currently available. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          {hasStripe && (
            <TabsTrigger value="stripe" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Credit Card
            </TabsTrigger>
          )}
          {hasCrypto && (
            <TabsTrigger value="crypto" className="flex items-center gap-2">
              <Bitcoin className="h-4 w-4" />
              Cryptocurrency
            </TabsTrigger>
          )}
        </TabsList>

        {hasStripe && (
          <TabsContent value="stripe">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Pay with Credit Card
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StripePaymentForm 
                  publishableKey={config.stripe!.publishableKey}
                  getAuthHeaders={getAuthHeaders}
                  onSuccess={() => {
                    toast({
                      title: 'Payment Successful',
                      description: 'Funds have been added to your account'
                    });
                  }}
                  onError={(error: string) => {
                    toast({
                      title: 'Payment Failed',
                      description: error,
                      variant: 'destructive'
                    });
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {hasCrypto && (
          <TabsContent value="crypto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bitcoin className="h-5 w-5" />
                  Pay with Cryptocurrency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CryptoPaymentForm 
                  supportedCurrencies={config.crypto!.supportedCurrencies}
                  onSuccess={() => {
                    toast({
                      title: 'Payment Submitted',
                      description: 'Your payment is being verified on the blockchain'
                    });
                  }}
                  onError={(error: string) => {
                    toast({
                      title: 'Payment Failed',
                      description: error,
                      variant: 'destructive'
                    });
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Payment Information</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Minimum deposit: $1.00</li>
          <li>• Maximum deposit: $10,000.00</li>
          <li>• Credit card payments are processed instantly</li>
          <li>• Cryptocurrency payments require blockchain confirmation</li>
          <li>• All transactions are secure and encrypted</li>
        </ul>
      </div>
    </div>
  );
}
