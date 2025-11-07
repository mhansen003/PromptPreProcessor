import type { PersonaConfig } from '@/lib/store';
import { Toggle } from '../Toggle';
import { useState } from 'react';
import ExampleModal from '../ExampleModal';

interface ResponseStructureTabProps {
  config: PersonaConfig;
  onUpdate: (updates: Partial<PersonaConfig>) => void;
}

export default function ResponseStructureTab({ config, onUpdate }: ResponseStructureTabProps) {
  const [showExampleModal, setShowExampleModal] = useState(false);
  const [exampleControl, setExampleControl] = useState<{
    name: string;
    description: string;
    value: boolean;
    onApply: (value: boolean) => void;
  } | null>(null);

  const openExample = (name: string, description: string, value: boolean, onApply: (value: boolean) => void) => {
    setExampleControl({ name, description, value, onApply });
    setShowExampleModal(true);
  };

  return (
    <div className="space-y-8">
      {/* Info Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-blue-400">Response Structure</span> controls how information is organized and formatted. Enable elements that match your preferred communication style and audience needs.
        </p>
      </div>

      {/* Content Elements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>📄</span>
          <span>Content Elements</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle
            label="Examples"
            checked={config.useExamples}
            onChange={(checked) => onUpdate({ useExamples: checked })}
            description="Include relevant examples to illustrate concepts"
            tooltip="When enabled, responses will include concrete examples to make concepts more understandable"
            onShowExample={() => openExample(
              'Examples',
              'Include relevant examples to illustrate concepts',
              config.useExamples,
              (value) => onUpdate({ useExamples: value })
            )}
          />

          <Toggle
            label="Analogies"
            checked={config.includeAnalogies}
            onChange={(checked) => onUpdate({ includeAnalogies: checked })}
            description="Use analogies to explain complex concepts"
            tooltip="Enables comparisons to familiar concepts to help explain unfamiliar or complex ideas"
            onShowExample={() => openExample(
              'Analogies',
              'Use analogies to explain complex concepts',
              config.includeAnalogies,
              (value) => onUpdate({ includeAnalogies: value })
            )}
          />

          <Toggle
            label="Code Samples"
            checked={config.includeCodeSamples}
            onChange={(checked) => onUpdate({ includeCodeSamples: checked })}
            description="Include code examples when discussing technical topics"
            tooltip="When enabled, technical explanations will include code snippets and programming examples"
            onShowExample={() => openExample(
              'Code Samples',
              'Include code examples when discussing technical topics',
              config.includeCodeSamples,
              (value) => onUpdate({ includeCodeSamples: value })
            )}
          />

          <Toggle
            label="Visual Descriptions"
            checked={config.includeVisualDescriptions}
            onChange={(checked) => onUpdate({ includeVisualDescriptions: checked })}
            description="Provide visual descriptions and mental imagery"
            tooltip="Adds vivid descriptions that help readers visualize concepts and scenarios"
            onShowExample={() => openExample(
              'Visual Descriptions',
              'Provide visual descriptions and mental imagery',
              config.includeVisualDescriptions,
              (value) => onUpdate({ includeVisualDescriptions: value })
            )}
          />

          <Toggle
            label="Snippets"
            checked={config.includeSnippets}
            onChange={(checked) => onUpdate({ includeSnippets: checked })}
            description="Extract and highlight key snippets or quotes"
            tooltip="Highlights the most important parts of responses as pull quotes or key takeaways"
            onShowExample={() => openExample(
              'Snippets',
              'Extract and highlight key snippets or quotes',
              config.includeSnippets,
              (value) => onUpdate({ includeSnippets: value })
            )}
          />

          <Toggle
            label="External References"
            checked={config.includeExternalReferences}
            onChange={(checked) => onUpdate({ includeExternalReferences: checked })}
            description="Reference external resources and documentation"
            tooltip="Includes citations and links to external documentation, articles, and resources"
            onShowExample={() => openExample(
              'External References',
              'Reference external resources and documentation',
              config.includeExternalReferences,
              (value) => onUpdate({ includeExternalReferences: value })
            )}
          />
        </div>
      </div>

      {/* Formatting Options */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>📋</span>
          <span>Formatting Options</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle
            label="Bullet Points"
            checked={config.useBulletPoints}
            onChange={(checked) => onUpdate({ useBulletPoints: checked })}
            description="Use bullet points to organize information"
            tooltip="Formats responses with bullet points for easy scanning of key information"
            onShowExample={() => openExample(
              'Bullet Points',
              'Use bullet points to organize information',
              config.useBulletPoints,
              (value) => onUpdate({ useBulletPoints: value })
            )}
          />

          <Toggle
            label="Numbered Lists"
            checked={config.useNumberedLists}
            onChange={(checked) => onUpdate({ useNumberedLists: checked })}
            description="Use numbered lists for sequential information"
            tooltip="Uses numbered lists for steps, rankings, or ordered information"
            onShowExample={() => openExample(
              'Numbered Lists',
              'Use numbered lists for sequential information',
              config.useNumberedLists,
              (value) => onUpdate({ useNumberedLists: value })
            )}
          />

          <Toggle
            label="Tables"
            checked={config.includeTables}
            onChange={(checked) => onUpdate({ includeTables: checked })}
            description="Use data tables for structured information"
            tooltip="Organizes comparative data and structured information into formatted tables"
            onShowExample={() => openExample(
              'Tables',
              'Use data tables for structured information',
              config.includeTables,
              (value) => onUpdate({ includeTables: value })
            )}
          />

          <Toggle
            label="Step-by-Step"
            checked={config.includeStepByStep}
            onChange={(checked) => onUpdate({ includeStepByStep: checked })}
            description="Break down processes into clear step-by-step instructions"
            tooltip="Breaks complex processes into clear, numbered steps for easy following"
            onShowExample={() => openExample(
              'Step-by-Step',
              'Break down processes into clear step-by-step instructions',
              config.includeStepByStep,
              (value) => onUpdate({ includeStepByStep: value })
            )}
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
          controlType="toggle"
          controlName={exampleControl.name}
          controlDescription={exampleControl.description}
          initialValue={exampleControl.value}
          onApply={(value) => {
            exampleControl.onApply(value as boolean);
          }}
        />
      )}
    </div>
  );
}
