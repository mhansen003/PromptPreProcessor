import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Retrieve the prompt from Redis
    const promptText = await redis.get(`published-prompt:${id}`);

    if (!promptText) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    // Return as plain text for easy consumption
    return new NextResponse(promptText, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
      },
    });
  } catch (error) {
    console.error('Error retrieving prompt:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve prompt' },
      { status: 500 }
    );
  }
}
