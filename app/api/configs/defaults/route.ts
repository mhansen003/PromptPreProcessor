import { NextResponse } from 'next/server';
import { getUserConfigs } from '@/lib/redis';

// GET /api/configs/defaults - Get default templates for new users (from mhansen's templates)
export async function GET() {
  try {
    // Fetch mhansen's templates to use as defaults
    const mhansenTemplates = await getUserConfigs('mhansen');

    // Remove generated prompts and user-specific data
    const defaultTemplates = mhansenTemplates.map(template => ({
      ...template,
      systemPrompt: undefined, // Remove any generated prompts
    }));

    return NextResponse.json({ templates: defaultTemplates });
  } catch (error: any) {
    console.error('Error fetching default templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch default templates', details: error.message, templates: [] },
      { status: 500 }
    );
  }
}
