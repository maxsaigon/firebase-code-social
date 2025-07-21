import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/users/[id]/transactions - Get user transaction history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== Get User Transactions API Started ===');
  
  try {
    const { id } = await params;
    const client = await pool.connect();

    try {
      // Get user transactions
      const transactionsQuery = `
        SELECT 
          id,
          amount,
          type,
          status,
          description,
          created_at
        FROM transactions
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT 50
      `;

      const result = await client.query(transactionsQuery, [id]);
      
      const transactions = result.rows.map(row => ({
        id: row.id,
        amount: parseFloat(row.amount),
        transaction_type: row.type,
        status: row.status,
        description: row.description,
        created_at: row.created_at
      }));

      console.log(`✅ Retrieved ${transactions.length} transactions for user: ${id}`);
      return NextResponse.json(transactions);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get user transactions error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user transactions' },
      { status: 500 }
    );
  }
}
