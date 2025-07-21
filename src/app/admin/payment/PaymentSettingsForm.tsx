'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthProvider';

interface PaymentSetting {
  id?: string;
  provider: string;
  isActive: boolean;
  config: Record<string, any>;
}

interface FormData {
  stripe: PaymentSetting;
  btc: PaymentSetting;
  eth: PaymentSetting;
  usdt: PaymentSetting;
}

export default function PaymentSettingsForm() {
  const { toast } = useToast();
  const { getAuthHeaders, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<FormData>({
    stripe: {
      provider: 'stripe',
      isActive: false,
      config: {
        publishable_key: '',
        secret_key: '',
        webhook_secret: ''
      }
    },
    btc: {
      provider: 'btc',
      isActive: false,
      config: {
        wallet_address: '',
        network: 'mainnet'
      }
    },
    eth: {
      provider: 'eth',
      isActive: false,
      config: {
        wallet_address: '',
        network: 'mainnet'
      }
    },
    usdt: {
      provider: 'usdt',
      isActive: false,
      config: {
        wallet_address: '',
        network: 'mainnet',
        memo: ''
      }
    }
  });

  useEffect(() => {
    if (!authLoading && getAuthHeaders) {
      loadPaymentSettings();
    }
  }, [authLoading, getAuthHeaders]);

  const loadPaymentSettings = async () => {
    if (!getAuthHeaders || typeof getAuthHeaders !== 'function') {
      console.error('Auth headers function not available');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payment-settings', {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to load payment settings');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const newFormData = { ...formData };
        
        result.data.forEach((setting: PaymentSetting) => {
          if (setting.provider in newFormData) {
            newFormData[setting.provider as keyof FormData] = setting;
          }
        });
        
        setFormData(newFormData);
      }
    } catch (error) {
      console.error('Failed to load payment settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load payment settings',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (provider: keyof FormData) => {
    if (!getAuthHeaders || typeof getAuthHeaders !== 'function') {
      console.error('Auth headers function not available');
      toast({
        title: 'Error',
        description: 'Authentication not available. Please refresh the page.',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await fetch('/api/admin/payment-settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData[provider])
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save settings');
      }

      if (result.success) {
        toast({
          title: 'Success',
          description: `${provider.toUpperCase()} settings saved successfully`
        });
        
        // Update form data with response
        if (result.data) {
          setFormData(prev => ({
            ...prev,
            [provider]: result.data
          }));
        }
      }
    } catch (error) {
      console.error('Failed to save payment settings:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (provider: keyof FormData, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        ...(field === 'isActive' ? { isActive: value } : {
          config: {
            ...prev[provider].config,
            [field]: value
          }
        })
      }
    }));
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const maskSecret = (value: string, show: boolean) => {
    if (!value) return '';
    if (show) return value;
    return '•'.repeat(Math.min(value.length, 32));
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="stripe" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stripe" className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${formData.stripe.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
            Stripe
          </TabsTrigger>
          <TabsTrigger value="btc" className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${formData.btc.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
            Bitcoin
          </TabsTrigger>
          <TabsTrigger value="eth" className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${formData.eth.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
            Ethereum
          </TabsTrigger>
          <TabsTrigger value="usdt" className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${formData.usdt.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
            USDT
          </TabsTrigger>
        </TabsList>

        {/* Stripe Settings */}
        <TabsContent value="stripe">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Stripe Configuration</span>
                {formData.stripe.isActive && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="stripe-active"
                  checked={formData.stripe.isActive}
                  onCheckedChange={(checked) => updateFormData('stripe', 'isActive', checked)}
                />
                <Label htmlFor="stripe-active">Enable Stripe Payments</Label>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="stripe-publishable">Publishable Key</Label>
                  <Input
                    id="stripe-publishable"
                    placeholder="pk_test_..."
                    value={formData.stripe.config.publishable_key || ''}
                    onChange={(e) => updateFormData('stripe', 'publishable_key', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="stripe-secret">Secret Key</Label>
                  <div className="relative">
                    <Input
                      id="stripe-secret"
                      type={showSecrets['stripe-secret'] ? 'text' : 'password'}
                      placeholder="sk_test_..."
                      value={showSecrets['stripe-secret'] 
                        ? formData.stripe.config.secret_key || ''
                        : maskSecret(formData.stripe.config.secret_key || '', false)
                      }
                      onChange={(e) => updateFormData('stripe', 'secret_key', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility('stripe-secret')}
                    >
                      {showSecrets['stripe-secret'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="stripe-webhook">Webhook Secret</Label>
                  <div className="relative">
                    <Input
                      id="stripe-webhook"
                      type={showSecrets['stripe-webhook'] ? 'text' : 'password'}
                      placeholder="whsec_..."
                      value={showSecrets['stripe-webhook'] 
                        ? formData.stripe.config.webhook_secret || ''
                        : maskSecret(formData.stripe.config.webhook_secret || '', false)
                      }
                      onChange={(e) => updateFormData('stripe', 'webhook_secret', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => toggleSecretVisibility('stripe-webhook')}
                    >
                      {showSecrets['stripe-webhook'] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You need to configure webhooks in your Stripe dashboard with the endpoint: 
                  <code className="bg-gray-100 px-1 rounded">/api/payments/stripe/webhook</code>
                </AlertDescription>
              </Alert>

              <Button 
                onClick={() => handleSubmit('stripe')}
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Stripe Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bitcoin Settings */}
        <TabsContent value="btc">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Bitcoin Configuration</span>
                {formData.btc.isActive && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="btc-active"
                  checked={formData.btc.isActive}
                  onCheckedChange={(checked) => updateFormData('btc', 'isActive', checked)}
                />
                <Label htmlFor="btc-active">Enable Bitcoin Payments</Label>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="btc-address">Bitcoin Wallet Address</Label>
                  <Input
                    id="btc-address"
                    placeholder="bc1q..."
                    value={formData.btc.config.wallet_address || ''}
                    onChange={(e) => updateFormData('btc', 'wallet_address', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="btc-network">Network</Label>
                  <select
                    id="btc-network"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.btc.config.network || 'mainnet'}
                    onChange={(e) => updateFormData('btc', 'network', e.target.value)}
                  >
                    <option value="mainnet">Mainnet</option>
                    <option value="testnet">Testnet</option>
                  </select>
                </div>
              </div>

              <Button 
                onClick={() => handleSubmit('btc')}
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Bitcoin Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ethereum Settings */}
        <TabsContent value="eth">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Ethereum Configuration</span>
                {formData.eth.isActive && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="eth-active"
                  checked={formData.eth.isActive}
                  onCheckedChange={(checked) => updateFormData('eth', 'isActive', checked)}
                />
                <Label htmlFor="eth-active">Enable Ethereum Payments</Label>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="eth-address">Ethereum Wallet Address</Label>
                  <Input
                    id="eth-address"
                    placeholder="0x..."
                    value={formData.eth.config.wallet_address || ''}
                    onChange={(e) => updateFormData('eth', 'wallet_address', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="eth-network">Network</Label>
                  <select
                    id="eth-network"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.eth.config.network || 'mainnet'}
                    onChange={(e) => updateFormData('eth', 'network', e.target.value)}
                  >
                    <option value="mainnet">Mainnet</option>
                    <option value="goerli">Goerli Testnet</option>
                    <option value="sepolia">Sepolia Testnet</option>
                  </select>
                </div>
              </div>

              <Button 
                onClick={() => handleSubmit('eth')}
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Ethereum Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* USDT Settings */}
        <TabsContent value="usdt">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>USDT Configuration</span>
                {formData.usdt.isActive && <CheckCircle className="h-5 w-5 text-green-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="usdt-active"
                  checked={formData.usdt.isActive}
                  onCheckedChange={(checked) => updateFormData('usdt', 'isActive', checked)}
                />
                <Label htmlFor="usdt-active">Enable USDT Payments</Label>
              </div>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="usdt-address">USDT Wallet Address</Label>
                  <Input
                    id="usdt-address"
                    placeholder="0x... or TRC20 address"
                    value={formData.usdt.config.wallet_address || ''}
                    onChange={(e) => updateFormData('usdt', 'wallet_address', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="usdt-network">Network</Label>
                  <select
                    id="usdt-network"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.usdt.config.network || 'mainnet'}
                    onChange={(e) => updateFormData('usdt', 'network', e.target.value)}
                  >
                    <option value="mainnet">Ethereum Mainnet (ERC-20)</option>
                    <option value="tron">Tron Network (TRC-20)</option>
                    <option value="bsc">Binance Smart Chain (BEP-20)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="usdt-memo">Memo (Optional)</Label>
                  <Input
                    id="usdt-memo"
                    placeholder="Optional memo for payments"
                    value={formData.usdt.config.memo || ''}
                    onChange={(e) => updateFormData('usdt', 'memo', e.target.value)}
                  />
                </div>
              </div>

              <Button 
                onClick={() => handleSubmit('usdt')}
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save USDT Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
