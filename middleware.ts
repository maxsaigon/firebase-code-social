import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // List of public endpoints that don't require authentication
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/register-pg',
    '/api/test-db',
    '/api/test-pg',
    '/_next',
    '/favicon.ico'
  ];

  // Check if the request is for an API endpoint
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Allow public endpoints
    const isPublicPath = publicPaths.some(path => 
      request.nextUrl.pathname.startsWith(path)
    );

    if (!isPublicPath) {
      // Check for Authorization header
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json(
          { 
            error: 'Unauthorized - Authentication required',
            message: 'Please provide a valid authentication token'
          },
          { status: 401 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
