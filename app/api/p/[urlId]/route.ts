import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis-client';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ urlId: string }> }
) {
  try {
    const { urlId } = await context.params;

    if (!urlId) {
      return NextResponse.json(
        { error: 'URL ID is required' },
        { status: 400 }
      );
    }

    // Fetch the published prompt from Redis
    const data = await redis.get(`published:${urlId}`);

    if (!data) {
      return NextResponse.json(
        { error: 'Prompt not found or has expired' },
        { status: 404 }
      );
    }

    // Parse the stored data
    const promptData = typeof data === 'string' ? JSON.parse(data) : data;

    return NextResponse.json(promptData);
  } catch (error: any) {
    console.error('Error fetching published prompt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt', details: error.message },
      { status: 500 }
    );
  }
}
