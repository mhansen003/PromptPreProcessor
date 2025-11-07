import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { put } from '@vercel/blob';
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

    const tempImageUrl = response.data?.[0]?.url;

    if (!tempImageUrl || !response.data) {
      return NextResponse.json(
        { success: false, error: 'No image URL returned from DALL-E' },
        { status: 500 }
      );
    }

    console.log('[DALL-E] Image generated, downloading from:', tempImageUrl);

    // Download image from OpenAI's temporary URL
    const imageResponse = await fetch(tempImageUrl);
    if (!imageResponse.ok) {
      throw new Error('Failed to download image from OpenAI');
    }
    const imageBlob = await imageResponse.blob();

    console.log('[DALL-E] Image downloaded, uploading to Vercel Blob...');

    // Upload to Vercel Blob for permanent storage
    const filename = `persona-${config.id}-${Date.now()}.png`;
    const blob = await put(filename, imageBlob, {
      access: 'public',
      contentType: 'image/png',
    });

    console.log('[DALL-E] Image uploaded to Vercel Blob:', blob.url);

    return NextResponse.json({
      success: true,
      imageUrl: blob.url, // Permanent Vercel Blob URL
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

// Build a DALL-E prompt for an abstract artistic persona representation
function buildCaricaturePrompt(config: PersonaConfig): string {
  let prompt = 'Abstract artistic avatar representing ';

  // Base concept based on role
  if (config.jobRole && config.jobRole !== 'general') {
    const role = config.jobRole.split('-').join(' ');
    prompt += `a ${role} persona, `;
  } else {
    prompt += 'a professional persona, ';
  }

  // Gender influences overall aesthetic (subtle, not literal)
  const gender = config.gender || 'neutral';
  const genderAesthetic: Record<string, string> = {
    male: 'bold angular geometric forms',
    female: 'flowing elegant curved shapes',
    neutral: 'balanced harmonious geometric patterns',
  };
  prompt += `using ${genderAesthetic[gender]}, `;

  // Color palette based on personality traits
  prompt += 'color palette with ';

  // Enthusiasm affects color energy
  if (config.enthusiasm > 70) {
    prompt += 'vibrant energetic colors (bright oranges, yellows, warm reds), ';
  } else if (config.enthusiasm > 40) {
    prompt += 'balanced warm colors (amber, coral, soft gold), ';
  } else {
    prompt += 'cool calm colors (blues, teals, muted tones), ';
  }

  // Confidence affects shapes and composition
  if (config.confidence > 70) {
    prompt += 'strong bold shapes with sharp defined edges and prominent central forms, ';
  } else if (config.confidence < 40) {
    prompt += 'gentle soft shapes with subtle gradients and supportive elements, ';
  } else {
    prompt += 'balanced shapes with smooth transitions, ';
  }

  // Creativity level affects artistic style
  if (config.creativityLevel > 70) {
    prompt += 'highly creative abstract composition with unique unexpected elements and playful asymmetry, ';
  } else if (config.creativityLevel > 40) {
    prompt += 'moderately creative design with artistic flair and balanced innovation, ';
  } else {
    prompt += 'clean structured composition with elegant simplicity, ';
  }

  // Formality affects overall aesthetic
  if (config.formalityLevel > 70) {
    prompt += 'professional refined aesthetic with geometric precision and sophisticated balance, ';
  } else if (config.formalityLevel > 40) {
    prompt += 'semi-formal approachable style with organized elements, ';
  } else {
    prompt += 'casual friendly aesthetic with organic flowing elements, ';
  }

  // Regional influence (as abstract background/accent elements)
  if (config.state || (config.region && config.region !== 'none' && config.region !== 'national')) {
    prompt += 'subtle regional motifs as abstract background patterns, ';
  }

  // Technical depth affects detail level
  if (config.technicalDepth > 70) {
    prompt += 'intricate detailed patterns with layered complexity, ';
  } else {
    prompt += 'clean minimalist approach, ';
  }

  // Style specification - key requirements
  prompt += 'abstract modern digital art, ';
  prompt += 'NO human faces, NO people, NO portraits, ';
  prompt += 'geometric and organic shapes only, ';
  prompt += 'symbolic representation of personality and role, ';
  prompt += 'professional icon style suitable for profile avatar, ';
  prompt += 'centered composition, ';
  prompt += 'clean white or subtle gradient background, ';
  prompt += 'high quality vector-style illustration, ';
  prompt += 'modern minimalist aesthetic with depth';

  // Trim to DALL-E's 4000 character limit
  if (prompt.length > 4000) {
    prompt = prompt.substring(0, 3997) + '...';
  }

  return prompt;
}
