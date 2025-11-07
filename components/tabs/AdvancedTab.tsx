import type { PersonaConfig } from '@/lib/store';
import { Slider } from '../Slider';
import { Select } from '../Select';
import { Toggle } from '../Toggle';
import { useState } from 'react';
import ExampleModal from '../ExampleModal';

interface AdvancedTabProps {
  config: PersonaConfig;
  onUpdate: (updates: Partial<PersonaConfig>) => void;
}

export default function AdvancedTab({ config, onUpdate }: AdvancedTabProps) {
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [exampleControl, setExampleControl] = useState<{
    name: string;
    description: string;
    value: number | boolean | string;
    controlType: 'slider' | 'toggle' | 'select';
    min?: number;
    max?: number;
    options?: Array<{ value: string; label: string }>;
    onApply: (value: number | boolean | string) => void;
  } | null>(null);

  const openSliderExample = (name: string, description: string, value: number, onApply: (value: number) => void) => {
    setExampleControl({ name, description, value, controlType: 'slider', min: 0, max: 100, onApply: onApply as (value: number | boolean | string) => void });
    setShowExampleModal(true);
  };

  const openToggleExample = (name: string, description: string, value: boolean, onApply: (value: boolean) => void) => {
    setExampleControl({ name, description, value, controlType: 'toggle', onApply: onApply as (value: number | boolean | string) => void });
    setShowExampleModal(true);
  };

  const openSelectExample = (name: string, description: string, value: string, options: Array<{ value: string; label: string }>, onApply: (value: string) => void) => {
    setExampleControl({ name, description, value, controlType: 'select', options, onApply: onApply as (value: number | boolean | string) => void });
    setShowExampleModal(true);
  };
  return (
    <div className="space-y-8">
      {/* Info Box */}
      <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-purple-400">Advanced Settings</span> provide fine-grained control over response characteristics, audience targeting, and custom behavioral instructions.
        </p>
      </div>

      {/* Response Preferences */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>⚙️</span>
          <span>Response Preferences</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            onShowExample={() => openSelectExample(
              'Response Length',
              'Preferred overall length of responses',
              config.responseLength,
              [
                { value: 'auto', label: 'Auto (Context-dependent)' },
                { value: 'short', label: 'Short (Brief answers)' },
                { value: 'medium', label: 'Medium (Balanced detail)' },
                { value: 'long', label: 'Long (Detailed explanations)' },
                { value: 'comprehensive', label: 'Comprehensive (Exhaustive coverage)' },
              ],
              (value) => onUpdate({ responseLength: value as PersonaConfig['responseLength'] })
            )}
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
            onShowExample={() => openSelectExample(
              'Perspective',
              'Narrative perspective for responses',
              config.perspective,
              [
                { value: '1st-person', label: '1st Person (I/We)' },
                { value: '2nd-person', label: '2nd Person (You)' },
                { value: '3rd-person', label: '3rd Person (They/It)' },
                { value: 'mixed', label: 'Mixed (Flexible)' },
              ],
              (value) => onUpdate({ perspective: value as PersonaConfig['perspective'] })
            )}
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
            onShowExample={() => openSelectExample(
              'Target Audience',
              'Primary demographic and generational focus',
              config.audience,
              [
                { value: 'mixed', label: 'Mixed (General audience)' },
                { value: 'gen-z', label: 'Gen Z (Born 1997-2012)' },
                { value: 'millennial', label: 'Millennial (Born 1981-1996)' },
                { value: 'gen-x', label: 'Gen X (Born 1965-1980)' },
                { value: 'boomer', label: 'Boomer (Born 1946-1964)' },
                { value: 'senior', label: 'Senior (65+)' },
              ],
              (value) => onUpdate({ audience: value as PersonaConfig['audience'] })
            )}
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
            onShowExample={() => openSelectExample(
              'Explanation Style',
              'Approach to explaining concepts',
              config.explanationStyle,
              [
                { value: 'direct', label: 'Direct (Straightforward)' },
                { value: 'socratic', label: 'Socratic (Question-driven)' },
                { value: 'narrative', label: 'Narrative (Story-based)' },
                { value: 'analytical', label: 'Analytical (Data-driven)' },
              ],
              (value) => onUpdate({ explanationStyle: value as PersonaConfig['explanationStyle'] })
            )}
          />
        </div>

        <Slider
          label="Industry Terminology"
          value={config.industryKnowledge}
          onChange={(value) => onUpdate({ industryKnowledge: value })}
          min={0}
          max={100}
          tooltip="How much to use industry-specific terms (0 = explain all terms like 'Annual Percentage Rate', 100 = freely use acronyms like 'APR', 'LTV', 'DTI')"
          onShowExample={() => openSliderExample(
            'Industry Terminology',
            'How much to use industry-specific terms (0 = explain all terms like \'Annual Percentage Rate\', 100 = freely use acronyms like \'APR\', \'LTV\', \'DTI\')',
            config.industryKnowledge,
            (value) => onUpdate({ industryKnowledge: value })
          )}
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
            checked={config.prioritizeAccuracy}
            onChange={(checked) => onUpdate({ prioritizeAccuracy: checked })}
            description="Emphasize factual accuracy over speed"
            onShowExample={() => openToggleExample(
              'Prioritize Accuracy',
              'Emphasize factual accuracy over speed',
              config.prioritizeAccuracy,
              (value) => onUpdate({ prioritizeAccuracy: value })
            )}
          />

          <Toggle
            label="Prioritize Speed"
            checked={config.prioritizeSpeed}
            onChange={(checked) => onUpdate({ prioritizeSpeed: checked })}
            description="Emphasize quick responses over depth"
            onShowExample={() => openToggleExample(
              'Prioritize Speed',
              'Emphasize quick responses over depth',
              config.prioritizeSpeed,
              (value) => onUpdate({ prioritizeSpeed: value })
            )}
          />

          <Toggle
            label="Prioritize Clarity"
            checked={config.prioritizeClarity}
            onChange={(checked) => onUpdate({ prioritizeClarity: checked })}
            description="Emphasize clear, understandable explanations"
            onShowExample={() => openToggleExample(
              'Prioritize Clarity',
              'Emphasize clear, understandable explanations',
              config.prioritizeClarity,
              (value) => onUpdate({ prioritizeClarity: value })
            )}
          />

          <Toggle
            label="Prioritize Comprehensiveness"
            checked={config.prioritizeComprehensiveness}
            onChange={(checked) => onUpdate({ prioritizeComprehensiveness: checked })}
            description="Emphasize thorough, complete coverage"
            onShowExample={() => openToggleExample(
              'Prioritize Comprehensiveness',
              'Emphasize thorough, complete coverage',
              config.prioritizeComprehensiveness,
              (value) => onUpdate({ prioritizeComprehensiveness: value })
            )}
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
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-300">
              Custom Instructions
            </label>
            <button
              onClick={() => openSelectExample(
                'Custom Instructions',
                'Additional behavioral guidelines and specific requirements',
                config.customInstructions || 'None',
                [{ value: 'None', label: 'None' }],
                (value) => {}
              )}
              className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 rounded hover:bg-indigo-500/30 transition-all shadow-sm hover:shadow-indigo-500/20"
              title="See example of this setting"
            >
              ✨ Example
            </button>
          </div>
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
          <div className="flex items-center gap-2">
            <label className="block text-sm font-medium text-gray-300">
              Custom Style Notes
            </label>
            <button
              onClick={() => openSelectExample(
                'Custom Style Notes',
                'Additional formatting or output style preferences',
                config.customStyle || 'None',
                [{ value: 'None', label: 'None' }],
                (value) => {}
              )}
              className="px-2 py-0.5 text-xs bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 rounded hover:bg-indigo-500/30 transition-all shadow-sm hover:shadow-indigo-500/20"
              title="See example of this setting"
            >
              ✨ Example
            </button>
          </div>
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

      {/* Example Modal */}
      {exampleControl && (
        <ExampleModal
          isOpen={showExampleModal}
          onClose={() => {
            setShowExampleModal(false);
            setExampleControl(null);
          }}
          controlType={exampleControl.controlType}
          controlName={exampleControl.name}
          controlDescription={exampleControl.description}
          initialValue={exampleControl.value}
          onApply={(value) => {
            exampleControl.onApply(value);
          }}
          min={exampleControl.min}
          max={exampleControl.max}
          options={exampleControl.options}
        />
      )}
    </div>
  );
}
