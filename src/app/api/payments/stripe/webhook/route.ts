import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Stripe Webhook Received ===');
    
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('❌ No Stripe signature found');
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    // Get Stripe settings
    const stripeSettings = await prisma.paymentSetting.findUnique({
      where: { provider: 'stripe' }
    });

    if (!stripeSettings || !stripeSettings.isActive) {
      console.error('❌ Stripe not configured');
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 500 }
      );
    }

    const config = stripeSettings.config as any;
    if (!config.secret_key || !config.webhook_secret) {
      console.error('❌ Stripe keys missing');
      return NextResponse.json(
        { error: 'Stripe keys missing' },
        { status: 500 }
      );
    }

    // Initialize Stripe
    const stripe = new Stripe(config.secret_key, {
      apiVersion: '2025-06-30.basil'
    });

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        config.webhook_secret
      );
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`📨 Webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;
      
      default:
        console.log(`🔄 Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('❌ Webhook processing failed:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`✅ Processing successful payment: ${paymentIntent.id}`);

    // Find the payment transaction
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { providerTransactionId: paymentIntent.id },
      include: { user: true }
    });

    if (!transaction) {
      console.error('❌ Transaction not found for payment intent:', paymentIntent.id);
      return;
    }

    if (transaction.status === 'completed') {
      console.log('⚠️ Transaction already processed');
      return;
    }

    // Start transaction to update payment and user balance
    await prisma.$transaction(async (tx) => {
      // Update payment transaction
      await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: 'completed',
          processedAt: new Date(),
          metadata: {
            ...transaction.metadata as object,
            stripePaymentIntent: paymentIntent
          }
        }
      });

      // Update user balance
      await tx.user.update({
        where: { id: transaction.userId },
        data: {
          balance: {
            increment: transaction.amount
          }
        }
      });

      console.log(`💰 Added $${transaction.amount} to user ${transaction.user?.email || transaction.userId} balance`);
    });

  } catch (error) {
    console.error('❌ Failed to process successful payment:', error);
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    console.log(`❌ Processing failed payment: ${paymentIntent.id}`);

    // Update payment transaction status
    await prisma.paymentTransaction.updateMany({
      where: { 
        providerTransactionId: paymentIntent.id,
        status: 'pending'
      },
      data: {
        status: 'failed',
        processedAt: new Date(),
        metadata: {
          stripePaymentIntent: paymentIntent
        }
      }
    });

    console.log(`🔄 Payment ${paymentIntent.id} marked as failed`);

  } catch (error) {
    console.error('❌ Failed to process failed payment:', error);
    throw error;
  }
}
