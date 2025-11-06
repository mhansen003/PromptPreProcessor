import { create } from 'zustand';

export interface PromptConfig {
  id: string;
  name: string;
  createdAt: string;

  // Response Style Controls
  detailLevel: number;         // 0-100: Concise to Extremely Detailed
  formalityLevel: number;       // 0-100: Casual to Formal
  technicalDepth: number;       // 0-100: Simple to Highly Technical
  creativityLevel: number;      // 0-100: Factual to Creative
  verbosity: number;            // 0-100: Brief to Lengthy

  // Tone Controls
  enthusiasm: number;           // 0-100: Neutral to Enthusiastic
  empathy: number;             // 0-100: Objective to Empathetic
  confidence: number;          // 0-100: Cautious to Assertive
  humor: number;               // 0-100: Serious to Humorous

  // Structure Controls
  useExamples: boolean;
  useBulletPoints: boolean;
  useNumberedLists: boolean;
  includeCodeSamples: boolean;
  includeAnalogies: boolean;
  includeVisualDescriptions: boolean;
  includeTables: boolean;
  includeSnippets: boolean;
  includeExternalReferences: boolean;
  showThoughtProcess: boolean;
  includeStepByStep: boolean;
  includeSummary: boolean;

  // Advanced Controls
  responseLength: 'auto' | 'short' | 'medium' | 'long' | 'comprehensive';
  perspective: '1st-person' | '2nd-person' | '3rd-person' | 'mixed';
  audience: 'gen-z' | 'millennial' | 'gen-x' | 'boomer' | 'senior' | 'mixed';
  explanationStyle: 'direct' | 'socratic' | 'narrative' | 'analytical';
  industryKnowledge: number;  // 0-100: Explain Terms to Use Acronyms

  // Focus Areas
  prioritizeAccuracy: boolean;
  prioritizeSpeed: boolean;
  prioritizeClarity: boolean;
  prioritizeComprehensiveness: boolean;

  // Custom Instructions
  customInstructions: string;
  customStyle: string;  // Additional style instructions like "output to PDF"
  systemPrompt?: string;  // Generated prompt
}

interface StoreState {
  configs: PromptConfig[];
  activeConfig: PromptConfig | null;

  // Actions
  addConfig: (config: PromptConfig) => void;
  updateConfig: (id: string, updates: Partial<PromptConfig>) => void;
  deleteConfig: (id: string) => void;
  setActiveConfig: (config: PromptConfig) => void;
  duplicateConfig: (id: string) => void;
  setConfigs: (configs: PromptConfig[]) => void; // Replace all configs
  clearStore: () => void; // Clear everything
}

const createDefaultConfig = (): PromptConfig => ({
  id: Date.now().toString(),
  name: 'New Configuration',
  createdAt: new Date().toISOString(),

  detailLevel: 50,
  formalityLevel: 50,
  technicalDepth: 50,
  creativityLevel: 30,
  verbosity: 50,

  enthusiasm: 50,
  empathy: 50,
  confidence: 70,
  humor: 20,

  useExamples: true,
  useBulletPoints: true,
  useNumberedLists: false,
  includeCodeSamples: false,
  includeAnalogies: false,
  includeVisualDescriptions: false,
  includeTables: false,
  includeSnippets: false,
  includeExternalReferences: false,
  showThoughtProcess: false,
  includeStepByStep: false,
  includeSummary: false,

  responseLength: 'auto',
  perspective: '2nd-person',
  audience: 'mixed',
  explanationStyle: 'direct',
  industryKnowledge: 50,

  prioritizeAccuracy: true,
  prioritizeSpeed: false,
  prioritizeClarity: true,
  prioritizeComprehensiveness: false,

  customInstructions: '',
      customStyle: '',
});

