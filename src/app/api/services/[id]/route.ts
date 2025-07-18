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
    console.log('=== Get Service by ID API Started ===');

    const { id } = params;

    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT * FROM services WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }

      console.log('✅ Service retrieved:', result.rows[0].name);

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Get service failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch service' 
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
    console.log('=== Update Service API Started ===');

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

      const query = `UPDATE services SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }

      console.log('✅ Service updated:', result.rows[0].name);

      return NextResponse.json({
        success: true,
        data: result.rows[0]
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Update service failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update service' 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('=== Delete Service API Started ===');

    const { id } = params;

    const client = await pool.connect();

    try {
      const result = await client.query(
        'DELETE FROM services WHERE id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }

      console.log('✅ Service deleted:', result.rows[0].name);

      return NextResponse.json({
        success: true,
        message: 'Service deleted successfully'
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Delete service failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to delete service' 
      },
      { status: 500 }
    );
  }
}
