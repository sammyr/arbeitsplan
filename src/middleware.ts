import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Da die Authentifizierung deaktiviert ist, verwenden wir einen Dummy-Wert
const JWT_SECRET = 'dummy-secret-for-disabled-auth';
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Configuration flag to disable authentication
const AUTH_ENABLED = false;

// Add paths that don't require authentication
const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password'];

export async function middleware(request: NextRequest) {
  try {
    // If authentication is disabled, allow all requests
    if (!AUTH_ENABLED) {
      return NextResponse.next();
    }

    const { pathname } = request.nextUrl;

    // Allow access to public paths
    if (publicPaths.includes(pathname)) {
      return NextResponse.next();
    }

    // Check for auth token
    const token = request.cookies.get('token')?.value;

    if (!token) {
      // Redirect to login if no token is present
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      // Verify the token
      await jwtVerify(token, secretKey);
      return NextResponse.next();
    } catch (error) {
      // Redirect to login if token is invalid
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  } catch (error) {
    // If any error occurs during middleware execution, log it and continue
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes
     * 2. /_next/static (static files)
     * 3. /_next/image (image optimization files)
     * 4. /favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
