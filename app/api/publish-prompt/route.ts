import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis-client';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const { promptText } = await request.json();

    if (!promptText) {
      return NextResponse.json(
        { success: false, error: 'Prompt text required' },
        { status: 400 }
      );
    }

    // Generate a unique ID for this prompt
    const promptId = nanoid(12); // Short, URL-safe ID

    // Store in Redis with no expiration (permanent)
    await redis.set(`published-prompt:${promptId}`, promptText);

    // Get the base URL from the request
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    const publicUrl = `${baseUrl}/api/prompts/${promptId}`;

    return NextResponse.json({
      success: true,
      promptId,
      publicUrl,
    });
  } catch (error) {
    console.error('Error publishing prompt:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to publish prompt' },
      { status: 500 }
    );
  }
}
