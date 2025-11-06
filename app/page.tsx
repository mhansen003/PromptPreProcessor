'use client';

import React, { useState, useEffect } from 'react';
import { useStore, createDefaultConfig } from '@/lib/store';
import { Slider } from '@/components/Slider';
import { Toggle } from '@/components/Toggle';
import { Select } from '@/components/Select';
import { ControlSection } from '@/components/ControlSection';
import { Tooltip } from '@/components/Tooltip';

interface GeneratedPromptRecord {
  id: string;
  templateId: string;
  configName: string;
  promptText: string;
  variation: number;
  totalVariations: number;
  timestamp: string;
  publishedUrl?: string;
}

interface TestResult {
  id: string;
  prompt: string;
  response: string;
  timestamp: string;
}

export default function Home() {
  const { configs, activeConfig, addConfig, updateConfig, saveConfig, setActiveConfig, deleteConfig, duplicateConfig, setConfigs } = useStore();
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [selectedPromptRecord, setSelectedPromptRecord] = useState<GeneratedPromptRecord | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showDeletePromptsModal, setShowDeletePromptsModal] = useState(false);
  const [promptsToDelete, setPromptsToDelete] = useState<Set<string>>(new Set());
  const [pendingGenerateCount, setPendingGenerateCount] = useState(3);
  const [showDeleteTemplateModal, setShowDeleteTemplateModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [selectedPromptsForBulkDelete, setSelectedPromptsForBulkDelete] = useState<Set<string>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showPublishSuccess, setShowPublishSuccess] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string>('');
  const [currentlyPublishingId, setCurrentlyPublishingId] = useState<string | null>(null);

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

  const handleSaveChanges = async () => {
    if (!currentConfig) return;

    setIsSaving(true);
    try {
      await saveConfig(currentConfig);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to save changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePrompts = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentConfig),
      });

      const data = await response.json();
      const record: GeneratedPromptRecord = {
        id: `${Date.now()}`,
        templateId: currentConfig.id,
        configName: currentConfig.name,
        promptText: data.systemPrompt,
        variation: 1,
        totalVariations: 1,
        timestamp: new Date().toLocaleTimeString(),
      };

      setCurrentGeneratedPrompts([record]);
      setSelectedGeneratedIndex(0);
      setGeneratedPrompt(record.promptText);

      // Save prompt to Redis
      await fetch('/api/generated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });

      // Update local state (add to beginning)
      const updated = [record, ...generatedHistory];
      setGeneratedHistory(updated);

      setIsGenerating(false);
      setShowGenerateModal(false);
      setShowPrompt(true);
    } catch (error) {
      console.error('Error generating prompt:', error);
      setIsGenerating(false);
      alert('Failed to generate prompt. Please try again.');
    }
  };

  const handlePublishFromView = async () => {
    if (!currentGeneratedPrompts[0]) return;

    const promptRecord = currentGeneratedPrompts[0];
    setCurrentlyPublishingId(promptRecord.id);

    try {
      // Call publish API endpoint
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: promptRecord.id,
          promptText: promptRecord.promptText,
          configName: promptRecord.configName
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Update the prompt record with published URL
        const updatedRecord = { ...promptRecord, publishedUrl: data.url };

        // Update local state
        const updatedHistory = generatedHistory.map(r =>
          r.id === promptRecord.id ? updatedRecord : r
        );
        setGeneratedHistory(updatedHistory);
        setCurrentGeneratedPrompts([updatedRecord]);

        // Save updated record to Redis
        await fetch('/api/generated', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedRecord),
        });

        // Show success modal
        setPublishedUrl(data.url);
        setShowPublishSuccess(true);
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Error publishing prompt:', error);
      alert('Failed to publish prompt. Please try again.');
    } finally {
      setCurrentlyPublishingId(null);
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

  const handlePublishPrompt = async () => {
    if (!selectedPromptRecord) return;

    setIsPublishing(true);
    try {
      const response = await fetch('/api/publish-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptText: selectedPromptRecord.promptText }),
      });

      const data = await response.json();

      if (data.success) {
        // Update the selected prompt record with the published URL
        const updatedRecord = { ...selectedPromptRecord, publishedUrl: data.publicUrl };
        setSelectedPromptRecord(updatedRecord);

        // Update in history as well
        const updatedHistory = generatedHistory.map((record) =>
          record.id === selectedPromptRecord.id ? updatedRecord : record
        );
        setGeneratedHistory(updatedHistory);

        // Save to Redis
        await fetch('/api/generated', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedRecord),
        });
      }
    } catch (error) {
      console.error('Error publishing prompt:', error);
      alert('Failed to publish prompt. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLogout = () => {
    // Clear auth cookie and redirect to login
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    window.location.href = '/login';
  };

  const handleUnpublishPrompt = async (promptRecord: GeneratedPromptRecord) => {
    if (!promptRecord.publishedUrl) return;

    // Update the prompt record to remove published URL
    const updatedRecord = { ...promptRecord, publishedUrl: undefined };

    // Update in history
    const updatedHistory = generatedHistory.map((record) =>
      record.id === promptRecord.id ? updatedRecord : record
    );
    setGeneratedHistory(updatedHistory);

    // Update in modal if it's open
    if (selectedPromptRecord?.id === promptRecord.id) {
      setSelectedPromptRecord(updatedRecord);
    }

    // Save to Redis
    await fetch('/api/generated', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedRecord),
    });
  };

  const handleDeletePrompt = async (promptRecord: GeneratedPromptRecord) => {
    if (!confirm('Delete this generated prompt?')) return;

    // Remove from history
    const updatedHistory = generatedHistory.filter((record) => record.id !== promptRecord.id);
    setGeneratedHistory(updatedHistory);

    // Close modal if this prompt is currently selected
    if (selectedPromptRecord?.id === promptRecord.id) {
      setShowPromptModal(false);
      setSelectedPromptRecord(null);
    }

    // Delete from Redis
    await fetch(`/api/generated?id=${promptRecord.id}`, {
      method: 'DELETE',
    });
  };

  const handleBulkDeleteAndGenerate = async () => {
    // Delete selected prompts
    const deletePromises = Array.from(promptsToDelete).map(async (promptId) => {
      return fetch(`/api/generated?id=${promptId}`, {
        method: 'DELETE',
      });
    });

    await Promise.all(deletePromises);

    // Update local state
    const updatedHistory = generatedHistory.filter((record) => !promptsToDelete.has(record.id));
    setGeneratedHistory(updatedHistory);

    // Close deletion modal and open generation modal
    setShowDeletePromptsModal(false);
    setPromptsToDelete(new Set());
    setShowGenerateModal(true);
  };

  const handleBulkDelete = async () => {
    // Delete selected prompts
    const deletePromises = Array.from(selectedPromptsForBulkDelete).map(async (promptId) => {
      return fetch(`/api/generated?id=${promptId}`, {
        method: 'DELETE',
      });
    });

    await Promise.all(deletePromises);

    // Update local state
    const updatedHistory = generatedHistory.filter((record) => !selectedPromptsForBulkDelete.has(record.id));
    setGeneratedHistory(updatedHistory);

    // Close modal and clear selection
    setShowBulkDeleteConfirm(false);
    setSelectedPromptsForBulkDelete(new Set());
  };

  return (
    <div className="min-h-screen bg-robinhood-dark flex">
      {/* Left Sidebar - Prompt Templates List */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-robinhood-darker border-r border-robinhood-border flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-robinhood-border">
          <button
            onClick={handleNewConfig}
            className="w-full px-4 py-2 text-sm bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90 flex items-center justify-center gap-2"
          >
            <span className="text-lg">+</span> New Template
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
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTemplateToDelete(config.id);
                  setShowDeleteTemplateModal(true);
                }}
                disabled={configs.length === 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded hover:bg-red-500/20 text-red-400 hover:text-red-300 disabled:opacity-0 disabled:cursor-not-allowed"
                title="Delete template"
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
                onChange={(e) => handleUpdate({ name: e.target.value })}
                className="text-lg font-bold bg-transparent border-none outline-none text-white focus:ring-1 focus:ring-robinhood-green rounded px-2 py-1"
                placeholder="Template Name"
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

              {/* Delete Template Button */}
              <button
                onClick={() => {
                  setTemplateToDelete(currentConfig.id);
                  setShowDeleteTemplateModal(true);
                }}
                disabled={configs.length === 1}
                className="px-3 py-1.5 text-sm bg-robinhood-card border border-red-900/50 text-red-400 rounded-lg hover:border-red-500 disabled:opacity-30 disabled:cursor-not-allowed"
                title="Delete template"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>

              {/* User Profile Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="px-3 py-1.5 text-sm bg-robinhood-card border border-robinhood-border text-white rounded-lg hover:border-robinhood-green flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-robinhood-card border border-robinhood-border rounded-lg shadow-xl z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-sm text-left text-red-400 hover:bg-robinhood-darker rounded-lg flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
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

              {/* Right Column - History Panel */}
              <div className="col-span-4 space-y-3">
                {/* Actions */}
                <div className="bg-robinhood-card border border-robinhood-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        // Filter prompts for current template
                        const currentTemplatePrompts = generatedHistory.filter(
                          r => r.templateId === currentConfig.id || !r.templateId
                        );

                        // Check if there's space for new prompts (limit is 10 per template)
                        if (currentTemplatePrompts.length >= 10) {
                          setPendingGenerateCount(1);
                          setPromptsToDelete(new Set());
                          setShowDeletePromptsModal(true);
                        } else {
                          setShowGenerateModal(true);
                        }
                      }}
                      disabled={isGenerating}
                      className="w-full px-4 py-2.5 text-sm bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90 disabled:opacity-50 glow-green"
                    >
                      {isGenerating ? 'Generating...' : '⚡ Generate Prompt'}
                    </button>
                  </div>
                </div>

                {/* Generated Prompts History */}
                <div className="bg-robinhood-card border border-robinhood-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-semibold text-white">Generated Prompts</h3>
                      <span className="text-xs text-robinhood-green font-mono">
                        {generatedHistory.filter(r => r.templateId === currentConfig.id || !r.templateId).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {selectedPromptsForBulkDelete.size > 0 && (
                        <>
                          <span className="text-xs text-gray-400">
                            {selectedPromptsForBulkDelete.size} selected
                          </span>
                          <button
                            onClick={() => setShowBulkDeleteConfirm(true)}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-all flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                          <button
                            onClick={() => setSelectedPromptsForBulkDelete(new Set())}
                            className="px-2 py-1 text-xs bg-robinhood-card border border-robinhood-border text-gray-400 rounded hover:border-robinhood-green hover:text-white transition-all"
                          >
                            Clear
                          </button>
                        </>
                      )}
                      {generatedHistory.filter(r => r.templateId === currentConfig.id || !r.templateId).length > 0 && (
                        <button
                          onClick={() => {
                            const currentTemplatePrompts = generatedHistory.filter(
                              r => r.templateId === currentConfig.id || !r.templateId
                            );
                            if (selectedPromptsForBulkDelete.size === currentTemplatePrompts.length) {
                              setSelectedPromptsForBulkDelete(new Set());
                            } else {
                              setSelectedPromptsForBulkDelete(new Set(currentTemplatePrompts.map(r => r.id)));
                            }
                          }}
                          className="px-2 py-1 text-xs bg-robinhood-card border border-robinhood-border text-gray-400 rounded hover:border-robinhood-green hover:text-white transition-all"
                        >
                          {selectedPromptsForBulkDelete.size === generatedHistory.filter(r => r.templateId === currentConfig.id || !r.templateId).length
                            ? 'Deselect All'
                            : 'Select All'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
                    {generatedHistory.filter(r => r.templateId === currentConfig.id || !r.templateId).length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-4">No prompts generated yet</p>
                    ) : (
                      generatedHistory.filter(r => r.templateId === currentConfig.id || !r.templateId).map((record, index) => (
                        <div
                          key={record.id}
                          className={`relative group p-2 bg-robinhood-darker border-2 rounded transition-all ${
                            selectedPromptsForBulkDelete.has(record.id)
                              ? 'border-blue-500 bg-blue-900/20'
                              : record.publishedUrl
                              ? 'border-robinhood-green shadow-lg shadow-robinhood-green/20'
                              : 'border-robinhood-border hover:border-robinhood-green/50'
                          }`}
                        >
                          <div className="flex gap-2">
                            {/* Checkbox */}
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                const newSet = new Set(selectedPromptsForBulkDelete);
                                if (newSet.has(record.id)) {
                                  newSet.delete(record.id);
                                } else {
                                  newSet.add(record.id);
                                }
                                setSelectedPromptsForBulkDelete(newSet);
                              }}
                              className="flex-shrink-0 cursor-pointer"
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                selectedPromptsForBulkDelete.has(record.id)
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'border-robinhood-border hover:border-robinhood-green'
                              }`}>
                                {selectedPromptsForBulkDelete.has(record.id) && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>

                            {/* Content */}
                            <div
                              onClick={() => {
                                setSelectedPromptRecord(record);
                                setShowPromptModal(true);
                              }}
                              className="flex-1 cursor-pointer"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] text-gray-500">{record.timestamp}</span>
                                  {record.publishedUrl && (
                                    <span className="text-[9px] bg-robinhood-green/20 text-robinhood-green px-1.5 py-0.5 rounded">
                                      Published
                                    </span>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs font-medium text-gray-300 truncate">{record.configName}</p>
                              <p className="text-[10px] text-gray-600">
                                {record.totalVariations > 1 ? `${record.variation}/${record.totalVariations}` : 'Single'}
                              </p>
                              <p className="text-[10px] text-gray-500 truncate mt-1">{record.promptText.substring(0, 60)}...</p>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyToClipboard(record.promptText);
                              }}
                              className="p-1 bg-robinhood-card border border-robinhood-border text-robinhood-green hover:bg-robinhood-green hover:text-robinhood-dark rounded text-xs"
                              title="Copy Prompt"
                            >
                              📋
                            </button>
                            {record.publishedUrl && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(record.publishedUrl);
                                    alert('Published URL copied to clipboard!');
                                  }}
                                  className="p-1 bg-robinhood-card border border-robinhood-border text-blue-400 hover:bg-blue-600 hover:text-white rounded text-xs"
                                  title="Copy Published URL"
                                >
                                  🔗
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnpublishPrompt(record);
                                  }}
                                  className="p-1 bg-robinhood-card border border-robinhood-border text-yellow-400 hover:bg-yellow-600 hover:text-white rounded text-xs"
                                  title="Unpublish"
                                >
                                  🔒
                                </button>
                              </>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePrompt(record);
                              }}
                              className="p-1 bg-robinhood-card border border-robinhood-border text-red-400 hover:bg-red-600 hover:text-white rounded text-xs"
                              title="Delete"
                            >
                              🗑️
                            </button>
                          </div>
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

      {/* Generate Modal - Loading State */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-robinhood-card border border-robinhood-green rounded-xl max-w-md w-full">
            <div className="px-6 py-8 text-center">
              {!isGenerating ? (
                <>
                  <div className="w-16 h-16 bg-robinhood-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-robinhood-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Generate Prompt</h3>
                  <p className="text-sm text-gray-400 mb-6">
                    Generate a structured system prompt using your current template configuration
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleGeneratePrompts}
                      className="flex-1 px-4 py-2.5 bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90 transition-all"
                    >
                      🎨 Generate Prompt
                    </button>
                    <button
                      onClick={() => setShowGenerateModal(false)}
                      className="flex-1 px-4 py-2.5 bg-robinhood-card border border-robinhood-border text-white rounded-lg hover:border-robinhood-green"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-robinhood-green/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <svg className="w-8 h-8 text-robinhood-green animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Generating Prompt...</h3>
                  <p className="text-sm text-gray-400">
                    Processing your template configuration with AI
                  </p>
                </>
              )}
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
                onClick={handlePublishFromView}
                disabled={currentlyPublishingId === currentGeneratedPrompts[0]?.id}
                className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {currentlyPublishingId === currentGeneratedPrompts[0]?.id ? '🔄 Publishing...' : '🌐 Publish'}
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

      {/* Prompt Details Modal */}
      {showPromptModal && selectedPromptRecord && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-robinhood-card border border-robinhood-border rounded-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-robinhood-border flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-white">{selectedPromptRecord.configName}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedPromptRecord.timestamp} • {selectedPromptRecord.totalVariations > 1 ? `Variation ${selectedPromptRecord.variation}/${selectedPromptRecord.totalVariations}` : 'Single Prompt'}
                </p>
              </div>
              <button onClick={() => setShowPromptModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="px-6 py-6 overflow-y-auto flex-1">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono bg-robinhood-darker p-4 rounded-lg border border-robinhood-border">
                {selectedPromptRecord.promptText}
              </pre>
              <div className="mt-4 p-3 bg-robinhood-darker/50 rounded-lg border border-robinhood-border">
                <p className="text-xs text-gray-400">
                  <span className="font-semibold text-robinhood-green">Character Count:</span> {selectedPromptRecord.promptText.length.toLocaleString()}
                </p>
              </div>

              {selectedPromptRecord.publishedUrl && (
                <div className="mt-4 p-4 bg-robinhood-green/10 rounded-lg border border-robinhood-green/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-robinhood-green">🌐 Published URL</p>
                    <button
                      onClick={() => copyToClipboard(selectedPromptRecord.publishedUrl!)}
                      className="px-3 py-1 text-xs bg-robinhood-green text-robinhood-dark rounded hover:bg-robinhood-green/90"
                    >
                      📋 Copy URL
                    </button>
                  </div>
                  <p className="text-xs text-gray-300 font-mono break-all bg-robinhood-darker/50 p-2 rounded">
                    {selectedPromptRecord.publishedUrl}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-2">
                    This URL returns the prompt text as plain text. You can use it in MCP servers or other applications.
                  </p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-robinhood-border">
              <div className="flex gap-3 mb-3">
                <button
                  onClick={() => {
                    copyToClipboard(selectedPromptRecord.promptText);
                  }}
                  className="flex-1 px-4 py-2 bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90"
                >
                  📋 Copy Text
                </button>
                {!selectedPromptRecord.publishedUrl ? (
                  <button
                    onClick={handlePublishPrompt}
                    disabled={isPublishing}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPublishing ? '🌐 Publishing...' : '🌐 Publish'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleUnpublishPrompt(selectedPromptRecord);
                    }}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg hover:bg-yellow-700"
                  >
                    🔒 Unpublish
                  </button>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleDeletePrompt(selectedPromptRecord);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
                >
                  🗑️ Delete
                </button>
                <button
                  onClick={() => setShowPromptModal(false)}
                  className="flex-1 px-4 py-2 bg-robinhood-card border border-robinhood-border text-white rounded-lg hover:border-robinhood-green"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Prompts Modal */}
      {showDeletePromptsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-robinhood-card border border-robinhood-border rounded-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="px-6 py-4 border-b border-robinhood-border">
              <h3 className="text-xl font-semibold text-white">⚠️ Prompt Limit Reached</h3>
              <p className="text-sm text-gray-400 mt-2">
                You're trying to generate {pendingGenerateCount} new prompt{pendingGenerateCount !== 1 ? 's' : ''}, but you've reached the limit of 10 prompts per template.
                <br />
                Please delete at least {
                  (generatedHistory.filter(r => r.templateId === currentConfig.id || !r.templateId).length + pendingGenerateCount) - 10
                } prompt{((generatedHistory.filter(r => r.templateId === currentConfig.id || !r.templateId).length + pendingGenerateCount) - 10) !== 1 ? 's' : ''} to continue.
              </p>
            </div>

            <div className="px-6 py-4 overflow-y-auto flex-1">
              <div className="space-y-2">
                {generatedHistory
                  .filter(r => r.templateId === currentConfig.id || !r.templateId)
                  .map((record) => (
                    <div
                      key={record.id}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        promptsToDelete.has(record.id)
                          ? 'border-red-500 bg-red-900/20'
                          : 'border-robinhood-border bg-robinhood-darker hover:border-robinhood-green/50'
                      }`}
                      onClick={() => {
                        const newSet = new Set(promptsToDelete);
                        if (newSet.has(record.id)) {
                          newSet.delete(record.id);
                        } else {
                          newSet.add(record.id);
                        }
                        setPromptsToDelete(newSet);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-gray-500">{record.timestamp}</span>
                            {record.publishedUrl && (
                              <span className="text-[9px] bg-robinhood-green/20 text-robinhood-green px-1.5 py-0.5 rounded">
                                Published
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-300">{record.configName}</p>
                          <p className="text-xs text-gray-500">
                            {record.totalVariations > 1 ? `Variation ${record.variation}/${record.totalVariations}` : 'Single'}
                          </p>
                          <p className="text-xs text-gray-600 truncate mt-1">{record.promptText.substring(0, 80)}...</p>
                        </div>
                        <div className="ml-4">
                          {promptsToDelete.has(record.id) ? (
                            <div className="w-6 h-6 bg-red-500 rounded flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          ) : (
                            <div className="w-6 h-6 border-2 border-robinhood-border rounded"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-robinhood-border">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-400">
                  Selected: <span className="text-robinhood-green font-semibold">{promptsToDelete.size}</span> prompt{promptsToDelete.size !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-gray-400">
                  Space needed: <span className="text-yellow-400 font-semibold">
                    {(generatedHistory.filter(r => r.templateId === currentConfig.id || !r.templateId).length + pendingGenerateCount) - 10}
                  </span>
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleBulkDeleteAndGenerate}
                  disabled={promptsToDelete.size < ((generatedHistory.filter(r => r.templateId === currentConfig.id || !r.templateId).length + pendingGenerateCount) - 10)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Selected & Generate
                </button>
                <button
                  onClick={() => {
                    setShowDeletePromptsModal(false);
                    setPromptsToDelete(new Set());
                  }}
                  className="flex-1 px-4 py-2 bg-robinhood-card border border-robinhood-border text-white rounded-lg hover:border-robinhood-green"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Template Modal */}
      {showDeleteTemplateModal && templateToDelete && (
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
                  <h3 className="text-2xl font-bold text-white">Delete Template</h3>
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
                  "{configs.find(c => c.id === templateToDelete)?.name}"
                </p>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>All template settings and controls will be lost</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-red-400 mt-0.5">•</span>
                    <span>This template configuration cannot be recovered</span>
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
                  <span>Consider duplicating this template first if you might need it later</span>
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t-2 border-red-500/30 bg-robinhood-darker/50">
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (templateToDelete) {
                      deleteConfig(templateToDelete);
                      setShowDeleteTemplateModal(false);
                      setTemplateToDelete(null);
                    }
                  }}
                  className="flex-1 px-5 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Template
                </button>
                <button
                  onClick={() => {
                    setShowDeleteTemplateModal(false);
                    setTemplateToDelete(null);
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

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-robinhood-card border-2 border-red-500/50 rounded-xl max-w-md w-full shadow-2xl">
            <div className="px-6 py-5 border-b border-red-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Delete Selected Prompts</h3>
                  <p className="text-sm text-gray-400">This action cannot be undone</p>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-4">
                <p className="text-white font-medium mb-2">
                  You are about to permanently delete:
                </p>
                <p className="text-2xl text-red-400 font-bold mb-3">
                  {selectedPromptsForBulkDelete.size} prompt{selectedPromptsForBulkDelete.size !== 1 ? 's' : ''}
                </p>
                <div className="space-y-1.5 text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">•</span>
                    <span>All selected prompts will be permanently removed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">•</span>
                    <span>Published prompts will be unpublished</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-red-400">•</span>
                    <span>This cannot be recovered</span>
                  </div>
                </div>
              </div>

              {/* Show count by status */}
              <div className="flex gap-2 text-xs">
                {generatedHistory.filter(r => selectedPromptsForBulkDelete.has(r.id) && r.publishedUrl).length > 0 && (
                  <div className="flex-1 bg-robinhood-green/10 border border-robinhood-green/30 rounded px-2 py-1.5">
                    <span className="text-robinhood-green font-semibold">
                      {generatedHistory.filter(r => selectedPromptsForBulkDelete.has(r.id) && r.publishedUrl).length}
                    </span>
                    <span className="text-gray-400 ml-1">published</span>
                  </div>
                )}
                {generatedHistory.filter(r => selectedPromptsForBulkDelete.has(r.id) && !r.publishedUrl).length > 0 && (
                  <div className="flex-1 bg-gray-500/10 border border-gray-500/30 rounded px-2 py-1.5">
                    <span className="text-gray-300 font-semibold">
                      {generatedHistory.filter(r => selectedPromptsForBulkDelete.has(r.id) && !r.publishedUrl).length}
                    </span>
                    <span className="text-gray-400 ml-1">unpublished</span>
                  </div>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-red-500/30 bg-robinhood-darker/50">
              <div className="flex gap-3">
                <button
                  onClick={handleBulkDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-red-500/30 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete {selectedPromptsForBulkDelete.size} Prompt{selectedPromptsForBulkDelete.size !== 1 ? 's' : ''}
                </button>
                <button
                  onClick={() => setShowBulkDeleteConfirm(false)}
                  className="flex-1 px-4 py-2.5 bg-robinhood-card border border-robinhood-border text-white font-semibold rounded-lg hover:border-robinhood-green transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Success Modal */}
      {showPublishSuccess && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-robinhood-card border-2 border-robinhood-green rounded-xl max-w-lg w-full shadow-2xl">
            <div className="px-6 py-5 border-b border-robinhood-green/30">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-robinhood-green/20 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-6 h-6 text-robinhood-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Prompt Published Successfully!</h3>
                  <p className="text-sm text-gray-400">Your prompt is now publicly accessible</p>
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
                  <span>Anyone with this URL can access your prompt template. The URL is also saved in your prompt card for easy access.</span>
                </p>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-robinhood-border bg-robinhood-darker/50">
              <button
                onClick={() => setShowPublishSuccess(false)}
                className="w-full px-4 py-2.5 bg-robinhood-green text-robinhood-dark font-semibold rounded-lg hover:bg-robinhood-green/90 transition-all"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
