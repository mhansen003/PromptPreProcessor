import { NextRequest, NextResponse } from 'next/server';
import type { PromptConfig } from '@/lib/store';
import { generatePrompt } from '@/lib/prompt-generator';

export async function POST(request: NextRequest) {
  try {
    const config: PromptConfig = await request.json();

    // Generate the prompt using shared function
    const systemPrompt = await generatePrompt(config);

    return NextResponse.json({ systemPrompt });
  } catch (error: any) {
    console.error('Error generating prompt:', error);

    // Return error details for debugging
    return NextResponse.json(
      {
        error: 'Failed to generate prompt',
        details: error.message,
        systemPrompt: ''
      },
      { status: 500 }
    );
  }
}
