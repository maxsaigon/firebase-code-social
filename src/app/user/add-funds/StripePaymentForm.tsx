'use client';

import { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle } from 'lucide-react';

interface StripePaymentFormProps {
  publishableKey: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  getAuthHeaders: () => Record<string, string>;
}

interface PaymentFormProps {
  onSuccess: () => void;
  onError: (error: string) => void;
  getAuthHeaders: () => Record<string, string>;
}

const stripePromise = (publishableKey: string) => loadStripe(publishableKey);

// Card element options
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false,
};

function PaymentForm({ onSuccess, onError, getAuthHeaders }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [amount, setAmount] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [clientSecret, setClientSecret] = useState('');

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  const createPaymentIntent = async () => {
    const amountNum = parseFloat(amount);
    
    if (!amountNum || amountNum < 1 || amountNum > 10000) {
      onError('Please enter an amount between $1 and $10,000');
      return;
    }

    try {
      const response = await fetch('/api/payments/stripe/create-payment-intent', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          amount: amountNum,
          currency: 'usd'
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create payment intent');
      }

      if (result.success) {
        setClientSecret(result.data.clientSecret);
      } else {
        throw new Error(result.error || 'Failed to create payment intent');
      }
    } catch (error) {
      console.error('Create payment intent error:', error);
      onError(error instanceof Error ? error.message : 'Failed to create payment intent');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      onError('Stripe has not loaded yet');
      return;
    }

    if (!clientSecret) {
      await createPaymentIntent();
      return;
    }

    setProcessing(true);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      onError('Card element not found');
      setProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      });

      if (error) {
        console.error('Payment error:', error);
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setSucceeded(true);
        onSuccess();
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      onError('Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  if (succeeded) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900">Payment Successful!</h3>
        <p className="text-gray-600">Your funds have been added to your account.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="amount">Amount (USD)</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <Input
            id="amount"
            type="text"
            placeholder="0.00"
            value={amount}
            onChange={handleAmountChange}
            className="pl-8"
            disabled={processing || !!clientSecret}
          />
        </div>
        {amount && (
          <p className="text-sm text-gray-500 mt-1">
            You will be charged ${parseFloat(amount || '0').toFixed(2)}
          </p>
        )}
      </div>

      {clientSecret && (
        <div>
          <Label>Card Information</Label>
          <div className="mt-2 p-3 border border-gray-300 rounded-md">
            <CardElement options={cardElementOptions} />
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || processing || (!amount && !clientSecret)}
        className="w-full"
      >
        {processing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing...
          </>
        ) : clientSecret ? (
          `Pay $${parseFloat(amount || '0').toFixed(2)}`
        ) : (
          'Continue to Payment'
        )}
      </Button>

      {!clientSecret && (
        <Alert>
          <AlertDescription>
            Click "Continue to Payment" to proceed with your credit card payment.
            Your card will not be charged until you complete the payment form.
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
}

export default function StripePaymentForm({ publishableKey, onSuccess, onError, getAuthHeaders }: StripePaymentFormProps) {
  const [stripePromiseInstance, setStripePromiseInstance] = useState<Promise<any> | null>(null);

  useEffect(() => {
    setStripePromiseInstance(stripePromise(publishableKey));
  }, [publishableKey]);

  if (!stripePromiseInstance) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const elementsOptions: StripeElementsOptions = {
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#0070f3',
      },
    },
  };

  return (
    <Elements stripe={stripePromiseInstance} options={elementsOptions}>
      <PaymentForm onSuccess={onSuccess} onError={onError} getAuthHeaders={getAuthHeaders} />
    </Elements>
  );
}
