import { NextRequest, NextResponse } from 'next/server';
import { getUserConfigs } from '@/lib/redis';

// GET /api/personalities/[username] - Get all published personalities for a user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Construct user email from username
    const userEmail = `${username}@cmgfi.com`;

    // Get all user configs
    const configs = await getUserConfigs(userEmail);

    // Filter to only published personalities
    const publishedPersonalities = configs
      .filter(c => c.isPublished && c.systemPrompt)
      .map(c => ({
        id: c.id,
        name: c.name,
        emoji: c.emoji,
        imageUrl: c.imageUrl,
        description: c.description || 'AI persona',
        slug: c.slug,
        url: `/personalities/${username}/${c.slug}`,
        createdAt: c.createdAt,
      }));

    return NextResponse.json({
      username,
      count: publishedPersonalities.length,
      personalities: publishedPersonalities,
    });
  } catch (error: any) {
    console.error('Error fetching personalities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personalities', details: error.message },
      { status: 500 }
    );
  }
}
