import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis-client';
import {
  getOTPKey,
  createAuthToken,
  AUTH_CONFIG,
} from '@/lib/auth-jwt';
import type { OTPData, VerifyOTPRequest } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, code }: VerifyOTPRequest = await request.json();

    // Validate input
    if (!email || !code) {
      return NextResponse.json(
        { success: false, error: 'Email and code are required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    const codeClean = code.trim();

    // Get OTP from Redis
    const otpKey = getOTPKey(emailLower);
    const otpDataStr = await redis.get<string>(otpKey);

    if (!otpDataStr) {
      return NextResponse.json(
        {
          success: false,
          error: 'Verification code expired or not found. Please request a new code.'
        },
        { status: 404 }
      );
    }

    const otpData: OTPData = JSON.parse(otpDataStr);

    // Check if expired
    if (new Date(otpData.expiresAt) < new Date()) {
      await redis.del(otpKey);
      return NextResponse.json(
        { success: false, error: 'Verification code has expired. Please request a new code.' },
        { status: 410 }
      );
    }

    // Check attempts
    if (otpData.attempts >= AUTH_CONFIG.MAX_ATTEMPTS) {
      await redis.del(otpKey);
      return NextResponse.json(
        {
          success: false,
          error: 'Maximum verification attempts exceeded. Please request a new code.'
        },
        { status: 403 }
      );
    }

    // Verify code
    if (otpData.code !== codeClean) {
      // Increment attempts
      otpData.attempts += 1;
      await redis.set(otpKey, JSON.stringify(otpData), {
        ex: AUTH_CONFIG.OTP_EXPIRY_MINUTES * 60
      });

      const attemptsLeft = AUTH_CONFIG.MAX_ATTEMPTS - otpData.attempts;
      return NextResponse.json(
        {
          success: false,
          error: `Invalid code. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`
        },
        { status: 401 }
      );
    }

    // Code is valid! Delete OTP and create session
    await redis.del(otpKey);

    // Create JWT token
    const token = createAuthToken(emailLower);

    // Create response with httpOnly cookie
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful',
      email: emailLower,
    });

    // Set cookie
    response.cookies.set({
      name: AUTH_CONFIG.COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: AUTH_CONFIG.SESSION_EXPIRY_HOURS * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Error in verify-otp:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
