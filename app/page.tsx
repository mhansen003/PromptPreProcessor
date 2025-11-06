'use client';

import React, { useState, useEffect } from 'react';
import { useStore, createDefaultConfig } from '@/lib/store';
import { Slider } from '@/components/Slider';
import { Toggle } from '@/components/Toggle';
import { Select } from '@/components/Select';
import { ControlSection } from '@/components/ControlSection';

export default function Home() {
  const { configs, activeConfig, addConfig, updateConfig, setActiveConfig, deleteConfig, duplicateConfig } = useStore();
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!activeConfig && configs.length > 0) {
      setActiveConfig(configs[0]);
    }
  }, [activeConfig, configs, setActiveConfig]);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  const currentConfig = activeConfig || configs[0];

  if (!currentConfig) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const handleUpdate = (updates: any) => {
    updateConfig(currentConfig.id, updates);
  };

  const handleGeneratePrompt = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentConfig),
      });

      const data = await response.json();
      setGeneratedPrompt(data.systemPrompt);
      setShowPrompt(true);

      // Save the generated prompt to the config
      handleUpdate({ systemPrompt: data.systemPrompt });
    } catch (error) {
      console.error('Error generating prompt:', error);
      setGeneratedPrompt('Error generating prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewConfig = () => {
    const newConfig = createDefaultConfig();
    addConfig(newConfig);
    setActiveConfig(newConfig);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt);
  };

  return (
    <div className="min-h-screen bg-robinhood-dark">
      {/* Header */}
      <header className="border-b border-robinhood-border bg-robinhood-darker/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-robinhood-green">⚡</span>
                PromptPreProcessor
              </h1>
              <p className="text-sm text-gray-400 mt-1">Configure AI prompts with precision</p>
            </div>

            <div className="flex items-center gap-4">
              <select
                value={currentConfig.id}
                onChange={(e) => {
                  const config = configs.find(c => c.id === e.target.value);
                  if (config) setActiveConfig(config);
                }}
                className="px-4 py-2 bg-robinhood-card border border-robinhood-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-robinhood-green"
              >
                {configs.map(config => (
                  <option key={config.id} value={config.id}>
                    {config.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleNewConfig}
                className="px-4 py-2 bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90 transition-all"
              >
                + New
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Config Name */}
            <div className="bg-robinhood-card border border-robinhood-border rounded-xl p-6">
              <input
                type="text"
                value={currentConfig.name}
                onChange={(e) => handleUpdate({ name: e.target.value })}
                className="w-full text-xl font-semibold bg-transparent border-none outline-none text-white placeholder-gray-500 focus:ring-2 focus:ring-robinhood-green rounded px-2 py-1"
                placeholder="Configuration Name"
              />
              <p className="text-sm text-gray-500 mt-2">
                Created {new Date(currentConfig.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Response Style Controls */}
            <ControlSection title="Response Style" icon="🎨" defaultOpen={true}>
              <div className="space-y-6">
                <Slider
                  label="Detail Level"
                  value={currentConfig.detailLevel}
                  onChange={(v) => handleUpdate({ detailLevel: v })}
                  leftLabel="Concise"
                  rightLabel="Detailed"
                />

                <Slider
                  label="Formality"
                  value={currentConfig.formalityLevel}
                  onChange={(v) => handleUpdate({ formalityLevel: v })}
                  leftLabel="Casual"
                  rightLabel="Formal"
                />

                <Slider
                  label="Technical Depth"
                  value={currentConfig.technicalDepth}
                  onChange={(v) => handleUpdate({ technicalDepth: v })}
                  leftLabel="Simple"
                  rightLabel="Technical"
                />

                <Slider
                  label="Creativity"
                  value={currentConfig.creativityLevel}
                  onChange={(v) => handleUpdate({ creativityLevel: v })}
                  leftLabel="Factual"
                  rightLabel="Creative"
                />

                <Slider
                  label="Verbosity"
                  value={currentConfig.verbosity}
                  onChange={(v) => handleUpdate({ verbosity: v })}
                  leftLabel="Brief"
                  rightLabel="Lengthy"
                />
              </div>
            </ControlSection>

            {/* Tone Controls */}
            <ControlSection title="Tone & Personality" icon="💬" defaultOpen={true}>
              <div className="space-y-6">
                <Slider
                  label="Enthusiasm"
                  value={currentConfig.enthusiasm}
                  onChange={(v) => handleUpdate({ enthusiasm: v })}
                  leftLabel="Neutral"
                  rightLabel="Enthusiastic"
                />

                <Slider
                  label="Empathy"
                  value={currentConfig.empathy}
                  onChange={(v) => handleUpdate({ empathy: v })}
                  leftLabel="Objective"
                  rightLabel="Empathetic"
                />

                <Slider
                  label="Confidence"
                  value={currentConfig.confidence}
                  onChange={(v) => handleUpdate({ confidence: v })}
                  leftLabel="Cautious"
                  rightLabel="Assertive"
                />

                <Slider
                  label="Humor"
                  value={currentConfig.humor}
                  onChange={(v) => handleUpdate({ humor: v })}
                  leftLabel="Serious"
                  rightLabel="Humorous"
                />
              </div>
            </ControlSection>

            {/* Structure Controls */}
            <ControlSection title="Response Structure" icon="📋" defaultOpen={true}>
              <div className="space-y-4">
                <Toggle
                  label="Include Examples"
                  checked={currentConfig.useExamples}
                  onChange={(v) => handleUpdate({ useExamples: v })}
                  description="Add relevant examples to illustrate points"
                />

                <Toggle
                  label="Use Bullet Points"
                  checked={currentConfig.useBulletPoints}
                  onChange={(v) => handleUpdate({ useBulletPoints: v })}
                  description="Organize information with bullet points"
                />

                <Toggle
                  label="Use Numbered Lists"
                  checked={currentConfig.useNumberedLists}
                  onChange={(v) => handleUpdate({ useNumberedLists: v })}
                  description="Use numbered lists for sequential information"
                />

                <Toggle
                  label="Include Code Samples"
                  checked={currentConfig.includeCodeSamples}
                  onChange={(v) => handleUpdate({ includeCodeSamples: v })}
                  description="Add code examples when relevant"
                />

                <Toggle
                  label="Include Analogies"
                  checked={currentConfig.includeAnalogies}
                  onChange={(v) => handleUpdate({ includeAnalogies: v })}
                  description="Use analogies to explain concepts"
                />

                <Toggle
                  label="Visual Descriptions"
                  checked={currentConfig.includeVisualDescriptions}
                  onChange={(v) => handleUpdate({ includeVisualDescriptions: v })}
                  description="Provide visual imagery and descriptions"
                />
              </div>
            </ControlSection>

            {/* Advanced Settings */}
            <ControlSection title="Advanced Settings" icon="⚙️" defaultOpen={false}>
              <div className="space-y-6">
                <Select
                  label="Response Length"
                  value={currentConfig.responseLength}
                  onChange={(v: any) => handleUpdate({ responseLength: v })}
                  options={[
                    { value: 'auto', label: 'Auto' },
                    { value: 'short', label: 'Short' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'long', label: 'Long' },
                    { value: 'comprehensive', label: 'Comprehensive' },
                  ]}
                />

                <Select
                  label="Perspective"
                  value={currentConfig.perspective}
                  onChange={(v: any) => handleUpdate({ perspective: v })}
                  options={[
                    { value: '1st-person', label: 'First Person (I/We)' },
                    { value: '2nd-person', label: 'Second Person (You)' },
                    { value: '3rd-person', label: 'Third Person (They/It)' },
                    { value: 'mixed', label: 'Mixed' },
                  ]}
                />

                <Select
                  label="Target Audience"
                  value={currentConfig.audience}
                  onChange={(v: any) => handleUpdate({ audience: v })}
                  options={[
                    { value: 'general', label: 'General Audience' },
                    { value: 'technical', label: 'Technical Audience' },
                    { value: 'executive', label: 'Executive Audience' },
                    { value: 'beginner', label: 'Beginners' },
                    { value: 'expert', label: 'Experts' },
                  ]}
                />

                <Select
                  label="Explanation Style"
                  value={currentConfig.explanationStyle}
                  onChange={(v: any) => handleUpdate({ explanationStyle: v })}
                  options={[
                    { value: 'direct', label: 'Direct' },
                    { value: 'socratic', label: 'Socratic (Questions)' },
                    { value: 'narrative', label: 'Narrative (Story)' },
                    { value: 'analytical', label: 'Analytical' },
                  ]}
                />

                <div className="pt-4 border-t border-robinhood-border">
                  <h4 className="text-sm font-semibold text-gray-300 mb-4">Priorities</h4>
                  <div className="space-y-4">
                    <Toggle
                      label="Prioritize Accuracy"
                      checked={currentConfig.prioritizeAccuracy}
                      onChange={(v) => handleUpdate({ prioritizeAccuracy: v })}
                    />

                    <Toggle
                      label="Prioritize Speed"
                      checked={currentConfig.prioritizeSpeed}
                      onChange={(v) => handleUpdate({ prioritizeSpeed: v })}
                    />

                    <Toggle
                      label="Prioritize Clarity"
                      checked={currentConfig.prioritizeClarity}
                      onChange={(v) => handleUpdate({ prioritizeClarity: v })}
                    />

                    <Toggle
                      label="Prioritize Comprehensiveness"
                      checked={currentConfig.prioritizeComprehensiveness}
                      onChange={(v) => handleUpdate({ prioritizeComprehensiveness: v })}
                    />
                  </div>
                </div>
              </div>
            </ControlSection>

            {/* Custom Instructions */}
            <ControlSection title="Custom Instructions" icon="✍️" defaultOpen={false}>
              <textarea
                value={currentConfig.customInstructions}
                onChange={(e) => handleUpdate({ customInstructions: e.target.value })}
                placeholder="Add any custom instructions or specific requirements..."
                className="w-full h-32 px-4 py-3 bg-robinhood-darker border border-robinhood-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-robinhood-green resize-none"
              />
            </ControlSection>
          </div>

          {/* Right Column - Actions & Preview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Actions */}
            <div className="bg-robinhood-card border border-robinhood-border rounded-xl p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-white mb-4">Actions</h3>

              <div className="space-y-3">
                <button
                  onClick={handleGeneratePrompt}
                  disabled={isGenerating}
                  className="w-full px-4 py-3 bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-green"
                >
                  {isGenerating ? 'Generating...' : '⚡ Generate Prompt'}
                </button>

                <button
                  onClick={() => duplicateConfig(currentConfig.id)}
                  className="w-full px-4 py-2 bg-robinhood-card border border-robinhood-border text-white rounded-lg hover:border-robinhood-green transition-all"
                >
                  📋 Duplicate
                </button>

                {configs.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this configuration?')) {
                        deleteConfig(currentConfig.id);
                      }
                    }}
                    className="w-full px-4 py-2 bg-robinhood-card border border-red-900/50 text-red-400 rounded-lg hover:border-red-500 transition-all"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="mt-6 pt-6 border-t border-robinhood-border">
                <h4 className="text-sm font-semibold text-gray-400 mb-3">Configuration Stats</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Total Configs</span>
                    <span className="text-robinhood-green font-mono">{configs.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Active Toggles</span>
                    <span className="text-robinhood-green font-mono">
                      {[
                        currentConfig.useExamples,
                        currentConfig.useBulletPoints,
                        currentConfig.useNumberedLists,
                        currentConfig.includeCodeSamples,
                        currentConfig.includeAnalogies,
                        currentConfig.includeVisualDescriptions,
                      ].filter(Boolean).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Prompt Modal */}
        {showPrompt && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
            <div className="bg-robinhood-card border border-robinhood-border rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="px-6 py-4 border-b border-robinhood-border flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Generated System Prompt</h3>
                <button
                  onClick={() => setShowPrompt(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="px-6 py-6 overflow-y-auto flex-1">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-robinhood-darker p-4 rounded-lg border border-robinhood-border">
                  {generatedPrompt}
                </pre>
              </div>

              <div className="px-6 py-4 border-t border-robinhood-border flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 px-4 py-2 bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90 transition-all"
                >
                  📋 Copy to Clipboard
                </button>
                <button
                  onClick={() => setShowPrompt(false)}
                  className="px-4 py-2 bg-robinhood-card border border-robinhood-border text-white rounded-lg hover:border-robinhood-green transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