// Pre-configured example templates
const createExampleConfigs = (): PromptConfig[] => {
  const baseDate = new Date('2024-01-01').toISOString();

  return [
    {
      id: 'example-1',
      name: '🎓 Teaching Assistant',
      createdAt: baseDate,
      detailLevel: 70,
      formalityLevel: 40,
      technicalDepth: 40,
      creativityLevel: 50,
      verbosity: 65,
      enthusiasm: 70,
      empathy: 85,
      confidence: 60,
      humor: 40,
      useExamples: true,
      useBulletPoints: true,
      useNumberedLists: true,
      includeCodeSamples: false,
      includeAnalogies: true,
      includeVisualDescriptions: true,
      includeTables: false,
      includeSnippets: false,
      includeExternalReferences: false,
      showThoughtProcess: false,
      includeStepByStep: false,
      includeSummary: false,
      responseLength: 'medium',
      perspective: '2nd-person',
      audience: 'millennial',
      explanationStyle: 'socratic',
      industryKnowledge: 50,
      prioritizeAccuracy: true,
      prioritizeSpeed: false,
      prioritizeClarity: true,
      prioritizeComprehensiveness: false,
      customInstructions: 'Help users learn by guiding them through concepts with questions and examples.',
      customStyle: '',
    },
    {
      id: 'example-2',
      name: '💻 Code Review Expert',
      createdAt: baseDate,
      detailLevel: 80,
      formalityLevel: 60,
      technicalDepth: 90,
      creativityLevel: 20,
      verbosity: 70,
      enthusiasm: 40,
      empathy: 50,
      confidence: 85,
      humor: 15,
      useExamples: true,
      useBulletPoints: true,
      useNumberedLists: false,
      includeCodeSamples: true,
      includeAnalogies: false,
      includeVisualDescriptions: false,
      includeTables: false,
      includeSnippets: false,
      includeExternalReferences: false,
      showThoughtProcess: false,
      includeStepByStep: false,
      includeSummary: false,
      responseLength: 'long',
      perspective: '2nd-person',
      audience: 'gen-x',
      explanationStyle: 'analytical',
      industryKnowledge: 50,
      prioritizeAccuracy: true,
      prioritizeSpeed: false,
      prioritizeClarity: true,
      prioritizeComprehensiveness: true,
      customInstructions: 'Provide thorough code reviews focusing on best practices, performance, and maintainability.',
      customStyle: '',
    },
    {
      id: 'example-3',
      name: '✨ Creative Storyteller',
      createdAt: baseDate,
      detailLevel: 75,
      formalityLevel: 30,
      technicalDepth: 20,
      creativityLevel: 95,
      verbosity: 80,
      enthusiasm: 80,
      empathy: 70,
      confidence: 75,
      humor: 60,
      useExamples: true,
      useBulletPoints: false,
      useNumberedLists: false,
      includeCodeSamples: false,
      includeAnalogies: true,
      includeVisualDescriptions: true,
      includeTables: false,
      includeSnippets: false,
      includeExternalReferences: false,
      showThoughtProcess: false,
      includeStepByStep: false,
      includeSummary: false,
      responseLength: 'long',
      perspective: 'mixed',
      audience: 'mixed',
      explanationStyle: 'narrative',
      industryKnowledge: 50,
      prioritizeAccuracy: false,
      prioritizeSpeed: false,
      prioritizeClarity: true,
      prioritizeComprehensiveness: false,
      customInstructions: 'Craft engaging narratives with vivid descriptions and creative flair.',
      customStyle: '',
    },
    {
      id: 'example-4',
      name: '📊 Executive Briefing',
      createdAt: baseDate,
      detailLevel: 40,
      formalityLevel: 85,
      technicalDepth: 50,
      creativityLevel: 20,
      verbosity: 30,
      enthusiasm: 30,
      empathy: 40,
      confidence: 90,
      humor: 10,
      useExamples: false,
      useBulletPoints: true,
      useNumberedLists: false,
      includeCodeSamples: false,
      includeAnalogies: false,
      includeVisualDescriptions: false,
      includeTables: false,
      includeSnippets: false,
      includeExternalReferences: false,
      showThoughtProcess: false,
      includeStepByStep: false,
      includeSummary: false,
      responseLength: 'short',
      perspective: '3rd-person',
      audience: 'boomer',
      explanationStyle: 'direct',
      industryKnowledge: 50,
      prioritizeAccuracy: true,
      prioritizeSpeed: true,
      prioritizeClarity: true,
      prioritizeComprehensiveness: false,
      customInstructions: 'Deliver concise, high-level summaries focused on key insights and actionable items.',
      customStyle: '',
    },
    {
      id: 'example-5',
      name: '💬 Casual Chat Friend',
      createdAt: baseDate,
      detailLevel: 45,
      formalityLevel: 15,
      technicalDepth: 25,
      creativityLevel: 60,
      verbosity: 50,
      enthusiasm: 75,
      empathy: 80,
      confidence: 65,
      humor: 70,
      useExamples: true,
      useBulletPoints: false,
      useNumberedLists: false,
      includeCodeSamples: false,
      includeAnalogies: true,
      includeVisualDescriptions: false,
      includeTables: false,
      includeSnippets: false,
      includeExternalReferences: false,
      showThoughtProcess: false,
      includeStepByStep: false,
      includeSummary: false,
      responseLength: 'medium',
      perspective: '1st-person',
      audience: 'mixed',
      explanationStyle: 'direct',
      industryKnowledge: 50,
      prioritizeAccuracy: false,
      prioritizeSpeed: true,
      prioritizeClarity: true,
      prioritizeComprehensiveness: false,
      customInstructions: 'Be friendly, relatable, and conversational. Like chatting with a knowledgeable friend.',
      customStyle: '',
    },
    {
      id: 'example-6',
      name: '🔬 Research Analyst',
      createdAt: baseDate,
      detailLevel: 95,
      formalityLevel: 75,
      technicalDepth: 85,
      creativityLevel: 25,
      verbosity: 90,
      enthusiasm: 40,
      empathy: 30,
      confidence: 80,
      humor: 10,
      useExamples: true,
      useBulletPoints: true,
      useNumberedLists: true,
      includeCodeSamples: false,
      includeAnalogies: false,
      includeVisualDescriptions: false,
      includeTables: false,
      includeSnippets: false,
      includeExternalReferences: false,
      showThoughtProcess: false,
      includeStepByStep: false,
      includeSummary: false,
      responseLength: 'comprehensive',
      perspective: '3rd-person',
      audience: 'gen-x',
      explanationStyle: 'analytical',
      industryKnowledge: 50,
      prioritizeAccuracy: true,
      prioritizeSpeed: false,
      prioritizeClarity: true,
      prioritizeComprehensiveness: true,
      customInstructions: 'Provide in-depth analysis with comprehensive coverage of topics, citing sources when possible.',
      customStyle: '',
    },
    {
      id: 'example-7',
      name: '⚡ Quick Helper',
      createdAt: baseDate,
      detailLevel: 25,
      formalityLevel: 40,
      technicalDepth: 50,
      creativityLevel: 15,
      verbosity: 20,
      enthusiasm: 50,
      empathy: 50,
      confidence: 75,
      humor: 20,
      useExamples: false,
      useBulletPoints: true,
      useNumberedLists: false,
      includeCodeSamples: false,
      includeAnalogies: false,
      includeVisualDescriptions: false,
      includeTables: false,
      includeSnippets: false,
      includeExternalReferences: false,
      showThoughtProcess: false,
      includeStepByStep: false,
      includeSummary: false,
      responseLength: 'short',
      perspective: '2nd-person',
      audience: 'mixed',
      explanationStyle: 'direct',
      industryKnowledge: 50,
      prioritizeAccuracy: true,
      prioritizeSpeed: true,
      prioritizeClarity: true,
      prioritizeComprehensiveness: false,
      customInstructions: 'Get straight to the point with brief, actionable answers.',
      customStyle: '',
    },
    {
      id: 'example-8',
      name: '📱 Social Media Writer',
      createdAt: baseDate,
      detailLevel: 30,
      formalityLevel: 20,
      technicalDepth: 20,
      creativityLevel: 80,
      verbosity: 35,
      enthusiasm: 90,
      empathy: 60,
      confidence: 85,
      humor: 75,
      useExamples: true,
      useBulletPoints: false,
      useNumberedLists: false,
      includeCodeSamples: false,
      includeAnalogies: false,
      includeVisualDescriptions: false,
      includeTables: false,
      includeSnippets: false,
      includeExternalReferences: false,
      showThoughtProcess: false,
      includeStepByStep: false,
      includeSummary: false,
      responseLength: 'short',
      perspective: '1st-person',
      audience: 'mixed',
      explanationStyle: 'direct',
      industryKnowledge: 50,
      prioritizeAccuracy: false,
      prioritizeSpeed: true,
      prioritizeClarity: true,
      prioritizeComprehensiveness: false,
      customInstructions: 'Create engaging, snappy content perfect for social media. Be trendy and relatable.',
      customStyle: '',
    },
    {
      id: 'example-9',
      name: '📚 Technical Documentation',
      createdAt: baseDate,
      detailLevel: 85,
      formalityLevel: 70,
      technicalDepth: 95,
      creativityLevel: 15,
      verbosity: 75,
      enthusiasm: 30,
      empathy: 40,
      confidence: 90,
      humor: 10,
      useExamples: true,
      useBulletPoints: true,
      useNumberedLists: true,
      includeCodeSamples: true,
      includeAnalogies: false,
      includeVisualDescriptions: false,
      includeTables: false,
      includeSnippets: false,
      includeExternalReferences: false,
      showThoughtProcess: false,
      includeStepByStep: false,
      includeSummary: false,
      responseLength: 'long',
      perspective: '2nd-person',
      audience: 'millennial',
      explanationStyle: 'direct',
      industryKnowledge: 50,
      prioritizeAccuracy: true,
      prioritizeSpeed: false,
      prioritizeClarity: true,
      prioritizeComprehensiveness: true,
      customInstructions: 'Write clear, comprehensive technical documentation with code examples and step-by-step instructions.',
      customStyle: '',
    },
    {
      id: 'example-10',
      name: '🐛 Debug Assistant',
      createdAt: baseDate,
      detailLevel: 75,
      formalityLevel: 45,
      technicalDepth: 85,
      creativityLevel: 30,
      verbosity: 60,
      enthusiasm: 55,
      empathy: 70,
      confidence: 80,
      humor: 25,
      useExamples: true,
      useBulletPoints: true,
      useNumberedLists: true,
      includeCodeSamples: true,
      includeAnalogies: true,
      includeVisualDescriptions: false,
      includeTables: false,
      includeSnippets: false,
      includeExternalReferences: false,
      showThoughtProcess: false,
      includeStepByStep: false,
      includeSummary: false,
      responseLength: 'medium',
      perspective: '2nd-person',
      audience: 'millennial',
      explanationStyle: 'analytical',
      industryKnowledge: 50,
      prioritizeAccuracy: true,
      prioritizeSpeed: false,
      prioritizeClarity: true,
      prioritizeComprehensiveness: false,
      customInstructions: 'Help identify and fix bugs with clear explanations of what went wrong and how to fix it.',
      customStyle: '',
    },
  ];
};

