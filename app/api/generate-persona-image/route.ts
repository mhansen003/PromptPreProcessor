import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { PersonaConfig } from '@/lib/store';

// POST /api/generate-persona-image - Generate a DALL-E caricature for a persona
export async function POST(request: NextRequest) {
  try {
    const config: PersonaConfig = await request.json();

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Build DALL-E prompt based on persona characteristics
    const imagePrompt = buildCaricaturePrompt(config);

    console.log('[DALL-E] Generating image with prompt:', imagePrompt);

    // Generate image with DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      style: 'vivid', // More artistic and caricature-like
    });

    const imageUrl = response.data?.[0]?.url;

    if (!imageUrl || !response.data) {
      return NextResponse.json(
        { success: false, error: 'No image URL returned from DALL-E' },
        { status: 500 }
      );
    }

    console.log('[DALL-E] Image generated successfully:', imageUrl);

    return NextResponse.json({
      success: true,
      imageUrl,
      personaName: config.name,
    });
  } catch (error: any) {
    console.error('[DALL-E] Error generating image:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate persona image',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Build a DALL-E prompt for a professional caricature
function buildCaricaturePrompt(config: PersonaConfig): string {
  let prompt = 'Professional caricature illustration of ';

  // Gender descriptor
  const genderMap = {
    male: 'a male',
    female: 'a female',
    neutral: 'a person',
  };
  prompt += genderMap[config.gender] + ' ';

  // Role and experience
  if (config.jobRole && config.jobRole !== 'general') {
    const role = config.jobRole.split('-').join(' ');
    prompt += `${role} `;
    if (config.yearsExperience > 0) {
      if (config.yearsExperience < 3) {
        prompt += '(early career) ';
      } else if (config.yearsExperience < 10) {
        prompt += '(mid-career) ';
      } else {
        prompt += '(experienced veteran) ';
      }
    }
  } else {
    prompt += 'professional ';
  }

  // Personality traits influence visual style
  prompt += 'with ';

  // Confidence affects posture
  if (config.confidence > 70) {
    prompt += 'confident, assertive posture, ';
  } else if (config.confidence < 40) {
    prompt += 'humble, approachable demeanor, ';
  }

  // Enthusiasm affects expression
  if (config.enthusiasm > 70) {
    prompt += 'bright enthusiastic smile, ';
  } else if (config.enthusiasm > 40) {
    prompt += 'friendly warm smile, ';
  } else {
    prompt += 'professional composed expression, ';
  }

  // Formality affects attire
  if (config.formalityLevel > 70) {
    prompt += 'wearing formal business attire (suit and tie), ';
  } else if (config.formalityLevel > 40) {
    prompt += 'wearing business casual attire, ';
  } else {
    prompt += 'wearing casual professional clothing, ';
  }

  // Regional context
  if (config.state) {
    prompt += `${config.state} background elements, `;
  } else if (config.region && config.region !== 'none' && config.region !== 'national') {
    const regionMap: Record<string, string> = {
      northeast: 'Northeast US urban',
      southeast: 'Southeast US',
      midwest: 'Midwest US',
      southwest: 'Southwest US desert',
      west: 'West Coast',
      'pacific-northwest': 'Pacific Northwest',
      'mountain-west': 'Mountain West',
    };
    prompt += `${regionMap[config.region] || ''} background elements, `;
  }

  // Creative style affects overall look
  if (config.creativityLevel > 70) {
    prompt += 'colorful vibrant artistic style, ';
  }

  // Style specification
  prompt += 'professional caricature art style with exaggerated but flattering features, ';
  prompt += 'vibrant colors, clean modern design, friendly and approachable, ';
  prompt += 'isolated on white background, ';
  prompt += 'suitable for professional profile picture, ';
  prompt += 'digital art, high quality illustration';

  // Trim to DALL-E's 4000 character limit (though we're well under)
  if (prompt.length > 4000) {
    prompt = prompt.substring(0, 3997) + '...';
  }

  return prompt;
}
