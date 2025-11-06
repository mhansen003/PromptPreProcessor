import { NextRequest, NextResponse } from 'next/server';
import { getUserConfigs, saveConfig, deleteConfig } from '@/lib/redis';
import { createExampleConfigs } from '@/lib/store';
import type { PromptConfig } from '@/lib/store';

// Helper function to generate URL-friendly slug from name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')      // Replace spaces with hyphens
    .replace(/-+/g, '-');      // Replace multiple hyphens with single hyphen
}

// Helper function to generate prompt from config (extracted from generate-prompt route)
async function generatePromptForConfig(config: PromptConfig): Promise<string> {
  try {
    // Call the generate-prompt API internally
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate-prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    });

    const data = await response.json();
    return data.systemPrompt || '';
  } catch (error) {
    console.error('Error generating prompt:', error);
    return '';
  }
}

// GET /api/configs - Get all user configurations
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email') || 'default-user';
    let configs = await getUserConfigs(userEmail);

    // If no configs exist, initialize with examples
    if (configs.length === 0) {
      const examples = createExampleConfigs();
      for (const config of examples) {
        await saveConfig(config, userEmail);
      }
      configs = examples;
    }

    return NextResponse.json({ configs });
  } catch (error: any) {
    console.error('Error fetching configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch configurations', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/configs - Create/update configuration with auto-generation
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email') || 'default-user';
    const config: PromptConfig = await request.json();

    // Generate slug from personality name
    config.slug = generateSlug(config.name);

    // Auto-generate the system prompt
    const systemPrompt = await generatePromptForConfig(config);
    config.systemPrompt = systemPrompt;

    // Save the updated config with generated prompt
    const success = await saveConfig(config, userEmail);

    if (success) {
      return NextResponse.json({ success: true, config });
    } else {
      return NextResponse.json(
        { error: 'Failed to save configuration' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error creating config:', error);
    return NextResponse.json(
      { error: 'Failed to create configuration', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/configs?id=xxx - Delete configuration
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email') || 'default-user';
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('id');

    if (!configId) {
      return NextResponse.json(
        { error: 'Configuration ID required' },
        { status: 400 }
      );
    }

    const success = await deleteConfig(configId, userEmail);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete configuration' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error deleting config:', error);
    return NextResponse.json(
      { error: 'Failed to delete configuration', details: error.message },
      { status: 500 }
    );
  }
}
