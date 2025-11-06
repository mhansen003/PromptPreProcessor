import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import {
  isValidCMGEmail,
  getOTPKey,
  getRateLimitKey,
  AUTH_CONFIG,
} from '@/lib/auth-jwt';
import { generateOTP, sendOTPEmail } from '@/lib/auth-email';
import type { OTPData, SendOTPRequest } from '@/types/auth';

export async function POST(request: NextRequest) {
  try {
    const { email }: SendOTPRequest = await request.json();

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();

    // Check if email is from allowed domain
    if (!isValidCMGEmail(emailLower)) {
      return NextResponse.json(
        {
          success: false,
          error: `Only @${AUTH_CONFIG.ALLOWED_DOMAIN} emails are allowed`
        },
        { status: 403 }
      );
    }

    // Check rate limiting
    const rateLimitKey = getRateLimitKey(emailLower);
    const requestCount = await kv.get<number>(rateLimitKey);

    if (requestCount && requestCount >= AUTH_CONFIG.MAX_REQUESTS_PER_WINDOW) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many requests. Please try again in ${AUTH_CONFIG.RATE_LIMIT_WINDOW_MINUTES} minutes.`
        },
        { status: 429 }
      );
    }

    // Increment rate limit counter
    const newCount = requestCount ? requestCount + 1 : 1;
    await kv.set(rateLimitKey, newCount, {
      ex: AUTH_CONFIG.RATE_LIMIT_WINDOW_MINUTES * 60
    });

    // Generate OTP
    const code = generateOTP();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + AUTH_CONFIG.OTP_EXPIRY_MINUTES * 60 * 1000);

    const otpData: OTPData = {
      code,
      email: emailLower,
      attempts: 0,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    // Store OTP in Redis with TTL
    const otpKey = getOTPKey(emailLower);
    await kv.set(otpKey, JSON.stringify(otpData), {
      ex: AUTH_CONFIG.OTP_EXPIRY_MINUTES * 60
    });

    // Send email
    try {
      await sendOTPEmail(emailLower, code);
      console.log(`OTP sent to ${emailLower}`);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send verification email. Please check your SMTP configuration.'
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent to ${emailLower}`,
    });
  } catch (error) {
    console.error('Error in send-otp:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
