import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

  // Advanced Controls
  responseLength: 'auto' | 'short' | 'medium' | 'long' | 'comprehensive';
  perspective: '1st-person' | '2nd-person' | '3rd-person' | 'mixed';
  audience: 'general' | 'technical' | 'executive' | 'beginner' | 'expert';
  explanationStyle: 'direct' | 'socratic' | 'narrative' | 'analytical';

  // Focus Areas
  prioritizeAccuracy: boolean;
  prioritizeSpeed: boolean;
  prioritizeClarity: boolean;
  prioritizeComprehensiveness: boolean;

  // Custom Instructions
  customInstructions: string;
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

  responseLength: 'auto',
  perspective: '2nd-person',
  audience: 'general',
  explanationStyle: 'direct',

  prioritizeAccuracy: true,
  prioritizeSpeed: false,
  prioritizeClarity: true,
  prioritizeComprehensiveness: false,

  customInstructions: '',
});

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      configs: [createDefaultConfig()],
      activeConfig: null,

      addConfig: (config) => set((state) => ({
        configs: [...state.configs, config],
      })),

      updateConfig: (id, updates) => set((state) => ({
        configs: state.configs.map((config) =>
          config.id === id ? { ...config, ...updates } : config
        ),
        activeConfig: state.activeConfig?.id === id
          ? { ...state.activeConfig, ...updates }
          : state.activeConfig,
      })),

      deleteConfig: (id) => set((state) => ({
        configs: state.configs.filter((config) => config.id !== id),
        activeConfig: state.activeConfig?.id === id ? null : state.activeConfig,
      })),

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
          set((state) => ({
            configs: [...state.configs, newConfig],
          }));
        }
      },
    }),
    {
      name: 'prompt-preprocessor-storage',
    }
  )
);

export { createDefaultConfig };
