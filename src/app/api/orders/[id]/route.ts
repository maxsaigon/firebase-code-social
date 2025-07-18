import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Get Order by ID API Started ===');

    const { id } = params;

    const client = await pool.connect();

    try {
      const result = await client.query(
        `SELECT o.*, 
                s.name as service_name, 
                s.description as service_description,
                u.full_name as user_name,
                u.email as user_email
         FROM orders o
         JOIN services s ON o.service_id = s.id
         JOIN users u ON o.user_id = u.id
         WHERE o.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      console.log('✅ Order retrieved:', result.rows[0].id);

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Get order failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch order' 
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Update Order API Started ===');

    const { id } = params;
    const body = await request.json();

    const client = await pool.connect();

    try {
      // Build dynamic update query
      const updateFields = [];
      const values = [];
      let paramIndex = 1;

      for (const [key, value] of Object.entries(body)) {
        if (key !== 'id') {
          updateFields.push(`${key} = $${paramIndex}`);
          values.push(value);
          paramIndex++;
        }
      }

      if (updateFields.length === 0) {
        return NextResponse.json(
          { error: 'No fields to update' },
          { status: 400 }
        );
      }

      updateFields.push(`updated_at = NOW()`);
      values.push(id);

      const query = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      console.log('✅ Order updated:', result.rows[0].id);

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Update order failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update order' 
      },
      { status: 500 }
    );
  }
}
