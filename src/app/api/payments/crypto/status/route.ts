import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth } from '@/lib/auth-middleware';
import { z } from 'zod';

const checkPaymentSchema = z.object({
  transactionId: z.string().uuid('Invalid transaction ID')
});

// GET /api/payments/crypto/status?transactionId=xxx
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    console.log('=== Check Crypto Payment Status ===');
    
    const { searchParams } = new URL(request.url);
    const transactionId = searchParams.get('transactionId');
    
    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      );
    }

    const validatedData = checkPaymentSchema.parse({ transactionId });

    // Get payment transaction
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { 
        id: validatedData.transactionId,
        userId: user.id // Ensure user can only check their own transactions
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check if transaction has expired
    const now = new Date();
    const isExpired = transaction.expiresAt && transaction.expiresAt < now;

    if (isExpired && transaction.status === 'pending') {
      // Update expired transaction
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { 
          status: 'expired',
          processedAt: now
        }
      });
      
      transaction.status = 'expired';
    }

    // Calculate time remaining
    const timeRemaining = transaction.expiresAt ? 
      Math.max(0, transaction.expiresAt.getTime() - now.getTime()) : null;

    return NextResponse.json({
      success: true,
      data: {
        transactionId: transaction.id,
        status: transaction.status,
        amount: transaction.amount,
        currency: transaction.currency,
        createdAt: transaction.createdAt,
        expiresAt: transaction.expiresAt,
        timeRemainingMs: timeRemaining,
        metadata: transaction.metadata
      }
    });

  } catch (error) {
    console.error('❌ Check crypto payment status failed:', error);
    
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to check payment status' },
      { status: 500 }
    );
  }
});

// POST /api/payments/crypto/confirm-payment
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    console.log('=== Confirm Crypto Payment ===');
    
    const body = await request.json();
    const { transactionId, txHash } = body;

    if (!transactionId || !txHash) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID and transaction hash are required' },
        { status: 400 }
      );
    }

    // Get payment transaction
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { 
        id: transactionId,
        userId: user.id
      }
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    if (transaction.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: 'Transaction is not pending' },
        { status: 400 }
      );
    }

    // Check if transaction has expired
    const now = new Date();
    const isExpired = transaction.expiresAt && transaction.expiresAt < now;

    if (isExpired) {
      return NextResponse.json(
        { success: false, error: 'Transaction has expired' },
        { status: 400 }
      );
    }

    // Update transaction with provided tx hash (pending verification)
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: 'verifying',
        metadata: {
          ...transaction.metadata as object,
          txHash,
          submittedAt: now.toISOString()
        }
      }
    });

    console.log(`🔍 Crypto payment submitted for verification: ${txHash}`);

    // In a real implementation, you would:
    // 1. Verify the transaction on the blockchain
    // 2. Check if the amount matches
    // 3. Update the user's balance if verified
    // For now, we'll simulate verification (replace with real blockchain API)

    // Simulate verification delay
    setTimeout(async () => {
      try {
        await simulateBlockchainVerification(transaction.id, txHash);
      } catch (error) {
        console.error('❌ Blockchain verification failed:', error);
      }
    }, 5000); // 5 second delay for simulation

    return NextResponse.json({
      success: true,
      message: 'Transaction submitted for verification',
      data: {
        transactionId: transaction.id,
        status: 'verifying',
        txHash
      }
    });

  } catch (error) {
    console.error('❌ Confirm crypto payment failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
});

// Simulate blockchain verification (replace with real implementation)
async function simulateBlockchainVerification(transactionId: string, txHash: string) {
  try {
    console.log(`🔍 Simulating blockchain verification for tx: ${txHash}`);
    
    // Simulate 80% success rate
    const isValid = Math.random() > 0.2;
    
    if (isValid) {
      // Simulate successful verification
      await prisma.$transaction(async (tx) => {
        const transaction = await tx.paymentTransaction.findUnique({
          where: { id: transactionId },
          include: { user: true }
        });

        if (!transaction) return;

        // Update transaction status
        await tx.paymentTransaction.update({
          where: { id: transactionId },
          data: {
            status: 'completed',
            processedAt: new Date(),
            metadata: {
              ...transaction.metadata as object,
              verified: true,
              verifiedAt: new Date().toISOString()
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

        console.log(`✅ Crypto payment verified: $${transaction.amount} added to ${transaction.user.email}`);
      });
    } else {
      // Simulate failed verification
      await prisma.paymentTransaction.update({
        where: { id: transactionId },
        data: {
          status: 'failed',
          processedAt: new Date(),
          metadata: {
            verified: false,
            verificationError: 'Transaction not found on blockchain',
            verifiedAt: new Date().toISOString()
          }
        }
      });

      console.log(`❌ Crypto payment verification failed for tx: ${txHash}`);
    }
  } catch (error) {
    console.error('❌ Blockchain verification simulation failed:', error);
  }
}
