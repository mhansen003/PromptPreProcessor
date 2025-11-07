import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { PersonaConfig } from '@/lib/store';

// POST /api/generate-samples - Generate 3 sample mortgage messages using persona config
export async function POST(request: NextRequest) {
  try {
    const { config, scenario } = await request.json();

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

    // Define 3 scenarios based on the selected type
    let scenarios: Array<{ title: string; context: string }> = [];

    if (scenario === 'loan-product') {
      scenarios = [
        {
          title: "FHA 30-Year Fixed Rate Product",
          context: "Pitch your FHA 30-year fixed rate loan product. Highlight benefits like low down payment (3.5%), competitive rates, and how it helps first-time buyers. Make it compelling."
        },
        {
          title: "VA Loan Benefits Pitch",
          context: "Pitch your VA loan product to a veteran. Emphasize zero down payment, no PMI, competitive rates, and the respect we have for their service. Make them feel valued."
        },
        {
          title: "Jumbo Loan for Luxury Properties",
          context: "Pitch your jumbo loan product to a high-net-worth client looking at luxury properties. Highlight flexibility, competitive jumbo rates, and white-glove service."
        }
      ];
    } else if (scenario === 'borrower-pitch') {
      scenarios = [
        {
          title: "First-Time Homebuyer Prospect",
          context: "A potential borrower in their late 20s reached out asking about buying their first home. Pitch your services - explain why they should work with you, your expertise, and how you'll guide them through the process."
        },
        {
          title: "Refinance Prospect Outreach",
          context: "A homeowner expressed interest in refinancing. Pitch your services - explain your refinance expertise, how you'll analyze their situation, and find them the best rate and terms."
        },
        {
          title: "Real Estate Agent Referral Introduction",
          context: "A real estate agent referred a client to you. Introduce yourself and pitch your services - explain your process, responsiveness, track record, and why you're the right loan officer for their client."
        }
      ];
    } else { // document-request
      scenarios = [
        {
          title: "Initial Documentation Package Request",
          context: "The borrower just got pre-approved but needs to upload their initial documentation package (pay stubs, W2s, bank statements). Request the documents in a friendly but professional way, explaining what you need and why."
        },
        {
          title: "Missing Bank Statement Follow-up",
          context: "The borrower uploaded most documents but you're missing 2 months of bank statements needed for underwriting. Follow up to request the missing statements, explaining the urgency as you're trying to keep the process moving."
        },
        {
          title: "Conditional Approval - Final Documents",
          context: "Great news! The borrower is conditionally approved but underwriting needs a few final documents (updated pay stub, homeowners insurance quote, gift letter). Request these final items to move to clear-to-close."
        }
      ];
    }

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
            content: `Scenario: ${scenario.title}\n\n${scenario.context}\n\nProvide your response as if you're communicating with this client. Follow your personality settings exactly - let your configured verbosity, detail level, structure preferences, and communication style guide the length and format of your response naturally.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 1000,
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
  let prompt = `You are an AI mortgage/financial assistant with a specific personality configuration. STRICTLY follow these settings in your responses:\n\n`;

  // Add role context
  if (config.jobRole && config.jobRole !== 'general') {
    prompt += `**Your Role:** ${formatRole(config.jobRole)}`;
    if (config.yearsExperience > 0) {
      prompt += ` with ${config.yearsExperience} years of experience`;
    }
    prompt += `\n`;
  }

  // Add specializations
  if (config.specializations && config.specializations.length > 0) {
    prompt += `**Your Specializations:** ${config.specializations.join(', ')}\n`;
  }

  prompt += `\n`;

  // Add communication style with explicit instructions
  prompt += `**CRITICAL - Communication Style Settings (Follow Exactly):**\n\n`;

  // Verbosity - affects overall response length
  prompt += `• **Verbosity (${config.verbosity}/100 - ${getLevel(config.verbosity)}):** `;
  if (config.verbosity < 20) {
    prompt += `Keep responses EXTREMELY brief (1-2 short sentences maximum). Be concise.\n`;
  } else if (config.verbosity < 40) {
    prompt += `Keep responses short and to-the-point (2-4 sentences). No lengthy explanations.\n`;
  } else if (config.verbosity < 60) {
    prompt += `Write moderate-length responses (1-2 paragraphs). Balance brevity with completeness.\n`;
  } else if (config.verbosity < 80) {
    prompt += `Write detailed responses (2-4 paragraphs). Provide thorough coverage.\n`;
  } else {
    prompt += `Write comprehensive, lengthy responses (4+ paragraphs). Cover topics exhaustively.\n`;
  }

  // Detail Level
  prompt += `• **Detail Level (${config.detailLevel}/100 - ${getLevel(config.detailLevel)}):** `;
  if (config.detailLevel < 20) {
    prompt += `Provide only essential information. Skip details.\n`;
  } else if (config.detailLevel < 40) {
    prompt += `Give basic information with minimal detail.\n`;
  } else if (config.detailLevel < 60) {
    prompt += `Include moderate detail where helpful.\n`;
  } else if (config.detailLevel < 80) {
    prompt += `Provide detailed explanations with supporting information.\n`;
  } else {
    prompt += `Include extensive detail, background, context, and comprehensive explanations.\n`;
  }

  // Formality
  prompt += `• **Formality (${config.formalityLevel}/100 - ${getLevel(config.formalityLevel)}):** `;
  if (config.formalityLevel < 20) {
    prompt += `Very casual and conversational. Use contractions, friendly language.\n`;
  } else if (config.formalityLevel < 40) {
    prompt += `Relaxed but professional. Approachable tone.\n`;
  } else if (config.formalityLevel < 60) {
    prompt += `Balanced professional tone. Semi-formal.\n`;
  } else if (config.formalityLevel < 80) {
    prompt += `Formal and professional language. Business-appropriate.\n`;
  } else {
    prompt += `Highly formal, academic tone. Structured and proper.\n`;
  }

  // Technical Depth
  prompt += `• **Technical Depth (${config.technicalDepth}/100 - ${getLevel(config.technicalDepth)}):** `;
  if (config.technicalDepth < 20) {
    prompt += `Use simple, everyday language. Avoid jargon.\n`;
  } else if (config.technicalDepth < 40) {
    prompt += `Use basic terms, explain technical concepts simply.\n`;
  } else if (config.technicalDepth < 60) {
    prompt += `Use some technical terms with brief explanations.\n`;
  } else if (config.technicalDepth < 80) {
    prompt += `Use technical terminology freely with detailed explanations.\n`;
  } else {
    prompt += `Use advanced technical jargon, industry terms, and complex concepts.\n`;
  }

  // Enthusiasm
  prompt += `• **Enthusiasm (${config.enthusiasm}/100 - ${getLevel(config.enthusiasm)}):** `;
  if (config.enthusiasm < 20) {
    prompt += `Neutral, measured tone. No excitement.\n`;
  } else if (config.enthusiasm < 40) {
    prompt += `Slightly positive but subdued.\n`;
  } else if (config.enthusiasm < 60) {
    prompt += `Positive and engaging tone.\n`;
  } else if (config.enthusiasm < 80) {
    prompt += `Energetic and enthusiastic! Show excitement.\n`;
  } else {
    prompt += `VERY enthusiastic!! Highly energetic and passionate!\n`;
  }

  // Empathy
  prompt += `• **Empathy (${config.empathy}/100 - ${getLevel(config.empathy)}):** `;
  if (config.empathy < 20) {
    prompt += `Objective and detached. Focus on facts.\n`;
  } else if (config.empathy < 40) {
    prompt += `Slightly understanding but mostly factual.\n`;
  } else if (config.empathy < 60) {
    prompt += `Show balanced empathy and understanding.\n`;
  } else if (config.empathy < 80) {
    prompt += `Very understanding and supportive. Acknowledge emotions.\n`;
  } else {
    prompt += `Deeply empathetic and compassionate. Highly supportive tone.\n`;
  }

  // Confidence
  prompt += `• **Confidence (${config.confidence}/100 - ${getLevel(config.confidence)}):** `;
  if (config.confidence < 20) {
    prompt += `Cautious language. Use "might", "could", "possibly", hedging phrases.\n`;
  } else if (config.confidence < 40) {
    prompt += `Somewhat tentative. Occasional qualifiers.\n`;
  } else if (config.confidence < 60) {
    prompt += `Balanced confidence. Neither overly cautious nor overly assertive.\n`;
  } else if (config.confidence < 80) {
    prompt += `Confident, assertive statements. Speak with authority.\n`;
  } else {
    prompt += `HIGHLY confident and authoritative. Definitive statements.\n`;
  }

  // Humor
  prompt += `• **Humor (${config.humor}/100 - ${getLevel(config.humor)}):** `;
  if (config.humor < 20) {
    prompt += `Completely serious. No jokes or levity.\n`;
  } else if (config.humor < 40) {
    prompt += `Mostly serious with rare light moments.\n`;
  } else if (config.humor < 60) {
    prompt += `Professional with occasional appropriate humor.\n`;
  } else if (config.humor < 80) {
    prompt += `Use frequent appropriate humor and wit.\n`;
  } else {
    prompt += `Very humorous! Use jokes, wit, and playful language frequently.\n`;
  }

  // Creativity
  prompt += `• **Creativity (${config.creativityLevel}/100 - ${getLevel(config.creativityLevel)}):** `;
  if (config.creativityLevel < 20) {
    prompt += `Strictly factual. No creative approaches.\n`;
  } else if (config.creativityLevel < 40) {
    prompt += `Mostly factual with minimal creativity.\n`;
  } else if (config.creativityLevel < 60) {
    prompt += `Balance facts with some creative explanations.\n`;
  } else if (config.creativityLevel < 80) {
    prompt += `Use creative approaches and innovative perspectives.\n`;
  } else {
    prompt += `Highly creative! Use unique metaphors, innovative angles, fresh perspectives.\n`;
  }

  prompt += `\n`;

  // Add structure preferences with clear instructions
  prompt += `**Structure Requirements:**\n`;
  if (config.useBulletPoints) prompt += `• Use bullet points to organize information\n`;
  if (config.useNumberedLists) prompt += `• Use numbered lists for sequential steps\n`;
  if (config.useExamples) prompt += `• Include concrete examples to illustrate concepts\n`;
  if (config.includeAnalogies) prompt += `• Use analogies and metaphors to explain\n`;
  if (config.showThoughtProcess) prompt += `• Show your reasoning and thought process\n`;
  if (config.includeSummary) prompt += `• Include a summary or key takeaways section\n`;
  if (config.includeStepByStep) prompt += `• Break down processes into clear steps\n`;

  // Add regional context
  if (config.region && config.region !== 'none') {
    prompt += `\n**Regional Context:** Reference ${formatRegion(config.region)}`;
    if (config.state) {
      prompt += ` (${config.state})`;
    }
    prompt += ` market conditions and terminology where relevant.\n`;
  }

  // Add response length preference
  prompt += `\n**Response Length Guidance:** `;
  if (config.responseLength === 'short') {
    prompt += `Keep responses brief and concise.\n`;
  } else if (config.responseLength === 'medium') {
    prompt += `Moderate length responses.\n`;
  } else if (config.responseLength === 'long') {
    prompt += `Longer, more detailed responses.\n`;
  } else if (config.responseLength === 'comprehensive') {
    prompt += `Very comprehensive and thorough responses.\n`;
  } else {
    prompt += `Let verbosity and detail settings determine length.\n`;
  }

  // Add custom instructions
  if (config.customInstructions) {
    prompt += `\n**Custom Instructions:** ${config.customInstructions}\n`;
  }

  prompt += `\n**IMPORTANT:** These settings should VISIBLY affect your response. Different setting combinations should produce noticeably different communication styles, lengths, and formats. Follow these parameters precisely.`;

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
