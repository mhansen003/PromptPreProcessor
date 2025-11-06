import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis-client';

export async function POST(request: NextRequest) {
  try {
    const { promptId, promptText, configName } = await request.json();

    if (!promptId || !promptText) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate a unique URL identifier (using timestamp + random string)
    const urlId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Store the prompt in Redis with the URL ID as key
    await redis.set(
      `published:${urlId}`,
      JSON.stringify({
        promptId,
        promptText,
        configName,
        publishedAt: new Date().toISOString()
      }),
      { ex: 60 * 60 * 24 * 365 } // Expire in 1 year
    );

    // Construct the public URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
                    (request.headers.get('host') ? `${request.headers.get('x-forwarded-proto') || 'http'}://${request.headers.get('host')}` : 'http://localhost:3000');
    const publicUrl = `${baseUrl}/p/${urlId}`;

    return NextResponse.json({
      url: publicUrl,
      urlId
    });
  } catch (error: any) {
    console.error('Error publishing prompt:', error);
    return NextResponse.json(
      { error: 'Failed to publish prompt', details: error.message },
      { status: 500 }
    );
  }
}
