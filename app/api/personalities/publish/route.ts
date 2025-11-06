import { NextRequest, NextResponse } from 'next/server';
import { getUserConfigs, saveConfig } from '@/lib/redis';

// POST /api/personalities/publish - Toggle publish status of a personality
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email') || 'default-user';
    const { personalityId, isPublished } = await request.json();

    if (!personalityId) {
      return NextResponse.json(
        { error: 'Personality ID required' },
        { status: 400 }
      );
    }

    // Get all user configs
    const configs = await getUserConfigs(userEmail);
    const personality = configs.find(c => c.id === personalityId);

    if (!personality) {
      return NextResponse.json(
        { error: 'Personality not found' },
        { status: 404 }
      );
    }

    // If publishing (turning on), require a prompt
    if (isPublished && !personality.systemPrompt) {
      return NextResponse.json(
        { error: 'Personality must have a generated prompt before publishing' },
        { status: 400 }
      );
    }

    // Construct the public URL
    const username = userEmail.split('@')[0]; // Use email prefix as username
    const slug = personality.slug || personality.name.toLowerCase().replace(/\s+/g, '-');
    const publicUrl = `/personalities/${username}/${slug}`;

    // Update the personality with published status
    const updatedPersonality = {
      ...personality,
      isPublished: isPublished,
      publishedUrl: isPublished ? publicUrl : undefined,
      slug,
    };

    // Save the updated config
    await saveConfig(updatedPersonality, userEmail);

    return NextResponse.json({
      success: true,
      isPublished: isPublished,
      url: isPublished ? publicUrl : null,
      personality: updatedPersonality,
    });
  } catch (error: any) {
    console.error('Error toggling publish status:', error);
    return NextResponse.json(
      { error: 'Failed to update publish status', details: error.message },
      { status: 500 }
    );
  }
}
