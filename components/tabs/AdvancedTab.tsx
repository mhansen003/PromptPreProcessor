import type { PersonaConfig } from '@/lib/store';
import { Slider } from '../Slider';
import { Select } from '../Select';
import { Toggle } from '../Toggle';

interface AdvancedTabProps {
  config: PersonaConfig;
  onUpdate: (updates: Partial<PersonaConfig>) => void;
}

export default function AdvancedTab({ config, onUpdate }: AdvancedTabProps) {
  return (
    <div className="space-y-8">
      {/* Response Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>⚙️</span>
          <span>Response Preferences</span>
        </h3>

        <Select
          label="Response Length"
          value={config.responseLength}
          onChange={(value) => onUpdate({ responseLength: value as PersonaConfig['responseLength'] })}
          options={[
            { value: 'auto', label: 'Auto (Context-dependent)' },
            { value: 'short', label: 'Short (Brief answers)' },
            { value: 'medium', label: 'Medium (Balanced detail)' },
            { value: 'long', label: 'Long (Detailed explanations)' },
            { value: 'comprehensive', label: 'Comprehensive (Exhaustive coverage)' },
          ]}
          tooltip="Preferred overall length of responses"
        />

        <Select
          label="Perspective"
          value={config.perspective}
          onChange={(value) => onUpdate({ perspective: value as PersonaConfig['perspective'] })}
          options={[
            { value: '1st-person', label: '1st Person (I/We)' },
            { value: '2nd-person', label: '2nd Person (You)' },
            { value: '3rd-person', label: '3rd Person (They/It)' },
            { value: 'mixed', label: 'Mixed (Flexible)' },
          ]}
          tooltip="Narrative perspective for responses"
        />

        <Select
          label="Target Audience"
          value={config.audience}
          onChange={(value) => onUpdate({ audience: value as PersonaConfig['audience'] })}
          options={[
            { value: 'mixed', label: 'Mixed (General audience)' },
            { value: 'gen-z', label: 'Gen Z (Born 1997-2012)' },
            { value: 'millennial', label: 'Millennial (Born 1981-1996)' },
            { value: 'gen-x', label: 'Gen X (Born 1965-1980)' },
            { value: 'boomer', label: 'Boomer (Born 1946-1964)' },
            { value: 'senior', label: 'Senior (65+)' },
          ]}
          tooltip="Primary demographic and generational focus"
        />

        <Select
          label="Explanation Style"
          value={config.explanationStyle}
          onChange={(value) => onUpdate({ explanationStyle: value as PersonaConfig['explanationStyle'] })}
          options={[
            { value: 'direct', label: 'Direct (Straightforward)' },
            { value: 'socratic', label: 'Socratic (Question-driven)' },
            { value: 'narrative', label: 'Narrative (Story-based)' },
            { value: 'analytical', label: 'Analytical (Data-driven)' },
          ]}
          tooltip="Approach to explaining concepts"
        />

        <Slider
          label="Industry Terminology"
          value={config.industryKnowledge}
          onChange={(value) => onUpdate({ industryKnowledge: value })}
          min={0}
          max={100}
          tooltip="How much to use industry-specific terms (0 = explain all terms like 'Annual Percentage Rate', 100 = freely use acronyms like 'APR', 'LTV', 'DTI')"
        />
      </div>

      {/* Priority Focuses */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🎯</span>
          <span>Priority Focuses</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle
            label="Prioritize Accuracy"
            enabled={config.prioritizeAccuracy}
            onChange={(enabled) => onUpdate({ prioritizeAccuracy: enabled })}
            description="Emphasize factual accuracy over speed"
          />

          <Toggle
            label="Prioritize Speed"
            enabled={config.prioritizeSpeed}
            onChange={(enabled) => onUpdate({ prioritizeSpeed: enabled })}
            description="Emphasize quick responses over depth"
          />

          <Toggle
            label="Prioritize Clarity"
            enabled={config.prioritizeClarity}
            onChange={(enabled) => onUpdate({ prioritizeClarity: enabled })}
            description="Emphasize clear, understandable explanations"
          />

          <Toggle
            label="Prioritize Comprehensiveness"
            enabled={config.prioritizeComprehensiveness}
            onChange={(enabled) => onUpdate({ prioritizeComprehensiveness: enabled })}
            description="Emphasize thorough, complete coverage"
          />
        </div>
      </div>

      {/* Custom Instructions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>✏️</span>
          <span>Custom Instructions</span>
        </h3>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Custom Instructions
          </label>
          <textarea
            value={config.customInstructions}
            onChange={(e) => onUpdate({ customInstructions: e.target.value })}
            rows={4}
            placeholder="Add any specific instructions or requirements for this persona..."
            className="w-full px-3 py-2 bg-robinhood-card border border-robinhood-card-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-robinhood-green resize-none"
          />
          <p className="text-xs text-gray-400">
            Additional behavioral guidelines and specific requirements
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Custom Style Notes
          </label>
          <textarea
            value={config.customStyle}
            onChange={(e) => onUpdate({ customStyle: e.target.value })}
            rows={3}
            placeholder="e.g., 'Always include actionable next steps', 'Format for email delivery', etc."
            className="w-full px-3 py-2 bg-robinhood-card border border-robinhood-card-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-robinhood-green resize-none"
          />
          <p className="text-xs text-gray-400">
            Additional formatting or output style preferences
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-purple-400">Advanced Settings</span> provide fine-grained control over response characteristics, audience targeting, and custom behavioral instructions.
        </p>
      </div>
    </div>
  );
}
