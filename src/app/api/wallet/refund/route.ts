import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, requireOwnership } from '@/lib/auth-middleware';
import { refundOrderSchema } from '@/lib/validation';

export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = refundOrderSchema.parse(body);
    const { order_id, reason } = validatedData;

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // First, get the order and verify ownership
      const order = await tx.order.findUnique({
        where: { id: order_id },
        include: { user: true }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      // Check ownership or admin privileges
      requireOwnership(user, order.userId);

      // Verify order can be refunded
      if (order.status === 'REFUNDED') {
        throw new Error('Order already refunded');
      }

      if (order.status === 'CANCELLED') {
        throw new Error('Order already cancelled');
      }

      if (order.totalAmount.toNumber() <= 0) {
        throw new Error('Invalid refund amount');
      }

      // Find or create user wallet
      let wallet = await tx.wallet.findUnique({
        where: { userId: order.userId }
      });

      if (!wallet) {
        // Create wallet if doesn't exist
        wallet = await tx.wallet.create({
          data: {
            userId: order.userId,
            balance: 0,
          }
        });
      }

      // Add refund amount to wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { userId: order.userId },
        data: {
          balance: wallet.balance.toNumber() + order.totalAmount.toNumber(),
        }
      });

      // Update order status
      const updatedOrder = await tx.order.update({
        where: { id: order_id },
        data: {
          status: 'REFUNDED',
          notes: reason ? `Refunded: ${reason}` : 'Refunded'
        }
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId: order.userId,
          orderId: order_id,
          amount: order.totalAmount.toNumber(),
          type: 'REFUND',
          status: 'COMPLETED',
          description: reason || `Refund for order #${order_id}`,
        }
      });

      return { wallet: updatedWallet, transaction, order: updatedOrder };
    });

    console.log(`✅ Refund processed successfully for order ${order_id} by user ${user.email}`);

    return NextResponse.json({
      success: true,
      data: {
        refundAmount: result.transaction.amount,
        newWalletBalance: result.wallet.balance,
        transactionId: result.transaction.id
      },
      message: 'Refund processed successfully'
    });

  } catch (error) {
    console.error('❌ Error processing refund:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    // Handle business logic errors
    if (error instanceof Error) {
      const statusCode = error.message.includes('not found') ? 404 :
                        error.message.includes('already') ? 409 :
                        error.message.includes('Access denied') ? 403 : 400;
      
      return NextResponse.json(
        { success: false, error: error.message },
        { status: statusCode }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to process refund' },
      { status: 500 }
    );
  }
});
