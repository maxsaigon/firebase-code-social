import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    console.log('=== Get Orders API Started ===');

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const client = await pool.connect();

    try {
      let query = `
        SELECT o.*, 
               s.name as service_name, 
               s.description as service_description,
               u.full_name as user_name,
               u.email as user_email
        FROM orders o
        JOIN services s ON o.service_id = s.id
        JOIN users u ON o.user_id = u.id
      `;
      
      const values = [];
      
      if (userId) {
        query += ' WHERE o.user_id = $1';
        values.push(userId);
      }
      
      query += ' ORDER BY o.created_at DESC';

      const result = await client.query(query, values);

      console.log(`✅ Retrieved ${result.rows.length} orders`);

      // Convert price fields from string to number
      const orders = result.rows.map(order => ({
        ...order,
        unit_price: parseFloat(order.unit_price),
        total_amount: parseFloat(order.total_amount)
      }));

      return NextResponse.json({
        success: true,
        data: orders
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Get orders failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch orders' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Create Order API Started ===');

    const body = await request.json();
    const { user_id, service_id, quantity = 1 } = body;

    if (!user_id || !service_id) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, service_id' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get service details and price
      const serviceResult = await client.query(
        'SELECT * FROM services WHERE id = $1 AND status = $2',
        [service_id, 'ACTIVE']
      );

      if (serviceResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Service not found or inactive' },
          { status: 404 }
        );
      }

      const service = serviceResult.rows[0];
      const unit_price = service.price;
      const total_amount = unit_price * quantity;

      // Check user's wallet balance
      const walletResult = await client.query(
        'SELECT balance FROM wallets WHERE user_id = $1',
        [user_id]
      );

      if (walletResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'User wallet not found' },
          { status: 404 }
        );
      }

      const wallet = walletResult.rows[0];
      if (wallet.balance < total_amount) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Insufficient balance' },
          { status: 400 }
        );
      }

      // Create the order
      const orderResult = await client.query(
        `INSERT INTO orders (id, user_id, service_id, quantity, unit_price, total_amount, status, created_at, updated_at) 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, 'PENDING', NOW(), NOW()) 
         RETURNING *`,
        [user_id, service_id, quantity, unit_price, total_amount]
      );

      const order = orderResult.rows[0];

      // Deduct from wallet
      await client.query(
        'UPDATE wallets SET balance = balance - $1, updated_at = NOW() WHERE user_id = $2',
        [total_amount, user_id]
      );

      // Create transaction record
      await client.query(
        `INSERT INTO transactions (id, user_id, order_id, amount, type, status, description, created_at) 
         VALUES (gen_random_uuid(), $1, $2, $3, 'PAYMENT', 'COMPLETED', $4, NOW())`,
        [user_id, order.id, -total_amount, `Payment for ${service.name} x${quantity}`]
      );

      await client.query('COMMIT');

      console.log('✅ Order created successfully:', order.id);

      // Convert price fields from string to number
      const orderWithNumbers = {
        ...order,
        unit_price: parseFloat(order.unit_price),
        total_amount: parseFloat(order.total_amount)
      };

      return NextResponse.json({
        success: true,
        data: orderWithNumbers
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Create order failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create order' 
      },
      { status: 500 }
    );
  }
}
