import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { PromptConfig } from '@/lib/store';

// POST /api/analyze-interview - Analyze interview answers and create personality config
export async function POST(request: NextRequest) {
  try {
    const { name, answers } = await request.json();

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Build prompt for GPT-4 to analyze answers and configure personality
    const analysisPrompt = `You are an AI personality configuration expert. Analyze the following user interview answers and create a personality configuration.

**Interview Questions & Answers:**

1. **Purpose:** ${answers[0]}
2. **Target Audience:** ${answers[1]}
3. **Tone & Style:** ${answers[2]}
4. **Response Preference:** ${answers[3]}
5. **Special Requirements:** ${answers[4]}

**Your Task:**
Based on these answers, configure all personality settings. Return a JSON object with the following structure:

{
  "detailLevel": 0-100,
  "formalityLevel": 0-100,
  "technicalDepth": 0-100,
  "creativityLevel": 0-100,
  "verbosity": 0-100,
  "enthusiasm": 0-100,
  "empathy": 0-100,
  "confidence": 0-100,
  "humor": 0-100,
  "industryKnowledge": 0-100,
  "useExamples": boolean,
  "useBulletPoints": boolean,
  "useNumberedLists": boolean,
  "includeCodeSamples": boolean,
  "includeAnalogies": boolean,
  "includeVisualDescriptions": boolean,
  "includeTables": boolean,
  "includeSnippets": boolean,
  "includeExternalReferences": boolean,
  "showThoughtProcess": boolean,
  "includeStepByStep": boolean,
  "includeSummary": boolean,
  "responseLength": "auto" | "short" | "medium" | "long" | "comprehensive",
  "perspective": "1st-person" | "2nd-person" | "3rd-person" | "mixed",
  "audience": "gen-z" | "millennial" | "gen-x" | "boomer" | "senior" | "mixed",
  "explanationStyle": "direct" | "socratic" | "narrative" | "analytical",
  "prioritizeAccuracy": boolean,
  "prioritizeSpeed": boolean,
  "prioritizeClarity": boolean,
  "prioritizeComprehensiveness": boolean,
  "customInstructions": "string",
  "emoji": "single emoji that represents the personality"
}

**Guidelines:**
- **detailLevel**: How detailed should responses be? (0=very concise, 100=extremely detailed)
- **formalityLevel**: How formal? (0=very casual, 100=very formal)
- **technicalDepth**: How technical? (0=simple language, 100=highly technical)
- **creativityLevel**: How creative? (0=factual only, 100=very creative)
- **verbosity**: Response length? (0=brief, 100=lengthy)
- **industryKnowledge**: Assume user knows industry terms? (0=explain everything, 100=use acronyms freely)
- **enthusiasm**: How enthusiastic? (0=neutral, 100=very enthusiastic)
- **empathy**: How empathetic? (0=objective, 100=very empathetic)
- **confidence**: How confident? (0=cautious/hedging, 100=assertive)
- **humor**: How humorous? (0=serious, 100=very humorous)
- **useExamples**: Should responses include examples?
- **useBulletPoints**: Should responses use bullet points?
- **useNumberedLists**: Should responses use numbered lists?
- **includeCodeSamples**: Should responses include code (for technical topics)?
- **includeAnalogies**: Should responses use analogies?
- **includeVisualDescriptions**: Should responses include visual descriptions?
- **includeTables**: Should responses use tables?
- **includeSnippets**: Should responses highlight key snippets?
- **includeExternalReferences**: Should responses reference external resources?
- **showThoughtProcess**: Should responses show internal reasoning (chain of thought)?
- **includeStepByStep**: Should responses break down into step-by-step instructions?
- **includeSummary**: Should responses include summary sections?
- **responseLength**: Preferred overall length
- **perspective**: Narrative perspective (1st="I", 2nd="you", 3rd="they", mixed)
- **audience**: Target demographic based on their description
- **explanationStyle**: How to explain concepts
- **prioritizeAccuracy**: Emphasize accuracy over speed?
- **prioritizeSpeed**: Emphasize quick responses?
- **prioritizeClarity**: Emphasize clarity and understandability?
- **prioritizeComprehensiveness**: Emphasize comprehensive coverage?
- **customInstructions**: 1-2 sentences summarizing the personality's core purpose and behavior
- **emoji**: A single emoji that best represents this personality (e.g., 🎓 for teacher, 💻 for coder, 📊 for analyst)

Return ONLY valid JSON, no additional text.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an AI configuration expert. Analyze user requirements and return precise personality configurations as JSON. Return only valid JSON with no additional commentary.',
        },
        {
          role: 'user',
          content: analysisPrompt,
        },
      ],
      temperature: 0.3, // Lower temperature for more consistent configurations
      response_format: { type: 'json_object' }, // Ensure JSON response
    });

    const configData = JSON.parse(completion.choices[0].message.content || '{}');

    // Build complete PromptConfig object
    const newConfig: PromptConfig = {
      id: Date.now().toString(),
      name: name || 'Custom Personality',
      emoji: configData.emoji || '⚙️',
      createdAt: new Date().toISOString(),

      // Response Style
      detailLevel: configData.detailLevel ?? 50,
      formalityLevel: configData.formalityLevel ?? 50,
      technicalDepth: configData.technicalDepth ?? 50,
      creativityLevel: configData.creativityLevel ?? 30,
      verbosity: configData.verbosity ?? 50,

      // Tone & Personality
      enthusiasm: configData.enthusiasm ?? 50,
      empathy: configData.empathy ?? 50,
      confidence: configData.confidence ?? 70,
      humor: configData.humor ?? 20,

      // Response Structure
      useExamples: configData.useExamples ?? true,
      useBulletPoints: configData.useBulletPoints ?? true,
      useNumberedLists: configData.useNumberedLists ?? false,
      includeCodeSamples: configData.includeCodeSamples ?? false,
      includeAnalogies: configData.includeAnalogies ?? false,
      includeVisualDescriptions: configData.includeVisualDescriptions ?? false,
      includeTables: configData.includeTables ?? false,
      includeSnippets: configData.includeSnippets ?? false,
      includeExternalReferences: configData.includeExternalReferences ?? false,
      showThoughtProcess: configData.showThoughtProcess ?? false,
      includeStepByStep: configData.includeStepByStep ?? false,
      includeSummary: configData.includeSummary ?? false,

      // Advanced Settings
      responseLength: configData.responseLength || 'auto',
      perspective: configData.perspective || '2nd-person',
      audience: configData.audience || 'mixed',
      explanationStyle: configData.explanationStyle || 'direct',
      industryKnowledge: configData.industryKnowledge ?? 50,

      // Focus Areas
      prioritizeAccuracy: configData.prioritizeAccuracy ?? true,
      prioritizeSpeed: configData.prioritizeSpeed ?? false,
      prioritizeClarity: configData.prioritizeClarity ?? true,
      prioritizeComprehensiveness: configData.prioritizeComprehensiveness ?? false,

      // Custom Instructions
      customInstructions: configData.customInstructions || '',
      customStyle: '',
    };

    return NextResponse.json({
      success: true,
      config: newConfig,
    });
  } catch (error: any) {
    console.error('Error analyzing interview:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze interview',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
