import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    console.log('=== Get Transactions API Started ===');

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const limit = searchParams.get('limit') || '50';

    const client = await pool.connect();

    try {
      let query = `
        SELECT t.*, 
               u.full_name as user_name,
               u.email as user_email
        FROM transactions t
        JOIN users u ON t.user_id = u.id
      `;
      
      const conditions = [];
      const values = [];
      let paramIndex = 1;
      
      if (userId) {
        conditions.push(`t.user_id = $${paramIndex}`);
        values.push(userId);
        paramIndex++;
      }
      
      if (type) {
        conditions.push(`t.type = $${paramIndex}`);
        values.push(type);
        paramIndex++;
      }
      
      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }
      
      query += ` ORDER BY t.created_at DESC LIMIT $${paramIndex}`;
      values.push(parseInt(limit));

      const result = await client.query(query, values);

      console.log(`✅ Retrieved ${result.rows.length} transactions`);

      // Convert amount from string to number
      const transactions = result.rows.map(transaction => ({
        ...transaction,
        amount: parseFloat(transaction.amount)
      }));

      return NextResponse.json({
        success: true,
        data: transactions
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Get transactions failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch transactions' 
      },
      { status: 500 }
    );
  }
}
