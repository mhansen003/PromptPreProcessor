'use client';

import React, { useState, useEffect } from 'react';
import { useStore, createDefaultConfig } from '@/lib/store';
import type { PersonaConfig } from '@/lib/store';
import TabNavigation from '@/components/TabNavigation';
import PersonalityTab from '@/components/tabs/PersonalityTab';
import ResponseStructureTab from '@/components/tabs/ResponseStructureTab';
import AdvancedTab from '@/components/tabs/AdvancedTab';
import RegionalTab from '@/components/tabs/RegionalTab';
import RoleTab from '@/components/tabs/RoleTab';

export default function Home() {
  const { configs, activeConfig, addConfig, updateConfig, saveConfig, setActiveConfig, deleteConfig, duplicateConfig, setConfigs } = useStore();
  const [mounted, setMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('personality');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [personaToDelete, setPersonaToDelete] = useState<string | null>(null);
  const [showViewPromptModal, setShowViewPromptModal] = useState(false);
  const [showToaster, setShowToaster] = useState(false);
  const [toasterMessage, setToasterMessage] = useState('');
  const [showEndpointsModal, setShowEndpointsModal] = useState(false);
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [editedPrompt, setEditedPrompt] = useState('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [username, setUsername] = useState<string>('default-user');

  // New Persona Modal States
  const [showNewPersonaModal, setShowNewPersonaModal] = useState(false);
  const [creationFlow, setCreationFlow] = useState<'choose' | 'scratch' | 'interview'>('choose');
  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaDescription, setNewPersonaDescription] = useState('');
  const [interviewStep, setInterviewStep] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState<string[]>(['', '', '', '', '']);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // New persona-focused interview questions
  const interviewQuestions = [
    {
      title: "What is this persona for?",
      description: "Describe the primary purpose and use case for this AI persona",
      placeholder: "e.g., 'Help me explain mortgage terms to first-time homebuyers' or 'Assist me with technical documentation for my team'"
    },
    {
      title: "Who will you be communicating with?",
      description: "Describe your audience and their level of expertise",
      placeholder: "e.g., 'Clients who are first-time homebuyers with little financial knowledge' or 'Experienced loan processors on my team'"
    },
    {
      title: "What tone should this persona use when responding to you?",
      description: "How should the AI communicate with you and your audience?",
      placeholder: "e.g., 'Friendly and patient, like a helpful advisor' or 'Professional and direct, like a colleague'"
    },
    {
      title: "How detailed should responses be?",
      description: "What level of detail and length do you prefer?",
      placeholder: "e.g., 'Brief summaries I can quickly scan' or 'Comprehensive explanations with examples'"
    },
    {
      title: "Any specific requirements or preferences?",
      description: "Special constraints, formatting needs, or other considerations",
      placeholder: "e.g., 'Always include actionable next steps' or 'Emphasize compliance and regulations'"
    }
  ];

  useEffect(() => {
    setMounted(true);

    // Fetch user session
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.email) {
          setUserEmail(data.email);
          const extractedUsername = data.email.split('@')[0];
          setUsername(extractedUsername);
        }
      })
      .catch(err => console.error('Error fetching session:', err));

    // Load configs from Redis
    fetch('/api/configs')
      .then(res => res.json())
      .then(async (data) => {
        if (data.configs && data.configs.length > 0) {
          setConfigs(data.configs);
        } else {
          const defaultsRes = await fetch('/api/configs/defaults');
          const defaultsData = await defaultsRes.json();

          if (defaultsData.personalities && defaultsData.personalities.length > 0) {
            for (const persona of defaultsData.personalities) {
              const newPersona = {
                ...persona,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                createdAt: new Date().toISOString(),
              };

              await fetch('/api/configs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPersona),
              });
            }

            const reloadRes = await fetch('/api/configs');
            const reloadData = await reloadRes.json();
            if (reloadData.configs && reloadData.configs.length > 0) {
              setConfigs(reloadData.configs);
            }
          }
        }
      })
      .catch(err => console.error('Error loading configs:', err));
  }, []);

  useEffect(() => {
    setHasUnsavedChanges(false);
  }, [activeConfig?.id]);

  if (!mounted) {
    return <div className="min-h-screen bg-robinhood-dark flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>;
  }

  const showToast = (message: string) => {
    setToasterMessage(message);
    setShowToaster(true);
    setTimeout(() => setShowToaster(false), 3000);
  };

  const handleNewPersona = () => {
    setShowNewPersonaModal(true);
    setCreationFlow('choose');
    setNewPersonaName('');
    setNewPersonaDescription('');
    setInterviewStep(0);
    setInterviewAnswers(['', '', '', '', '']);
    setUploadedFiles([]);
  };

  const createFromScratch = () => {
    const newConfig = createDefaultConfig();
    newConfig.name = newPersonaName || 'New Persona';
    newConfig.description = newPersonaDescription || 'A balanced AI persona for general assistance';
    addConfig(newConfig);
    setActiveConfig(newConfig);
    setShowNewPersonaModal(false);
    showToast('✨ New persona created!');
  };

  const analyzeInterviewAndCreate = async () => {
    setIsAnalyzing(true);
    try {
      // Prepare file contents if any
      let fileContents = '';
      if (uploadedFiles.length > 0) {
        for (const file of uploadedFiles) {
          const text = await file.text();
          fileContents += `\n\n--- File: ${file.name} ---\n${text}`;
        }
      }

      const response = await fetch('/api/analyze-interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPersonaName || 'Custom Persona',
          answers: interviewAnswers,
          fileContents: fileContents || undefined,
        }),
      });

      const data = await response.json();
      if (data.success && data.config) {
        addConfig(data.config);
        setActiveConfig(data.config);
        setShowNewPersonaModal(false);
        showToast('🎯 AI-configured persona created!');
      } else {
        showToast('❌ Failed to analyze. Creating default.');
        createFromScratch();
      }
    } catch (error) {
      console.error('Error analyzing interview:', error);
      showToast('❌ Error. Creating default persona.');
      createFromScratch();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!activeConfig) return;

    setIsSaving(true);
    try {
      const savedConfig = await saveConfig(activeConfig);
      if (savedConfig) {
        showToast('💾 Persona saved & prompt generated!');
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error saving:', error);
      showToast('❌ Error saving persona');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePublish = async (id: string, shouldPublish: boolean) => {
    try {
      const response = await fetch('/api/personalities/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personalityId: id, isPublished: shouldPublish }),
      });

      const data = await response.json();
      if (data.success) {
        showToast(shouldPublish ? '✅ Persona published!' : '📴 Persona unpublished');

        // Reload configs to get updated publish status
        const reloadRes = await fetch('/api/configs');
        const reloadData = await reloadRes.json();
        if (reloadData.configs) {
          setConfigs(reloadData.configs);
        }
      } else {
        showToast('❌ ' + (data.error || 'Failed to update publish status'));
      }
    } catch (error) {
      console.error('Error toggling publish:', error);
      showToast('❌ Error updating publish status');
    }
  };

  const confirmDelete = (id: string) => {
    setPersonaToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    if (personaToDelete) {
      const configToDelete = configs.find(c => c.id === personaToDelete);
      deleteConfig(personaToDelete);
      showToast(`🗑️ "${configToDelete?.name}" deleted`);
      setShowDeleteModal(false);
      setPersonaToDelete(null);
    }
  };

  const handleDuplicate = (id: string) => {
    const config = configs.find(c => c.id === id);
    if (config) {
      duplicateConfig(id);
      showToast(`📋 "${config.name}" duplicated`);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('📋 Copied to clipboard!');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfigUpdate = (updates: Partial<PersonaConfig>) => {
    if (activeConfig) {
      updateConfig(activeConfig.id, updates);
      setHasUnsavedChanges(true);
    }
  };

  const renderTabContent = () => {
    if (!activeConfig) return null;

    switch (activeTab) {
      case 'personality':
        return <PersonalityTab config={activeConfig} onUpdate={handleConfigUpdate} />;
      case 'structure':
        return <ResponseStructureTab config={activeConfig} onUpdate={handleConfigUpdate} />;
      case 'advanced':
        return <AdvancedTab config={activeConfig} onUpdate={handleConfigUpdate} />;
      case 'regional':
        return <RegionalTab config={activeConfig} onUpdate={handleConfigUpdate} />;
      case 'role':
        return <RoleTab config={activeConfig} onUpdate={handleConfigUpdate} />;
      default:
        return <PersonalityTab config={activeConfig} onUpdate={handleConfigUpdate} />;
    }
  };

  return (
    <div className="min-h-screen bg-robinhood-dark text-white">
      {/* Header */}
      <header className="bg-robinhood-darker border-b border-robinhood-card-border py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">AI Persona Builder</h1>
            <span className="text-xs text-gray-400">persona.cmgfinancial.ai</span>
          </div>
          <div className="flex items-center gap-3">
            {activeConfig && (
              <>
                {activeConfig.systemPrompt && (
                  <button
                    onClick={() => setShowViewPromptModal(true)}
                    className="px-4 py-2 bg-robinhood-card border border-robinhood-green/30 text-robinhood-green rounded-lg hover:bg-robinhood-green/10 transition-all"
                  >
                    View Prompt
                  </button>
                )}

                {activeConfig.isPublished && activeConfig.systemPrompt && (
                  <button
                    onClick={() => setShowEndpointsModal(true)}
                    className="px-4 py-2 bg-robinhood-green/20 text-robinhood-green border border-robinhood-green/30 rounded-lg hover:bg-robinhood-green/30 transition-all"
                  >
                    View Endpoints
                  </button>
                )}

                <button
                  onClick={() => handleDuplicate(activeConfig.id)}
                  className="px-4 py-2 bg-robinhood-card border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-500/10 transition-all"
                >
                  Duplicate
                </button>

                <button
                  onClick={() => confirmDelete(activeConfig.id)}
                  className="px-4 py-2 bg-robinhood-card border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition-all"
                >
                  Delete
                </button>

                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className={`px-6 py-2 text-sm rounded-lg font-medium transition-all flex items-center gap-2 ${
                    isSaving
                      ? 'bg-robinhood-card border-2 border-robinhood-green text-white animate-pulse shadow-lg shadow-robinhood-green/50'
                      : hasUnsavedChanges
                      ? 'bg-robinhood-green text-robinhood-dark hover:bg-robinhood-green/90'
                      : 'bg-robinhood-card border border-robinhood-green text-robinhood-green'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-robinhood-green" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : hasUnsavedChanges ? '💾 Save & Generate' : '💾 Save'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Active Persona Info */}
        {activeConfig && (
          <div className="mt-3 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <span>{activeConfig.emoji}</span>
                <span>{activeConfig.name}</span>
              </h2>
              {activeConfig.description && (
                <p className="text-sm text-gray-400 mt-1">{activeConfig.description}</p>
              )}
            </div>
          </div>
        )}
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden bg-robinhood-darker border-r border-robinhood-card-border`}>
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Your Personas</h3>
              <button
                onClick={handleNewPersona}
                className="px-3 py-1 bg-robinhood-green text-robinhood-dark rounded-lg hover:bg-robinhood-green/90 transition-all text-sm font-medium"
              >
                + New
              </button>
            </div>

            <div className="space-y-2">
              {configs.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-sm mb-3">No personas yet</p>
                  <p className="text-xs">Click "+ New" above to create your first one</p>
                </div>
              ) : (
                configs.map((config) => (
                  <div
                    key={config.id}
                    onClick={() => setActiveConfig(config)}
                    className={`p-3 rounded-lg cursor-pointer transition-all ${
                      activeConfig?.id === config.id
                        ? 'bg-robinhood-green/20 border-2 border-robinhood-green'
                        : 'bg-robinhood-card hover:bg-robinhood-card-hover border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-xl flex-shrink-0">{config.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{config.name}</p>
                          {config.description && (
                            <p className="text-xs text-gray-400 truncate">{config.description}</p>
                          )}
                        </div>
                      </div>

                      {config.systemPrompt && (
                        <div className="flex items-center gap-1.5 ml-2">
                          <span className={`text-[9px] font-medium whitespace-nowrap ${config.isPublished ? 'text-blue-400' : 'text-red-400'}`}>
                            {config.isPublished ? 'Published' : 'Not Published'}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePublish(config.id, !config.isPublished);
                            }}
                            className={`relative w-10 h-5 rounded-full transition-all duration-300 ${
                              config.isPublished
                                ? 'bg-blue-500 shadow-lg shadow-blue-500/50'
                                : 'bg-red-500/30 shadow-sm'
                            }`}
                          >
                            <div
                              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${
                                config.isPublished ? 'left-5' : 'left-0.5'
                              }`}
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {configs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="text-6xl mb-6">🎭</div>
                <h2 className="text-3xl font-bold text-white mb-3">Welcome to AI Persona Builder</h2>
                <p className="text-gray-400 mb-8 text-lg">
                  Create your first AI persona to get started. Choose from a quick interview or build from scratch.
                </p>
                <button
                  onClick={handleNewPersona}
                  className="px-8 py-4 bg-robinhood-green text-robinhood-dark rounded-lg hover:bg-robinhood-green/90 transition-all font-medium text-lg shadow-lg shadow-robinhood-green/20"
                >
                  + Create Your First Persona
                </button>
              </div>
            </div>
          ) : activeConfig ? (
            <>
              <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
              <div className="p-6">
                {renderTabContent()}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-400">
                <p className="text-xl mb-4">No persona selected</p>
                <p className="text-sm mb-6">Select a persona from the sidebar or create a new one</p>
                <button
                  onClick={handleNewPersona}
                  className="px-6 py-3 bg-robinhood-green text-robinhood-dark rounded-lg hover:bg-robinhood-green/90 transition-all font-medium"
                >
                  + Create New Persona
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-0 top-1/2 -translate-y-1/2 bg-robinhood-card border-y border-r border-robinhood-card-border rounded-r-lg p-2 hover:bg-robinhood-card-hover transition-all"
      >
        {sidebarOpen ? '◀' : '▶'}
      </button>

      {/* Toast Notification */}
      {showToaster && (
        <div className="fixed top-4 right-4 bg-robinhood-card border border-robinhood-green rounded-lg px-4 py-3 shadow-lg z-50 animate-slide-in">
          <p className="text-white">{toasterMessage}</p>
        </div>
      )}

      {/* New Persona Modal */}
      {showNewPersonaModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-robinhood-dark border border-robinhood-card-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-robinhood-card-border flex items-center justify-between sticky top-0 bg-robinhood-dark z-10">
              <h2 className="text-2xl font-bold">Create New Persona</h2>
              <button
                onClick={() => setShowNewPersonaModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {creationFlow === 'choose' && (
                <div className="space-y-4">
                  <p className="text-gray-300 text-center mb-6">
                    How would you like to create your persona?
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setCreationFlow('scratch')}
                      className="p-6 bg-robinhood-card border-2 border-robinhood-card-border rounded-xl hover:border-blue-500 transition-all text-center"
                    >
                      <div className="text-4xl mb-3">➕</div>
                      <h3 className="font-semibold text-lg mb-2">From Scratch</h3>
                      <p className="text-sm text-gray-400">
                        Start with balanced defaults and customize manually
                      </p>
                    </button>

                    <button
                      onClick={() => setCreationFlow('interview')}
                      className="p-6 bg-robinhood-card border-2 border-robinhood-card-border rounded-xl hover:border-robinhood-green transition-all text-center"
                    >
                      <div className="text-4xl mb-3">💬</div>
                      <h3 className="font-semibold text-lg mb-2">Interview Style</h3>
                      <p className="text-sm text-gray-400">
                        Answer questions and let AI configure everything
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {creationFlow === 'scratch' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Persona Name</label>
                    <input
                      type="text"
                      value={newPersonaName}
                      onChange={(e) => setNewPersonaName(e.target.value)}
                      placeholder="e.g., Mortgage Helper"
                      className="w-full px-4 py-2 bg-robinhood-card border border-robinhood-card-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-robinhood-green"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                    <input
                      type="text"
                      value={newPersonaDescription}
                      onChange={(e) => setNewPersonaDescription(e.target.value)}
                      placeholder="Brief description of this persona..."
                      className="w-full px-4 py-2 bg-robinhood-card border border-robinhood-card-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-robinhood-green"
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setCreationFlow('choose')}
                      className="flex-1 px-4 py-2 bg-robinhood-card border border-robinhood-card-border rounded-lg hover:bg-robinhood-card-hover transition-all"
                    >
                      Back
                    </button>
                    <button
                      onClick={createFromScratch}
                      className="flex-1 px-4 py-2 bg-robinhood-green text-robinhood-dark rounded-lg hover:bg-robinhood-green/90 transition-all font-medium"
                    >
                      Create Persona
                    </button>
                  </div>
                </div>
              )}

              {creationFlow === 'interview' && (
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="flex items-center gap-2">
                    {[0, 1, 2, 3, 4, 5].map((step) => (
                      <div
                        key={step}
                        className={`flex-1 h-2 rounded-full transition-all ${
                          step <= interviewStep ? 'bg-robinhood-green' : 'bg-robinhood-card'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="text-center text-sm text-gray-400">
                    Step {interviewStep + 1} of 6
                  </div>

                  {interviewStep === 0 && (
                    <div className="space-y-4">
                      <div className="bg-robinhood-green/10 border border-robinhood-green/30 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-300">
                          <span className="font-semibold text-robinhood-green">What is a Persona?</span><br />
                          A persona defines how AI will communicate with you and your audience. Think of it as creating a custom assistant tailored to your specific needs, communication style, and the type of responses you prefer.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Persona Name</label>
                        <input
                          type="text"
                          value={newPersonaName}
                          onChange={(e) => setNewPersonaName(e.target.value)}
                          placeholder="e.g., Client Communication Assistant"
                          className="w-full px-4 py-2 bg-robinhood-card border border-robinhood-card-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-robinhood-green"
                        />
                      </div>
                    </div>
                  )}

                  {interviewStep > 0 && interviewStep <= 5 && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">
                          {interviewQuestions[interviewStep - 1].title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-4">
                          {interviewQuestions[interviewStep - 1].description}
                        </p>
                        <textarea
                          value={interviewAnswers[interviewStep - 1]}
                          onChange={(e) => {
                            const newAnswers = [...interviewAnswers];
                            newAnswers[interviewStep - 1] = e.target.value;
                            setInterviewAnswers(newAnswers);
                          }}
                          rows={4}
                          placeholder={interviewQuestions[interviewStep - 1].placeholder}
                          className="w-full px-4 py-3 bg-robinhood-card border border-robinhood-card-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-robinhood-green resize-none"
                        />
                      </div>
                    </div>
                  )}

                  {interviewStep === 5 && (
                    <div className="space-y-4 mt-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">Additional Context (Optional)</h3>
                        <p className="text-sm text-gray-400 mb-4">
                          Upload any documents that might help us understand your communication style and needs (emails, reports, resume, writing samples, etc.)
                        </p>

                        <div className="border-2 border-dashed border-robinhood-card-border rounded-lg p-6 text-center hover:border-robinhood-green/50 transition-all">
                          <input
                            type="file"
                            id="file-upload"
                            multiple
                            accept=".txt,.pdf,.doc,.docx,.md"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <div className="text-4xl">📎</div>
                            <p className="text-sm text-gray-400">Click to upload files</p>
                            <p className="text-xs text-gray-500">TXT, PDF, DOC, MD files supported</p>
                          </label>
                        </div>

                        {uploadedFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {uploadedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-2 bg-robinhood-card rounded-lg"
                              >
                                <span className="text-sm truncate flex-1">{file.name}</span>
                                <button
                                  onClick={() => removeFile(index)}
                                  className="text-red-400 hover:text-red-300 ml-2"
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 mt-6">
                    {interviewStep > 0 && (
                      <button
                        onClick={() => setInterviewStep(interviewStep - 1)}
                        disabled={isAnalyzing}
                        className="flex-1 px-4 py-2 bg-robinhood-card border border-robinhood-card-border rounded-lg hover:bg-robinhood-card-hover transition-all disabled:opacity-50"
                      >
                        Back
                      </button>
                    )}

                    {interviewStep === 0 && (
                      <button
                        onClick={() => setCreationFlow('choose')}
                        disabled={isAnalyzing}
                        className="flex-1 px-4 py-2 bg-robinhood-card border border-robinhood-card-border rounded-lg hover:bg-robinhood-card-hover transition-all"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (interviewStep < 5) {
                          setInterviewStep(interviewStep + 1);
                        } else {
                          analyzeInterviewAndCreate();
                        }
                      }}
                      disabled={
                        isAnalyzing ||
                        (interviewStep === 0 && !newPersonaName) ||
                        (interviewStep > 0 && interviewStep < 5 && !interviewAnswers[interviewStep - 1])
                      }
                      className="flex-1 px-4 py-2 bg-robinhood-green text-robinhood-dark rounded-lg hover:bg-robinhood-green/90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isAnalyzing ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Analyzing...
                        </span>
                      ) : interviewStep < 5 ? 'Next' : 'Create Persona'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Prompt Modal */}
      {showViewPromptModal && activeConfig?.systemPrompt && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-robinhood-dark border border-robinhood-card-border rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-robinhood-card-border flex items-center justify-between">
              <h2 className="text-2xl font-bold">Generated System Prompt</h2>
              <button
                onClick={() => {
                  setShowViewPromptModal(false);
                  setIsEditingPrompt(false);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {isEditingPrompt ? (
                <textarea
                  value={editedPrompt}
                  onChange={(e) => setEditedPrompt(e.target.value)}
                  className="w-full h-full min-h-[400px] px-4 py-3 bg-robinhood-card border border-robinhood-card-border rounded-lg text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-robinhood-green resize-none"
                />
              ) : (
                <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300 bg-robinhood-card p-4 rounded-lg">
                  {activeConfig.systemPrompt}
                </pre>
              )}
            </div>

            <div className="p-6 border-t border-robinhood-card-border flex gap-3">
              <button
                onClick={() => copyToClipboard(activeConfig.systemPrompt || '')}
                className="px-4 py-2 bg-robinhood-card border border-robinhood-green/30 text-robinhood-green rounded-lg hover:bg-robinhood-green/10 transition-all"
              >
                📋 Copy
              </button>
              <button
                onClick={() => setShowViewPromptModal(false)}
                className="flex-1 px-4 py-2 bg-robinhood-card border border-robinhood-card-border rounded-lg hover:bg-robinhood-card-hover transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Endpoints Modal */}
      {showEndpointsModal && activeConfig && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-robinhood-dark border border-robinhood-card-border rounded-xl max-w-3xl w-full">
            <div className="p-6 border-b border-robinhood-card-border flex items-center justify-between">
              <h2 className="text-2xl font-bold">API Endpoints</h2>
              <button
                onClick={() => setShowEndpointsModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">List All Your Personas</h3>
                <div className="bg-robinhood-card p-4 rounded-lg space-y-3">
                  <code className="text-sm text-robinhood-green break-all">
                    {typeof window !== 'undefined' ? window.location.origin : 'https://persona.cmgfinancial.ai'}/api/personalities/{username}
                  </code>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const url = typeof window !== 'undefined' ? `${window.location.origin}/api/personalities/${username}` : `/api/personalities/${username}`;
                        window.open(url, '_blank');
                      }}
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-all flex items-center gap-1 text-xs font-medium"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => {
                        const url = typeof window !== 'undefined' ? `${window.location.origin}/api/personalities/${username}` : `/api/personalities/${username}`;
                        copyToClipboard(url);
                      }}
                      className="px-3 py-1.5 bg-robinhood-green/20 text-robinhood-green rounded hover:bg-robinhood-green/30 transition-all text-xs font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Get Specific Persona</h3>
                <div className="bg-robinhood-card p-4 rounded-lg space-y-3">
                  <code className="text-sm text-robinhood-green break-all">
                    {typeof window !== 'undefined' ? window.location.origin : 'https://persona.cmgfinancial.ai'}/api/personalities/{username}/{activeConfig.slug || activeConfig.name.toLowerCase().replace(/\s+/g, '-')}
                  </code>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const slug = activeConfig.slug || activeConfig.name.toLowerCase().replace(/\s+/g, '-');
                        const url = typeof window !== 'undefined' ? `${window.location.origin}/api/personalities/${username}/${slug}` : `/api/personalities/${username}/${slug}`;
                        window.open(url, '_blank');
                      }}
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-all flex items-center gap-1 text-xs font-medium"
                    >
                      Test
                    </button>
                    <button
                      onClick={() => {
                        const slug = activeConfig.slug || activeConfig.name.toLowerCase().replace(/\s+/g, '-');
                        const url = typeof window !== 'undefined' ? `${window.location.origin}/api/personalities/${username}/${slug}` : `/api/personalities/${username}/${slug}`;
                        copyToClipboard(url);
                      }}
                      className="px-3 py-1.5 bg-robinhood-green/20 text-robinhood-green rounded hover:bg-robinhood-green/30 transition-all text-xs font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-robinhood-card-border">
              <button
                onClick={() => setShowEndpointsModal(false)}
                className="w-full px-4 py-2 bg-robinhood-card border border-robinhood-card-border rounded-lg hover:bg-robinhood-card-hover transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-robinhood-dark border border-robinhood-card-border rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">Delete Persona?</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete <span className="font-semibold text-white">"{configs.find(c => c.id === personaToDelete)?.name}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPersonaToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-robinhood-card border border-robinhood-card-border rounded-lg hover:bg-robinhood-card-hover transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
