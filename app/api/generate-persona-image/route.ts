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

// Build a DALL-E prompt for a semi-abstract professional icon persona representation
// Uses personality traits for diversity while maintaining recognizability
function buildCaricaturePrompt(config: PersonaConfig): string {
  const parts: string[] = [];

  // Start with professional icon style
  parts.push('Modern professional icon avatar, semi-abstract symbolic design');

  // HEAVY WEIGHT: Enthusiasm drives the entire color scheme and energy
  let colorScheme = '';
  let backgroundStyle = '';
  if (config.enthusiasm > 80) {
    colorScheme = 'vibrant energetic colors - bright oranges, warm yellows, hot pinks, electric blues';
    backgroundStyle = 'dynamic gradient background with radial energy, bright color bursts';
  } else if (config.enthusiasm > 60) {
    colorScheme = 'bold warm colors - rich reds, golden yellows, deep purples, warm magentas';
    backgroundStyle = 'flowing gradient waves, warm color transitions';
  } else if (config.enthusiasm > 40) {
    colorScheme = 'balanced color palette - soft teals, warm corals, muted golds, gentle purples';
    backgroundStyle = 'smooth clean gradient, balanced color harmony';
  } else if (config.enthusiasm > 20) {
    colorScheme = 'cool professional tones - slate blues, soft grays, sage greens, muted lavenders';
    backgroundStyle = 'subtle atmospheric gradient, professional backdrop';
  } else {
    colorScheme = 'minimalist sophisticated palette - deep navy, charcoal, silver, slate blue';
    backgroundStyle = 'clean professional gradient, refined subtle depth';
  }

  // HEAVY WEIGHT: Confidence determines shape boldness and size
  let shapeStyle = '';
  if (config.confidence > 80) {
    shapeStyle = 'bold prominent central icon with strong defined edges, commanding geometric forms, assertive presence';
  } else if (config.confidence > 60) {
    shapeStyle = 'strong clear geometric shapes with defined structure, confident forms, solid composition';
  } else if (config.confidence > 40) {
    shapeStyle = 'balanced geometric icon with harmonious proportions, moderate sizing, approachable design';
  } else if (config.confidence > 20) {
    shapeStyle = 'gentle rounded forms, softer edges, supportive shapes, friendly proportions';
  } else {
    shapeStyle = 'minimal refined shapes, delicate forms, understated elegance, subtle presence';
  }

  // HEAVY WEIGHT: Creativity determines composition complexity
  let compositionStyle = '';
  if (config.creativityLevel > 80) {
    compositionStyle = 'creative innovative arrangement with unique elements, playful asymmetry, artistic interpretation';
  } else if (config.creativityLevel > 60) {
    compositionStyle = 'imaginative design with interesting patterns, dynamic balance, creative flair';
  } else if (config.creativityLevel > 40) {
    compositionStyle = 'thoughtfully designed with tasteful variety, balanced creativity, professional polish';
  } else if (config.creativityLevel > 20) {
    compositionStyle = 'structured organized layout with clean lines, orderly arrangement, classic design';
  } else {
    compositionStyle = 'ultra-minimalist design with extreme simplicity, essential elements only, refined elegance';
  }

  // Gender aesthetic influences (not literal)
  const gender = config.gender || 'neutral';
  let genderInfluence = '';
  if (gender === 'male') {
    genderInfluence = 'geometric angular aesthetic with structured lines';
  } else if (gender === 'female') {
    genderInfluence = 'flowing organic aesthetic with smooth curves';
  } else {
    genderInfluence = 'balanced harmonious blend of geometric and organic';
  }

  // Formality affects texture and polish
  let textureStyle = '';
  if (config.formalityLevel > 70) {
    textureStyle = 'polished professional finish, smooth surfaces, corporate quality, refined aesthetic';
  } else if (config.formalityLevel > 40) {
    textureStyle = 'semi-polished approachable finish, balanced professionalism';
  } else {
    textureStyle = 'friendly natural textures, casual approachable feel, artistic warmth';
  }

  // Technical depth affects detail complexity
  let detailLevel = '';
  if (config.technicalDepth > 70) {
    detailLevel = 'detailed intricate patterns, layered elements, sophisticated complexity';
  } else if (config.technicalDepth > 40) {
    detailLevel = 'moderate detail work with clean layering';
  } else {
    detailLevel = 'clean minimal details, simple elegant forms';
  }

  // Role-based thematic elements (recognizable symbolic icons)
  let thematicElements = '';
  if (config.jobRole && config.jobRole !== 'general') {
    const roleMap: Record<string, string> = {
      'loan-officer': 'incorporate house or key symbolism, trust and security icons',
      'processor': 'incorporate workflow arrows, organized system patterns',
      'underwriter': 'incorporate analytical symbols, balance and assessment icons',
      'manager': 'incorporate organizational hierarchy symbols, leadership badge elements',
      'executive': 'incorporate premium badge or crest, authority and excellence symbols',
    };
    thematicElements = roleMap[config.jobRole] || 'professional symbolic elements';
  }

  // Regional color influences (subtle)
  if (config.region && config.region !== 'none' && config.region !== 'national') {
    const regionColors: Record<string, string> = {
      'northeast': 'with subtle urban steel blue accents',
      'southeast': 'with warm southern sunset orange hints',
      'midwest': 'with earthy amber grain-field tones',
      'southwest': 'with desert terra-cotta and turquoise touches',
      'west': 'with golden coast sunset hues',
      'pacific-northwest': 'with deep forest green and misty gray notes',
      'mountain-west': 'with alpine blue and snow-white highlights',
    };
    colorScheme += ` ${regionColors[config.region] || ''}`;
  }

  // Build final prompt with heavy emphasis on variety
  parts.push(`DOMINANT COLOR SCHEME: ${colorScheme}`);
  parts.push(`BACKGROUND: ${backgroundStyle}`);
  parts.push(`SHAPE STYLE: ${shapeStyle}`);
  parts.push(`with ${genderInfluence}`);
  parts.push(`COMPOSITION: ${compositionStyle}`);
  parts.push(`TEXTURE: ${textureStyle}`);
  parts.push(`DETAIL LEVEL: ${detailLevel}`);

  if (thematicElements) {
    parts.push(`subtle thematic elements: ${thematicElements}`);
  }

  // Add variation seed based on config ID for uniqueness
  const idHash = config.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const variations = [
    'with crystalline geometric patterns',
    'with smooth flowing gradients',
    'with structured tessellation',
    'with organic circular motifs',
    'with clean linear elements',
    'with polished metallic accents',
    'with layered dimensional depth',
    'with radial symmetry',
    'with balanced asymmetry',
    'with refined geometric harmony',
  ];
  parts.push(variations[idHash % variations.length]);

  // Style and constraints - balanced between abstract and recognizable
  parts.push('NO HUMAN FACES, NO PEOPLE, NO PORTRAITS');
  parts.push('symbolic icon representation - semi-abstract professional design');
  parts.push('recognizable as a professional profile avatar');
  parts.push('modern icon style similar to app icons or brand logos');
  parts.push('clear centered focal point');
  parts.push('clean polished finish');
  parts.push('strong visual identity');
  parts.push('suitable for business and professional contexts');
  parts.push('high-quality digital illustration');
  parts.push('contemporary professional aesthetic');

  let prompt = parts.join(', ');

  // Trim to DALL-E's 4000 character limit
  if (prompt.length > 4000) {
    prompt = prompt.substring(0, 3997) + '...';
  }

  console.log('[DALL-E PROMPT]', prompt);
  return prompt;
}
