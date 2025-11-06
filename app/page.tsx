'use client';

import React, { useState, useEffect } from 'react';
import { useStore, createDefaultConfig } from '@/lib/store';
import { Slider } from '@/components/Slider';
import { Toggle } from '@/components/Toggle';
import { Select } from '@/components/Select';
import { ControlSection } from '@/components/ControlSection';

interface GeneratedPromptRecord {
  id: string;
  configName: string;
  promptText: string;
  variation: number;
  totalVariations: number;
  timestamp: string;
}

interface TestResult {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
}

export default function Home() {
  const { configs, activeConfig, addConfig, updateConfig, setActiveConfig, deleteConfig, duplicateConfig, setConfigs } = useStore();
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateCount, setGenerateCount] = useState(3);
  const [testCount, setTestCount] = useState(3);
  const [testPromptText, setTestPromptText] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(0);
  const [isTesting, setIsTesting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [generatedHistory, setGeneratedHistory] = useState<GeneratedPromptRecord[]>([]);
  const [currentGeneratedPrompts, setCurrentGeneratedPrompts] = useState<GeneratedPromptRecord[]>([]);
  const [selectedGeneratedIndex, setSelectedGeneratedIndex] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Load configs from Redis - this is the single source of truth
    fetch('/api/configs')
      .then(res => res.json())
      .then(data => {
        if (data.configs && data.configs.length > 0) {
          // Replace all configs with those from Redis (user-specific)
          setConfigs(data.configs);
        }
      })
      .catch(err => console.error('Error loading configs from Redis:', err));

    // Load generated prompts from Redis
    fetch('/api/generated')
      .then(res => res.json())
      .then(data => {
        if (data.prompts) {
          setGeneratedHistory(data.prompts);
        }
      })
      .catch(err => console.error('Error loading generated prompts:', err));
  }, []);

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

  const handleGeneratePrompts = async () => {
    setIsGenerating(true);
    const prompts: GeneratedPromptRecord[] = [];

    for (let i = 0; i < generateCount; i++) {
      try {
        const response = await fetch('/api/generate-prompt', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...currentConfig, variationIndex: i }),
        });

        const data = await response.json();
        const record: GeneratedPromptRecord = {
          id: `${Date.now()}-${i}`,
          configName: currentConfig.name,
          promptText: data.systemPrompt,
          variation: i + 1,
          totalVariations: generateCount,
          timestamp: new Date().toLocaleTimeString(),
        };
        prompts.push(record);
      } catch (error) {
        console.error('Error generating prompt:', error);
      }
    }

    setCurrentGeneratedPrompts(prompts);
    setSelectedGeneratedIndex(0);
    if (prompts.length > 0) {
      setGeneratedPrompt(prompts[0].promptText);
    }

    // Save prompts to Redis and update local state
    for (const prompt of prompts) {
      await fetch('/api/generated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prompt),
      });
    }

    const updated = [...prompts, ...generatedHistory].slice(0, 50);
    setGeneratedHistory(updated);

    setIsGenerating(false);
    setShowGenerateModal(false);
    setShowPrompt(true);
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
                  ? 'bg-robinhood-border text-white border-l-2 border-robinhood-green'
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
              if (confirm(`Delete "${currentConfig.name}"?`)) {
                deleteConfig(currentConfig.id);
              }
            }}
            className="w-full px-3 py-2 text-xs bg-robinhood-card border border-red-900/50 text-red-400 rounded-lg hover:border-red-500 disabled:opacity-30"
            disabled={configs.length === 1}
          >
            🗑️ Delete
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
              <input
                type="text"
                value={currentConfig.name}
                onChange={(e) => handleUpdate({ name: e.target.value })}
                className="text-lg font-bold bg-transparent border-none outline-none text-white focus:ring-1 focus:ring-robinhood-green rounded px-2 py-1"
                placeholder="Configuration Name"
              />
            </div>
            <button
              onClick={() => duplicateConfig(currentConfig.id)}
              className="px-3 py-1.5 text-sm bg-robinhood-card border border-robinhood-border text-white rounded-lg hover:border-robinhood-green"
            >
              📋 Duplicate
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1600px] mx-auto px-4 py-4">
            <div className="grid grid-cols-12 gap-4">
              {/* Controls Column */}
              <div className="col-span-8 space-y-3">
                {/* Response Style */}
                <ControlSection title="Response Style" icon="🎨" defaultOpen={true}>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <Slider
                      label="Detail Level"
                      value={currentConfig.detailLevel}
                      onChange={(v) => handleUpdate({ detailLevel: v })}
                      leftLabel="Concise"
                      rightLabel="Detailed"
                      tooltip={`Low: "The sky is blue" → High: "Due to Rayleigh scattering..."`}
                    />
                    <Slider
                      label="Formality"
                      value={currentConfig.formalityLevel}
                      onChange={(v) => handleUpdate({ formalityLevel: v })}
                      leftLabel="Casual"
                      rightLabel="Formal"
                      tooltip={`Low: "Hey! Let's go..." → High: "It is imperative..."`}
                    />
                    <Slider
                      label="Technical Depth"
                      value={currentConfig.technicalDepth}
                      onChange={(v) => handleUpdate({ technicalDepth: v })}
                      leftLabel="Simple"
                      rightLabel="Advanced"
                      tooltip={`Low: "It stores data" → High: "B-tree indexing O(log n)"`}
                    />
                    <Slider
                      label="Creativity"
                      value={currentConfig.creativityLevel}
                      onChange={(v) => handleUpdate({ creativityLevel: v })}
                      leftLabel="Factual"
                      rightLabel="Creative"
                      tooltip={`Low: "The report states..." → High: "Imagine a world..."`}
                    />
                    <Slider
                      label="Verbosity"
                      value={currentConfig.verbosity}
                      onChange={(v) => handleUpdate({ verbosity: v })}
                      leftLabel="Brief"
                      rightLabel="Lengthy"
                      tooltip={`Low: "Done." → High: "To accomplish this, first..."`}
                    />
                    <Slider
                      label="Industry Terminology"
                      value={currentConfig.industryKnowledge}
                      onChange={(v) => handleUpdate({ industryKnowledge: v })}
                      leftLabel="Explain Terms"
                      rightLabel="Use Acronyms"
                      tooltip={`Low: "Annual Percentage Rate" → High: "APR, LTV, DTI"`}
                    />
                  </div>
                </ControlSection>

                {/* Tone */}
                <ControlSection title="Tone & Personality" icon="💬" defaultOpen={true}>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    <Slider
                      label="Enthusiasm"
                      value={currentConfig.enthusiasm}
                      onChange={(v) => handleUpdate({ enthusiasm: v })}
                      leftLabel="Neutral"
                      rightLabel="Excited"
                      tooltip={`Low: "This is correct" → High: "Amazing work!"`}
                    />
                    <Slider
                      label="Empathy"
                      value={currentConfig.empathy}
                      onChange={(v) => handleUpdate({ empathy: v })}
                      leftLabel="Objective"
                      rightLabel="Caring"
                      tooltip={`Low: "Error occurred" → High: "I understand this is frustrating..."`}
                    />
                    <Slider
                      label="Confidence"
                      value={currentConfig.confidence}
                      onChange={(v) => handleUpdate({ confidence: v })}
                      leftLabel="Cautious"
                      rightLabel="Assertive"
                      tooltip={`Low: "This might be..." → High: "This is definitively..."`}
                    />
                    <Slider
                      label="Humor"
                      value={currentConfig.humor}
                      onChange={(v) => handleUpdate({ humor: v })}
                      leftLabel="Serious"
                      rightLabel="Playful"
                      tooltip={`Low: "Task complete" → High: "Mission accomplished! 🎉"`}
                    />
                  </div>
                </ControlSection>

                {/* Structure */}
                <ControlSection title="Response Structure" icon="📋" defaultOpen={true}>
                  <div className="grid grid-cols-3 gap-x-3 gap-y-1.5">
                    <div className="flex items-center justify-between bg-robinhood-darker/50 rounded px-2 py-1.5">
                      <span className="text-xs text-gray-300">Examples</span>
                      <Toggle label="" checked={currentConfig.useExamples} onChange={(v) => handleUpdate({ useExamples: v })} description="" />
                    </div>
                    <div className="flex items-center justify-between bg-robinhood-darker/50 rounded px-2 py-1.5">
                      <span className="text-xs text-gray-300">Bullets</span>
                      <Toggle label="" checked={currentConfig.useBulletPoints} onChange={(v) => handleUpdate({ useBulletPoints: v })} description="" />
                    </div>
                    <div className="flex items-center justify-between bg-robinhood-darker/50 rounded px-2 py-1.5">
                      <span className="text-xs text-gray-300">Numbers</span>
                      <Toggle label="" checked={currentConfig.useNumberedLists} onChange={(v) => handleUpdate({ useNumberedLists: v })} description="" />
                    </div>
                    <div className="flex items-center justify-between bg-robinhood-darker/50 rounded px-2 py-1.5">
                      <span className="text-xs text-gray-300">Code</span>
                      <Toggle label="" checked={currentConfig.includeCodeSamples} onChange={(v) => handleUpdate({ includeCodeSamples: v })} description="" />
                    </div>
                    <div className="flex items-center justify-between bg-robinhood-darker/50 rounded px-2 py-1.5">
                      <span className="text-xs text-gray-300">Analogies</span>
                      <Toggle label="" checked={currentConfig.includeAnalogies} onChange={(v) => handleUpdate({ includeAnalogies: v })} description="" />
                    </div>
                    <div className="flex items-center justify-between bg-robinhood-darker/50 rounded px-2 py-1.5">
                      <span className="text-xs text-gray-300">Visual</span>
                      <Toggle label="" checked={currentConfig.includeVisualDescriptions} onChange={(v) => handleUpdate({ includeVisualDescriptions: v })} description="" />
                    </div>
                    <div className="flex items-center justify-between bg-robinhood-darker/50 rounded px-2 py-1.5">
                      <span className="text-xs text-gray-300">Tables</span>
                      <Toggle label="" checked={currentConfig.includeTables} onChange={(v) => handleUpdate({ includeTables: v })} description="" />
                    </div>
                    <div className="flex items-center justify-between bg-robinhood-darker/50 rounded px-2 py-1.5">
                      <span className="text-xs text-gray-300">Snippets</span>
                      <Toggle label="" checked={currentConfig.includeSnippets} onChange={(v) => handleUpdate({ includeSnippets: v })} description="" />
                    </div>
                    <div className="flex items-center justify-between bg-robinhood-darker/50 rounded px-2 py-1.5">
                      <span className="text-xs text-gray-300">References</span>
                      <Toggle label="" checked={currentConfig.includeExternalReferences} onChange={(v) => handleUpdate({ includeExternalReferences: v })} description="" />
                    </div>
                    <div className="flex items-center justify-between bg-robinhood-darker/50 rounded px-2 py-1.5">
                      <span className="text-xs text-gray-300">Thought Process</span>
                      <Toggle label="" checked={currentConfig.showThoughtProcess} onChange={(v) => handleUpdate({ showThoughtProcess: v })} description="" />
                    </div>
                    <div className="flex items-center justify-between bg-robinhood-darker/50 rounded px-2 py-1.5">
                      <span className="text-xs text-gray-300">Step-by-Step</span>
                      <Toggle label="" checked={currentConfig.includeStepByStep} onChange={(v) => handleUpdate({ includeStepByStep: v })} description="" />
                    </div>
                    <div className="flex items-center justify-between bg-robinhood-darker/50 rounded px-2 py-1.5">
                      <span className="text-xs text-gray-300">Summary</span>
                      <Toggle label="" checked={currentConfig.includeSummary} onChange={(v) => handleUpdate({ includeSummary: v })} description="" />
                    </div>
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
                    <Select label="Target Generation" value={currentConfig.audience} onChange={(v: any) => handleUpdate({ audience: v })}
                      options={[
                        { value: 'gen-z', label: 'Gen Z (18-27)' },
                        { value: 'millennial', label: 'Millennial (28-43)' },
                        { value: 'gen-x', label: 'Gen X (44-59)' },
                        { value: 'boomer', label: 'Boomer (60-78)' },
                        { value: 'senior', label: 'Senior (79+)' },
                        { value: 'mixed', label: 'Mixed Audience' },
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
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-robinhood-border">
                    <div className="flex items-center justify-between bg-robinhood-darker/50 rounded px-2 py-1.5">
                      <span className="text-xs text-gray-300">Accuracy</span>
                      <Toggle label="" checked={currentConfig.prioritizeAccuracy} onChange={(v) => handleUpdate({ prioritizeAccuracy: v })} description="" />
                    </div>
                    <div className="flex items-center justify-between bg-robinhood-darker/50 rounded px-2 py-1.5">
                      <span className="text-xs text-gray-300">Speed</span>
                      <Toggle label="" checked={currentConfig.prioritizeSpeed} onChange={(v) => handleUpdate({ prioritizeSpeed: v })} description="" />
                    </div>
                    <div className="flex items-center justify-between bg-robinhood-darker/50 rounded px-2 py-1.5">
                      <span className="text-xs text-gray-300">Clarity</span>
                      <Toggle label="" checked={currentConfig.prioritizeClarity} onChange={(v) => handleUpdate({ prioritizeClarity: v })} description="" />
                    </div>
                    <div className="flex items-center justify-between bg-robinhood-darker/50 rounded px-2 py-1.5">
                      <span className="text-xs text-gray-300">Complete</span>
                      <Toggle label="" checked={currentConfig.prioritizeComprehensiveness} onChange={(v) => handleUpdate({ prioritizeComprehensiveness: v })} description="" />
                    </div>
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
                        placeholder="e.g., 'Also include option to output as PDF' or 'Use emojis'"
                        className="w-full px-3 py-2 text-sm bg-robinhood-darker border border-robinhood-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-robinhood-green"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-300 mb-1 block">Custom Instructions</label>
                      <textarea
                        value={currentConfig.customInstructions}
                        onChange={(e) => handleUpdate({ customInstructions: e.target.value })}
                        placeholder="Add specific requirements for financial/mortgage context..."
                        className="w-full h-20 px-3 py-2 text-sm bg-robinhood-darker border border-robinhood-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-robinhood-green resize-none"
                      />
                    </div>
                  </div>
                </ControlSection>
              </div>

              {/* Right Column - History Panel */}
              <div className="col-span-4 space-y-3">
                {/* Actions */}
                <div className="bg-robinhood-card border border-robinhood-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowGenerateModal(true)}
                      disabled={isGenerating}
                      className="w-full px-4 py-2.5 text-sm bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90 disabled:opacity-50 glow-green"
                    >
                      {isGenerating ? 'Generating...' : '⚡ Generate Prompts'}
                    </button>

                    {generatedPrompt && (
                      <>
                        <button
                          onClick={() => setShowTestModal(true)}
                          className="w-full px-4 py-2 text-sm bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                        >
                          🧪 Test Prompt
                        </button>
                        <button
                          onClick={() => setShowPrompt(true)}
                          className="w-full px-3 py-2 text-sm bg-robinhood-card border border-robinhood-border text-white rounded-lg hover:border-robinhood-green"
                        >
                          👁️ View Current
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Generated Prompts History */}
                <div className="bg-robinhood-card border border-robinhood-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">Generated Prompts</h3>
                    <span className="text-xs text-robinhood-green font-mono">{generatedHistory.length}</span>
                  </div>

                  <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                    {generatedHistory.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-4">No prompts generated yet</p>
                    ) : (
                      generatedHistory.map((record, index) => (
                        <div key={record.id} className="p-2 bg-robinhood-darker border border-robinhood-border rounded hover:border-robinhood-green/50 transition-colors">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-gray-500">{record.timestamp}</span>
                            <button
                              onClick={() => copyToClipboard(record.promptText)}
                              className="text-xs text-robinhood-green hover:text-robinhood-green/80"
                            >
                              📋
                            </button>
                          </div>
                          <p className="text-xs font-medium text-gray-300 truncate">{record.configName}</p>
                          <p className="text-[10px] text-gray-600">
                            {record.totalVariations > 1 ? `${record.variation}/${record.totalVariations}` : 'Single'}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate mt-1">{record.promptText.substring(0, 60)}...</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-robinhood-card border border-robinhood-border rounded-xl max-w-xl w-full">
            <div className="px-6 py-4 border-b border-robinhood-border flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Generate System Prompts</h3>
              <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300 mb-3 block">How many variations? (1-10)</label>
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 3, 5, 10].map((num) => (
                    <button
                      key={num}
                      onClick={() => setGenerateCount(num)}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                        generateCount === num
                          ? 'bg-robinhood-green text-robinhood-dark'
                          : 'bg-robinhood-darker border border-robinhood-border text-gray-400 hover:border-robinhood-green'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  Generate multiple variations to compare phrasings and select the best one for your needs
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-robinhood-border flex gap-3">
              <button
                onClick={handleGeneratePrompts}
                disabled={isGenerating}
                className="flex-1 px-4 py-2.5 bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90 disabled:opacity-50"
              >
                {isGenerating ? `Generating ${generateCount} variation${generateCount > 1 ? 's' : ''}...` : `🎨 Generate ${generateCount} Variation${generateCount > 1 ? 's' : ''}`}
              </button>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="px-4 py-2 bg-robinhood-card border border-robinhood-border text-white rounded-lg hover:border-robinhood-green"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* View Generated Prompts Modal (after multi-generate) */}
      {showPrompt && currentGeneratedPrompts.length > 1 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-robinhood-card border border-robinhood-border rounded-xl max-w-5xl w-full max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-robinhood-border flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">Generated Prompts</h3>
                <p className="text-sm text-gray-400 mt-1">Viewing {selectedGeneratedIndex + 1} of {currentGeneratedPrompts.length}</p>
              </div>
              <button onClick={() => setShowPrompt(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-gray-300">{currentGeneratedPrompts[selectedGeneratedIndex].configName}</p>
                    <p className="text-xs text-gray-500">Variation {currentGeneratedPrompts[selectedGeneratedIndex].variation} of {currentGeneratedPrompts[selectedGeneratedIndex].totalVariations}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(currentGeneratedPrompts[selectedGeneratedIndex].promptText)}
                    className="px-3 py-1.5 bg-robinhood-green/20 text-robinhood-green rounded hover:bg-robinhood-green/30 text-sm"
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="p-4 bg-robinhood-darker border border-robinhood-border rounded-lg max-h-[500px] overflow-y-auto">
                  <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">{currentGeneratedPrompts[selectedGeneratedIndex].promptText}</pre>
                </div>
                <div className="text-xs text-gray-500">
                  Character count: {currentGeneratedPrompts[selectedGeneratedIndex].promptText.length}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-robinhood-border flex items-center justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedGeneratedIndex(Math.max(0, selectedGeneratedIndex - 1))}
                  disabled={selectedGeneratedIndex === 0}
                  className="px-4 py-2 bg-robinhood-darker border border-robinhood-border text-white rounded-lg hover:border-robinhood-green disabled:opacity-30"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setSelectedGeneratedIndex(Math.min(currentGeneratedPrompts.length - 1, selectedGeneratedIndex + 1))}
                  disabled={selectedGeneratedIndex === currentGeneratedPrompts.length - 1}
                  className="px-4 py-2 bg-robinhood-darker border border-robinhood-border text-white rounded-lg hover:border-robinhood-green disabled:opacity-30"
                >
                  Next →
                </button>
              </div>

              <div className="flex gap-1">
                {currentGeneratedPrompts.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedGeneratedIndex(index)}
                    className={`w-8 h-8 rounded-lg font-semibold text-xs transition-all ${
                      selectedGeneratedIndex === index
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
                  copyToClipboard(currentGeneratedPrompts.map(p => p.promptText).join('\n\n---\n\n'));
                }}
                className="px-4 py-2 bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90"
              >
                📋 Copy All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Single Prompt View Modal */}
      {showPrompt && currentGeneratedPrompts.length <= 1 && (
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
