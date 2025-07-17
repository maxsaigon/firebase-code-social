import { Pool } from 'pg';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing PostgreSQL connection...');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    // Test connection
    const client = await pool.connect();
    console.log('Connected to PostgreSQL successfully');
    
    // Test query
    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log('Query result:', result.rows[0]);
    
    client.release();
    await pool.end();

    return NextResponse.json({
      success: true,
      message: 'PostgreSQL connection successful',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('PostgreSQL connection failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      },
      { status: 500 }
    );
  }
}
