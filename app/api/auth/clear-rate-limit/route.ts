import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis-client';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      );
    }

    const emailLower = email.toLowerCase().trim();
    const rateLimitKey = `ratelimit:${emailLower}`;

    // Delete the rate limit key
    await redis.del(rateLimitKey);

    return NextResponse.json({
      success: true,
      message: `Rate limit cleared for ${emailLower}`,
    });
  } catch (error) {
    console.error('Error clearing rate limit:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear rate limit' },
      { status: 500 }
    );
  }
}
