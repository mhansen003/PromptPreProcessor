import { create } from 'zustand';

export interface PersonaConfig {
  id: string;
  name: string;
  emoji: string;  // Decorative emoji for aesthetics
  description: string;  // One-sentence overview of the persona
  createdAt: string;

  // Response Style Controls (Personality Tab)
  detailLevel: number;         // 0-100: Concise to Extremely Detailed
  formalityLevel: number;       // 0-100: Casual to Formal
  technicalDepth: number;       // 0-100: Simple to Highly Technical
  creativityLevel: number;      // 0-100: Factual to Creative
  verbosity: number;            // 0-100: Brief to Lengthy

  // Tone Controls (Personality Tab)
  enthusiasm: number;           // 0-100: Neutral to Enthusiastic
  empathy: number;             // 0-100: Objective to Empathetic
  confidence: number;          // 0-100: Cautious to Assertive
  humor: number;               // 0-100: Serious to Humorous

  // Structure Controls (Response Structure Tab)
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

  // Advanced Controls (Advanced Tab)
  responseLength: 'auto' | 'short' | 'medium' | 'long' | 'comprehensive';
  perspective: '1st-person' | '2nd-person' | '3rd-person' | 'mixed';
  audience: 'gen-z' | 'millennial' | 'gen-x' | 'boomer' | 'senior' | 'mixed';
  explanationStyle: 'direct' | 'socratic' | 'narrative' | 'analytical';
  industryKnowledge: number;  // 0-100: Explain Terms to Use Acronyms

  // Focus Areas (Advanced Tab)
  prioritizeAccuracy: boolean;
  prioritizeSpeed: boolean;
  prioritizeClarity: boolean;
  prioritizeComprehensiveness: boolean;

  // Custom Instructions (Advanced Tab)
  customInstructions: string;
  customStyle: string;  // Additional style instructions like "output to PDF"

  // Regional Settings (Regional Tab)
  region: 'northeast' | 'southeast' | 'midwest' | 'southwest' | 'west' | 'pacific-northwest' | 'mountain-west' | 'national' | 'none';
  state: string;  // Specific state (e.g., "California", "Texas", "New York")
  gender: 'male' | 'female' | 'neutral';  // For DALL-E caricature generation
  dialect: 'standard-american' | 'southern' | 'midwestern' | 'northeast' | 'california' | 'neutral';
  includeLocalReferences: boolean;  // Include local landmarks, culture, etc.
  timeZoneAwareness: boolean;  // Mention time-specific context
  regionalTerminology: number;  // 0-100: Generic to Region-Specific terms
  localMarketKnowledge: boolean;  // Include local real estate/mortgage market insights
  culturalSensitivity: number;  // 0-100: General to Highly Culturally Aware

  // Role Settings (Role Tab - Mortgage/Financial)
  jobRole: 'loan-officer' | 'processor' | 'underwriter' | 'sales' | 'sales-assistant' | 'branch-manager' | 'operations' | 'closer' | 'account-executive' | 'general';
  yearsExperience: number;  // 0-50+
  specializations: string[];  // FHA, VA, Conventional, Jumbo, Reverse, USDA, Non-QM, Construction
  certifications: string;  // e.g., "NMLS #12345, MLO Licensed"
  clientFocus: 'first-time-buyers' | 'refinance' | 'investors' | 'purchase' | 'mixed';
  teamRole: 'individual' | 'team-lead' | 'manager' | 'executive';
  complianceEmphasis: number;  // 0-100: Minimal to Highly Compliance-Focused
  productKnowledge: number;  // 0-100: Basic to Expert Product Knowledge
  loanTypes: string[];  // Specific products: "30-Year Fixed", "15-Year Fixed", "ARM", "FHA 203(b)", etc.
  marketExpertise: string[];  // "Purchase", "Refinance", "Cash-Out Refi", "HELOC", "Construction-to-Perm"

  // Generated Prompt & Publishing
  systemPrompt?: string;  // Auto-generated prompt
  slug?: string;  // URL-friendly name (auto-generated from name)
  publishedUrl?: string;  // Public URL if published
  isPublished?: boolean;  // Publishing status
  imageUrl?: string;  // DALL-E generated caricature image URL
}

// For backward compatibility, export as PromptConfig as well
export type PromptConfig = PersonaConfig;

interface StoreState {
  configs: PromptConfig[];
  activeConfig: PromptConfig | null;

  // Actions
  addConfig: (config: PromptConfig) => void;
  updateConfig: (id: string, updates: Partial<PromptConfig>) => void;
  saveConfig: (config: PromptConfig) => Promise<PromptConfig | undefined>; // Manual save to Redis with auto-generation
  deleteConfig: (id: string) => void;
  setActiveConfig: (config: PromptConfig) => void;
  duplicateConfig: (id: string) => void;
  setConfigs: (configs: PromptConfig[]) => void; // Replace all configs
  clearStore: () => void; // Clear everything
}

const createDefaultConfig = (): PersonaConfig => ({
  id: Date.now().toString(),
  name: 'New Persona',
  emoji: '⚙️',  // Default emoji
  description: 'A balanced AI persona for general assistance',
  createdAt: new Date().toISOString(),

  // Personality Tab - Response Style
  detailLevel: 50,
  formalityLevel: 50,
  technicalDepth: 50,
  creativityLevel: 30,
  verbosity: 50,

  // Personality Tab - Tone
  enthusiasm: 50,
  empathy: 50,
  confidence: 70,
  humor: 20,

  // Response Structure Tab
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

  // Advanced Tab
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

  // Regional Tab
  region: 'national',
  state: '',
  gender: 'neutral',
  dialect: 'neutral',
  includeLocalReferences: false,
  timeZoneAwareness: false,
  regionalTerminology: 50,
  localMarketKnowledge: false,
  culturalSensitivity: 50,

  // Role Tab (Mortgage/Financial)
  jobRole: 'general',
  yearsExperience: 5,
  specializations: [],
  certifications: '',
  clientFocus: 'mixed',
  teamRole: 'individual',
  complianceEmphasis: 50,
  productKnowledge: 50,
  loanTypes: [],
  marketExpertise: [],
});

