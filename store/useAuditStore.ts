// store/useAuditStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ToolInput } from '@/lib/auditEngine';

type UseCase = 'coding' | 'writing' | 'data' | 'research' | 'mixed';

function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback: not cryptographically strong, but fine for a UI row key
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const DEFAULT_STATE = {
  teamSize: 5,
  primaryUseCase: 'coding' as UseCase,
  tools: [
    {
      id: generateId(),
      tool: 'ChatGPT',
      plan: 'Plus',
      monthlySpend: 20,
      seats: 1,
      useCase: 'mixed' as UseCase,
    },
  ] satisfies ToolInput[],
};

type State = {
  tools: ToolInput[];
  teamSize: number;
  primaryUseCase: UseCase;

  addTool: (tool: Omit<ToolInput, 'id'>) => void;
  removeTool: (id: string) => void;
  updateTool: (id: string, updates: Partial<Omit<ToolInput, 'id'>>) => void;
  setTeamSize: (size: number) => void;
  setUseCase: (useCase: UseCase) => void;
  reset: () => void;
};

export const useAuditStore = create<State>()(
  persist(
    (set) => ({
      ...DEFAULT_STATE,

      addTool: (tool) =>
        set((state) => ({
          tools: [...state.tools, { ...tool, id: generateId() }],
        })),

      removeTool: (id) =>
        set((state) => ({
          tools: state.tools.filter((t) => t.id !== id),
        })),

      updateTool: (id, updates) =>
        set((state) => ({
          tools: state.tools.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        })),

      setTeamSize: (size) => set({ teamSize: size }),

      setUseCase: (useCase) => set({ primaryUseCase: useCase }),
      reset: () =>
        set({
          ...DEFAULT_STATE,
          tools: DEFAULT_STATE.tools.map((t) => ({ ...t, id: generateId() })),
        }),
    }),
    {
      name: 'ai-spend-audit',
      version: 1,
    }
  )
);