import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/users/[id]/stats - Get user statistics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== Get User Stats API Started ===');
  
  try {
    const { id } = await params;
    const client = await pool.connect();

    try {
      // Get user statistics
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM orders WHERE user_id = $1) as total_orders,
          (SELECT COUNT(*) FROM orders WHERE user_id = $1 AND status = 'COMPLETED') as completed_orders,
          (SELECT COUNT(*) FROM orders WHERE user_id = $1 AND status = 'PENDING') as pending_orders,
          (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE user_id = $1 AND status = 'COMPLETED') as total_spent,
          (SELECT COALESCE(balance, 0) FROM wallets WHERE user_id = $1) as wallet_balance
      `;

      const result = await client.query(statsQuery, [id]);
      const stats = result.rows[0];

      // Convert string numbers to actual numbers
      const formattedStats = {
        total_orders: parseInt(stats.total_orders) || 0,
        completed_orders: parseInt(stats.completed_orders) || 0,
        pending_orders: parseInt(stats.pending_orders) || 0,
        total_spent: parseFloat(stats.total_spent) || 0,
        wallet_balance: parseFloat(stats.wallet_balance) || 0,
      };

      console.log(`✅ User stats retrieved for user: ${id}`);
      return NextResponse.json(formattedStats);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get user stats error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user statistics' },
      { status: 500 }
    );
  }
}
