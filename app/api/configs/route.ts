import { NextRequest, NextResponse } from 'next/server';
import { getUserConfigs, saveConfig, deleteConfig } from '@/lib/redis';
import { createExampleConfigs } from '@/lib/store';

// GET /api/configs - Get all user configurations
export async function GET() {
  try {
    let configs = await getUserConfigs();

    // If no configs exist, initialize with examples
    if (configs.length === 0) {
      const examples = createExampleConfigs();
      for (const config of examples) {
        await saveConfig(config);
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

// POST /api/configs - Create new configuration
export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    const success = await saveConfig(config);

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
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get('id');

    if (!configId) {
      return NextResponse.json(
        { error: 'Configuration ID required' },
        { status: 400 }
      );
    }

    const success = await deleteConfig(configId);

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
