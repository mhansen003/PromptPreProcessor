import { NextRequest, NextResponse } from 'next/server';
import { getUserConfigs } from '@/lib/redis';

// GET /api/personalities/[username]/[slug] - Get published personality
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; slug: string }> }
) {
  try {
    const { username, slug } = await params;

    // Construct user email from username (reverse of publish logic)
    const userEmail = `${username}@default.com`; // Simplified - in production you'd look this up

    // Get all user configs
    const configs = await getUserConfigs(userEmail);

    // Find the personality by slug
    const personality = configs.find(c => c.slug === slug && c.isPublished);

    if (!personality) {
      return NextResponse.json(
        { error: 'Personality not found or not published' },
        { status: 404 }
      );
    }

    // Return only public data
    return NextResponse.json({
      id: personality.id,
      name: personality.name,
      emoji: personality.emoji,
      slug: personality.slug,
      systemPrompt: personality.systemPrompt,
      createdAt: personality.createdAt,
      username,
    });
  } catch (error: any) {
    console.error('Error fetching personality:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personality', details: error.message },
      { status: 500 }
    );
  }
}
