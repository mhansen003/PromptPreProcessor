import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { PromptConfig } from '@/lib/store';

function buildPromptFromConfig(config: PromptConfig): string {
  let prompt = 'You are an AI assistant with the following configuration:\n\n';

  // Response Style
  prompt += '## Response Style\n';

  if (config.detailLevel < 30) {
    prompt += '- Keep responses concise and to the point\n';
  } else if (config.detailLevel > 70) {
    prompt += '- Provide extremely detailed and comprehensive responses\n';
  } else {
    prompt += '- Provide moderately detailed responses\n';
  }

  if (config.formalityLevel < 30) {
    prompt += '- Use a casual, conversational tone\n';
  } else if (config.formalityLevel > 70) {
    prompt += '- Use a formal, professional tone\n';
  } else {
    prompt += '- Use a balanced, semi-formal tone\n';
  }

  if (config.technicalDepth < 30) {
    prompt += '- Explain concepts in simple, accessible terms\n';
  } else if (config.technicalDepth > 70) {
    prompt += '- Use technical terminology and provide in-depth technical explanations\n';
  } else {
    prompt += '- Balance technical accuracy with accessibility\n';
  }

  if (config.creativityLevel > 60) {
    prompt += '- Feel free to be creative and explore novel perspectives\n';
  } else if (config.creativityLevel < 40) {
    prompt += '- Stick to factual, straightforward information\n';
  }

  if (config.verbosity < 30) {
    prompt += '- Keep responses brief\n';
  } else if (config.verbosity > 70) {
    prompt += '- Provide lengthy, thorough responses\n';
  }

  // Tone
  prompt += '\n## Tone and Personality\n';

  if (config.enthusiasm > 60) {
    prompt += '- Show enthusiasm and energy in responses\n';
  }

  if (config.empathy > 60) {
    prompt += '- Be empathetic and understanding\n';
  }

  if (config.confidence < 30) {
    prompt += '- Express uncertainty when appropriate and hedge statements\n';
  } else if (config.confidence > 70) {
    prompt += '- Be confident and assertive in your responses\n';
  }

  if (config.humor > 60) {
    prompt += '- Include appropriate humor when suitable\n';
  } else if (config.humor < 30) {
    prompt += '- Maintain a serious, professional demeanor\n';
  }

  // Structure
  prompt += '\n## Response Structure\n';

  if (config.useExamples) {
    prompt += '- Include relevant examples to illustrate points\n';
  }

  if (config.useBulletPoints) {
    prompt += '- Use bullet points to organize information\n';
  }

  if (config.useNumberedLists) {
    prompt += '- Use numbered lists for sequential information\n';
  }

  if (config.includeCodeSamples) {
    prompt += '- Include code samples when relevant\n';
  }

  if (config.includeAnalogies) {
    prompt += '- Use analogies to explain complex concepts\n';
  }

  if (config.includeVisualDescriptions) {
    prompt += '- Provide visual descriptions and mental imagery\n';
  }

  // Advanced settings
  prompt += '\n## Additional Guidelines\n';

  prompt += `- Target audience: ${config.audience}\n`;
  prompt += `- Perspective: ${config.perspective}\n`;
  prompt += `- Explanation style: ${config.explanationStyle}\n`;
  prompt += `- Preferred response length: ${config.responseLength}\n`;

  if (config.prioritizeAccuracy) {
    prompt += '- Prioritize accuracy over speed\n';
  }

  if (config.prioritizeClarity) {
    prompt += '- Prioritize clarity and understandability\n';
  }

  if (config.prioritizeComprehensiveness) {
    prompt += '- Prioritize comprehensive coverage of topics\n';
  }

  if (config.customInstructions) {
    prompt += `\n## Custom Instructions\n${config.customInstructions}\n`;
  }

  if (config.customStyle) {
    prompt += `\n## Additional Style Requirements\n${config.customStyle}\n`;
  }

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const config: PromptConfig = await request.json();

    if (!process.env.OPENAI_API_KEY) {
      // If no API key, just return the built prompt
      const systemPrompt = buildPromptFromConfig(config);
      return NextResponse.json({ systemPrompt });
    }

    // Use OpenAI to enhance and optimize the prompt
    const systemPrompt = buildPromptFromConfig(config);

    // Initialize OpenAI client only when API key is available
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at crafting system prompts for AI assistants. Your task is to refine and optimize the provided prompt configuration into a clear, effective system prompt.',
        },
        {
          role: 'user',
          content: `Please refine this system prompt configuration into a clear, well-structured system prompt:\n\n${systemPrompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const refinedPrompt = completion.choices[0].message.content || systemPrompt;

    return NextResponse.json({ systemPrompt: refinedPrompt });
  } catch (error) {
    console.error('Error generating prompt:', error);

    // Fallback to basic prompt building if OpenAI fails
    const config: PromptConfig = await request.json();
    const systemPrompt = buildPromptFromConfig(config);

    return NextResponse.json({
      systemPrompt,
      warning: 'OpenAI enhancement unavailable, using basic prompt generation'
    });
  }
}
