import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { PromptConfig } from '@/lib/store';

function buildPromptFromConfig(config: PromptConfig): string {
  let prompt = `# Pre-Prompt Builder - Meta-Instruction Generator

This tool is a **Pre-Prompt Builder**. Its purpose is to generate meta-instructions — a "prompt about how to make prompts." The output from this tool is not meant to answer a question directly; instead, it defines how another AI should behave when generating responses for users.

When a user interacts with this tool, their selections (like tone, formality, creativity, empathy, etc.) should be interpreted as **behavioral parameters** — instructions that describe the personality, structure, and communication style of the AI that will later use this configuration.

The output of this tool should be a clear, structured description (in text or JSON form) of how the next AI should construct its responses. It should summarize the intended **response style**, **tone and personality**, **response structure**, and **advanced settings**.

For example:

* The pre-prompt might describe whether responses should be formal or casual, brief or detailed, factual or creative.
* It might specify if the AI should include examples, analogies, humor, summaries, or visual descriptions.
* It might define the AI's empathy, confidence, and enthusiasm levels, or the preferred perspective (first-person, third-person, etc.).

The tool's output should include both:

1. A **human-readable summary** (for the user to understand the personality and tone being configured).
2. A **machine-readable version** (so another AI can interpret and apply these behaviors automatically).

In short, this tool's job is to **generate a pre-prompt that tells another AI how to think, write, and respond** — not to generate those responses itself.

---

## Configuration Parameters (0-100 scales)

### Response Style Controls
- Detail Level: ${config.detailLevel}/100 (0=Concise, 100=Extremely Detailed)
- Formality Level: ${config.formalityLevel}/100 (0=Casual, 100=Formal)
- Technical Depth: ${config.technicalDepth}/100 (0=Simple, 100=Highly Technical)
- Creativity Level: ${config.creativityLevel}/100 (0=Factual, 100=Creative)
- Verbosity: ${config.verbosity}/100 (0=Brief, 100=Lengthy)

### Tone Controls
- Enthusiasm: ${config.enthusiasm}/100 (0=Neutral, 100=Enthusiastic)
- Empathy: ${config.empathy}/100 (0=Objective, 100=Empathetic)
- Confidence: ${config.confidence}/100 (0=Cautious, 100=Assertive)
- Humor: ${config.humor}/100 (0=Serious, 100=Humorous)

### Industry Knowledge
- Industry Knowledge: ${config.industryKnowledge}/100 (0=Explain All Terms, 100=Use Acronyms Freely)

### Structure Controls (Enabled/Disabled)
- Use Examples: ${config.useExamples ? 'Yes' : 'No'}
- Use Bullet Points: ${config.useBulletPoints ? 'Yes' : 'No'}
- Use Numbered Lists: ${config.useNumberedLists ? 'Yes' : 'No'}
- Include Code Samples: ${config.includeCodeSamples ? 'Yes' : 'No'}
- Include Analogies: ${config.includeAnalogies ? 'Yes' : 'No'}
- Include Visual Descriptions: ${config.includeVisualDescriptions ? 'Yes' : 'No'}
- Include Tables: ${config.includeTables ? 'Yes' : 'No'}
- Include Snippets: ${config.includeSnippets ? 'Yes' : 'No'}
- Include External References: ${config.includeExternalReferences ? 'Yes' : 'No'}
- Show Thought Process: ${config.showThoughtProcess ? 'Yes' : 'No'}
- Include Step-by-Step: ${config.includeStepByStep ? 'Yes' : 'No'}
- Include Summary: ${config.includeSummary ? 'Yes' : 'No'}

### Advanced Settings
- Response Length: ${config.responseLength}
- Perspective: ${config.perspective}
- Target Audience: ${config.audience}
- Explanation Style: ${config.explanationStyle}
- Prioritize Accuracy: ${config.prioritizeAccuracy ? 'Yes' : 'No'}
- Prioritize Speed: ${config.prioritizeSpeed ? 'Yes' : 'No'}
- Prioritize Clarity: ${config.prioritizeClarity ? 'Yes' : 'No'}
- Prioritize Comprehensiveness: ${config.prioritizeComprehensiveness ? 'Yes' : 'No'}

${config.customInstructions ? `### Custom Instructions\n${config.customInstructions}\n` : ''}
${config.customStyle ? `### Additional Style Requirements\n${config.customStyle}\n` : ''}

---

## Response Style Interpretation\n`;

  if (config.detailLevel < 30) {
    prompt += '- Keep responses concise and to the point\n';
  } else if (config.detailLevel > 70) {
    prompt += '- Provide extremely detailed and comprehensive responses\n';
  } else {
    prompt += '- Provide moderately detailed responses\n';
  }

  if (config.formalityLevel < 30) {
    prompt += '- Use casual, conversational tone\n';
  } else if (config.formalityLevel > 70) {
    prompt += '- Use formal, professional tone\n';
  } else {
    prompt += '- Use balanced, semi-formal tone\n';
  }

  if (config.technicalDepth < 30) {
    prompt += '- Explain concepts in simple, accessible terms\n';
  } else if (config.technicalDepth > 70) {
    prompt += '- Use technical terminology and provide in-depth technical explanations\n';
  } else {
    prompt += '- Balance technical accuracy with accessibility\n';
  }

  if (config.creativityLevel > 60) {
    prompt += '- Be creative and explore novel perspectives\n';
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
    prompt += '- Show enthusiasm and energy\n';
  }

  if (config.empathy > 60) {
    prompt += '- Be empathetic and understanding\n';
  }

  if (config.confidence < 30) {
    prompt += '- Express uncertainty when appropriate and hedge statements\n';
  } else if (config.confidence > 70) {
    prompt += '- Be confident and assertive\n';
  }

  if (config.humor > 60) {
    prompt += '- Include appropriate humor when suitable\n';
  } else if (config.humor < 30) {
    prompt += '- Maintain serious, professional demeanor\n';
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

  if (config.includeTables) {
    prompt += '- Include data tables when presenting structured information\n';
  }

  if (config.includeSnippets) {
    prompt += '- Extract and highlight key snippets or quotes\n';
  }

  if (config.includeExternalReferences) {
    prompt += '- Reference external resources and documentation when relevant\n';
  }

  if (config.showThoughtProcess) {
    prompt += '- Show internal reasoning and thought process (Chain of Thought)\n';
  }

  if (config.includeStepByStep) {
    prompt += '- Break down processes into clear step-by-step instructions\n';
  }

  if (config.includeSummary) {
    prompt += '- Include summary sections for key points\n';
  }

  // Industry Knowledge
  if (config.industryKnowledge < 30) {
    prompt += '- Explain all industry terms and acronyms in full (e.g., "Annual Percentage Rate" not "APR")\n';
  } else if (config.industryKnowledge > 70) {
    prompt += '- Use industry acronyms and terminology freely (e.g., "APR", "LTV", "DTI", "ARM")\n';
  } else {
    prompt += '- Balance industry terminology with explanations\n';
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

    // Always build the basic prompt first
    const systemPrompt = buildPromptFromConfig(config);

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      // If no API key, just return the built prompt
      return NextResponse.json({ systemPrompt });
    }

    // Use OpenAI to enhance and optimize the prompt

    // Initialize OpenAI client only when API key is available
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert at crafting meta-instructions and behavioral guidelines. Your role is to convert configuration parameters into a comprehensive pre-prompt that defines communication behaviors.

Remember: You are NOT generating responses to user questions. You are generating instructions that define HOW responses should be structured and delivered.

Your output should include:
1. Direct behavioral guidelines (avoid phrases like "you are" or "as an assistant")
2. Specific instructions based on the numeric parameters provided
3. Clear guidelines about structure, tone, and content approach

Transform the configuration into well-structured behavioral guidelines. Use imperative language (e.g., "Use formal tone", "Include examples") rather than second-person descriptions (e.g., "You should use formal tone").`,
        },
        {
          role: 'user',
          content: `Based on the configuration parameters below, generate comprehensive behavioral guidelines that define communication style and approach. Use direct, imperative language without "you are" or "as an assistant" framing.

Configuration:
${systemPrompt}

Please create refined, professional behavioral guidelines that capture all these parameters. Focus on WHAT to do, not WHO is doing it.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const refinedPrompt = completion.choices[0].message.content || systemPrompt;

    return NextResponse.json({ systemPrompt: refinedPrompt });
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
