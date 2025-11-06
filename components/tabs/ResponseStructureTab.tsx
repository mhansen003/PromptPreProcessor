import type { PersonaConfig } from '@/lib/store';
import Toggle from '../Toggle';

interface ResponseStructureTabProps {
  config: PersonaConfig;
  onUpdate: (updates: Partial<PersonaConfig>) => void;
}

export default function ResponseStructureTab({ config, onUpdate }: ResponseStructureTabProps) {
  return (
    <div className="space-y-8">
      {/* Content Elements */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>📄</span>
          <span>Content Elements</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle
            label="Examples"
            enabled={config.useExamples}
            onChange={(enabled) => onUpdate({ useExamples: enabled })}
            description="Include relevant examples to illustrate concepts"
          />

          <Toggle
            label="Analogies"
            enabled={config.includeAnalogies}
            onChange={(enabled) => onUpdate({ includeAnalogies: enabled })}
            description="Use analogies to explain complex concepts"
          />

          <Toggle
            label="Code Samples"
            enabled={config.includeCodeSamples}
            onChange={(enabled) => onUpdate({ includeCodeSamples: enabled })}
            description="Include code examples when discussing technical topics"
          />

          <Toggle
            label="Visual Descriptions"
            enabled={config.includeVisualDescriptions}
            onChange={(enabled) => onUpdate({ includeVisualDescriptions: enabled })}
            description="Provide visual descriptions and mental imagery"
          />

          <Toggle
            label="Snippets"
            enabled={config.includeSnippets}
            onChange={(enabled) => onUpdate({ includeSnippets: enabled })}
            description="Extract and highlight key snippets or quotes"
          />

          <Toggle
            label="External References"
            enabled={config.includeExternalReferences}
            onChange={(enabled) => onUpdate({ includeExternalReferences: enabled })}
            description="Reference external resources and documentation"
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
            enabled={config.useBulletPoints}
            onChange={(enabled) => onUpdate({ useBulletPoints: enabled })}
            description="Use bullet points to organize information"
          />

          <Toggle
            label="Numbered Lists"
            enabled={config.useNumberedLists}
            onChange={(enabled) => onUpdate({ useNumberedLists: enabled })}
            description="Use numbered lists for sequential information"
          />

          <Toggle
            label="Tables"
            enabled={config.includeTables}
            onChange={(enabled) => onUpdate({ includeTables: enabled })}
            description="Use data tables for structured information"
          />

          <Toggle
            label="Step-by-Step"
            enabled={config.includeStepByStep}
            onChange={(enabled) => onUpdate({ includeStepByStep: enabled })}
            description="Break down processes into clear step-by-step instructions"
          />
        </div>
      </div>

      {/* Response Organization */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <span>🗂️</span>
          <span>Response Organization</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Toggle
            label="Show Thought Process"
            enabled={config.showThoughtProcess}
            onChange={(enabled) => onUpdate({ showThoughtProcess: enabled })}
            description="Show internal reasoning and chain of thought"
          />

          <Toggle
            label="Include Summary"
            enabled={config.includeSummary}
            onChange={(enabled) => onUpdate({ includeSummary: enabled })}
            description="Include summary sections for key points"
          />
        </div>
      </div>

      {/* Info Box */}
      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <p className="text-sm text-gray-300">
          <span className="font-semibold text-blue-400">Response Structure</span> controls how information is organized and formatted. Enable elements that match your preferred communication style and audience needs.
        </p>
      </div>
    </div>
  );
}
