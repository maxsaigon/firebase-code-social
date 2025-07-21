import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/users/[id]/orders - Get user orders with service details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== Get User Orders API Started ===');
  
  try {
    const { id } = await params;
    const client = await pool.connect();

    try {
      // Get user orders with service information
      const ordersQuery = `
        SELECT 
          o.id,
          o.total_amount,
          o.status,
          o.created_at,
          s.name as service_name,
          s.description as service_description
        FROM orders o
        LEFT JOIN services s ON o.service_id = s.id
        WHERE o.user_id = $1
        ORDER BY o.created_at DESC
        LIMIT 50
      `;

      const result = await client.query(ordersQuery, [id]);
      
      const orders = result.rows.map(row => ({
        id: row.id,
        total_amount: parseFloat(row.total_amount),
        status: row.status,
        created_at: row.created_at,
        service: {
          name: row.service_name || 'Unknown Service',
          description: row.service_description
        }
      }));

      console.log(`✅ Retrieved ${orders.length} orders for user: ${id}`);
      return NextResponse.json(orders);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get user orders error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user orders' },
      { status: 500 }
    );
  }
}
