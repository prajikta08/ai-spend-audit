'use client';

import { X } from 'lucide-react';
import { useAuditStore } from '@/store/useAuditStore';
import { toolPricing, getPlanPrice } from '@/lib/pricing';
import type { ToolInput } from '@/lib/auditEngine';

const TOOL_NAMES = Object.keys(toolPricing) as (keyof typeof toolPricing)[];

function getPlansForTool(toolName: string): string[] {
  const pricing = toolPricing[toolName as keyof typeof toolPricing];
  return pricing ? Object.keys(pricing) : [];
}

const USE_CASES = [
  { value: 'coding',   label: 'Coding / Development' },
  { value: 'writing',  label: 'Writing / Content' },
  { value: 'data',     label: 'Data Analysis' },
  { value: 'research', label: 'Research' },
  { value: 'mixed',    label: 'Mixed Use' },
] as const;

type UseCase = typeof USE_CASES[number]['value'];

interface ToolInputRowProps {
  tool: ToolInput;
  index: number;
}

export default function ToolInputRow({ tool, index }: ToolInputRowProps) {
  const { updateTool, removeTool } = useAuditStore();

  const availablePlans = getPlansForTool(tool.tool);
  const planPrice = getPlanPrice(tool.tool, tool.plan);
  const expectedMonthly = planPrice !== null ? planPrice * tool.seats : null;

  const handleToolChange = (newTool: string) => {
    const plans = getPlansForTool(newTool);
    updateTool(tool.id, { tool: newTool, plan: plans[0] ?? '' });
  };

  const handleMonthlySpend = (value: string) => {
    const parsed = parseFloat(value);
    if (isNaN(parsed)) return;
    updateTool(tool.id, { monthlySpend: Math.max(0, Math.round(parsed)) });
  };

  const handleSeats = (value: string) => {
    const parsed = parseInt(value, 10);
    if (isNaN(parsed)) return;
    updateTool(tool.id, { seats: Math.min(Math.max(parsed, 1), 10_000) });
  };

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 bg-white dark:bg-gray-900">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-base text-gray-700 dark:text-gray-300">
          Tool {index + 1}
        </h3>
        <button
          onClick={() => removeTool(tool.id)}
          aria-label={`Remove tool ${index + 1}`}
          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tool */}
        <div>
          <label className="block text-sm font-medium mb-1">AI Tool</label>
          <select
            value={tool.tool}
            onChange={(e) => handleToolChange(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {TOOL_NAMES.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>

        {/* Plan */}
        <div>
          <label className="block text-sm font-medium mb-1">Plan</label>
          <select
            value={tool.plan}
            onChange={(e) => updateTool(tool.id, { plan: e.target.value })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {availablePlans.length > 0 ? (
              availablePlans.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))
            ) : (
              <option value="">No plans available</option>
            )}
          </select>
        </div>

        {/* Monthly Spend */}
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <label className="block text-sm font-medium">Monthly Spend ($)</label>
            {expectedMonthly !== null && (
              <span className="text-xs text-gray-400">
                Expected: ${expectedMonthly}/mo
              </span>
            )}
          </div>
          <input
            type="number"
            value={tool.monthlySpend}
            onChange={(e) => handleMonthlySpend(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="0"
            step="1"
          />
        </div>

        {/* Seats */}
        <div>
          <label className="block text-sm font-medium mb-1">Number of Seats</label>
          <input
            type="number"
            value={tool.seats}
            onChange={(e) => handleSeats(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max="10000"
            step="1"
          />
        </div>

        {/* Use Case — spans both columns */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">
            How does your team use this tool?
          </label>
          <select
            value={tool.useCase}
            onChange={(e) => updateTool(tool.id, { useCase: e.target.value as UseCase })}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {USE_CASES.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
