import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    console.log('=== Get Wallet API Started ===');

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      // Get wallet data
      const walletResult = await client.query(
        'SELECT * FROM wallets WHERE user_id = $1',
        [userId]
      );

      if (walletResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Wallet not found' },
          { status: 404 }
        );
      }

      // Get recent transactions (10 most recent)
      const transactionsResult = await client.query(
        'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10',
        [userId]
      );

      // Calculate total deposited and spent
      const statsResult = await client.query(
        `SELECT 
          COALESCE(SUM(CASE WHEN type = 'DEPOSIT' THEN amount ELSE 0 END), 0) as total_deposited,
          COALESCE(SUM(CASE WHEN type = 'PAYMENT' THEN ABS(amount) ELSE 0 END), 0) as total_spent
        FROM transactions WHERE user_id = $1`,
        [userId]
      );

      console.log('✅ Wallet retrieved for user:', userId);

      // Convert amounts from string to number and prepare response
      const wallet = {
        ...walletResult.rows[0],
        balance: parseFloat(walletResult.rows[0].balance),
        total_deposited: parseFloat(statsResult.rows[0].total_deposited),
        total_spent: parseFloat(statsResult.rows[0].total_spent),
        transactions: transactionsResult.rows.map(t => ({
          ...t,
          amount: parseFloat(t.amount)
        }))
      };

      return NextResponse.json({
        success: true,
        data: wallet
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Get wallet failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch wallet' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Add Funds API Started ===');

    const body = await request.json();
    const { user_id, amount, description = 'Wallet top-up' } = body;

    if (!user_id || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, amount' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Update wallet balance
      const walletResult = await client.query(
        'UPDATE wallets SET balance = balance + $1, updated_at = NOW() WHERE user_id = $2 RETURNING *',
        [amount, user_id]
      );

      if (walletResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Wallet not found' },
          { status: 404 }
        );
      }

      // Create transaction record
      await client.query(
        `INSERT INTO transactions (id, user_id, amount, type, status, description, created_at) 
         VALUES (gen_random_uuid(), $1, $2, 'DEPOSIT', 'COMPLETED', $3, NOW())`,
        [user_id, amount, description]
      );

      await client.query('COMMIT');

      console.log('✅ Funds added successfully:', amount);

      // Convert balance from string to number
      const wallet = {
        ...walletResult.rows[0],
        balance: parseFloat(walletResult.rows[0].balance)
      };

      return NextResponse.json({
        success: true,
        data: wallet
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Add funds failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to add funds' 
      },
      { status: 500 }
    );
  }
}
