import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET() {
  try {
    console.log('=== Get Services API Started ===');

    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT * FROM services ORDER BY created_at DESC'
      );

      console.log(`✅ Retrieved ${result.rows.length} services`);

      // Convert price from string to number
      const services = result.rows.map(service => ({
        ...service,
        price: parseFloat(service.price)
      }));

      return NextResponse.json({
        success: true,
        data: services
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Get services failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to fetch services' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== Create Service API Started ===');

    const body = await request.json();
    const { name, description, price, category, status = 'ACTIVE' } = body;

    if (!name || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Normalize status to uppercase for enum
    const normalizedStatus = status ? status.toUpperCase() : 'ACTIVE';

    const client = await pool.connect();

    try {
      const result = await client.query(
        `INSERT INTO services (id, name, description, price, category, status, created_at, updated_at) 
         VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NOW(), NOW()) 
         RETURNING *`,
        [name, description, price, category, normalizedStatus]
      );

      console.log('✅ Service created successfully:', result.rows[0].name);

      // Convert price from string to number
      const service = {
        ...result.rows[0],
        price: parseFloat(result.rows[0].price)
      };

      return NextResponse.json({
        success: true,
        data: service
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Create service failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to create service' 
      },
      { status: 500 }
    );
  }
}
