import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { PersonaConfig } from '@/lib/store';

// POST /api/generate-samples - Generate 3 sample mortgage messages using persona config
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

    // Build a persona description from the config
    const personaPrompt = buildPersonaPrompt(config);

    // Define 3 different mortgage scenarios
    const scenarios = [
      {
        title: "First-Time Homebuyer Consultation",
        context: "A young couple in their late 20s is looking to buy their first home. They're nervous about the process and have many questions about down payments, closing costs, and what they can afford."
      },
      {
        title: "Refinance Analysis",
        context: "A homeowner who bought 3 years ago wants to refinance to get a better rate. They're wondering if it makes financial sense given current market conditions and their remaining balance."
      },
      {
        title: "Investment Property Financing",
        context: "An experienced real estate investor is looking to purchase their 4th rental property. They want to understand loan options, cash flow requirements, and strategies to maximize returns."
      }
    ];

    // Generate all 3 samples concurrently
    const samplePromises = scenarios.map(async (scenario) => {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: personaPrompt,
          },
          {
            role: 'user',
            content: `Scenario: ${scenario.title}\n\n${scenario.context}\n\nProvide your response as if you're communicating with this client. Write a brief but complete response (2-4 paragraphs) that demonstrates your communication style and expertise.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 600,
      });

      return {
        title: scenario.title,
        content: completion.choices[0].message.content || 'No response generated',
      };
    });

    const samples = await Promise.all(samplePromises);

    return NextResponse.json({
      success: true,
      samples,
      personaName: config.name,
    });
  } catch (error: any) {
    console.error('Error generating samples:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate samples',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Build a persona prompt from the configuration
function buildPersonaPrompt(config: PersonaConfig): string {
  let prompt = `You are an AI assistant configured with the following personality and communication style:\n\n`;

  // Add role context
  if (config.jobRole && config.jobRole !== 'general') {
    prompt += `**Role:** ${formatRole(config.jobRole)}`;
    if (config.yearsExperience > 0) {
      prompt += ` with ${config.yearsExperience} years of experience`;
    }
    prompt += `\n\n`;
  }

  // Add specializations
  if (config.specializations && config.specializations.length > 0) {
    prompt += `**Specializations:** ${config.specializations.join(', ')}\n\n`;
  }

  // Add communication style
  prompt += `**Communication Style:**\n`;
  prompt += `- Detail Level: ${getLevel(config.detailLevel)} (${config.detailLevel}/100)\n`;
  prompt += `- Formality: ${getLevel(config.formalityLevel)} (${config.formalityLevel}/100)\n`;
  prompt += `- Technical Depth: ${getLevel(config.technicalDepth)} (${config.technicalDepth}/100)\n`;
  prompt += `- Creativity: ${getLevel(config.creativityLevel)} (${config.creativityLevel}/100)\n`;
  prompt += `- Verbosity: ${getLevel(config.verbosity)} (${config.verbosity}/100)\n`;
  prompt += `- Enthusiasm: ${getLevel(config.enthusiasm)} (${config.enthusiasm}/100)\n`;
  prompt += `- Empathy: ${getLevel(config.empathy)} (${config.empathy}/100)\n`;
  prompt += `- Confidence: ${getLevel(config.confidence)} (${config.confidence}/100)\n`;
  prompt += `- Humor: ${getLevel(config.humor)} (${config.humor}/100)\n\n`;

  // Add structure preferences
  const structurePrefs = [];
  if (config.useExamples) structurePrefs.push('use concrete examples');
  if (config.useBulletPoints) structurePrefs.push('use bullet points for clarity');
  if (config.useNumberedLists) structurePrefs.push('use numbered lists for steps');
  if (config.includeAnalogies) structurePrefs.push('include helpful analogies');
  if (config.showThoughtProcess) structurePrefs.push('explain your reasoning');
  if (config.includeSummary) structurePrefs.push('include a summary of key points');

  if (structurePrefs.length > 0) {
    prompt += `**Structure Preferences:** ${structurePrefs.join(', ')}\n\n`;
  }

  // Add regional context
  if (config.region && config.region !== 'none') {
    prompt += `**Regional Context:** ${formatRegion(config.region)}`;
    if (config.state) {
      prompt += ` (${config.state})`;
    }
    prompt += `\n\n`;
  }

  // Add custom instructions
  if (config.customInstructions) {
    prompt += `**Additional Instructions:** ${config.customInstructions}\n\n`;
  }

  prompt += `Respond naturally according to these settings while providing helpful, accurate mortgage and financial guidance.`;

  return prompt;
}

function getLevel(value: number): string {
  if (value < 20) return 'Very Low';
  if (value < 40) return 'Low';
  if (value < 60) return 'Moderate';
  if (value < 80) return 'High';
  return 'Very High';
}

function formatRole(role: string): string {
  return role.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

function formatRegion(region: string): string {
  return region.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
