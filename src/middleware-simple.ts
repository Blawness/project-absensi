import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/auth/signin',
  '/auth/error',
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/api/auth',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // For now, allow all other routes to pass through
  // Authentication will be handled at the component level
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|icon-).*)',
  ],
};
