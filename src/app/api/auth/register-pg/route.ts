import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== Registration API Started ===');
    
    const body = await request.json();
    const { email, password, fullName } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Registration attempt for:', email);

    const client = await pool.connect();

    try {
      // Start transaction
      await client.query('BEGIN');

      // Check if user already exists
      const existingUserResult = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUserResult.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'User already exists' },
          { status: 400 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const userResult = await client.query(
        `INSERT INTO users (id, email, full_name, password, created_at, updated_at) 
         VALUES (gen_random_uuid(), $1, $2, $3, NOW(), NOW()) 
         RETURNING id, email, full_name, created_at`,
        [email, fullName, hashedPassword]
      );

      const newUser = userResult.rows[0];

      // Create wallet for user
      await client.query(
        `INSERT INTO wallets (id, user_id, balance, created_at, updated_at) 
         VALUES (gen_random_uuid(), $1, 0, NOW(), NOW())`,
        [newUser.id]
      );

      // Commit transaction
      await client.query('COMMIT');

      console.log('User registered successfully:', newUser.email);

      return NextResponse.json({
        success: true,
        message: 'User registered successfully',
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.full_name,
          createdAt: newUser.created_at
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Registration failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      },
      { status: 500 }
    );
  }
}
