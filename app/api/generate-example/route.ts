import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// POST /api/generate-example - Generate example text demonstrating a control setting
export async function POST(request: NextRequest) {
  try {
    const { controlType, controlName, controlValue, controlDescription } = await request.json();

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    // Build prompt for generating example
    let examplePrompt = '';

    if (controlType === 'slider') {
      const valueDesc = controlValue < 20 ? 'Very Low' :
                        controlValue < 40 ? 'Low' :
                        controlValue < 60 ? 'Moderate' :
                        controlValue < 80 ? 'High' : 'Very High';

      examplePrompt = `Generate a sample paragraph demonstrating the "${controlName}" setting at ${controlValue}/100 (${valueDesc}).

**Control:** ${controlName}
**Description:** ${controlDescription || 'N/A'}
**Current Value:** ${controlValue}/100
**Value Level:** ${valueDesc}

**Your Task:**
Write a single paragraph (3-5 sentences) on the topic "How to choose a mortgage loan" that demonstrates this specific ${controlName} setting. Make the paragraph clearly reflect the ${valueDesc} level of ${controlName}.

For example:
- If ${controlName} is "Detail Level" at ${controlValue}, make the response ${valueDesc === 'Very Low' ? 'extremely brief and to-the-point' : valueDesc === 'Low' ? 'concise but informative' : valueDesc === 'Moderate' ? 'balanced with moderate detail' : valueDesc === 'High' ? 'detailed with thorough explanations' : 'extremely comprehensive with exhaustive detail'}.
- If ${controlName} is "Formality Level" at ${controlValue}, use ${valueDesc === 'Very Low' ? 'very casual, conversational language' : valueDesc === 'Low' ? 'relaxed, friendly language' : valueDesc === 'Moderate' ? 'semi-formal business language' : valueDesc === 'High' ? 'professional, formal language' : 'highly formal, academic language'}.
- If ${controlName} is "Technical Depth" at ${controlValue}, use ${valueDesc === 'Very Low' ? 'simple, everyday language' : valueDesc === 'Low' ? 'minimal technical terms' : valueDesc === 'Moderate' ? 'some technical terms with brief explanations' : valueDesc === 'High' ? 'technical terminology with detailed explanations' : 'advanced technical jargon and in-depth analysis'}.
- If ${controlName} is "Enthusiasm" at ${controlValue}, show ${valueDesc === 'Very Low' ? 'neutral, measured tone' : valueDesc === 'Low' ? 'mild interest' : valueDesc === 'Moderate' ? 'positive, engaging tone' : valueDesc === 'High' ? 'energetic, enthusiastic tone' : 'extremely excited, passionate tone'}.
- If ${controlName} is "Empathy" at ${controlValue}, demonstrate ${valueDesc === 'Very Low' ? 'objective, detached tone' : valueDesc === 'Low' ? 'slightly understanding tone' : valueDesc === 'Moderate' ? 'balanced empathy' : valueDesc === 'High' ? 'very understanding and supportive' : 'deeply empathetic and compassionate'}.
- If ${controlName} is "Confidence" at ${controlValue}, show ${valueDesc === 'Very Low' ? 'cautious, hedging language ("might", "could", "possibly")' : valueDesc === 'Low' ? 'somewhat tentative' : valueDesc === 'Moderate' ? 'balanced confidence' : valueDesc === 'High' ? 'confident, assertive statements' : 'extremely confident, authoritative tone'}.

Return ONLY the paragraph, no labels or commentary.`;
    } else if (controlType === 'toggle') {
      examplePrompt = `Generate a sample paragraph demonstrating the "${controlName}" toggle in ${controlValue ? 'ON' : 'OFF'} state.

**Control:** ${controlName}
**Description:** ${controlDescription || 'N/A'}
**Current State:** ${controlValue ? 'ENABLED' : 'DISABLED'}

**Your Task:**
Write a paragraph (3-5 sentences) on the topic "How to choose a mortgage loan" that ${controlValue ? 'includes' : 'avoids'} the feature "${controlName}".

For example:
- If "${controlName}" is "Examples" and is ${controlValue ? 'ON' : 'OFF'}, ${controlValue ? 'include concrete examples to illustrate concepts' : 'explain concepts without using examples'}.
- If "${controlName}" is "Bullet Points" and is ${controlValue ? 'ON' : 'OFF'}, ${controlValue ? 'format key information as bullet points' : 'write in flowing paragraph form without bullets'}.
- If "${controlName}" is "Analogies" and is ${controlValue ? 'ON' : 'OFF'}, ${controlValue ? 'use analogies to explain concepts' : 'explain directly without analogies'}.
- If "${controlName}" is "Step-by-Step" and is ${controlValue ? 'ON' : 'OFF'}, ${controlValue ? 'break down information into numbered steps' : 'present information holistically'}.

Return ONLY the paragraph/formatted text, no labels or commentary.`;
    } else if (controlType === 'select') {
      examplePrompt = `Generate a sample paragraph demonstrating the "${controlName}" setting at value "${controlValue}".

**Control:** ${controlName}
**Description:** ${controlDescription || 'N/A'}
**Current Value:** ${controlValue}

**Your Task:**
Write a paragraph (3-5 sentences) on the topic "How to choose a mortgage loan" that reflects the ${controlValue} setting for ${controlName}.

For example:
- If "${controlName}" is "Response Length" at "${controlValue}", write a response that is ${controlValue === 'short' ? 'very brief (1-2 sentences)' : controlValue === 'medium' ? 'moderate length (3-4 sentences)' : controlValue === 'long' ? 'longer (5-6 sentences)' : controlValue === 'comprehensive' ? 'very thorough (7+ sentences)' : 'appropriately sized for the question'}.
- If "${controlName}" is "Perspective" at "${controlValue}", use ${controlValue === '1st-person' ? 'first person (I/we)' : controlValue === '2nd-person' ? 'second person (you)' : controlValue === '3rd-person' ? 'third person (they/it)' : 'a natural mix of perspectives'}.
- If "${controlName}" is "Explanation Style" at "${controlValue}", use ${controlValue === 'direct' ? 'straightforward, direct explanations' : controlValue === 'socratic' ? 'questions to guide understanding' : controlValue === 'narrative' ? 'story-based examples' : 'data-driven analysis with facts'}.

Return ONLY the paragraph, no labels or commentary.`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Fast, efficient model for quick results
      messages: [
        {
          role: 'system',
          content: 'You are an expert at demonstrating different communication styles. Generate clear examples that perfectly illustrate the requested setting. Return ONLY the example text, no labels, no commentary, no introduction.',
        },
        {
          role: 'user',
          content: examplePrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const exampleText = completion.choices[0].message.content || '';

    return NextResponse.json({
      success: true,
      exampleText: exampleText.trim(),
      controlName,
      controlValue,
    });
  } catch (error: any) {
    console.error('Error generating example:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate example',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
