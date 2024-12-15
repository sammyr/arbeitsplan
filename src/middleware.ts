import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Da die Authentifizierung deaktiviert ist, verwenden wir einen Dummy-Wert
const JWT_SECRET = 'dummy-secret-for-disabled-auth';
const secretKey = new TextEncoder().encode(JWT_SECRET);

// Configuration flag to disable authentication
const AUTH_ENABLED = false;

// Add paths that don't require authentication
const publicPaths = ['/auth/login', '/auth/register', '/auth/passwort'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Debugging
  console.log('Current pathname:', pathname);
  
  // Check if path starts with /auth/
  if (pathname.startsWith('/auth/')) {
    console.log('Auth path detected, allowing access');
    return NextResponse.next();
  }
  
  // If authentication is disabled, allow all requests
  if (!AUTH_ENABLED) {
    console.log('Auth disabled, allowing access');
    return NextResponse.next();
  }

  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      console.log('No token found, redirecting to login');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    try {
      await jwtVerify(token, secretKey);
      return NextResponse.next();
    } catch (error) {
      console.log('Invalid token, redirecting to login');
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

// Konfiguriere die Middleware-Matcher
export const config = {
  matcher: [
    '/((?!_next/|public/|api/).*)',
  ],
};
