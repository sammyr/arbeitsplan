"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.middleware = middleware;
const server_1 = require("next/server");
const jose_1 = require("jose");
// Da die Authentifizierung deaktiviert ist, verwenden wir einen Dummy-Wert
const JWT_SECRET = 'dummy-secret-for-disabled-auth';
const secretKey = new TextEncoder().encode(JWT_SECRET);
// Configuration flag to disable authentication
const AUTH_ENABLED = false;
// Add paths that don't require authentication
const publicPaths = ['/auth/login', '/auth/register', '/auth/forgot-password'];
async function middleware(request) {
    var _a;
    // If authentication is disabled, allow all requests
    if (!AUTH_ENABLED) {
        return server_1.NextResponse.next();
    }
    const { pathname } = request.nextUrl;
    // Allow access to public paths
    if (publicPaths.includes(pathname)) {
        return server_1.NextResponse.next();
    }
    // Check for auth token
    const token = (_a = request.cookies.get('token')) === null || _a === void 0 ? void 0 : _a.value;
    if (!token) {
        // Redirect to login if no token is present
        return server_1.NextResponse.redirect(new URL('/auth/login', request.url));
    }
    try {
        // Verify the token
        await (0, jose_1.jwtVerify)(token, secretKey);
        return server_1.NextResponse.next();
    }
    catch (error) {
        // Redirect to login if token is invalid
        return server_1.NextResponse.redirect(new URL('/auth/login', request.url));
    }
}
exports.config = {
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
