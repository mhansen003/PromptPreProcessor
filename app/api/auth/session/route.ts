import { NextRequest, NextResponse } from 'next/server';
import { verifyAuthToken, AUTH_CONFIG } from '@/lib/auth-jwt';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json({
        authenticated: false,
        email: null,
      });
    }

    const session = verifyAuthToken(token);

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        email: null,
      });
    }

    return NextResponse.json({
      authenticated: true,
      email: session.email,
    });
  } catch (error) {
    console.error('Error in session check:', error);
    return NextResponse.json({
      authenticated: false,
      email: null,
    });
  }
}
