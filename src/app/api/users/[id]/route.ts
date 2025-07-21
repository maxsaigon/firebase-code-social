import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// GET /api/users/[id] - Get user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await pool.connect();

    try {
      const result = await client.query(
        'SELECT id, email, full_name, is_admin, status, created_at, updated_at FROM users WHERE id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== Update User API Started ===');
  
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, full_name, is_admin, status, password } = body;

    console.log('Update data received:', { email, full_name, is_admin, status, password: !!password });

    // Validation and defaults
    if (!email || email.trim() === '') {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    if (!full_name || full_name.trim() === '') {
      return NextResponse.json(
        { message: 'Full name is required' },
        { status: 400 }
      );
    }

    // Ensure is_admin has a boolean value
    const adminValue = is_admin === true || is_admin === 'true' || is_admin === 1;
    
    // Normalize status to uppercase for enum
    const normalizedStatus = status ? status.toUpperCase() : 'ACTIVE';

    const client = await pool.connect();

    try {
      // Check if user exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE id = $1',
        [id]
      );

      if (existingUser.rows.length === 0) {
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      // Prepare update query
      let updateQuery = `
        UPDATE users 
        SET email = $1, full_name = $2, is_admin = $3, status = $4, updated_at = CURRENT_TIMESTAMP
      `;
      let queryParams = [email.trim(), full_name.trim(), adminValue, normalizedStatus];

      // If password is provided, hash it and include in update
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 12);
        updateQuery += `, password = $5`;
        queryParams.push(hashedPassword);
      }

      updateQuery += ` WHERE id = $${queryParams.length + 1} RETURNING id, email, full_name, is_admin, status, created_at, updated_at`;
      queryParams.push(id);

      const result = await client.query(updateQuery, queryParams);
      const updatedUser = result.rows[0];

      console.log(`✅ User updated successfully: ${updatedUser.email}`);
      return NextResponse.json(updatedUser);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { message: 'Failed to update user' },
      { status: 500 }
    );
  }
}

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== Delete User API Started ===');
  
  try {
    const { id } = await params;
    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Check if user exists
      const existingUser = await client.query(
        'SELECT id FROM users WHERE id = $1',
        [id]
      );

      if (existingUser.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { message: 'User not found' },
          { status: 404 }
        );
      }

      // Delete user's wallet first (foreign key constraint)
      await client.query('DELETE FROM wallets WHERE user_id = $1', [id]);

      // Delete user's transactions
      await client.query('DELETE FROM transactions WHERE user_id = $1', [id]);

      // Delete user's orders (this will cascade to order_items)
      await client.query('DELETE FROM orders WHERE user_id = $1', [id]);

      // Finally delete the user
      await client.query('DELETE FROM users WHERE id = $1', [id]);

      // Commit transaction
      await client.query('COMMIT');

      console.log(`✅ User deleted successfully: ${id}`);
      return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { message: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
