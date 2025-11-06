import { NextRequest, NextResponse } from 'next/server';
import { getGeneratedPrompts, saveGeneratedPrompt } from '@/lib/redis';

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
