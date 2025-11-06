import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const { systemPrompt, userPrompt } = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        response: 'OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.',
        error: true
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content || 'No response generated';

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error('Error testing prompt:', error);

    return NextResponse.json({
      response: `Error: ${error.message || 'Failed to test prompt'}`,
      error: true
    });
  }
}
