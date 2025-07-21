import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { withAdminAuth } from '@/lib/auth-middleware';
import { createUserSchema, sanitizeString } from '@/lib/validation';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/users - Get all users (Admin only)
export const GET = withAdminAuth(async (request: NextRequest, user) => {
  console.log('=== Get Users API Started ===');
  
  try {
    const client = await pool.connect();

    try {
      const result = await client.query(`
        SELECT 
          u.id,
          u.email,
          u.full_name,
          u.is_admin,
          u.status,
          u.created_at,
          u.updated_at,
          COALESCE(w.balance, 0) as balance
        FROM users u
        LEFT JOIN wallets w ON u.id = w.user_id
        ORDER BY u.created_at DESC
      `);

      console.log(`✅ Retrieved ${result.rows.length} users by admin ${user.email}`);
      return NextResponse.json({
        success: true,
        data: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('❌ Get users error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
});

// POST /api/users - Create new user (Admin only)
export const POST = withAdminAuth(async (request: NextRequest, user) => {
  console.log('=== Create User API Started ===');
  
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = createUserSchema.parse(body);
    let { email, password, full_name, is_admin = false } = validatedData;

    // Sanitize inputs
    email = email.toLowerCase().trim();
    full_name = sanitizeString(full_name);

    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Check if user already exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'User with this email already exists' },
          { status: 400 }
        );
      }

      // Hash password with high cost
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const userResult = await client.query(`
        INSERT INTO users (id, email, password, full_name, is_admin, status, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, $2, $3, $4, 'ACTIVE', NOW(), NOW())
        RETURNING id, email, full_name, is_admin, status, created_at, updated_at
      `, [email, hashedPassword, full_name, is_admin]);

      const newUser = userResult.rows[0];

      // Create wallet for user
      await client.query(`
        INSERT INTO wallets (id, user_id, balance, created_at, updated_at)
        VALUES (gen_random_uuid(), $1, 0, NOW(), NOW())
      `, [newUser.id]);

      // Commit transaction
      await client.query('COMMIT');

      console.log(`✅ User created successfully by admin ${user.email}: ${newUser.email}`);

      // Return user data without password
      return NextResponse.json({
        success: true,
        data: newUser,
        message: 'User created successfully'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Create user error:', error);
    
    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid input data' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to create user' },
      { status: 500 }
    );
  }
});