export const useStore = create<StoreState>()((set, get) => ({
  configs: [], // Start with empty configs - will be loaded from Redis per user
  activeConfig: null,

  addConfig: (config) => {
    // Save to Redis via API
    fetch('/api/configs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    }).catch(err => console.error('Error saving config to Redis:', err));

    set((state) => ({
      configs: [...state.configs, config],
    }));
  },

  updateConfig: (id, updates) => {
    // Get the updated config
    const state = get();
    const updatedConfig = state.configs.find(c => c.id === id);
    if (updatedConfig) {
      const configToSave = { ...updatedConfig, ...updates };
      // Save to Redis via API
      fetch('/api/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configToSave),
      }).catch(err => console.error('Error updating config in Redis:', err));
    }

    set((state) => ({
      configs: state.configs.map((config) =>
        config.id === id ? { ...config, ...updates } : config
      ),
      activeConfig: state.activeConfig?.id === id
        ? { ...state.activeConfig, ...updates }
        : state.activeConfig,
    }));
  },

  deleteConfig: (id) => {
    // Delete from Redis via API
    fetch(`/api/configs?id=${id}`, {
      method: 'DELETE',
    }).catch(err => console.error('Error deleting config from Redis:', err));

    set((state) => ({
      configs: state.configs.filter((config) => config.id !== id),
      activeConfig: state.activeConfig?.id === id ? null : state.activeConfig,
    }));
  },

  setActiveConfig: (config) => set({ activeConfig: config }),

  duplicateConfig: (id) => {
    const config = get().configs.find((c) => c.id === id);
    if (config) {
      const newConfig = {
        ...config,
        id: Date.now().toString(),
        name: `${config.name} (Copy)`,
        createdAt: new Date().toISOString(),
      };

      // Save to Redis via API
      fetch('/api/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      }).catch(err => console.error('Error saving duplicated config to Redis:', err));

      set((state) => ({
        configs: [...state.configs, newConfig],
      }));
    }
  },

  setConfigs: (configs) => set({ configs, activeConfig: configs[0] || null }),

  clearStore: () => set({ configs: [], activeConfig: null }),
}));

export { createDefaultConfig, createExampleConfigs };

// Export a helper to clear store from outside components (e.g., on logout)
export const clearUserSession = () => {
  useStore.getState().clearStore();
};
