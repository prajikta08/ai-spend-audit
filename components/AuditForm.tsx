'use client';

import { useState } from 'react';
import { Plus, Play, Loader2 } from 'lucide-react';
import { useAuditStore } from '@/store/useAuditStore';
import ToolInputRow from './ToolInputRow';
import { runAudit, calculateTotals, type AuditResultItem } from '@/lib/auditEngine';
import { calculateTotals as calcTotals } from '@/lib/auditEngine';
import { cn } from '@/lib/utils';

const USE_CASES = [
  { value: 'coding',   label: 'Heavy Coding / Software Development' },
  { value: 'writing',  label: 'Content & Writing' },
  { value: 'data',     label: 'Data Science / Analytics' },
  { value: 'research', label: 'Research & Analysis' },
  { value: 'mixed',    label: 'Mixed Usage' },
] as const;

type UseCase = typeof USE_CASES[number]['value'];

export interface AuditCompletePayload {
  results: AuditResultItem[];
  totals: ReturnType<typeof calculateTotals>;
  teamSize: number;
  primaryUseCase: UseCase;
}

interface AuditFormProps {
  onAuditComplete: (payload: AuditCompletePayload) => void;
}

export default function AuditForm({ onAuditComplete }: AuditFormProps) {
  const { tools, teamSize, primaryUseCase, addTool, setTeamSize, setUseCase } = useAuditStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunAudit = async () => {
    setError(null);

    if (tools.length === 0) {
      setError('Add at least one tool before running the audit.');
      return;
    }

    setIsLoading(true);

    try {
      const results = runAudit(tools, teamSize);
      const totals = calculateTotals(results);
      await new Promise((resolve) => setTimeout(resolve, 600));

      onAuditComplete({ results, totals, teamSize, primaryUseCase: primaryUseCase as UseCase });
    } catch (err) {
      console.error('[AuditForm] runAudit threw:', err);
      setError('Something went wrong running the audit. Please try again.');
    } finally {
      // Always reset loading — even if runAudit throws
      setIsLoading(false);
    }
  };

  const handleTeamSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    // Clamp between 1 and 10,000 — avoids nonsense values reaching the audit engine
    if (!isNaN(value)) setTeamSize(Math.min(Math.max(value, 1), 10_000));
  };

  const handleUseCaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setUseCase(e.target.value as UseCase);
  };

  const handleAddTool = () => {
    addTool({
      tool: 'ChatGPT',
      plan: 'Plus',
      monthlySpend: 20,
      seats: 1,
      useCase: primaryUseCase as UseCase,
    });
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Team context */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div>
          <label htmlFor="team-size" className="block text-sm font-medium mb-2">
            Team Size
          </label>
          <input
            id="team-size"
            type="number"
            value={teamSize}
            onChange={handleTeamSizeChange}
            className="w-full p-4 text-lg border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="10000"
          />
        </div>

        <div>
          <label htmlFor="use-case" className="block text-sm font-medium mb-2">
            Primary Use Case
          </label>
          <select
            id="use-case"
            value={primaryUseCase}
            onChange={handleUseCaseChange}
            className="w-full p-4 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {USE_CASES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tool rows */}
      <div className="space-y-6 mb-10">
        {tools.length === 0 && (
          <p className="text-center text-gray-400 py-8">
            No tools added yet — click below to get started.
          </p>
        )}
        {tools.map((tool, index) => (
          <ToolInputRow key={tool.id} tool={tool} index={index} />
        ))}
      </div>

      {/* Inline error — no alert() */}
      {error && (
        <p className="text-sm text-red-600 mb-4 text-center">{error}</p>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={handleAddTool}
          className="flex-1 py-4 border border-dashed border-gray-400 hover:border-gray-600 rounded-2xl flex items-center justify-center gap-2 font-medium transition-colors"
        >
          <Plus size={20} />
          Add Tool
        </button>

        <button
          onClick={handleRunAudit}
          disabled={isLoading || tools.length === 0}
          className={cn(
            'flex-1 py-4 rounded-2xl font-semibold text-lg flex items-center justify-center gap-3 transition-colors text-white',
            'bg-gradient-to-r from-blue-600 to-indigo-600',
            'hover:from-blue-700 hover:to-indigo-700',
            'disabled:opacity-60 disabled:cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Running Audit…
            </>
          ) : (
            <>
              Run AI Spend Audit
              <Play size={20} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