// Default Regional and Role fields for example personas
const defaultRegionalFields = {
  region: 'national' as const,
  state: '',
  gender: 'neutral' as const,
  dialect: 'neutral' as const,
  includeLocalReferences: false,
  timeZoneAwareness: false,
  regionalTerminology: 50,
  localMarketKnowledge: false,
  culturalSensitivity: 50,
};

const defaultRoleFields = {
  jobRole: 'general' as const,
  yearsExperience: 5,
  specializations: [] as string[],
  certifications: '',
  clientFocus: 'mixed' as const,
  teamRole: 'individual' as const,
  complianceEmphasis: 50,
  productKnowledge: 50,
  loanTypes: [] as string[],
  marketExpertise: [] as string[],
};

// Pre-configured example personalities
const createExampleConfigs = (): PromptConfig[] => {
  const baseDate = new Date('2024-01-01').toISOString();

  return [
    {
      id: 'example-1',
      name: 'Teaching Assistant',
      emoji: '🎓',
      description: 'Patient educator who guides learners through concepts with questions and examples',
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
      region: 'national',
      state: '',
      gender: 'neutral',
      dialect: 'neutral',
      includeLocalReferences: false,
      timeZoneAwareness: false,
      regionalTerminology: 50,
      localMarketKnowledge: false,
      culturalSensitivity: 50,
      jobRole: 'general',
      yearsExperience: 5,
      specializations: [],
      certifications: '',
      clientFocus: 'mixed',
      teamRole: 'individual',
      complianceEmphasis: 50,
      productKnowledge: 50,
      loanTypes: [],
      marketExpertise: [],
    },
    {
      id: 'example-2',
      name: 'Code Review Expert',
      emoji: '💻',
      description: 'Technical expert providing in-depth code analysis and best practices',
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
      ...defaultRegionalFields,
      ...defaultRoleFields,
    },
    {
      id: 'example-3',
      name: 'Creative Storyteller',
      emoji: '✨',
      description: 'Imaginative storyteller crafting engaging narratives with vivid descriptions',
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
      ...defaultRegionalFields,
      ...defaultRoleFields,
    },
    {
      id: 'example-4',
      name: 'Executive Briefing',
      emoji: '📊',
      description: 'Concise executive-level summaries focusing on key insights and decisions',
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
      ...defaultRegionalFields,
      ...defaultRoleFields,
    },
    {
      id: 'example-5',
      name: 'Casual Chat Friend',
      emoji: '💬',
      description: 'Friendly conversational assistant like chatting with a knowledgeable friend',
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
      ...defaultRegionalFields,
      ...defaultRoleFields,
    },
    {
      id: 'example-6',
      name: 'Research Analyst',
      emoji: '🔬',
      description: 'In-depth research analysis with comprehensive coverage and citations',
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
      ...defaultRegionalFields,
      ...defaultRoleFields,
    },
    {
      id: 'example-7',
      name: 'Quick Helper',
      emoji: '⚡',
      description: 'Fast direct answers getting straight to the point',
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
      ...defaultRegionalFields,
      ...defaultRoleFields,
    },
    {
      id: 'example-8',
      name: 'Social Media Writer',
      emoji: '📱',
      description: 'Trendy engaging social content that\'s snappy and shareable',
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
      ...defaultRegionalFields,
      ...defaultRoleFields,
    },
    {
      id: 'example-9',
      name: 'Technical Documentation',
      emoji: '📚',
      description: 'Comprehensive technical documentation with clear examples and instructions',
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
      ...defaultRegionalFields,
      ...defaultRoleFields,
    },
    {
      id: 'example-10',
      name: 'Debug Assistant',
      emoji: '🐛',
      description: 'Systematic troubleshooting to identify issues and provide clear fixes',
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
      ...defaultRegionalFields,
      ...defaultRoleFields,
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
    // Update in local state only (no auto-save)
    set((state) => ({
      configs: state.configs.map((config) =>
        config.id === id ? { ...config, ...updates } : config
      ),
      activeConfig: state.activeConfig?.id === id
        ? { ...state.activeConfig, ...updates }
        : state.activeConfig,
    }));
  },

  saveConfig: async (config) => {
    // Manual save to Redis with auto-generation
    try {
      const response = await fetch('/api/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success && data.config) {
        // Update the config in the store with the returned data (includes generated prompt)
        set((state) => ({
          configs: state.configs.map(c => c.id === data.config.id ? data.config : c),
          activeConfig: state.activeConfig?.id === data.config.id ? data.config : state.activeConfig,
        }));

        return data.config;
      }
    } catch (err) {
      console.error('Error saving config to Redis:', err);
      throw err;
    }
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
        // Clear generated prompt - needs to be regenerated
        systemPrompt: undefined,
        // Reset slug - will be generated on save
        slug: undefined,
        // Reset publish status - duplicate starts unpublished
        isPublished: false,
      };

      // Save to Redis via API
      fetch('/api/configs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      }).catch(err => console.error('Error saving duplicated config to Redis:', err));

      set((state) => ({
        configs: [...state.configs, newConfig],
        activeConfig: newConfig, // Automatically focus on the duplicated config
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
