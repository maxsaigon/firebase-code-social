import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { generateToken } from '@/lib/auth-middleware';
import { loginSchema } from '@/lib/validation';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  try {
    console.log('=== User Login API Started ===');
    
    const body = await request.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);
    const { email, password } = validatedData;

    console.log('Login attempt for:', email);

    const client = await pool.connect();

    try {
      // Find user by email (exclude password from initial select for security)
      const userResult = await client.query(
        'SELECT id, email, full_name, password, is_admin, status FROM users WHERE email = $1',
        [email]
      );

      if (userResult.rows.length === 0) {
        // Generic error message to prevent user enumeration
        return NextResponse.json(
          { error: 'Invalid credentials' },
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
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      console.log('✅ User logged in successfully:', user.email);

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        isAdmin: user.is_admin,
        status: user.status
      });

      // Return user data without password
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
        token, // Include JWT token in response
        redirectTo
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Login failed:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Login failed' // Generic error message
      },
      { status: 500 }
    );
  }
}
