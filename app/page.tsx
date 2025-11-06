'use client';

import React, { useState, useEffect } from 'react';
import { useStore, createDefaultConfig } from '@/lib/store';
import { Slider } from '@/components/Slider';
import { Toggle } from '@/components/Toggle';
import { Select } from '@/components/Select';
import { ControlSection } from '@/components/ControlSection';
import { Tooltip } from '@/components/Tooltip';

export default function Home() {
  const { configs, activeConfig, addConfig, updateConfig, saveConfig, setActiveConfig, deleteConfig, duplicateConfig, setConfigs } = useStore();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeletePersonalityModal, setShowDeletePersonalityModal] = useState(false);
  const [personalityToDelete, setPersonalityToDelete] = useState<string | null>(null);
  const [showViewPromptModal, setShowViewPromptModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string>('');
  const [showToaster, setShowToaster] = useState(false);
  const [toasterMessage, setToasterMessage] = useState('');

  useEffect(() => {
    setMounted(true);

    // Load configs from Redis - this is the single source of truth
    fetch('/api/configs')
      .then(res => res.json())
      .then(async (data) => {
        if (data.configs && data.configs.length > 0) {
          // Replace all configs with those from Redis (user-specific)
          setConfigs(data.configs);
        } else {
          // New user - initialize with default personalities from mhansen's current personalities
          // Request default personalities from API
          const defaultsRes = await fetch('/api/configs/defaults');
          const defaultsData = await defaultsRes.json();

          if (defaultsData.personalities && defaultsData.personalities.length > 0) {
            // Save default personalities for this user
            for (const personality of defaultsData.personalities) {
              // Create new IDs for each personality
              const newPersonality = {
                ...personality,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                createdAt: new Date().toISOString(),
              };

              await fetch('/api/configs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPersonality),
              });
            }

            // Reload configs after initialization
            const reloadRes = await fetch('/api/configs');
            const reloadData = await reloadRes.json();
            if (reloadData.configs && reloadData.configs.length > 0) {
              setConfigs(reloadData.configs);
            }
          }
        }
      })
      .catch(err => console.error('Error loading configs from Redis:', err));
  }, []);

  // Reset unsaved changes when switching configs (use activeConfig directly to avoid conditional hook)
  useEffect(() => {
    setHasUnsavedChanges(false);
  }, [activeConfig?.id]);

  if (!mounted) {
    return null;
  }

  const currentConfig = activeConfig || configs[0];

  if (!currentConfig) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const handleUpdate = (updates: any) => {
    updateConfig(currentConfig.id, updates);
    setHasUnsavedChanges(true);
  };

  const showToast = (message: string, duration = 3000) => {
    setToasterMessage(message);
    setShowToaster(true);
    setTimeout(() => setShowToaster(false), duration);
  };

  const handleSaveChanges = async () => {
    if (!currentConfig) return;

    setIsSaving(true);
    showToast('🔄 Generating prompt in background...');

    try {
      await saveConfig(currentConfig);
      setHasUnsavedChanges(false);
      showToast('✅ Personality saved and prompt generated!');
    } catch (error) {
      console.error('Failed to save changes:', error);
      showToast('❌ Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
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
    <div className="min-h-screen bg-robinhood-dark flex">
      {/* Left Sidebar - Prompt Personalities List */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-robinhood-darker border-r border-robinhood-border flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-robinhood-border">
          <button
            onClick={handleNewConfig}
            className="w-full px-4 py-2 text-sm bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90 flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> New Personality
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {configs.map((config) => (
            <div
              key={config.id}
              className={`relative group w-full text-left px-3 py-2.5 mb-1 rounded-lg text-sm transition-colors ${
                currentConfig.id === config.id
                  ? 'bg-robinhood-border text-white border-l-2 border-robinhood-green'
                  : 'text-gray-400 hover:bg-robinhood-card'
              }`}
            >
              <button
                onClick={() => setActiveConfig(config)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{config.emoji}</span>
                  <span className="truncate flex-1">{config.name}</span>
                  {currentConfig.id === config.id && (
                    <span className="text-robinhood-green">●</span>
                  )}
                </div>
                <div className="text-[10px] text-gray-600 mt-0.5">
                  {new Date(config.createdAt).toLocaleDateString()}
                </div>
                {config.isPublished && (
                  <div className="text-[9px] text-robinhood-green mt-0.5 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Published
                  </div>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPersonalityToDelete(config.id);
                  setShowDeletePersonalityModal(true);
                }}
                disabled={configs.length === 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 disabled:opacity-0 disabled:cursor-not-allowed"
                title="Delete personality"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
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
              <select
                value={currentConfig.emoji}
                onChange={(e) => handleUpdate({ emoji: e.target.value })}
                className="text-xl bg-transparent border-none outline-none cursor-pointer hover:bg-robinhood-card rounded px-1 transition-colors"
                title="Select emoji"
              >
                <option value="⚙️">⚙️</option>
                <option value="🎓">🎓</option>
                <option value="💻">💻</option>
                <option value="✨">✨</option>
                <option value="📊">📊</option>
                <option value="💬">💬</option>
                <option value="🔬">🔬</option>
                <option value="⚡">⚡</option>
                <option value="📚">📚</option>
                <option value="🐛">🐛</option>
                <option value="📱">📱</option>
                <option value="🎯">🎯</option>
                <option value="🚀">🚀</option>
                <option value="💡">💡</option>
                <option value="🔧">🔧</option>
                <option value="📝">📝</option>
                <option value="🎨">🎨</option>
                <option value="🌟">🌟</option>
                <option value="🔥">🔥</option>
                <option value="💪">💪</option>
              </select>
              <input
                type="text"
                value={currentConfig.name}
                onChange={(e) => {
                  handleUpdate({ name: e.target.value });
                  // Auto-save name change after typing stops
                  if ((window as any).renameSaveTimeout) {
                    clearTimeout((window as any).renameSaveTimeout);
                  }
                  (window as any).renameSaveTimeout = setTimeout(async () => {
                    try {
                      await saveConfig(currentConfig);
                      setHasUnsavedChanges(false);
                    } catch (err) {
                      console.error('Failed to auto-save name:', err);
                    }
                  }, 1000); // Auto-save after 1 second of no typing
                }}
                className="text-lg font-bold bg-transparent border-none outline-none text-white focus:ring-1 focus:ring-robinhood-green rounded px-2 py-1"
                placeholder="Personality Name"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveChanges}
                disabled={!hasUnsavedChanges || isSaving}
                className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-all ${
                  hasUnsavedChanges && !isSaving
                    ? 'bg-robinhood-green text-robinhood-dark hover:bg-robinhood-green/90 shadow-lg shadow-robinhood-green/20'
                    : 'bg-robinhood-card border border-robinhood-border text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSaving ? '💾 Saving...' : hasUnsavedChanges ? '💾 Save Changes' : '✓ Saved'}
              </button>
              <button
                onClick={() => duplicateConfig(currentConfig.id)}
                className="px-3 py-1.5 text-sm bg-robinhood-card border border-robinhood-border text-white rounded-lg hover:border-robinhood-green"
              >
                📋 Duplicate
              </button>

              {/* View Prompt Button */}
              <button
                onClick={() => setShowViewPromptModal(true)}
                disabled={!currentConfig.systemPrompt}
                className="px-3 py-1.5 text-sm bg-robinhood-card border border-robinhood-border text-white rounded-lg hover:border-robinhood-green disabled:opacity-30 disabled:cursor-not-allowed"
                title={currentConfig.systemPrompt ? 'View generated prompt' : 'Save to generate prompt'}
              >
                👁️ View Prompt
              </button>

              {/* Publish Button */}
              <button
                onClick={async () => {
                  if (!currentConfig.systemPrompt) {
                    showToast('⚠️ Save first to generate prompt before publishing');
                    return;
                  }
                  setIsPublishing(true);
                  showToast('🚀 Publishing personality...');
                  try {
                    const response = await fetch('/api/personalities/publish', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ personalityId: currentConfig.id }),
                    });
                    const data = await response.json();
                    if (data.success) {
                      updateConfig(currentConfig.id, { isPublished: true, publishedUrl: data.url });
                      setPublishedUrl(data.url);
                      setShowPublishSuccess(true);
                      showToast('✅ Personality published successfully!');
                    } else {
                      showToast('❌ Failed to publish. Please try again.');
                    }
                  } catch (error) {
                    console.error('Error publishing:', error);
                    showToast('❌ Failed to publish. Please try again.');
                  } finally {
                    setIsPublishing(false);
                  }
                }}
                disabled={isPublishing || !currentConfig.systemPrompt}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-all ${
                  currentConfig.isPublished
                    ? 'bg-robinhood-green/20 border border-robinhood-green text-robinhood-green'
                    : 'bg-robinhood-card border border-robinhood-border text-white hover:border-robinhood-green'
                } disabled:opacity-30 disabled:cursor-not-allowed`}
                title={!currentConfig.systemPrompt ? 'Save to generate prompt before publishing' : currentConfig.isPublished ? 'Already published' : 'Publish personality'}
              >
                {isPublishing ? '🚀 Publishing...' : currentConfig.isPublished ? '✅ Published' : '🌐 Publish'}
              </button>

              {/* Delete Personality Button */}
              <button
                onClick={() => {
                  setPersonalityToDelete(currentConfig.id);
                  setShowDeletePersonalityModal(true);
                }}
                disabled={configs.length === 1}
                className="px-3 py-1.5 text-sm bg-robinhood-card border border-red-900/50 text-red-400 rounded-lg hover:border-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Delete personality"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

            </div>
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
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center justify-between gap-1.5 bg-robinhood-darker/50 rounded px-2.5 py-1.5 border border-robinhood-border/30">
                      <Toggle
                        label="Examples"
                        checked={currentConfig.useExamples}
                        onChange={(v) => handleUpdate({ useExamples: v })}
                        description=""
                        tooltip="Include concrete examples to illustrate concepts and make ideas more tangible"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1.5 bg-robinhood-darker/50 rounded px-2.5 py-1.5 border border-robinhood-border/30">
                      <Toggle
                        label="Bullets"
                        checked={currentConfig.useBulletPoints}
                        onChange={(v) => handleUpdate({ useBulletPoints: v })}
                        description=""
                        tooltip="Format information as bullet points for easier scanning and readability"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1.5 bg-robinhood-darker/50 rounded px-2.5 py-1.5 border border-robinhood-border/30">
                      <Toggle
                        label="Numbers"
                        checked={currentConfig.useNumberedLists}
                        onChange={(v) => handleUpdate({ useNumberedLists: v })}
                        description=""
                        tooltip="Use numbered lists for sequential steps or ordered information"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1.5 bg-robinhood-darker/50 rounded px-2.5 py-1.5 border border-robinhood-border/30">
                      <Toggle
                        label="Code"
                        checked={currentConfig.includeCodeSamples}
                        onChange={(v) => handleUpdate({ includeCodeSamples: v })}
                        description=""
                        tooltip="Include code snippets and programming examples in responses"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1.5 bg-robinhood-darker/50 rounded px-2.5 py-1.5 border border-robinhood-border/30">
                      <Toggle
                        label="Analogies"
                        checked={currentConfig.includeAnalogies}
                        onChange={(v) => handleUpdate({ includeAnalogies: v })}
                        description=""
                        tooltip="Use analogies and metaphors to explain complex concepts through familiar comparisons"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1.5 bg-robinhood-darker/50 rounded px-2.5 py-1.5 border border-robinhood-border/30">
                      <Toggle
                        label="Visual"
                        checked={currentConfig.includeVisualDescriptions}
                        onChange={(v) => handleUpdate({ includeVisualDescriptions: v })}
                        description=""
                        tooltip="Provide visual descriptions and mental imagery to help visualize concepts"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1.5 bg-robinhood-darker/50 rounded px-2.5 py-1.5 border border-robinhood-border/30">
                      <Toggle
                        label="Tables"
                        checked={currentConfig.includeTables}
                        onChange={(v) => handleUpdate({ includeTables: v })}
                        description=""
                        tooltip="Present structured data and comparisons in table format"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1.5 bg-robinhood-darker/50 rounded px-2.5 py-1.5 border border-robinhood-border/30">
                      <Toggle
                        label="Snippets"
                        checked={currentConfig.includeSnippets}
                        onChange={(v) => handleUpdate({ includeSnippets: v })}
                        description=""
                        tooltip="Extract and highlight key quotes or important snippets from content"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1.5 bg-robinhood-darker/50 rounded px-2.5 py-1.5 border border-robinhood-border/30">
                      <Toggle
                        label="References"
                        checked={currentConfig.includeExternalReferences}
                        onChange={(v) => handleUpdate({ includeExternalReferences: v })}
                        description=""
                        tooltip="Include references to external resources, documentation, and sources"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1.5 bg-robinhood-darker/50 rounded px-2.5 py-1.5 border border-robinhood-border/30">
                      <Toggle
                        label="Thought Process"
                        checked={currentConfig.showThoughtProcess}
                        onChange={(v) => handleUpdate({ showThoughtProcess: v })}
                        description=""
                        tooltip="Show internal reasoning and chain of thought before answering (helps with complex problems)"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1.5 bg-robinhood-darker/50 rounded px-2.5 py-1.5 border border-robinhood-border/30">
                      <Toggle
                        label="Step-by-Step"
                        checked={currentConfig.includeStepByStep}
                        onChange={(v) => handleUpdate({ includeStepByStep: v })}
                        description=""
                        tooltip="Break down processes into clear, numbered step-by-step instructions"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1.5 bg-robinhood-darker/50 rounded px-2.5 py-1.5 border border-robinhood-border/30">
                      <Toggle
                        label="Summary"
                        checked={currentConfig.includeSummary}
                        onChange={(v) => handleUpdate({ includeSummary: v })}
                        description=""
                        tooltip="Include a summary section highlighting key points and takeaways"
                      />
                    </div>
                  </div>
                </ControlSection>

                {/* Advanced */}
                <ControlSection title="Advanced Settings" icon="⚙️" defaultOpen={false}>
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Response Length"
                      value={currentConfig.responseLength}
                      onChange={(v: any) => handleUpdate({ responseLength: v })}
                      tooltip="Control target response length: Auto (context-dependent), Short (1-2 paragraphs), Medium (3-5 paragraphs), Long (5-10 paragraphs), Comprehensive (detailed deep-dive)"
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
                      tooltip="Set grammatical perspective: First Person (I/We), Second Person (You - direct address), Third Person (They - objective), Mixed (context-dependent)"
                      options={[
                        { value: '1st-person', label: 'First Person (I/We)' },
                        { value: '2nd-person', label: 'Second Person (You)' },
                        { value: '3rd-person', label: 'Third Person (They)' },
                        { value: 'mixed', label: 'Mixed' },
                      ]}
                    />
                    <Select
                      label="Target Generation"
                      value={currentConfig.audience}
                      onChange={(v: any) => handleUpdate({ audience: v })}
                      tooltip="Tailor language and references to age group: Gen Z (modern slang, digital-native), Millennial (tech-savvy), Gen X (balanced), Boomer (traditional), Senior (accessible)"
                      options={[
                        { value: 'gen-z', label: 'Gen Z (18-27)' },
                        { value: 'millennial', label: 'Millennial (28-43)' },
                        { value: 'gen-x', label: 'Gen X (44-59)' },
                        { value: 'boomer', label: 'Boomer (60-78)' },
                        { value: 'senior', label: 'Senior (79+)' },
                        { value: 'mixed', label: 'Mixed Audience' },
                      ]}
                    />
                    <Select
                      label="Explanation Style"
                      value={currentConfig.explanationStyle}
                      onChange={(v: any) => handleUpdate({ explanationStyle: v })}
                      tooltip="Choose teaching approach: Direct (straightforward answers), Socratic (learning through questions), Narrative (story-based), Analytical (structured breakdown)"
                      options={[
                        { value: 'direct', label: 'Direct' },
                        { value: 'socratic', label: 'Socratic' },
                        { value: 'narrative', label: 'Narrative' },
                        { value: 'analytical', label: 'Analytical' },
                      ]}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-robinhood-border/30">
                    <div className="flex items-center justify-between gap-1.5 bg-robinhood-darker/50 rounded px-2.5 py-1.5 border border-robinhood-border/30">
                      <Toggle
                        label="Accuracy"
                        checked={currentConfig.prioritizeAccuracy}
                        onChange={(v) => handleUpdate({ prioritizeAccuracy: v })}
                        description=""
                        tooltip="Prioritize factual correctness and precision over speed or brevity"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1.5 bg-robinhood-darker/50 rounded px-2.5 py-1.5 border border-robinhood-border/30">
                      <Toggle
                        label="Speed"
                        checked={currentConfig.prioritizeSpeed}
                        onChange={(v) => handleUpdate({ prioritizeSpeed: v })}
                        description=""
                        tooltip="Prioritize quick, concise responses over comprehensive coverage"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1.5 bg-robinhood-darker/50 rounded px-2.5 py-1.5 border border-robinhood-border/30">
                      <Toggle
                        label="Clarity"
                        checked={currentConfig.prioritizeClarity}
                        onChange={(v) => handleUpdate({ prioritizeClarity: v })}
                        description=""
                        tooltip="Prioritize clear, understandable explanations using simple language"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-1.5 bg-robinhood-darker/50 rounded px-2.5 py-1.5 border border-robinhood-border/30">
                      <Toggle
                        label="Complete"
                        checked={currentConfig.prioritizeComprehensiveness}
                        onChange={(v) => handleUpdate({ prioritizeComprehensiveness: v })}
                        description=""
                        tooltip="Prioritize thorough, comprehensive coverage of topics with all relevant details"
                      />
                    </div>
                  </div>
                </ControlSection>

                {/* Custom */}
                <ControlSection title="Custom Instructions" icon="✍️" defaultOpen={false}>
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <label className="text-sm font-medium text-gray-300">Additional Style</label>
                        <Tooltip content="Add formatting or presentation requirements like 'Output as PDF', 'Use emojis', 'Include charts', 'Format for email'">
                          <div className="flex items-center justify-center w-4 h-4 rounded-full bg-robinhood-green/20 text-robinhood-green text-[10px] font-bold cursor-help hover:bg-robinhood-green hover:text-robinhood-dark hover:scale-110 transition-all shadow-sm">
                            i
                          </div>
                        </Tooltip>
                      </div>
                      <input
                        type="text"
                        value={currentConfig.customStyle}
                        onChange={(e) => handleUpdate({ customStyle: e.target.value })}
                        placeholder="e.g., 'Also include option to output as PDF' or 'Use emojis'"
                        className="w-full px-3 py-2 text-sm bg-robinhood-darker border border-robinhood-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-robinhood-green"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <label className="text-sm font-medium text-gray-300">Custom Instructions</label>
                        <Tooltip content="Add domain-specific requirements, context, or behaviors. Examples: 'Use mortgage industry standards', 'Reference CMG policies', 'Emphasize compliance requirements', 'Focus on customer service'">
                          <div className="flex items-center justify-center w-4 h-4 rounded-full bg-robinhood-green/20 text-robinhood-green text-[10px] font-bold cursor-help hover:bg-robinhood-green hover:text-robinhood-dark hover:scale-110 transition-all shadow-sm">
                            i
                          </div>
                        </Tooltip>
                      </div>
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
            </div>
          </div>
        </div>
      </div>

      {/* View Prompt Modal */}
      {showViewPromptModal && currentConfig && currentConfig.systemPrompt && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-robinhood-card border border-robinhood-green rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-robinhood-border flex items-center justify-between">
              <h3 className="text-2xl font-bold text-white">Generated System Prompt</h3>
              <button
                onClick={() => setShowViewPromptModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-robinhood-darker p-6 rounded-lg border border-robinhood-border">
                {currentConfig.systemPrompt}
              </pre>
            </div>
            <div className="px-6 py-4 border-t border-robinhood-border flex items-center justify-between bg-robinhood-darker/50">
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-robinhood-green">Character Count:</span> {currentConfig.systemPrompt.length.toLocaleString()}
              </p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(currentConfig.systemPrompt || '');
                  alert('Prompt copied to clipboard!');
                }}
                className="px-5 py-2.5 bg-robinhood-green text-robinhood-dark font-bold rounded-lg hover:bg-robinhood-green/90 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Personality Modal */}
      {showDeletePersonalityModal && personalityToDelete && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-gradient-to-br from-red-950/90 to-robinhood-card border-2 border-red-500 rounded-xl max-w-lg w-full shadow-2xl">
            <div className="px-6 py-5 border-b-2 border-red-500/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Delete Personality</h3>
                  <p className="text-sm text-red-300">This action cannot be undone</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-4">
                <p className="text-white font-semibold mb-2">
                  You are about to permanently delete:
                </p>
                <p className="text-xl text-robinhood-green font-bold mb-3">
                  "{configs.find(c => c.id === personalityToDelete)?.name}"
                </p>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>All personality settings and controls will be lost</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>This personality configuration cannot be recovered</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>Associated generated prompts will remain but won't be linked</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <p className="text-xs text-yellow-300 flex items-center gap-2">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Consider duplicating this personality first if you might need it later</span>
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t-2 border-red-500/30 bg-robinhood-darker/50">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (personalityToDelete) {
                      deleteConfig(personalityToDelete);
                      setShowDeletePersonalityModal(false);
                      setPersonalityToDelete(null);
                    }
                  }}
                  className="flex-1 px-5 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Personality
                </button>
                <button
                  onClick={() => {
                    setShowDeletePersonalityModal(false);
                    setPersonalityToDelete(null);
                  }}
                  className="flex-1 px-5 py-3 bg-robinhood-card border-2 border-robinhood-green text-white font-semibold rounded-lg hover:bg-robinhood-green hover:text-robinhood-dark transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Toaster Notification */}
      {showToaster && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="bg-robinhood-card border-2 border-robinhood-green rounded-lg shadow-2xl px-6 py-4 flex items-center gap-3 min-w-[300px]">
            <div className="text-2xl">{toasterMessage.split(' ')[0]}</div>
            <div className="flex-1 text-white font-medium">{toasterMessage.split(' ').slice(1).join(' ')}</div>
          </div>
        </div>
      )}

      {/* Publish Success Modal */}
      {showPublishSuccess && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-robinhood-card border-2 border-robinhood-green rounded-xl max-w-lg w-full shadow-2xl">
            <div className="px-6 py-5 border-b border-robinhood-green/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-robinhood-green/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-robinhood-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Published Prompt</h3>
                  <p className="text-sm text-gray-400">Share this public URL</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="bg-robinhood-darker border border-robinhood-green/30 rounded-lg p-4 mb-4">
                <p className="text-xs text-gray-400 mb-2 font-medium">Published URL:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm text-robinhood-green font-mono bg-robinhood-dark px-3 py-2 rounded border border-robinhood-green/20">
                    {publishedUrl}
                  </code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(publishedUrl);
                      alert('URL copied to clipboard!');
                    }}
                    className="px-3 py-2 bg-robinhood-green/20 hover:bg-robinhood-green/30 text-robinhood-green rounded transition-all"
                    title="Copy URL"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-blue-300 flex items-start gap-2">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Anyone with this URL can access your prompt personality. The URL is also saved in your prompt card for easy access.</span>
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-robinhood-border bg-robinhood-darker/50 flex gap-3">
              <a
                href={publishedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-all flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Visit URL
              </a>
              <button
                onClick={() => setShowPublishSuccess(false)}
                className="flex-1 px-4 py-2.5 bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90 transition-all"
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
