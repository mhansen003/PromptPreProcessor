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
import SampleMessagesModal from '@/components/SampleMessagesModal';

export default function Home() {
  const { configs, activeConfig, addConfig, updateConfig, saveConfig, setActiveConfig, deleteConfig, duplicateConfig, setConfigs } = useStore();
  const [mounted, setMounted] = useState(false);
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
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingName, setEditingName] = useState('');
  const [editingEmoji, setEditingEmoji] = useState('');
  const [showSampleMessagesModal, setShowSampleMessagesModal] = useState(false);
  const [showActionsDropdown, setShowActionsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [generatingImageForId, setGeneratingImageForId] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // New Persona Modal States
  const [showNewPersonaModal, setShowNewPersonaModal] = useState(false);
  const [creationFlow, setCreationFlow] = useState<'choose' | 'scratch' | 'interview'>('choose');
  const [newPersonaName, setNewPersonaName] = useState('');
  const [newPersonaDescription, setNewPersonaDescription] = useState('');
  const [interviewStep, setInterviewStep] = useState(0);
  const [interviewAnswers, setInterviewAnswers] = useState<string[]>(['', '', '', '', '']);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Interview questions focused on the person's personality and preferences
  const interviewQuestions = [
    {
      title: "How would you describe your communication style?",
      description: "Tell us about how you naturally communicate with clients or colleagues",
      placeholder: "e.g., 'I'm warm and conversational, I like to build rapport' or 'I'm direct and professional, I get straight to the point'"
    },
    {
      title: "How much mortgage/financial industry experience do you have?",
      description: "This helps us understand your knowledge level and expertise",
      placeholder: "e.g., '15 years as a loan officer' or 'New to the industry, still learning' or 'Experienced processor with deep product knowledge'"
    },
    {
      title: "Do you prefer detailed information or quick summaries?",
      description: "When learning or explaining concepts, what works best for you?",
      placeholder: "e.g., 'I like comprehensive explanations with research and context' or 'I prefer brief, actionable bullet points'"
    },
    {
      title: "How structured vs. flexible is your approach?",
      description: "Do you like organized, step-by-step processes or more adaptable approaches?",
      placeholder: "e.g., 'I follow clear processes and checklists' or 'I adapt to each situation as it comes' or 'Somewhere in between'"
    },
    {
      title: "What's your personality and tone when working with clients?",
      description: "Are you more formal, casual, empathetic, analytical, etc.?",
      placeholder: "e.g., 'Friendly and empathetic, I focus on relationships' or 'Professional and analytical, I focus on numbers' or 'Enthusiastic and energetic'"
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
    // Auto-generate character image
    setTimeout(() => handleGenerateImage(newConfig), 500);
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
        // Auto-generate character image
        setTimeout(() => handleGenerateImage(data.config), 500);
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...files]);
    }
  };

  const handleConfigUpdate = (updates: Partial<PersonaConfig>) => {
    if (activeConfig) {
      updateConfig(activeConfig.id, updates);
      setHasUnsavedChanges(true);
    }
  };

  const handleNameEmojiUpdate = async (updates: Partial<PersonaConfig>) => {
    if (!activeConfig) return;

    // Update local state
    updateConfig(activeConfig.id, updates);

    // If persona is published, also save to backend immediately
    if (activeConfig.isPublished) {
      try {
        const updatedConfig = { ...activeConfig, ...updates };
        await saveConfig(updatedConfig);
        showToast('✅ Published persona updated!');
      } catch (error) {
        console.error('Error updating published persona:', error);
        showToast('⚠️ Local update saved, but failed to update published version');
      }
    } else {
      setHasUnsavedChanges(true);
    }
  };

  const handleGenerateImage = async (configToUse?: PersonaConfig) => {
    const targetConfig = configToUse || activeConfig;
    if (!targetConfig) return;

    // Track which persona is being generated
    setGeneratingImageForId(targetConfig.id);
    try {
      const response = await fetch('/api/generate-persona-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targetConfig),
      });

      const data = await response.json();

      if (data.success && data.imageUrl) {
        // Update config with new image URL
        updateConfig(targetConfig.id, { imageUrl: data.imageUrl });

        // Save to backend (Redis) immediately so it persists on refresh
        const updatedConfig = { ...targetConfig, imageUrl: data.imageUrl };
        await saveConfig(updatedConfig);

        showToast('✨ Character image generated successfully!');
      } else {
        showToast('⚠️ Failed to generate image: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error generating persona image:', error);
      showToast('⚠️ Failed to generate image');
    } finally {
      setGeneratingImageForId(null);
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
    <div className="h-screen bg-robinhood-dark text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-robinhood-darker border-b border-robinhood-card-border py-4 px-6 flex-shrink-0 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎭</span>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-robinhood-green via-emerald-400 to-robinhood-green bg-clip-text text-transparent">AI Persona Builder</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {activeConfig && (
              <>
                {/* Actions Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                    onBlur={() => setTimeout(() => setShowActionsDropdown(false), 200)}
                    className="px-4 py-2 text-sm rounded-lg font-medium transition-all flex items-center gap-2 bg-robinhood-card border border-robinhood-card-border hover:bg-robinhood-card-hover hover:border-robinhood-green/30"
                  >
                    Actions
                    <svg className={`w-3 h-3 transition-transform duration-200 ${showActionsDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showActionsDropdown && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-robinhood-card border border-robinhood-green/30 rounded-lg shadow-2xl shadow-black/50 z-50 py-1">
                      <button
                        onClick={() => {
                          setShowSampleMessagesModal(true);
                          setShowActionsDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-robinhood-card-hover transition-all flex items-center gap-3 text-blue-400"
                      >
                        <span className="text-lg">📋</span>
                        <span>Generate Sample Message</span>
                      </button>

                      {activeConfig.systemPrompt && (
                        <button
                          onClick={() => {
                            setShowViewPromptModal(true);
                            setShowActionsDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-robinhood-card-hover transition-all flex items-center gap-3 text-robinhood-green"
                        >
                          <span className="text-lg">👁️</span>
                          <span>View Prompt</span>
                        </button>
                      )}

                      {activeConfig.isPublished && activeConfig.systemPrompt && (
                        <button
                          onClick={() => {
                            setShowEndpointsModal(true);
                            setShowActionsDropdown(false);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-robinhood-card-hover transition-all flex items-center gap-3 text-cyan-400"
                        >
                          <span className="text-lg">🔗</span>
                          <span>View Endpoints</span>
                        </button>
                      )}

                      <div className="h-px bg-robinhood-card-border my-1"></div>

                      <button
                        onClick={() => {
                          handleDuplicate(activeConfig.id);
                          setShowActionsDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-robinhood-card-hover transition-all flex items-center gap-3 text-purple-400"
                      >
                        <span className="text-lg">📑</span>
                        <span>Duplicate Persona</span>
                      </button>

                      <button
                        onClick={() => {
                          confirmDelete(activeConfig.id);
                          setShowActionsDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-robinhood-card-hover transition-all flex items-center gap-3 text-red-400"
                      >
                        <span className="text-lg">🗑️</span>
                        <span>Delete Persona</span>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className={`px-6 py-2 text-sm rounded-lg font-medium transition-all flex items-center gap-2 ${
                    isSaving
                      ? 'bg-robinhood-green text-robinhood-dark border-2 border-robinhood-green animate-pulse shadow-lg shadow-robinhood-green/50'
                      : hasUnsavedChanges
                      ? 'bg-robinhood-green text-robinhood-dark hover:bg-robinhood-green/90'
                      : 'bg-robinhood-card border border-robinhood-green text-robinhood-green'
                  }`}
                >
                  {isSaving ? (
                    <>
                      <svg className="w-4 h-4 animate-spin text-robinhood-dark" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : hasUnsavedChanges ? '💾 Save & Generate' : '💾 Save'}
                </button>
              </>
            )}

            {/* User Menu */}
            {userEmail && (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                  className="w-10 h-10 bg-robinhood-green/20 hover:bg-robinhood-green/30 rounded-full flex items-center justify-center transition-all cursor-pointer"
                  title={userEmail}
                >
                  <span className="text-lg font-bold text-robinhood-green">
                    {userEmail.charAt(0).toUpperCase()}
                  </span>
                </button>

                {showUserDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-robinhood-card border border-robinhood-card-border rounded-lg shadow-xl z-50 py-1">
                    <div className="px-4 py-2 border-b border-robinhood-card-border">
                      <p className="text-xs text-gray-400">Signed in as</p>
                      <p className="text-sm font-medium truncate">{userEmail}</p>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await fetch('/api/auth/logout', { method: 'POST' });
                          window.location.href = '/signin';
                        } catch (error) {
                          console.error('Logout error:', error);
                        }
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-robinhood-card-hover transition-all flex items-center gap-3 text-red-400"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Active Persona Info */}
        {activeConfig && (
          <div className="mt-3 flex items-center justify-between">
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <select
                    value={editingEmoji}
                    onChange={(e) => setEditingEmoji(e.target.value)}
                    className="w-16 px-1 py-1 bg-robinhood-card border border-robinhood-card-border rounded text-2xl text-center focus:outline-none focus:ring-2 focus:ring-robinhood-green cursor-pointer"
                  >
                    <option value="🎭">🎭</option>
                    <option value="🤖">🤖</option>
                    <option value="💼">💼</option>
                    <option value="👔">👔</option>
                    <option value="🏠">🏠</option>
                    <option value="💰">💰</option>
                    <option value="📊">📊</option>
                    <option value="📈">📈</option>
                    <option value="🎯">🎯</option>
                    <option value="⭐">⭐</option>
                    <option value="💡">💡</option>
                    <option value="🚀">🚀</option>
                    <option value="📝">📝</option>
                    <option value="📋">📋</option>
                    <option value="✨">✨</option>
                    <option value="🎨">🎨</option>
                    <option value="🔧">🔧</option>
                    <option value="⚙️">⚙️</option>
                    <option value="🎓">🎓</option>
                    <option value="📚">📚</option>
                    <option value="🏆">🏆</option>
                    <option value="🌟">🌟</option>
                    <option value="💎">💎</option>
                    <option value="🔑">🔑</option>
                    <option value="👥">👥</option>
                    <option value="💬">💬</option>
                    <option value="📞">📞</option>
                    <option value="✉️">✉️</option>
                    <option value="🎤">🎤</option>
                    <option value="🎬">🎬</option>
                  </select>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={async (e) => {
                      if (e.key === 'Enter') {
                        await handleNameEmojiUpdate({ name: editingName, emoji: editingEmoji });
                        setIsEditingName(false);
                        handleSaveChanges();
                      } else if (e.key === 'Escape') {
                        setIsEditingName(false);
                      }
                    }}
                    placeholder="Persona Name"
                    className="flex-1 px-3 py-1 bg-robinhood-card border border-robinhood-card-border rounded text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-robinhood-green"
                    autoFocus
                  />
                  <button
                    onClick={async () => {
                      await handleNameEmojiUpdate({ name: editingName, emoji: editingEmoji });
                      setIsEditingName(false);
                      // Trigger regeneration
                      handleSaveChanges();
                    }}
                    className="px-3 py-1 bg-robinhood-green text-robinhood-dark rounded hover:bg-robinhood-green/90 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="px-3 py-1 bg-robinhood-card border border-robinhood-card-border rounded hover:bg-robinhood-card-hover text-sm"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-3 group">
                    {/* Show generated image or emoji */}
                    {activeConfig.imageUrl ? (
                      <div className="relative">
                        <img
                          src={activeConfig.imageUrl}
                          alt={activeConfig.name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-robinhood-green/30 shadow-lg shadow-robinhood-green/20 cursor-pointer transition-transform hover:scale-105"
                          onMouseEnter={() => setShowImagePreview(true)}
                          onMouseLeave={() => setShowImagePreview(false)}
                        />
                        {/* Hover Preview - Larger Version */}
                        {showImagePreview && (
                          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] pointer-events-none">
                            <div className="bg-robinhood-dark border-4 border-robinhood-green/70 rounded-lg p-3 shadow-2xl shadow-robinhood-green/50">
                              <img
                                src={activeConfig.imageUrl}
                                alt={activeConfig.name}
                                className="w-80 h-80 rounded-lg object-cover"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-5xl">{activeConfig.emoji}</span>
                    )}
                    <div>
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <span>{activeConfig.name}</span>
                        <button
                          onClick={() => {
                            setEditingName(activeConfig.name);
                            setEditingEmoji(activeConfig.emoji);
                            setIsEditingName(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-robinhood-green text-sm transition-all"
                          title="Edit name and emoji"
                        >
                          ✏️
                        </button>
                      </h2>
                      {/* Generate or Regenerate button */}
                      <button
                        onClick={() => handleGenerateImage()}
                        disabled={generatingImageForId === activeConfig.id}
                        className="text-xs text-robinhood-green/70 hover:text-robinhood-green flex items-center gap-1 transition-all disabled:opacity-50 mt-1"
                      >
                        {generatingImageForId === activeConfig.id ? (
                          <>
                            <span className="animate-pulse">⏳</span>
                            <span>Generating...</span>
                          </>
                        ) : activeConfig.imageUrl ? (
                          <>
                            <span>🔄</span>
                            <span>Regenerate Character Image</span>
                          </>
                        ) : (
                          <>
                            <span>✨</span>
                            <span>Generate Character Image</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {activeConfig.description && (
                <p className="text-sm text-gray-400 mt-1">{activeConfig.description}</p>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area - Scrollable */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Always Visible */}
        <div className="w-80 bg-robinhood-darker border-r border-robinhood-card-border overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Your Personas</h3>
              <button
                onClick={handleNewPersona}
                className="px-3 py-1.5 bg-robinhood-green text-robinhood-dark rounded-lg hover:bg-robinhood-green/90 hover:shadow-lg hover:shadow-robinhood-green/30 transition-all text-sm font-medium"
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
                configs.map((config) => {
                  const isActive = activeConfig?.id === config.id;
                  const isGenerating = generatingImageForId === config.id;

                  return (
                    <div
                      key={config.id}
                      onClick={() => setActiveConfig(config)}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 relative ${
                        isGenerating
                          ? 'bg-blue-500/20 border-2 border-blue-400 animate-pulse shadow-lg shadow-blue-400/30'
                          : isSaving && isActive
                          ? 'bg-robinhood-green/20 border-2 border-robinhood-green animate-pulse shadow-lg shadow-robinhood-green/20'
                          : isActive
                          ? 'bg-robinhood-green/20 border-2 border-robinhood-green shadow-lg shadow-robinhood-green/10'
                          : 'bg-robinhood-card hover:bg-robinhood-card-hover border-2 border-transparent hover:border-robinhood-green/30 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {/* Show generated image or emoji */}
                          {config.imageUrl ? (
                            <img
                              src={config.imageUrl}
                              alt={config.name}
                              className="w-10 h-10 rounded-full object-cover border border-robinhood-green/30 flex-shrink-0 shadow-md"
                            />
                          ) : (
                            <span className="text-2xl flex-shrink-0">{config.emoji}</span>
                          )}
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
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {configs.length === 0 ? (
            <div className="flex items-center justify-center min-h-full p-8">
              <div className="text-center max-w-md">
                <div className="text-7xl mb-8 animate-bounce">🎭</div>
                <h2 className="text-4xl font-bold bg-gradient-to-r from-robinhood-green to-emerald-400 bg-clip-text text-transparent mb-4">Welcome to AI Persona Builder</h2>
                <p className="text-gray-400 mb-10 text-lg leading-relaxed">
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
              <div className="p-6 m-4 bg-robinhood-card/30 border border-robinhood-card-border rounded-lg">
                {renderTabContent()}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center min-h-full">
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

      {/* Footer - Always Visible */}
      <footer className="border-t border-robinhood-card-border bg-robinhood-darker py-4 px-6 flex-shrink-0">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-4">
            <span>© 2025 AI Persona Builder</span>
            <span className="text-gray-600">|</span>
            <span>CMG Financial</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">Version 1.0</span>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {showToaster && (
        <div className="fixed top-4 right-4 bg-robinhood-card border border-robinhood-green rounded-lg px-4 py-3 shadow-lg z-50 animate-slide-in">
          <p className="text-white">{toasterMessage}</p>
        </div>
      )}

      {/* New Persona Modal */}
      {showNewPersonaModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900/40 via-robinhood-dark to-blue-900/40 border-2 border-purple-500/50 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-purple-500/20">
            <div className="p-6 border-b border-purple-500/30 flex items-center justify-between sticky top-0 bg-robinhood-dark/95 backdrop-blur-sm z-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Create New Persona</h2>
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
                <div className="flex flex-col h-full">
                  {/* Main Content Area */}
                  <div className="flex-1 space-y-6 overflow-y-auto">
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
                  </div>

                  {/* Always-Visible File Upload at Bottom */}
                  <div className="mt-6 pt-4 border-t border-robinhood-card-border">
                    <p className="text-sm text-gray-400 mb-3 text-center">
                      You may also drop artifacts here that describe your personality preferences
                    </p>
                    <div
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-all ${
                        isDragging
                          ? 'border-robinhood-green bg-robinhood-green/10 scale-105'
                          : 'border-robinhood-card-border hover:border-robinhood-green/50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => {
                        handleDrop(e);
                        // If files uploaded, auto-complete and jump to end
                        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                          setInterviewStep(5);
                        }
                      }}
                    >
                      <input
                        type="file"
                        id="file-upload-bottom"
                        multiple
                        accept=".txt,.pdf,.doc,.docx,.md"
                        onChange={(e) => {
                          handleFileUpload(e);
                          // If files uploaded via click, auto-complete and jump to end
                          if (e.target.files && e.target.files.length > 0) {
                            setInterviewStep(5);
                          }
                        }}
                        className="hidden"
                      />
                      <label
                        htmlFor="file-upload-bottom"
                        className="cursor-pointer flex flex-col items-center gap-1"
                      >
                        <div className="text-2xl">📎</div>
                        <p className="text-xs text-gray-400">
                          {isDragging ? 'Drop files here' : 'Drop files or click to upload'}
                        </p>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-3 space-y-1 max-h-24 overflow-y-auto">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-robinhood-card rounded text-xs"
                          >
                            <span className="truncate flex-1">{file.name}</span>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-400 hover:text-red-300 ml-2 text-sm"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

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
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-green-900/40 via-robinhood-dark to-emerald-900/40 border-2 border-robinhood-green/50 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl shadow-robinhood-green/20">
            <div className="p-6 border-b border-robinhood-green/30 flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-robinhood-green to-emerald-400 bg-clip-text text-transparent">Generated System Prompt</h2>
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

            <div className="p-6 border-t border-robinhood-green/30 flex gap-3">
              <button
                onClick={() => copyToClipboard(activeConfig.systemPrompt || '')}
                className="px-4 py-2 bg-robinhood-green/20 border border-robinhood-green/50 text-robinhood-green rounded-lg hover:bg-robinhood-green/30 transition-all shadow-lg shadow-robinhood-green/10"
              >
                📋 Copy
              </button>
              <button
                onClick={() => setShowViewPromptModal(false)}
                className="flex-1 px-4 py-2 bg-robinhood-card border border-robinhood-green/30 rounded-lg hover:bg-robinhood-card-hover transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Endpoints Modal */}
      {showEndpointsModal && activeConfig && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-blue-900/40 via-robinhood-dark to-cyan-900/40 border-2 border-blue-500/50 rounded-xl max-w-3xl w-full shadow-2xl shadow-blue-500/20">
            <div className="p-6 border-b border-blue-500/30 flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">API Endpoints</h2>
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

            <div className="p-6 border-t border-blue-500/30">
              <button
                onClick={() => setShowEndpointsModal(false)}
                className="w-full px-4 py-2 bg-blue-500/20 border border-blue-500/50 rounded-lg hover:bg-blue-500/30 transition-all shadow-lg shadow-blue-500/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-red-900/40 via-robinhood-dark to-orange-900/40 border-2 border-red-500/50 rounded-xl max-w-md w-full shadow-2xl shadow-red-500/20">
            <div className="p-6 border-b border-red-500/30 flex items-center justify-between">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">Delete Persona?</h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPersonaToDelete(null);
                }}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <p className="text-gray-300">
                Are you sure you want to delete <span className="font-semibold text-white">"{configs.find(c => c.id === personaToDelete)?.name}"</span>? This action cannot be undone.
              </p>
            </div>

            <div className="p-6 border-t border-red-500/30 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPersonaToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-robinhood-card border border-red-500/30 rounded-lg hover:bg-robinhood-card-hover transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-500/30 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/40 transition-all shadow-lg shadow-red-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sample Messages Modal */}
      <SampleMessagesModal
        isOpen={showSampleMessagesModal}
        onClose={() => setShowSampleMessagesModal(false)}
        config={activeConfig}
      />
    </div>
  );
}
