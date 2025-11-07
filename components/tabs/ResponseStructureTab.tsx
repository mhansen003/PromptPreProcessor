import type { PersonaConfig } from '@/lib/store';
import { Toggle } from '../Toggle';

interface ResponseStructureTabProps {
  config: PersonaConfig;
  onUpdate: (updates: Partial<PersonaConfig>) => void;
}

export default function ResponseStructureTab({ config, onUpdate }: ResponseStructureTabProps) {
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
          />

          <Toggle
            label="Analogies"
            checked={config.includeAnalogies}
            onChange={(checked) => onUpdate({ includeAnalogies: checked })}
            description="Use analogies to explain complex concepts"
          />

          <Toggle
            label="Code Samples"
            checked={config.includeCodeSamples}
            onChange={(checked) => onUpdate({ includeCodeSamples: checked })}
            description="Include code examples when discussing technical topics"
          />

          <Toggle
            label="Visual Descriptions"
            checked={config.includeVisualDescriptions}
            onChange={(checked) => onUpdate({ includeVisualDescriptions: checked })}
            description="Provide visual descriptions and mental imagery"
          />

          <Toggle
            label="Snippets"
            checked={config.includeSnippets}
            onChange={(checked) => onUpdate({ includeSnippets: checked })}
            description="Extract and highlight key snippets or quotes"
          />

          <Toggle
            label="External References"
            checked={config.includeExternalReferences}
            onChange={(checked) => onUpdate({ includeExternalReferences: checked })}
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
            checked={config.useBulletPoints}
            onChange={(checked) => onUpdate({ useBulletPoints: checked })}
            description="Use bullet points to organize information"
          />

          <Toggle
            label="Numbered Lists"
            checked={config.useNumberedLists}
            onChange={(checked) => onUpdate({ useNumberedLists: checked })}
            description="Use numbered lists for sequential information"
          />

          <Toggle
            label="Tables"
            checked={config.includeTables}
            onChange={(checked) => onUpdate({ includeTables: checked })}
            description="Use data tables for structured information"
          />

          <Toggle
            label="Step-by-Step"
            checked={config.includeStepByStep}
            onChange={(checked) => onUpdate({ includeStepByStep: checked })}
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
            checked={config.showThoughtProcess}
            onChange={(checked) => onUpdate({ showThoughtProcess: checked })}
            description="Show internal reasoning and chain of thought"
          />

          <Toggle
            label="Include Summary"
            checked={config.includeSummary}
            onChange={(checked) => onUpdate({ includeSummary: checked })}
            description="Include summary sections for key points"
          />
        </div>
      </div>
    </div>
  );
}
