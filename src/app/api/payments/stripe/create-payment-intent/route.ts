import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth-middleware';
import Stripe from 'stripe';
import { z } from 'zod';

const createPaymentIntentSchema = z.object({
  amount: z.number().positive().max(10000, 'Amount exceeds limit'),
  currency: z.string().default('usd')
});

// GET /api/payments/stripe/config - Get Stripe public configuration
export async function GET() {
  try {
    const stripeSettings = await prisma.paymentSetting.findUnique({
      where: { provider: 'stripe' }
    });

    if (!stripeSettings || !stripeSettings.isActive) {
      return NextResponse.json(
        { success: false, error: 'Stripe payment not available' },
        { status: 503 }
      );
    }

    const config = stripeSettings.config as any;
    
    return NextResponse.json({
      success: true,
      publishableKey: config.publishable_key
    });

  } catch (error) {
    console.error('❌ Get Stripe config failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get Stripe configuration' },
      { status: 500 }
    );
  }
}

// POST /api/payments/stripe/create-payment-intent
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    console.log('=== Create Stripe Payment Intent ===');
    
    const body = await request.json();
    const validatedData = createPaymentIntentSchema.parse(body);
    const { amount, currency } = validatedData;

    // Get Stripe settings
    const stripeSettings = await prisma.paymentSetting.findUnique({
      where: { provider: 'stripe' }
    });

    if (!stripeSettings || !stripeSettings.isActive) {
      return NextResponse.json(
        { success: false, error: 'Stripe payment not available' },
        { status: 503 }
      );
    }

    const config = stripeSettings.config as any;
    if (!config.secret_key) {
      return NextResponse.json(
        { success: false, error: 'Stripe not properly configured' },
        { status: 500 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(config.secret_key, {
      apiVersion: '2025-06-30.basil'
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        userId: user.id,
        type: 'wallet_deposit'
      }
    });

    // Create payment transaction record
    const paymentTransaction = await prisma.paymentTransaction.create({
      data: {
        userId: user.id,
        amount,
        currency: currency.toUpperCase(),
        provider: 'stripe',
        providerTransactionId: paymentIntent.id,
        status: 'pending',
        type: 'deposit',
        metadata: {
          clientSecret: paymentIntent.client_secret
        }
      }
    });

    console.log(`✅ Payment intent created for user ${user.email}: $${amount}`);

    return NextResponse.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        transactionId: paymentTransaction.id
      }
    });

  } catch (error) {
    console.error('❌ Create payment intent failed:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
});
