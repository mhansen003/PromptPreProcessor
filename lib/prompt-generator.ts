import type { PromptConfig } from '@/lib/store';
import OpenAI from 'openai';

function getValueDescription(value: number): string {
  if (value < 20) return 'Very Low';
  if (value < 40) return 'Low';
  if (value < 60) return 'Moderate';
  if (value < 80) return 'High';
  return 'Very High';
}

export function buildPromptFromConfig(config: PromptConfig): string {
  const prompt = `## 🧩 Pre-Prompt Configuration Personality

### 🧠 Summary
This configuration defines how the AI should construct its responses.
It specifies the **style, tone, structure, and behavioral settings** for the model that will generate user-facing answers.

---

### 1. 🎨 Response Style
| Setting | Value | Description |
|----------|--------|-------------|
| **Detail Level** | ${config.detailLevel}/100 | ${getValueDescription(config.detailLevel)} - ${config.detailLevel < 30 ? 'Concise responses' : config.detailLevel > 70 ? 'Extremely detailed responses' : 'Moderately detailed responses'} |
| **Formality** | ${config.formalityLevel}/100 | ${getValueDescription(config.formalityLevel)} - ${config.formalityLevel < 30 ? 'Casual, conversational tone' : config.formalityLevel > 70 ? 'Formal, professional tone' : 'Balanced, semi-formal tone'} |
| **Technical Depth** | ${config.technicalDepth}/100 | ${getValueDescription(config.technicalDepth)} - ${config.technicalDepth < 30 ? 'Simple, accessible explanations' : config.technicalDepth > 70 ? 'Technical terminology with in-depth explanations' : 'Balance technical accuracy with accessibility'} |
| **Creativity** | ${config.creativityLevel}/100 | ${getValueDescription(config.creativityLevel)} - ${config.creativityLevel > 60 ? 'Creative, novel perspectives' : config.creativityLevel < 40 ? 'Factual, straightforward information' : 'Balanced creativity'} |
| **Verbosity** | ${config.verbosity}/100 | ${getValueDescription(config.verbosity)} - ${config.verbosity < 30 ? 'Brief responses' : config.verbosity > 70 ? 'Lengthy, thorough responses' : 'Moderate length responses'} |
| **Industry Terminology** | ${config.industryKnowledge}/100 | ${getValueDescription(config.industryKnowledge)} - ${config.industryKnowledge < 30 ? 'Explain all terms (e.g., "Annual Percentage Rate" not "APR")' : config.industryKnowledge > 70 ? 'Use acronyms freely (e.g., "APR", "LTV", "DTI")' : 'Balance terminology with explanations'} |

---

### 2. 💬 Tone & Personality
| Setting | Value | Description |
|----------|--------|-------------|
| **Enthusiasm** | ${config.enthusiasm}/100 | ${getValueDescription(config.enthusiasm)} - ${config.enthusiasm > 60 ? 'Show enthusiasm and energy' : config.enthusiasm < 30 ? 'Neutral tone' : 'Moderate enthusiasm'} |
| **Empathy** | ${config.empathy}/100 | ${getValueDescription(config.empathy)} - ${config.empathy > 60 ? 'Empathetic and understanding' : config.empathy < 30 ? 'Objective and factual' : 'Balanced empathy'} |
| **Confidence** | ${config.confidence}/100 | ${getValueDescription(config.confidence)} - ${config.confidence < 30 ? 'Express uncertainty, hedge statements' : config.confidence > 70 ? 'Confident and assertive' : 'Balanced confidence'} |
| **Humor** | ${config.humor}/100 | ${getValueDescription(config.humor)} - ${config.humor > 60 ? 'Include appropriate humor' : config.humor < 30 ? 'Maintain serious, professional demeanor' : 'Occasional light humor'} |

---

### 3. 🧱 Response Structure
| Feature | Enabled | Behavior |
|----------|----------|-----------|
| **Examples** | ${config.useExamples ? '✅ Yes' : '❌ No'} | ${config.useExamples ? 'Include relevant examples to illustrate points' : 'Avoid using examples'} |
| **Bullets** | ${config.useBulletPoints ? '✅ Yes' : '❌ No'} | ${config.useBulletPoints ? 'Use bullet points to organize information' : 'Avoid bullet point formatting'} |
| **Numbers** | ${config.useNumberedLists ? '✅ Yes' : '❌ No'} | ${config.useNumberedLists ? 'Use numbered lists for sequential information' : 'Avoid numbered lists'} |
| **Code** | ${config.includeCodeSamples ? '✅ Yes' : '❌ No'} | ${config.includeCodeSamples ? 'Include code samples when relevant' : 'Avoid code samples'} |
| **Tables** | ${config.includeTables ? '✅ Yes' : '❌ No'} | ${config.includeTables ? 'Use data tables for structured information' : 'Avoid table formatting'} |
| **Thought Process** | ${config.showThoughtProcess ? '✅ Yes' : '❌ No'} | ${config.showThoughtProcess ? 'Show internal reasoning and thought process (Chain of Thought)' : 'Present final conclusions only'} |
| **Analogies** | ${config.includeAnalogies ? '✅ Yes' : '❌ No'} | ${config.includeAnalogies ? 'Use analogies to explain complex concepts' : 'Avoid analogies'} |
| **Snippets** | ${config.includeSnippets ? '✅ Yes' : '❌ No'} | ${config.includeSnippets ? 'Extract and highlight key snippets or quotes' : 'Avoid highlighting snippets'} |
| **Step-by-Step** | ${config.includeStepByStep ? '✅ Yes' : '❌ No'} | ${config.includeStepByStep ? 'Break down processes into clear step-by-step instructions' : 'Present information holistically'} |
| **Summary** | ${config.includeSummary ? '✅ Yes' : '❌ No'} | ${config.includeSummary ? 'Include summary sections for key points' : 'Omit summary sections'} |
| **Visual** | ${config.includeVisualDescriptions ? '✅ Yes' : '❌ No'} | ${config.includeVisualDescriptions ? 'Provide visual descriptions and mental imagery' : 'Avoid visual descriptions'} |
| **References** | ${config.includeExternalReferences ? '✅ Yes' : '❌ No'} | ${config.includeExternalReferences ? 'Reference external resources and documentation' : 'Avoid external references'} |

---

### 4. ⚙️ Advanced Settings
| Setting | Value | Description |
|----------|--------|-------------|
| **Response Length** | ${config.responseLength} | Preferred length of responses |
| **Perspective** | ${config.perspective} | Narrative perspective for responses |
| **Target Generation** | ${config.audience} | Audience demographic and characteristics |
| **Explanation Style** | ${config.explanationStyle} | Approach to explaining concepts |
| **Accuracy** | ${config.prioritizeAccuracy ? '✅ High Priority' : '⚪ Standard'} | ${config.prioritizeAccuracy ? 'Prioritize accuracy over speed' : 'Standard accuracy'} |
| **Speed** | ${config.prioritizeSpeed ? '✅ High Priority' : '⚪ Standard'} | ${config.prioritizeSpeed ? 'Prioritize quick responses' : 'Standard response speed'} |
| **Clarity** | ${config.prioritizeClarity ? '✅ High Priority' : '⚪ Standard'} | ${config.prioritizeClarity ? 'Prioritize clarity and understandability' : 'Standard clarity'} |
| **Completeness** | ${config.prioritizeComprehensiveness ? '✅ High Priority' : '⚪ Standard'} | ${config.prioritizeComprehensiveness ? 'Prioritize comprehensive coverage' : 'Standard completeness'} |

${config.customInstructions ? `\n**Custom Instructions:**\n${config.customInstructions}\n` : ''}
${config.customStyle ? `\n**Additional Style Requirements:**\n${config.customStyle}\n` : ''}

---

### 5. 🧾 Resulting Behavior Summary (Human-Readable)
> This AI will respond with **${getValueDescription(config.detailLevel).toLowerCase()} detail** in a **${config.formalityLevel < 30 ? 'casual' : config.formalityLevel > 70 ? 'formal' : 'balanced'}** tone.
> Technical content will be ${config.technicalDepth < 30 ? 'simplified and accessible' : config.technicalDepth > 70 ? 'technical and in-depth' : 'moderately technical'}.
> The personality is ${config.enthusiasm > 60 ? 'enthusiastic' : 'measured'}, ${config.empathy > 60 ? 'empathetic' : 'objective'}, and ${config.confidence > 70 ? 'confident' : config.confidence < 30 ? 'cautious' : 'balanced'}${config.humor > 60 ? ' with appropriate humor' : ''}.
> ${config.audience !== 'mixed' ? `Responses are tailored for ${config.audience} audience.` : 'Responses are tailored for a general audience.'}

---

### 6. 🧠 Machine-Readable Configuration (JSON)
\`\`\`json
{
  "response_style": {
    "detail_level": ${config.detailLevel},
    "formality": ${config.formalityLevel},
    "technical_depth": ${config.technicalDepth},
    "creativity": ${config.creativityLevel},
    "verbosity": ${config.verbosity},
    "industry_terminology": ${config.industryKnowledge}
  },
  "tone_personality": {
    "enthusiasm": ${config.enthusiasm},
    "empathy": ${config.empathy},
    "confidence": ${config.confidence},
    "humor": ${config.humor}
  },
  "response_structure": {
    "examples": ${config.useExamples},
    "bullets": ${config.useBulletPoints},
    "numbers": ${config.useNumberedLists},
    "code": ${config.includeCodeSamples},
    "tables": ${config.includeTables},
    "thought_process": ${config.showThoughtProcess},
    "analogies": ${config.includeAnalogies},
    "snippets": ${config.includeSnippets},
    "step_by_step": ${config.includeStepByStep},
    "summary": ${config.includeSummary},
    "visual": ${config.includeVisualDescriptions},
    "references": ${config.includeExternalReferences}
  },
  "advanced_settings": {
    "response_length": "${config.responseLength}",
    "perspective": "${config.perspective}",
    "target_generation": "${config.audience}",
    "explanation_style": "${config.explanationStyle}",
    "accuracy": ${config.prioritizeAccuracy},
    "speed": ${config.prioritizeSpeed},
    "clarity": ${config.prioritizeClarity},
    "completeness": ${config.prioritizeComprehensiveness}
  }
}
\`\`\``;

  return prompt;
}

export async function generatePrompt(config: PromptConfig): Promise<string> {
  try {
    // Always build the basic prompt first
    const systemPrompt = buildPromptFromConfig(config);

    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      // If no API key, just return the built prompt
      return systemPrompt;
    }

    // Use OpenAI to enhance and optimize the prompt
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a prompt configuration formatter. Your job is to return the provided configuration EXACTLY as given, without modification.

The configuration is already formatted in a strict personality structure with:
- Markdown tables
- Emoji section headers
- Detailed descriptions
- JSON configuration block

DO NOT modify, rephrase, or restructure the content. Return it verbatim.`,
        },
        {
          role: 'user',
          content: systemPrompt,
        },
      ],
      temperature: 0.1,
      max_tokens: 3000,
    });

    const refinedPrompt = completion.choices[0].message.content || systemPrompt;
    return refinedPrompt;
  } catch (error) {
    console.error('Error generating prompt:', error);
    // Return the basic prompt if API fails
    return buildPromptFromConfig(config);
  }
}
