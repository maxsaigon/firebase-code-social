import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthenticatedUser {
  id: string;
  email: string;
  isAdmin: boolean;
  status: string;
}

/**
 * Authenticate user from JWT token
 */
export async function authenticateUser(request: NextRequest): Promise<AuthenticatedUser> {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    return {
      id: decoded.id,
      email: decoded.email,
      isAdmin: decoded.isAdmin || false,
      status: decoded.status || 'ACTIVE'
    };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

/**
 * Require admin privileges
 */
export function requireAdmin(user: AuthenticatedUser): void {
  if (!user.isAdmin) {
    throw new Error('Admin privileges required');
  }
}

/**
 * Require resource ownership or admin privileges
 */
export function requireOwnership(user: AuthenticatedUser, resourceUserId: string): void {
  if (!user.isAdmin && user.id !== resourceUserId) {
    throw new Error('Access denied: insufficient permissions');
  }
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: { id: string; email: string; isAdmin: boolean; status: string }): string {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
      status: user.status
    },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Middleware wrapper for authenticated routes
 */
export function withAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const user = await authenticateUser(request);
      
      if (user.status !== 'ACTIVE') {
        return NextResponse.json({ error: 'Account is not active' }, { status: 401 });
      }
      
      return await handler(request, user);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Authentication failed' },
        { status: 401 }
      );
    }
  };
}

/**
 * Middleware wrapper for admin-only routes
 */
export function withAdminAuth(handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>) {
  return withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      requireAdmin(user);
      return await handler(request, user);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Admin access required' },
        { status: 403 }
      );
    }
  });
}
