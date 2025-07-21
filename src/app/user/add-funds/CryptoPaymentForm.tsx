'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Copy, Clock, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import QRCode from 'qrcode';

interface CryptoCurrency {
  currency: string;
  name: string;
  network: string;
}

interface CryptoPaymentFormProps {
  supportedCurrencies: CryptoCurrency[];
  onSuccess: () => void;
  onError: (error: string) => void;
}

interface PaymentData {
  paymentId: string;
  transactionId: string;
  walletAddress: string;
  amount: number;
  currency: string;
  network: string;
  memo?: string;
  expiresAt: string;
  estimatedUSD: number;
  qrCodeData: string;
}

export default function CryptoPaymentForm({ supportedCurrencies, onSuccess, onError }: CryptoPaymentFormProps) {
  const [amount, setAmount] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>(supportedCurrencies[0]?.currency || '');
  const [loading, setLoading] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [txHash, setTxHash] = useState<string>('');
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'verifying' | 'completed' | 'failed' | 'expired'>('pending');

  // Countdown timer
  useEffect(() => {
    if (!paymentData) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiresAt = new Date(paymentData.expiresAt).getTime();
      const remaining = Math.max(0, expiresAt - now);
      
      setTimeRemaining(remaining);
      
      if (remaining === 0) {
        setPaymentStatus('expired');
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentData]);

  // Poll payment status
  useEffect(() => {
    if (!paymentData || paymentStatus !== 'pending') return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/payments/crypto/status?transactionId=${paymentData.transactionId}`);
        const result = await response.json();

        if (result.success) {
          setPaymentStatus(result.data.status);
          
          if (result.data.status === 'completed') {
            onSuccess();
            clearInterval(pollInterval);
          } else if (['failed', 'expired'].includes(result.data.status)) {
            clearInterval(pollInterval);
          }
        }
      } catch (error) {
        console.error('Failed to check payment status:', error);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(pollInterval);
  }, [paymentData, paymentStatus, onSuccess]);

  // Generate QR code
  useEffect(() => {
    if (paymentData?.qrCodeData) {
      QRCode.toDataURL(paymentData.qrCodeData)
        .then(setQrCodeUrl)
        .catch(console.error);
    }
  }, [paymentData]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const createPayment = async () => {
    const amountNum = parseFloat(amount);
    
    if (!amountNum || amountNum < 1 || amountNum > 10000) {
      onError('Please enter an amount between $1 and $10,000');
      return;
    }

    if (!selectedCurrency) {
      onError('Please select a cryptocurrency');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/payments/crypto/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountNum,
          currency: selectedCurrency
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment');
      }

      if (result.success) {
        setPaymentData(result.data);
        setPaymentStatus('pending');
      } else {
        throw new Error(result.error || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Create payment error:', error);
      onError(error instanceof Error ? error.message : 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const confirmPayment = async () => {
    if (!txHash.trim()) {
      onError('Please enter the transaction hash');
      return;
    }

    try {
      setConfirmingPayment(true);
      
      const response = await fetch('/api/payments/crypto/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: paymentData!.transactionId,
          txHash: txHash.trim()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to confirm payment');
      }

      if (result.success) {
        setPaymentStatus('verifying');
      } else {
        throw new Error(result.error || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error('Confirm payment error:', error);
      onError(error instanceof Error ? error.message : 'Failed to confirm payment');
    } finally {
      setConfirmingPayment(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could show a toast here
    });
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const resetForm = () => {
    setPaymentData(null);
    setQrCodeUrl('');
    setTxHash('');
    setPaymentStatus('pending');
    setTimeRemaining(0);
  };

  if (paymentData) {
    return (
      <div className="space-y-6">
        {/* Payment Status */}
        <div className="text-center">
          {paymentStatus === 'pending' && (
            <div className="flex items-center justify-center gap-2 text-orange-600">
              <Clock className="h-5 w-5" />
              <span>Waiting for payment...</span>
            </div>
          )}
          {paymentStatus === 'verifying' && (
            <div className="flex items-center justify-center gap-2 text-blue-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verifying payment...</span>
            </div>
          )}
          {paymentStatus === 'completed' && (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span>Payment completed!</span>
            </div>
          )}
          {paymentStatus === 'failed' && (
            <div className="flex items-center justify-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>Payment failed</span>
            </div>
          )}
          {paymentStatus === 'expired' && (
            <div className="flex items-center justify-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <span>Payment expired</span>
            </div>
          )}
        </div>

        {/* Timer */}
        {timeRemaining > 0 && paymentStatus === 'pending' && (
          <div className="text-center">
            <p className="text-sm text-gray-600">Time remaining:</p>
            <p className="text-2xl font-bold text-red-600">{formatTime(timeRemaining)}</p>
          </div>
        )}

        {/* Payment Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">Payment Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-semibold">${paymentData.amount} (≈ ${paymentData.estimatedUSD.toFixed(2)})</span>
            </div>
            <div className="flex justify-between">
              <span>Currency:</span>
              <span className="font-semibold">{paymentData.currency}</span>
            </div>
            <div className="flex justify-between">
              <span>Network:</span>
              <span className="font-semibold">{paymentData.network}</span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        {qrCodeUrl && paymentStatus === 'pending' && (
          <div className="text-center">
            <img src={qrCodeUrl} alt="Payment QR Code" className="mx-auto mb-2" />
            <p className="text-sm text-gray-600">Scan QR code with your wallet</p>
          </div>
        )}

        {/* Wallet Address */}
        {paymentStatus === 'pending' && (
          <div>
            <Label>Send {paymentData.currency} to this address:</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                value={paymentData.walletAddress}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(paymentData.walletAddress)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Memo */}
        {paymentData.memo && paymentStatus === 'pending' && (
          <div>
            <Label>Memo/Tag (Required):</Label>
            <div className="flex items-center gap-2 mt-1">
              <Input
                value={paymentData.memo}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(paymentData.memo!)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Alert className="mt-2">
              <AlertDescription>
                ⚠️ Important: Include the memo/tag when sending the transaction, or your payment may be lost.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Transaction Hash Input */}
        {paymentStatus === 'pending' && (
          <div>
            <Label htmlFor="txhash">Transaction Hash (Optional)</Label>
            <p className="text-sm text-gray-600 mb-2">
              If you've sent the payment, enter the transaction hash to speed up verification:
            </p>
            <div className="flex gap-2">
              <Input
                id="txhash"
                placeholder="Enter transaction hash..."
                value={txHash}
                onChange={(e) => setTxHash(e.target.value)}
                disabled={confirmingPayment}
              />
              <Button
                onClick={confirmPayment}
                disabled={!txHash.trim() || confirmingPayment}
              >
                {confirmingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm'}
              </Button>
            </div>
          </div>
        )}

        {/* Instructions */}
        {paymentStatus === 'pending' && (
          <Alert>
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Instructions:</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Send exactly <strong>${paymentData.amount} worth of {paymentData.currency}</strong> to the address above</li>
                  {paymentData.memo && <li>Include the memo/tag when sending</li>}
                  <li>Wait for blockchain confirmation (usually 10-60 minutes)</li>
                  <li>Your account will be credited automatically once confirmed</li>
                </ol>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {(paymentStatus === 'expired' || paymentStatus === 'failed') && (
            <Button onClick={resetForm} className="flex-1">
              Try Again
            </Button>
          )}
          {paymentStatus === 'completed' && (
            <Button onClick={resetForm} className="flex-1">
              Make Another Payment
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="crypto-amount">Amount (USD)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <Input
            id="crypto-amount"
            type="text"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
            className="pl-8"
            disabled={loading}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="currency">Cryptocurrency</Label>
        <select
          id="currency"
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={selectedCurrency}
          onChange={(e) => setSelectedCurrency(e.target.value)}
          disabled={loading}
        >
          {supportedCurrencies.map((currency) => (
            <option key={currency.currency} value={currency.currency}>
              {currency.name} ({currency.currency}) - {currency.network}
            </option>
          ))}
        </select>
      </div>

      <Button
        onClick={createPayment}
        disabled={!amount || !selectedCurrency || loading}
        className="w-full"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Creating Payment...
          </>
        ) : (
          `Continue with ${selectedCurrency}`
        )}
      </Button>

      <Alert>
        <AlertDescription>
          Cryptocurrency payments require blockchain confirmation and may take 10-60 minutes to process.
          Make sure you have sufficient funds in your wallet including transaction fees.
        </AlertDescription>
      </Alert>
    </div>
  );
}
