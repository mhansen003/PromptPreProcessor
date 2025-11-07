import type { PersonaConfig } from '@/lib/store';
import { Slider } from '../Slider';
import { Toggle } from '../Toggle';
import { useState } from 'react';
import ExampleModal from '../ExampleModal';

interface PersonalityTabProps {
  config: PersonaConfig;
  onUpdate: (updates: Partial<PersonaConfig>) => void;
}

export default function PersonalityTab({ config, onUpdate }: PersonalityTabProps) {
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [exampleControl, setExampleControl] = useState<{
    name: string;
    description: string;
    value: number;
    min: number;
    max: number;
    onApply: (value: number) => void;
  } | null>(null);

  const openExample = (name: string, description: string, value: number, onApply: (value: number) => void) => {
    setExampleControl({ name, description, value, min: 0, max: 100, onApply });
    setShowExampleModal(true);
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Slider
            label="Detail Level"
            value={config.detailLevel}
            onChange={(value) => onUpdate({ detailLevel: value })}
            min={0}
            max={100}
            tooltip="How detailed responses should be (0 = very concise, 100 = extremely detailed with comprehensive explanations)"
            onShowExample={() => openExample(
              'Detail Level',
              'How detailed responses should be (0 = very concise, 100 = extremely detailed)',
              config.detailLevel,
              (value) => onUpdate({ detailLevel: value })
            )}
          />

          <Slider
            label="Formality Level"
            value={config.formalityLevel}
            onChange={(value) => onUpdate({ formalityLevel: value })}
            min={0}
            max={100}
            tooltip="Communication formality (0 = very casual and conversational, 100 = highly formal and professional)"
            onShowExample={() => openExample(
              'Formality Level',
              'Communication formality (0 = very casual, 100 = highly formal)',
              config.formalityLevel,
              (value) => onUpdate({ formalityLevel: value })
            )}
          />

          <Slider
            label="Technical Depth"
            value={config.technicalDepth}
            onChange={(value) => onUpdate({ technicalDepth: value })}
            min={0}
            max={100}
            tooltip="Level of technical complexity (0 = simple explanations for beginners, 100 = expert-level technical depth)"
            onShowExample={() => openExample(
              'Technical Depth',
              'Level of technical complexity (0 = simple, 100 = expert-level)',
              config.technicalDepth,
              (value) => onUpdate({ technicalDepth: value })
            )}
          />

          <Slider
            label="Creativity Level"
            value={config.creativityLevel}
            onChange={(value) => onUpdate({ creativityLevel: value })}
            min={0}
            max={100}
            tooltip="Creative vs factual approach (0 = strictly factual, 100 = creative and innovative perspectives)"
            onShowExample={() => openExample(
              'Creativity Level',
              'Creative vs factual approach (0 = strictly factual, 100 = creative)',
              config.creativityLevel,
              (value) => onUpdate({ creativityLevel: value })
            )}
          />

          <Slider
            label="Verbosity"
            value={config.verbosity}
            onChange={(value) => onUpdate({ verbosity: value })}
            min={0}
            max={100}
            tooltip="Overall response length (0 = brief and succinct, 100 = long and thorough)"
            onShowExample={() => openExample(
              'Verbosity',
              'Overall response length (0 = brief, 100 = long and thorough)',
              config.verbosity,
              (value) => onUpdate({ verbosity: value })
            )}
          />
        </div>
      </div>

      {/* Tone & Personality Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🎭</span>
          <span>Tone & Personality</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Slider
            label="Enthusiasm"
            value={config.enthusiasm}
            onChange={(value) => onUpdate({ enthusiasm: value })}
            min={0}
            max={100}
            tooltip="Energy and enthusiasm level (0 = neutral and measured, 100 = highly enthusiastic and energetic)"
            onShowExample={() => openExample(
              'Enthusiasm',
              'Energy and enthusiasm level (0 = neutral, 100 = highly enthusiastic)',
              config.enthusiasm,
              (value) => onUpdate({ enthusiasm: value })
            )}
          />

          <Slider
            label="Empathy"
            value={config.empathy}
            onChange={(value) => onUpdate({ empathy: value })}
            min={0}
            max={100}
            tooltip="Emotional intelligence and empathy (0 = objective and detached, 100 = highly empathetic and understanding)"
            onShowExample={() => openExample(
              'Empathy',
              'Emotional intelligence and empathy (0 = objective, 100 = highly empathetic)',
              config.empathy,
              (value) => onUpdate({ empathy: value })
            )}
          />

          <Slider
            label="Confidence"
            value={config.confidence}
            onChange={(value) => onUpdate({ confidence: value })}
            min={0}
            max={100}
            tooltip="Assertiveness and confidence (0 = cautious with hedging language, 100 = highly confident and assertive)"
            onShowExample={() => openExample(
              'Confidence',
              'Assertiveness and confidence (0 = cautious, 100 = highly confident)',
              config.confidence,
              (value) => onUpdate({ confidence: value })
            )}
          />

          <Slider
            label="Humor"
            value={config.humor}
            onChange={(value) => onUpdate({ humor: value })}
            min={0}
            max={100}
            tooltip="Use of humor and levity (0 = completely serious, 100 = frequent appropriate humor)"
            onShowExample={() => openExample(
              'Humor',
              'Use of humor and levity (0 = completely serious, 100 = frequent humor)',
              config.humor,
              (value) => onUpdate({ humor: value })
            )}
          />
        </div>
      </div>

      {/* Response Organization */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🗂️</span>
          <span>Response Preferences</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle
            label="Show Thought Process"
            checked={config.showThoughtProcess}
            onChange={(checked) => onUpdate({ showThoughtProcess: checked })}
            description="Show internal reasoning and chain of thought"
            tooltip="Reveals the AI's reasoning process and logic leading to conclusions (Chain of Thought)"
          />

          <Toggle
            label="Include Summary"
            checked={config.includeSummary}
            onChange={(checked) => onUpdate({ includeSummary: checked })}
            description="Include summary sections for key points"
            tooltip="Adds summary sections or TL;DR blocks highlighting the main takeaways"
          />
        </div>
      </div>

      {/* Example Modal */}
      {exampleControl && (
        <ExampleModal
          isOpen={showExampleModal}
          onClose={() => {
            setShowExampleModal(false);
            setExampleControl(null);
          }}
          controlType="slider"
          controlName={exampleControl.name}
          controlDescription={exampleControl.description}
          initialValue={exampleControl.value}
          onApply={(value) => {
            exampleControl.onApply(value as number);
          }}
          min={exampleControl.min}
          max={exampleControl.max}
        />
      )}
    </div>
  );
}
