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
// Uses HEAVY weighting of personality traits for maximum diversity
function buildCaricaturePrompt(config: PersonaConfig): string {
  const parts: string[] = [];

  // Start with abstract art style
  parts.push('Abstract artistic avatar');

  // HEAVY WEIGHT: Enthusiasm drives the entire color scheme and energy
  let colorScheme = '';
  let backgroundStyle = '';
  if (config.enthusiasm > 80) {
    colorScheme = 'EXPLOSIVE vibrant neon colors - electric pinks, vivid cyans, blazing oranges, hot magentas';
    backgroundStyle = 'dynamic radiating energy bursts, swirling particles, high-contrast gradients';
  } else if (config.enthusiasm > 60) {
    colorScheme = 'bold saturated warm colors - deep reds, bright yellows, rich purples, warm magentas';
    backgroundStyle = 'flowing color waves, energetic sweeps, layered gradients';
  } else if (config.enthusiasm > 40) {
    colorScheme = 'balanced color palette - soft teals, warm corals, muted golds, gentle purples';
    backgroundStyle = 'smooth gradient transitions, subtle color shifts';
  } else if (config.enthusiasm > 20) {
    colorScheme = 'cool muted tones - slate blues, soft grays, sage greens, dusty lavenders';
    backgroundStyle = 'gentle fog-like gradients, misty atmospheric effects';
  } else {
    colorScheme = 'minimalist monochromatic palette - deep navy, charcoal, silver, slate';
    backgroundStyle = 'stark clean background with subtle depth, professional gradient';
  }

  // HEAVY WEIGHT: Confidence determines shape boldness and size
  let shapeStyle = '';
  if (config.confidence > 80) {
    shapeStyle = 'MASSIVE DOMINANT central geometric form with sharp aggressive angles, commanding presence, oversized bold shapes';
  } else if (config.confidence > 60) {
    shapeStyle = 'strong prominent geometric shapes with defined edges, assertive forms, clear structure';
  } else if (config.confidence > 40) {
    shapeStyle = 'balanced mix of geometric and organic shapes, moderate sizing, harmonious proportions';
  } else if (config.confidence > 20) {
    shapeStyle = 'soft gentle curves, smaller supportive shapes, delicate forms, subtle patterns';
  } else {
    shapeStyle = 'minimal understated shapes, fine lines, whisper-soft forms, gentle presence';
  }

  // HEAVY WEIGHT: Creativity determines composition complexity
  let compositionStyle = '';
  if (config.creativityLevel > 80) {
    compositionStyle = 'WILDLY EXPERIMENTAL layout - chaotic asymmetry, unexpected elements, surreal combinations, breaking traditional composition rules';
  } else if (config.creativityLevel > 60) {
    compositionStyle = 'highly creative arrangement - dynamic asymmetry, playful element placement, innovative patterns, artistic flair';
  } else if (config.creativityLevel > 40) {
    compositionStyle = 'moderately creative design - interesting balance, tasteful variety, thoughtful arrangement';
  } else if (config.creativityLevel > 20) {
    compositionStyle = 'structured organized layout - clean lines, predictable patterns, orderly arrangement';
  } else {
    compositionStyle = 'ultra-minimalist composition - extreme simplicity, single focal point, bare essentials';
  }

  // Gender aesthetic influences (not literal)
  const gender = config.gender || 'neutral';
  let genderInfluence = '';
  if (gender === 'male') {
    genderInfluence = 'angular hard-edged geometric bias, straight lines and sharp corners';
  } else if (gender === 'female') {
    genderInfluence = 'flowing curved organic bias, smooth arcs and circular motifs';
  } else {
    genderInfluence = 'balanced geometric and organic fusion, harmonious blend';
  }

  // Formality affects texture and polish
  let textureStyle = '';
  if (config.formalityLevel > 70) {
    textureStyle = 'ultra-polished smooth surfaces, glass-like finish, professional sheen, corporate precision';
  } else if (config.formalityLevel > 40) {
    textureStyle = 'semi-polished surfaces with some texture, approachable finish';
  } else {
    textureStyle = 'organic textures, hand-crafted feel, artistic imperfections, natural materials';
  }

  // Technical depth affects detail complexity
  let detailLevel = '';
  if (config.technicalDepth > 70) {
    detailLevel = 'INTRICATE micro-patterns, layered complexity, fine details, nested elements, mathematical precision';
  } else if (config.technicalDepth > 40) {
    detailLevel = 'moderate detail work, some layering, balanced complexity';
  } else {
    detailLevel = 'minimal details, clean surfaces, simple forms';
  }

  // Role-based thematic elements (abstract symbols)
  let thematicElements = '';
  if (config.jobRole && config.jobRole !== 'general') {
    const roleMap: Record<string, string> = {
      'loan-officer': 'abstract currency symbols, flowing transaction lines, trust motifs',
      'processor': 'interconnected data nodes, pipeline structures, systematic patterns',
      'underwriter': 'analytical grids, risk assessment symbols, balanced scales motifs',
      'manager': 'hierarchical structures, organizational patterns, leadership arrows',
      'executive': 'executive crown motifs, premium luxury elements, authority symbols',
    };
    thematicElements = roleMap[config.jobRole] || 'professional abstract motifs';
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
    'with crystalline structures',
    'with fluid dynamics',
    'with fractal patterns',
    'with geometric tessellation',
    'with organic growth patterns',
    'with technological circuitry motifs',
    'with liquid metal effects',
    'with particle systems',
    'with wave interference patterns',
    'with molecular structures',
  ];
  parts.push(variations[idHash % variations.length]);

  // Critical constraints
  parts.push('NO HUMAN FACES, NO PEOPLE, NO PORTRAITS, NO CHARACTERS');
  parts.push('abstract symbolic representation only');
  parts.push('suitable for profile avatar');
  parts.push('professional icon style');
  parts.push('centered focal point');
  parts.push('1024x1024 square format');
  parts.push('high contrast for visibility');
  parts.push('modern digital art aesthetic');

  let prompt = parts.join(', ');

  // Trim to DALL-E's 4000 character limit
  if (prompt.length > 4000) {
    prompt = prompt.substring(0, 3997) + '...';
  }

  console.log('[DALL-E PROMPT]', prompt);
  return prompt;
}
