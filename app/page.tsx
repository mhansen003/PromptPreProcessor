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
  const [savedPrompts, setSavedPrompts] = useState<Array<{id: string, name: string, prompt: string}>>([]);
  const [testPrompt, setTestPrompt] = useState('');
  const [testResponse, setTestResponse] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!activeConfig && configs.length > 0) {
      setActiveConfig(configs[0]);
    }
    // Load saved prompts from localStorage
    const saved = localStorage.getItem('saved-prompts');
    if (saved) {
      setSavedPrompts(JSON.parse(saved));
    }
  }, [activeConfig, configs, setActiveConfig]);

  if (!mounted) {
    return null;
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
      handleUpdate({ systemPrompt: data.systemPrompt });
    } catch (error) {
      console.error('Error generating prompt:', error);
      setGeneratedPrompt('Error generating prompt. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSavePrompt = () => {
    if (!generatedPrompt) return;
    const newPrompt = {
      id: Date.now().toString(),
      name: currentConfig.name + ' - ' + new Date().toLocaleTimeString(),
      prompt: generatedPrompt
    };
    const updated = [...savedPrompts, newPrompt];
    setSavedPrompts(updated);
    localStorage.setItem('saved-prompts', JSON.stringify(updated));
  };

  const handleTestPrompt = async () => {
    if (!testPrompt || !generatedPrompt) return;
    setIsTesting(true);
    try {
      const response = await fetch('/api/test-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt: generatedPrompt, userPrompt: testPrompt }),
      });
      const data = await response.json();
      setTestResponse(data.response);
    } catch (error) {
      console.error('Error testing prompt:', error);
      setTestResponse('Error testing prompt');
    } finally {
      setIsTesting(false);
    }
  };

  const handleNewConfig = () => {
    const newConfig = createDefaultConfig();
    addConfig(newConfig);
    setActiveConfig(newConfig);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-robinhood-dark">
      {/* Compact Header */}
      <header className="border-b border-robinhood-border bg-robinhood-darker/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-robinhood-green text-xl">⚡</span>
            <h1 className="text-lg font-bold text-white">PromptPreProcessor</h1>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={currentConfig.id}
              onChange={(e) => {
                const config = configs.find(c => c.id === e.target.value);
                if (config) setActiveConfig(config);
              }}
              className="px-3 py-1.5 text-sm bg-robinhood-card border border-robinhood-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-robinhood-green"
            >
              {configs.map(config => (
                <option key={config.id} value={config.id}>{config.name}</option>
              ))}
            </select>
            <button
              onClick={handleNewConfig}
              className="px-3 py-1.5 text-sm bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90"
            >
              + New
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Left Column - Controls (70%) */}
          <div className="col-span-8 space-y-3">
            {/* Config Name */}
            <div className="bg-robinhood-card border border-robinhood-border rounded-lg p-3">
              <input
                type="text"
                value={currentConfig.name}
                onChange={(e) => handleUpdate({ name: e.target.value })}
                className="w-full text-base font-semibold bg-transparent border-none outline-none text-white"
                placeholder="Configuration Name"
              />
            </div>

            {/* Response Style - Compact Grid */}
            <ControlSection title="Response Style" icon="🎨" defaultOpen={true}>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Slider
                  label="Detail"
                  value={currentConfig.detailLevel}
                  onChange={(v) => handleUpdate({ detailLevel: v })}
                  leftLabel="Concise"
                  rightLabel="Detailed"
                  tooltip="Controls how much information is included"
                  examples={{
                    low: '"The sky is blue."',
                    high: '"The sky appears blue due to Rayleigh scattering of sunlight by atmospheric molecules..."'
                  }}
                />
                <Slider
                  label="Formality"
                  value={currentConfig.formalityLevel}
                  onChange={(v) => handleUpdate({ formalityLevel: v })}
                  leftLabel="Casual"
                  rightLabel="Formal"
                  tooltip="Sets the tone from conversational to professional"
                  examples={{
                    low: '"Hey! Let\'s dive in..."',
                    high: '"It is imperative to consider..."'
                  }}
                />
                <Slider
                  label="Technical"
                  value={currentConfig.technicalDepth}
                  onChange={(v) => handleUpdate({ technicalDepth: v })}
                  leftLabel="Simple"
                  rightLabel="Advanced"
                  tooltip="Adjusts complexity of explanations"
                  examples={{
                    low: '"It stores data"',
                    high: '"Utilizes B-tree indexing for O(log n) lookups"'
                  }}
                />
                <Slider
                  label="Creativity"
                  value={currentConfig.creativityLevel}
                  onChange={(v) => handleUpdate({ creativityLevel: v })}
                  leftLabel="Factual"
                  rightLabel="Creative"
                  tooltip="Balance between facts and creative expression"
                  examples={{
                    low: '"The report states..."',
                    high: '"Imagine a world where..."'
                  }}
                />
                <Slider
                  label="Verbosity"
                  value={currentConfig.verbosity}
                  onChange={(v) => handleUpdate({ verbosity: v })}
                  leftLabel="Brief"
                  rightLabel="Lengthy"
                  tooltip="Controls overall response length"
                  examples={{
                    low: '"Done."',
                    high: '"To accomplish this, first consider..."'
                  }}
                />
              </div>
            </ControlSection>

            {/* Tone - Compact Grid */}
            <ControlSection title="Tone" icon="💬" defaultOpen={true}>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                <Slider
                  label="Enthusiasm"
                  value={currentConfig.enthusiasm}
                  onChange={(v) => handleUpdate({ enthusiasm: v })}
                  leftLabel="Neutral"
                  rightLabel="Excited"
                  tooltip="Energy level in responses"
                  examples={{
                    low: '"This is correct."',
                    high: '"This is amazing! Great work!"'
                  }}
                />
                <Slider
                  label="Empathy"
                  value={currentConfig.empathy}
                  onChange={(v) => handleUpdate({ empathy: v })}
                  leftLabel="Objective"
                  rightLabel="Caring"
                  tooltip="Emotional understanding and warmth"
                  examples={{
                    low: '"The error occurred."',
                    high: '"I understand this is frustrating..."'
                  }}
                />
                <Slider
                  label="Confidence"
                  value={currentConfig.confidence}
                  onChange={(v) => handleUpdate({ confidence: v })}
                  leftLabel="Cautious"
                  rightLabel="Assertive"
                  tooltip="Certainty in statements"
                  examples={{
                    low: '"This might be correct..."',
                    high: '"This is definitively the solution."'
                  }}
                />
                <Slider
                  label="Humor"
                  value={currentConfig.humor}
                  onChange={(v) => handleUpdate({ humor: v })}
                  leftLabel="Serious"
                  rightLabel="Playful"
                  tooltip="Use of humor and wit"
                  examples={{
                    low: '"The task is complete."',
                    high: '"Mission accomplished! 🎉"'
                  }}
                />
              </div>
            </ControlSection>

            {/* Structure - Compact 3 Column */}
            <ControlSection title="Structure" icon="📋" defaultOpen={true}>
              <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                <Toggle label="Examples" checked={currentConfig.useExamples} onChange={(v) => handleUpdate({ useExamples: v })} tooltip="Include examples to illustrate concepts" />
                <Toggle label="Bullets" checked={currentConfig.useBulletPoints} onChange={(v) => handleUpdate({ useBulletPoints: v })} tooltip="Use bullet points for lists" />
                <Toggle label="Numbers" checked={currentConfig.useNumberedLists} onChange={(v) => handleUpdate({ useNumberedLists: v })} tooltip="Use numbered lists for sequences" />
                <Toggle label="Code" checked={currentConfig.includeCodeSamples} onChange={(v) => handleUpdate({ includeCodeSamples: v })} tooltip="Include code examples when relevant" />
                <Toggle label="Analogies" checked={currentConfig.includeAnalogies} onChange={(v) => handleUpdate({ includeAnalogies: v })} tooltip="Use analogies to explain concepts" />
                <Toggle label="Visual" checked={currentConfig.includeVisualDescriptions} onChange={(v) => handleUpdate({ includeVisualDescriptions: v })} tooltip="Include visual descriptions" />
              </div>
            </ControlSection>

            {/* Advanced - Compact 2 Column */}
            <ControlSection title="Advanced" icon="⚙️" defaultOpen={false}>
              <div className="grid grid-cols-2 gap-4">
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
                    { value: '3rd-person', label: 'Third Person (They)' },
                    { value: 'mixed', label: 'Mixed' },
                  ]}
                />
                <Select
                  label="Target Audience"
                  value={currentConfig.audience}
                  onChange={(v: any) => handleUpdate({ audience: v })}
                  options={[
                    { value: 'general', label: 'General' },
                    { value: 'technical', label: 'Technical' },
                    { value: 'executive', label: 'Executive' },
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'expert', label: 'Expert' },
                  ]}
                />
                <Select
                  label="Style"
                  value={currentConfig.explanationStyle}
                  onChange={(v: any) => handleUpdate({ explanationStyle: v })}
                  options={[
                    { value: 'direct', label: 'Direct' },
                    { value: 'socratic', label: 'Socratic' },
                    { value: 'narrative', label: 'Narrative' },
                    { value: 'analytical', label: 'Analytical' },
                  ]}
                />
              </div>
              <div className="grid grid-cols-4 gap-3 mt-3 pt-3 border-t border-robinhood-border">
                <Toggle label="Accuracy" checked={currentConfig.prioritizeAccuracy} onChange={(v) => handleUpdate({ prioritizeAccuracy: v })} />
                <Toggle label="Speed" checked={currentConfig.prioritizeSpeed} onChange={(v) => handleUpdate({ prioritizeSpeed: v })} />
                <Toggle label="Clarity" checked={currentConfig.prioritizeClarity} onChange={(v) => handleUpdate({ prioritizeClarity: v })} />
                <Toggle label="Complete" checked={currentConfig.prioritizeComprehensiveness} onChange={(v) => handleUpdate({ prioritizeComprehensiveness: v })} />
              </div>
            </ControlSection>

            {/* Custom Style & Instructions */}
            <ControlSection title="Custom" icon="✍️" defaultOpen={false}>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-300 mb-1 block">Additional Style</label>
                  <input
                    type="text"
                    value={currentConfig.customStyle}
                    onChange={(e) => handleUpdate({ customStyle: e.target.value })}
                    placeholder="e.g., 'Also include option to output as PDF' or 'Use emojis'"
                    className="w-full px-3 py-2 text-sm bg-robinhood-darker border border-robinhood-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-robinhood-green"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-300 mb-1 block">Custom Instructions</label>
                  <textarea
                    value={currentConfig.customInstructions}
                    onChange={(e) => handleUpdate({ customInstructions: e.target.value })}
                    placeholder="Add specific requirements or guidelines..."
                    className="w-full h-20 px-3 py-2 text-sm bg-robinhood-darker border border-robinhood-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-robinhood-green resize-none"
                  />
                </div>
              </div>
            </ControlSection>
          </div>

          {/* Right Column - Actions & Test (30%) */}
          <div className="col-span-4 space-y-3">
            {/* Actions */}
            <div className="bg-robinhood-card border border-robinhood-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={handleGeneratePrompt}
                  disabled={isGenerating}
                  className="w-full px-4 py-2.5 text-sm bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90 disabled:opacity-50 glow-green"
                >
                  {isGenerating ? 'Generating...' : '⚡ Generate Prompt'}
                </button>
                <button
                  onClick={() => duplicateConfig(currentConfig.id)}
                  className="w-full px-3 py-2 text-sm bg-robinhood-card border border-robinhood-border text-white rounded-lg hover:border-robinhood-green"
                >
                  📋 Duplicate
                </button>
                {configs.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm('Delete this configuration?')) {
                        deleteConfig(currentConfig.id);
                      }
                    }}
                    className="w-full px-3 py-2 text-sm bg-robinhood-card border border-red-900/50 text-red-400 rounded-lg hover:border-red-500"
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>

            {/* Test Harness */}
            {generatedPrompt && (
              <div className="bg-robinhood-card border border-robinhood-border rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-2 flex items-center justify-between">
                  Test Harness
                  <button
                    onClick={handleSavePrompt}
                    className="text-xs px-2 py-1 bg-robinhood-green/20 text-robinhood-green rounded hover:bg-robinhood-green/30"
                  >
                    💾 Save
                  </button>
                </h3>
                <div className="space-y-2">
                  <textarea
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                    placeholder="Enter test prompt..."
                    className="w-full h-20 px-2 py-2 text-xs bg-robinhood-darker border border-robinhood-border rounded text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-robinhood-green resize-none"
                  />
                  <button
                    onClick={handleTestPrompt}
                    disabled={isTesting || !testPrompt}
                    className="w-full px-3 py-2 text-xs bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isTesting ? 'Testing...' : '🧪 Test with OpenAI'}
                  </button>
                  {testResponse && (
                    <div className="p-2 bg-robinhood-darker border border-robinhood-border rounded text-xs text-gray-300 max-h-32 overflow-y-auto">
                      {testResponse}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Saved Prompts Library */}
            <div className="bg-robinhood-card border border-robinhood-border rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Saved Prompts ({savedPrompts.length})</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedPrompts.length === 0 ? (
                  <p className="text-xs text-gray-500">No saved prompts yet</p>
                ) : (
                  savedPrompts.slice().reverse().map((saved) => (
                    <div key={saved.id} className="p-2 bg-robinhood-darker border border-robinhood-border rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-300 truncate">{saved.name}</span>
                        <button
                          onClick={() => copyToClipboard(saved.prompt)}
                          className="text-[10px] text-robinhood-green hover:text-robinhood-green/80"
                        >
                          📋
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate">{saved.prompt.substring(0, 80)}...</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-robinhood-card border border-robinhood-border rounded-lg p-3">
              <h4 className="text-xs font-semibold text-gray-400 mb-2">Stats</h4>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Configs</span>
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
                className="text-gray-400 hover:text-white"
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
                onClick={() => copyToClipboard(generatedPrompt)}
                className="flex-1 px-4 py-2 bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90"
              >
                📋 Copy to Clipboard
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="px-4 py-2 bg-robinhood-card border border-robinhood-border text-white rounded-lg hover:border-robinhood-green"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
