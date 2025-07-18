import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const client = await pool.connect();

    try {
      // Get counts from different tables
      const [usersResult, servicesResult, ordersResult, transactionsResult] = await Promise.all([
        client.query('SELECT COUNT(*) as total_users FROM users'),
        client.query('SELECT COUNT(*) as total_services FROM services'),
        client.query('SELECT COUNT(*) as total_orders FROM orders'),
        client.query('SELECT SUM(amount) as total_revenue FROM transactions WHERE type = \'payment\' AND status = \'completed\''),
      ]);

      // Get pending orders count
      const pendingOrdersResult = await client.query(
        'SELECT COUNT(*) as pending_orders FROM orders WHERE status = \'pending\''
      );

      const stats = {
        total_users: parseInt(usersResult.rows[0].total_users) || 0,
        total_services: parseInt(servicesResult.rows[0].total_services) || 0,
        total_orders: parseInt(ordersResult.rows[0].total_orders) || 0,
        pending_orders: parseInt(pendingOrdersResult.rows[0].pending_orders) || 0,
        total_revenue: parseFloat(transactionsResult.rows[0].total_revenue) || 0,
      };

      return NextResponse.json(stats);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
