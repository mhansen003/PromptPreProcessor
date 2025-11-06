import { NextRequest, NextResponse } from 'next/server';
import { getGeneratedPrompts, saveGeneratedPrompt, deleteGeneratedPrompt } from '@/lib/redis';

// GET /api/generated - Get generated prompts history
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email') || 'default-user';
    const prompts = await getGeneratedPrompts(userEmail);
    return NextResponse.json({ prompts });
  } catch (error: any) {
    console.error('Error fetching generated prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch generated prompts', details: error.message },
      { status: 500 }
    );
  }
}

// POST /api/generated - Save generated prompt to history
export async function POST(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email') || 'default-user';
    const promptData = await request.json();
    const success = await saveGeneratedPrompt(promptData, userEmail);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to save generated prompt' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error saving generated prompt:', error);
    return NextResponse.json(
      { error: 'Failed to save generated prompt', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/generated?id=xxx - Delete generated prompt from history
export async function DELETE(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email') || 'default-user';
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('id');

    if (!promptId) {
      return NextResponse.json(
        { error: 'Prompt ID required' },
        { status: 400 }
      );
    }

    const success = await deleteGeneratedPrompt(promptId, userEmail);

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete generated prompt' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error deleting generated prompt:', error);
    return NextResponse.json(
      { error: 'Failed to delete generated prompt', details: error.message },
      { status: 500 }
    );
  }
}
