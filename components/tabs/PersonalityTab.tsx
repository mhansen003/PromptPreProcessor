import type { PersonaConfig } from '@/lib/store';
import { Slider } from '../Slider';

interface PersonalityTabProps {
  config: PersonaConfig;
  onUpdate: (updates: Partial<PersonaConfig>) => void;
}

export default function PersonalityTab({ config, onUpdate }: PersonalityTabProps) {
  return (
    <div className="space-y-8">
      {/* Info Box */}
      <div className="p-4 bg-robinhood-green/10 border border-robinhood-green/30 rounded-lg">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-robinhood-green">Personality Settings</span> define the core communication style and tone of your persona. These settings shape how formal, detailed, and emotionally expressive your AI responses will be.
        </p>
      </div>

      {/* Response Style Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>📝</span>
          <span>Response Style</span>
        </h3>

        <Slider
          label="Detail Level"
          value={config.detailLevel}
          onChange={(value) => onUpdate({ detailLevel: value })}
          min={0}
          max={100}
          tooltip="How detailed responses should be (0 = very concise, 100 = extremely detailed with comprehensive explanations)"
        />

        <Slider
          label="Formality Level"
          value={config.formalityLevel}
          onChange={(value) => onUpdate({ formalityLevel: value })}
          min={0}
          max={100}
          tooltip="Communication formality (0 = very casual and conversational, 100 = highly formal and professional)"
        />

        <Slider
          label="Technical Depth"
          value={config.technicalDepth}
          onChange={(value) => onUpdate({ technicalDepth: value })}
          min={0}
          max={100}
          tooltip="Level of technical complexity (0 = simple explanations for beginners, 100 = expert-level technical depth)"
        />

        <Slider
          label="Creativity Level"
          value={config.creativityLevel}
          onChange={(value) => onUpdate({ creativityLevel: value })}
          min={0}
          max={100}
          tooltip="Creative vs factual approach (0 = strictly factual, 100 = creative and innovative perspectives)"
        />

        <Slider
          label="Verbosity"
          value={config.verbosity}
          onChange={(value) => onUpdate({ verbosity: value })}
          min={0}
          max={100}
          tooltip="Overall response length (0 = brief and succinct, 100 = long and thorough)"
        />
      </div>

      {/* Tone & Personality Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🎭</span>
          <span>Tone & Personality</span>
        </h3>

        <Slider
          label="Enthusiasm"
          value={config.enthusiasm}
          onChange={(value) => onUpdate({ enthusiasm: value })}
          min={0}
          max={100}
          tooltip="Energy and enthusiasm level (0 = neutral and measured, 100 = highly enthusiastic and energetic)"
        />

        <Slider
          label="Empathy"
          value={config.empathy}
          onChange={(value) => onUpdate({ empathy: value })}
          min={0}
          max={100}
          tooltip="Emotional intelligence and empathy (0 = objective and detached, 100 = highly empathetic and understanding)"
        />

        <Slider
          label="Confidence"
          value={config.confidence}
          onChange={(value) => onUpdate({ confidence: value })}
          min={0}
          max={100}
          tooltip="Assertiveness and confidence (0 = cautious with hedging language, 100 = highly confident and assertive)"
        />

        <Slider
          label="Humor"
          value={config.humor}
          onChange={(value) => onUpdate({ humor: value })}
          min={0}
          max={100}
          tooltip="Use of humor and levity (0 = completely serious, 100 = frequent appropriate humor)"
        />
      </div>
    </div>
  );
}
