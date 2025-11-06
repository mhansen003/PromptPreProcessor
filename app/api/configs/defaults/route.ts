import { NextResponse } from 'next/server';
import { getUserConfigs } from '@/lib/redis';

// GET /api/configs/defaults - Get default personalities for new users (from mhansen's personalities)
export async function GET() {
  try {
    // Fetch mhansen's personalities to use as defaults
    const mhansenPersonalities = await getUserConfigs('mhansen');

    // Remove generated prompts and user-specific data
    const defaultPersonalities = mhansenPersonalities.map(personality => ({
      ...personality,
      systemPrompt: undefined, // Remove any generated prompts
    }));

    return NextResponse.json({ personalities: defaultPersonalities });
  } catch (error: any) {
    console.error('Error fetching default personalities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch default personalities', details: error.message, personalities: [] },
      { status: 500 }
    );
  }
}
