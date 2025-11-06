import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, AUTH_CONFIG } from '@/lib/auth-jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to signin page and auth API routes
  if (
    pathname === '/signin' ||
    pathname.startsWith('/api/auth/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get(AUTH_CONFIG.COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  try {
    const session = verifyAuthToken(token);

    if (!session) {
      const response = NextResponse.redirect(new URL('/signin', request.url));
      response.cookies.delete(AUTH_CONFIG.COOKIE_NAME);
      return response;
    }

    // Add user email to request headers for API routes to use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-email', session.email);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Error in middleware:', error);
    const response = NextResponse.redirect(new URL('/signin', request.url));
    response.cookies.delete(AUTH_CONFIG.COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: [
    '/',
    '/api/configs/:path*',
    '/api/generate-prompt',
    '/api/test-prompt',
    '/api/generated/:path*',
  ],
};
