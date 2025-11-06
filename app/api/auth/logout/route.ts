import { NextResponse } from 'next/server';
import { AUTH_CONFIG } from '@/lib/auth-jwt';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear auth cookie
    response.cookies.set({
      name: AUTH_CONFIG.COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Delete cookie
    });

    return response;
  } catch (error) {
    console.error('Error in logout:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
