'use client';

import React, { useState, useEffect } from 'react';
import { useStore, createDefaultConfig } from '@/lib/store';
import { Slider } from '@/components/Slider';
import { Toggle } from '@/components/Toggle';
import { Select } from '@/components/Select';
import { ControlSection } from '@/components/ControlSection';

interface TestResult {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
}

export default function Home() {
  const { configs, activeConfig, addConfig, updateConfig, setActiveConfig, deleteConfig, duplicateConfig } = useStore();
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testCount, setTestCount] = useState(3);
  const [testPromptText, setTestPromptText] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (!activeConfig && configs.length > 0) {
      setActiveConfig(configs[0]);
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

  const handleRunTests = async () => {
    if (!testPromptText || !generatedPrompt) return;

    setIsTesting(true);
    const results: TestResult[] = [];

    for (let i = 0; i < testCount; i++) {
      try {
        const response = await fetch('/api/test-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ systemPrompt: generatedPrompt, userPrompt: testPromptText }),
        });
        const data = await response.json();
        results.push({
          id: `${Date.now()}-${i}`,
          prompt: testPromptText,
          response: data.response,
          timestamp: new Date().toLocaleTimeString()
        });
      } catch (error) {
        console.error('Error in test:', error);
        results.push({
          id: `${Date.now()}-${i}`,
          prompt: testPromptText,
          response: 'Error generating response',
          timestamp: new Date().toLocaleTimeString()
        });
      }
    }

    setTestResults(results);
    setIsTesting(false);
    setShowTestModal(false);
    setShowResultsModal(true);
    setSelectedResultIndex(0);
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
    <div className="min-h-screen bg-robinhood-dark flex">
      {/* Left Sidebar - Prompts List */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-robinhood-darker border-r border-robinhood-border flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-robinhood-border">
          <button
            onClick={handleNewConfig}
            className="w-full px-4 py-2 text-sm bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90 flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> New Prompt
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {configs.map((config) => (
            <button
              key={config.id}
              onClick={() => setActiveConfig(config)}
              className={`w-full text-left px-3 py-2.5 mb-1 rounded-lg text-sm transition-colors ${
                currentConfig.id === config.id
                  ? 'bg-robinhood-border text-white'
                  : 'text-gray-400 hover:bg-robinhood-card'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="truncate flex-1">{config.name}</span>
                {currentConfig.id === config.id && (
                  <span className="text-robinhood-green">●</span>
                )}
              </div>
              <div className="text-[10px] text-gray-600 mt-0.5">
                {new Date(config.createdAt).toLocaleDateString()}
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-robinhood-border">
          <button
            onClick={() => {
              if (confirm('Delete this prompt?')) {
                deleteConfig(currentConfig.id);
              }
            }}
            className="w-full px-3 py-2 text-xs bg-robinhood-card border border-red-900/50 text-red-400 rounded-lg hover:border-red-500"
            disabled={configs.length === 1}
          >
            🗑️ Delete Current
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b border-robinhood-border bg-robinhood-darker/50 backdrop-blur-sm">
          <div className="px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <span className="text-robinhood-green text-xl">⚡</span>
              <h1 className="text-lg font-bold text-white">PromptPreProcessor</h1>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={currentConfig.name}
                onChange={(e) => handleUpdate({ name: e.target.value })}
                className="px-3 py-1.5 text-sm bg-robinhood-card border border-robinhood-border rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-robinhood-green"
                placeholder="Configuration Name"
              />
              <button
                onClick={() => duplicateConfig(currentConfig.id)}
                className="px-3 py-1.5 text-sm bg-robinhood-card border border-robinhood-border text-white rounded-lg hover:border-robinhood-green"
              >
                📋 Duplicate
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-4 py-4">
            <div className="grid grid-cols-12 gap-4">
              {/* Controls Column */}
              <div className="col-span-9 space-y-3">
                {/* Response Style */}
                <ControlSection title="Response Style" icon="🎨" defaultOpen={true}>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <Slider
                        label="Detail Level"
                        value={currentConfig.detailLevel}
                        onChange={(v) => handleUpdate({ detailLevel: v })}
                        leftLabel="Concise"
                        rightLabel="Detailed"
                      />
                      <p className="text-[10px] text-gray-500 mt-1 italic">Low: "The sky is blue" → High: "Due to Rayleigh scattering..."</p>
                    </div>
                    <div>
                      <Slider
                        label="Formality"
                        value={currentConfig.formalityLevel}
                        onChange={(v) => handleUpdate({ formalityLevel: v })}
                        leftLabel="Casual"
                        rightLabel="Formal"
                      />
                      <p className="text-[10px] text-gray-500 mt-1 italic">Low: "Hey! Let's go..." → High: "It is imperative..."</p>
                    </div>
                    <div>
                      <Slider
                        label="Technical Depth"
                        value={currentConfig.technicalDepth}
                        onChange={(v) => handleUpdate({ technicalDepth: v })}
                        leftLabel="Simple"
                        rightLabel="Advanced"
                      />
                      <p className="text-[10px] text-gray-500 mt-1 italic">Low: "It stores data" → High: "B-tree indexing O(log n)"</p>
                    </div>
                    <div>
                      <Slider
                        label="Creativity"
                        value={currentConfig.creativityLevel}
                        onChange={(v) => handleUpdate({ creativityLevel: v })}
                        leftLabel="Factual"
                        rightLabel="Creative"
                      />
                      <p className="text-[10px] text-gray-500 mt-1 italic">Low: "The report states..." → High: "Imagine a world..."</p>
                    </div>
                    <div>
                      <Slider
                        label="Verbosity"
                        value={currentConfig.verbosity}
                        onChange={(v) => handleUpdate({ verbosity: v })}
                        leftLabel="Brief"
                        rightLabel="Lengthy"
                      />
                      <p className="text-[10px] text-gray-500 mt-1 italic">Low: "Done." → High: "To accomplish this, first..."</p>
                    </div>
                  </div>
                </ControlSection>

                {/* Tone */}
                <ControlSection title="Tone & Personality" icon="💬" defaultOpen={true}>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <div>
                      <Slider
                        label="Enthusiasm"
                        value={currentConfig.enthusiasm}
                        onChange={(v) => handleUpdate({ enthusiasm: v })}
                        leftLabel="Neutral"
                        rightLabel="Excited"
                      />
                      <p className="text-[10px] text-gray-500 mt-1 italic">Low: "This is correct" → High: "Amazing work!"</p>
                    </div>
                    <div>
                      <Slider
                        label="Empathy"
                        value={currentConfig.empathy}
                        onChange={(v) => handleUpdate({ empathy: v })}
                        leftLabel="Objective"
                        rightLabel="Caring"
                      />
                      <p className="text-[10px] text-gray-500 mt-1 italic">Low: "Error occurred" → High: "I understand this is frustrating..."</p>
                    </div>
                    <div>
                      <Slider
                        label="Confidence"
                        value={currentConfig.confidence}
                        onChange={(v) => handleUpdate({ confidence: v })}
                        leftLabel="Cautious"
                        rightLabel="Assertive"
                      />
                      <p className="text-[10px] text-gray-500 mt-1 italic">Low: "This might be..." → High: "This is definitively..."</p>
                    </div>
                    <div>
                      <Slider
                        label="Humor"
                        value={currentConfig.humor}
                        onChange={(v) => handleUpdate({ humor: v })}
                        leftLabel="Serious"
                        rightLabel="Playful"
                      />
                      <p className="text-[10px] text-gray-500 mt-1 italic">Low: "Task complete" → High: "Mission accomplished! 🎉"</p>
                    </div>
                  </div>
                </ControlSection>

                {/* Structure */}
                <ControlSection title="Structure" icon="📋" defaultOpen={true}>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2">
                    <Toggle label="Examples" checked={currentConfig.useExamples} onChange={(v) => handleUpdate({ useExamples: v })} description="Include examples" />
                    <Toggle label="Bullets" checked={currentConfig.useBulletPoints} onChange={(v) => handleUpdate({ useBulletPoints: v })} description="Use bullet points" />
                    <Toggle label="Numbers" checked={currentConfig.useNumberedLists} onChange={(v) => handleUpdate({ useNumberedLists: v })} description="Numbered lists" />
                    <Toggle label="Code" checked={currentConfig.includeCodeSamples} onChange={(v) => handleUpdate({ includeCodeSamples: v })} description="Code examples" />
                    <Toggle label="Analogies" checked={currentConfig.includeAnalogies} onChange={(v) => handleUpdate({ includeAnalogies: v })} description="Use analogies" />
                    <Toggle label="Visual" checked={currentConfig.includeVisualDescriptions} onChange={(v) => handleUpdate({ includeVisualDescriptions: v })} description="Visual descriptions" />
                  </div>
                </ControlSection>

                {/* Advanced */}
                <ControlSection title="Advanced Settings" icon="⚙️" defaultOpen={false}>
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Response Length" value={currentConfig.responseLength} onChange={(v: any) => handleUpdate({ responseLength: v })}
                      options={[
                        { value: 'auto', label: 'Auto' },
                        { value: 'short', label: 'Short' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'long', label: 'Long' },
                        { value: 'comprehensive', label: 'Comprehensive' },
                      ]}
                    />
                    <Select label="Perspective" value={currentConfig.perspective} onChange={(v: any) => handleUpdate({ perspective: v })}
                      options={[
                        { value: '1st-person', label: 'First Person (I/We)' },
                        { value: '2nd-person', label: 'Second Person (You)' },
                        { value: '3rd-person', label: 'Third Person (They)' },
                        { value: 'mixed', label: 'Mixed' },
                      ]}
                    />
                    <Select label="Target Audience" value={currentConfig.audience} onChange={(v: any) => handleUpdate({ audience: v })}
                      options={[
                        { value: 'general', label: 'General' },
                        { value: 'technical', label: 'Technical' },
                        { value: 'executive', label: 'Executive' },
                        { value: 'beginner', label: 'Beginner' },
                        { value: 'expert', label: 'Expert' },
                      ]}
                    />
                    <Select label="Explanation Style" value={currentConfig.explanationStyle} onChange={(v: any) => handleUpdate({ explanationStyle: v })}
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

                {/* Custom */}
                <ControlSection title="Custom Instructions" icon="✍️" defaultOpen={false}>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-300 mb-1 block">Additional Style</label>
                      <input
                        type="text"
                        value={currentConfig.customStyle}
                        onChange={(e) => handleUpdate({ customStyle: e.target.value })}
                        placeholder="e.g., 'Also include option to output as PDF'"
                        className="w-full px-3 py-2 text-sm bg-robinhood-darker border border-robinhood-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-robinhood-green"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-300 mb-1 block">Custom Instructions</label>
                      <textarea
                        value={currentConfig.customInstructions}
                        onChange={(e) => handleUpdate({ customInstructions: e.target.value })}
                        placeholder="Add specific requirements..."
                        className="w-full h-20 px-3 py-2 text-sm bg-robinhood-darker border border-robinhood-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-robinhood-green resize-none"
                      />
                    </div>
                  </div>
                </ControlSection>
              </div>

              {/* Actions Column */}
              <div className="col-span-3 space-y-3">
                <div className="bg-robinhood-card border border-robinhood-border rounded-lg p-4 sticky top-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleGeneratePrompt}
                      disabled={isGenerating}
                      className="w-full px-4 py-2.5 text-sm bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90 disabled:opacity-50 glow-green"
                    >
                      {isGenerating ? 'Generating...' : '⚡ Generate Prompt'}
                    </button>

                    {generatedPrompt && (
                      <button
                        onClick={() => setShowTestModal(true)}
                        className="w-full px-4 py-2.5 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                      >
                        🧪 Test Prompt
                      </button>
                    )}

                    <button
                      onClick={() => setShowPrompt(true)}
                      disabled={!generatedPrompt}
                      className="w-full px-3 py-2 text-sm bg-robinhood-card border border-robinhood-border text-white rounded-lg hover:border-robinhood-green disabled:opacity-50"
                    >
                      👁️ View Prompt
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-robinhood-border">
                    <h4 className="text-xs font-semibold text-gray-400 mb-2">Stats</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total Prompts</span>
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
                      {testResults.length > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">Test Results</span>
                          <button
                            onClick={() => setShowResultsModal(true)}
                            className="text-robinhood-green font-mono hover:underline"
                          >
                            {testResults.length} →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-robinhood-card border border-robinhood-border rounded-xl max-w-2xl w-full">
            <div className="px-6 py-4 border-b border-robinhood-border flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Test Prompt with OpenAI</h3>
              <button onClick={() => setShowTestModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Test Message</label>
                <textarea
                  value={testPromptText}
                  onChange={(e) => setTestPromptText(e.target.value)}
                  placeholder="Enter your test message here..."
                  className="w-full h-32 px-4 py-3 bg-robinhood-darker border border-robinhood-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-robinhood-green resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Number of Test Runs (1-10)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setTestCount(num)}
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-all ${
                        testCount === num
                          ? 'bg-robinhood-green text-robinhood-dark'
                          : 'bg-robinhood-darker border border-robinhood-border text-gray-400 hover:border-robinhood-green'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Run multiple tests to see response variation and consistency
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-robinhood-border flex gap-3">
              <button
                onClick={handleRunTests}
                disabled={isTesting || !testPromptText}
                className="flex-1 px-4 py-2 bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90 disabled:opacity-50"
              >
                {isTesting ? `Running ${testCount} tests...` : `🧪 Run ${testCount} Test${testCount > 1 ? 's' : ''}`}
              </button>
              <button
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 bg-robinhood-card border border-robinhood-border text-white rounded-lg hover:border-robinhood-green"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {showResultsModal && testResults.length > 0 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-robinhood-card border border-robinhood-border rounded-xl max-w-5xl w-full max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-robinhood-border flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Test Results</h3>
                <p className="text-sm text-gray-400 mt-1">Viewing {selectedResultIndex + 1} of {testResults.length}</p>
              </div>
              <button onClick={() => setShowResultsModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-300">Test Prompt</label>
                    <span className="text-xs text-gray-500">{testResults[selectedResultIndex].timestamp}</span>
                  </div>
                  <div className="p-4 bg-robinhood-darker border border-robinhood-border rounded-lg">
                    <p className="text-sm text-gray-300">{testResults[selectedResultIndex].prompt}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-300">AI Response</label>
                    <button
                      onClick={() => copyToClipboard(testResults[selectedResultIndex].response)}
                      className="text-xs px-3 py-1 bg-robinhood-green/20 text-robinhood-green rounded hover:bg-robinhood-green/30"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <div className="p-4 bg-robinhood-darker border border-robinhood-border rounded-lg max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans">{testResults[selectedResultIndex].response}</pre>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-robinhood-border flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedResultIndex(Math.max(0, selectedResultIndex - 1))}
                  disabled={selectedResultIndex === 0}
                  className="px-4 py-2 bg-robinhood-darker border border-robinhood-border text-white rounded-lg hover:border-robinhood-green disabled:opacity-30"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setSelectedResultIndex(Math.min(testResults.length - 1, selectedResultIndex + 1))}
                  disabled={selectedResultIndex === testResults.length - 1}
                  className="px-4 py-2 bg-robinhood-darker border border-robinhood-border text-white rounded-lg hover:border-robinhood-green disabled:opacity-30"
                >
                  Next →
                </button>
              </div>

              <div className="flex gap-1">
                {testResults.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedResultIndex(index)}
                    className={`w-8 h-8 rounded-lg font-semibold text-xs transition-all ${
                      selectedResultIndex === index
                        ? 'bg-robinhood-green text-robinhood-dark'
                        : 'bg-robinhood-darker border border-robinhood-border text-gray-400 hover:border-robinhood-green'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  copyToClipboard(testResults.map((r, i) => `Test ${i + 1}:\n${r.response}`).join('\n\n---\n\n'));
                }}
                className="px-4 py-2 bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90"
              >
                📋 Copy All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Prompt Modal */}
      {showPrompt && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-robinhood-card border border-robinhood-border rounded-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-robinhood-border flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Generated System Prompt</h3>
              <button onClick={() => setShowPrompt(false)} className="text-gray-400 hover:text-white">✕</button>
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
