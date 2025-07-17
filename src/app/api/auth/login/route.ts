import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== User Login API Started ===');
    
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('Login attempt for:', email);

    const client = await pool.connect();

    try {
      // Find user by email
      const userResult = await client.query(
        'SELECT id, email, full_name, password, is_admin, status FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      const user = userResult.rows[0];

      // Check if user is active
      if (user.status !== 'ACTIVE') {
        return NextResponse.json(
          { error: 'Account is not active' },
          { status: 401 }
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        );
      }

      console.log('✅ User logged in successfully:', user.email);

      // Return user data without password and determine redirect
      const userData = {
        id: user.id,
        email: user.email,
        name: user.full_name,
        isAdmin: user.is_admin,
        status: user.status
      };

      // Redirect logic based on admin status
      const redirectTo = user.is_admin ? '/admin/dashboard' : '/user';

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        user: userData,
        redirectTo
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Login failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      },
      { status: 500 }
    );
  }
}
