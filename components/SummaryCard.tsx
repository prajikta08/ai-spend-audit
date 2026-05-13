'use client';

import type { AuditResultItem } from '@/lib/auditEngine';
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface Totals {
  monthlySavings: number;
  annualSavings: number;
  currentMonthlySpend: number;
}

interface SummaryCardProps {
  results: AuditResultItem[];
  totals: Totals;
}

const HIGH_SAVINGS_THRESHOLD = 500;

export default function SummaryCard({ results, totals }: SummaryCardProps) {
  const { monthlySavings, annualSavings, currentMonthlySpend } = totals;

  // How many tools actually have a recommendation vs are already optimal
  const toolsWithSavings = results.filter((r) => r.monthlySavings > 0).length;
  const totalTools = results.length;

  const savingsPct =
    currentMonthlySpend > 0
      ? Math.round((monthlySavings / currentMonthlySpend) * 100)
      : 0;

  const isHighSavings = monthlySavings >= HIGH_SAVINGS_THRESHOLD;
  const hasSavings = monthlySavings > 0;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-10 text-center">
      <h2 className="text-2xl font-medium mb-1">Your Potential Savings</h2>

      {totalTools > 0 && (
        <p className="text-blue-200 text-sm mb-6">
          {hasSavings
            ? `${toolsWithSavings} of ${totalTools} tool${totalTools !== 1 ? 's' : ''} can be optimised`
            : `Your ${totalTools} tool${totalTools !== 1 ? 's' : ''} look well-optimised`}
        </p>
      )}

      {/* Primary figure */}
      <div className="mt-2 mb-4">
        <div className="text-7xl font-bold tracking-tighter">
          {formatCurrency(monthlySavings)}
        </div>
        <p className="text-xl text-blue-100 mt-1">per month</p>
      </div>

      {/* Secondary figures */}
      <div className="flex items-center justify-center gap-6 mb-8 text-blue-100">
        <div>
          <p className="text-2xl font-semibold text-white">{formatCurrency(annualSavings)}</p>
          <p className="text-sm">per year</p>
        </div>

        {savingsPct > 0 && (
          <>
            <div className="w-px h-10 bg-white/20" />
            <div>
              <p className="text-2xl font-semibold text-white">{savingsPct}%</p>
              <p className="text-sm">of current spend</p>
            </div>
          </>
        )}
      </div>

      {isHighSavings && (
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-5 mt-2 text-left">
          <p className="font-semibold text-base">🎯 Significant opportunity identified</p>
          <p className="mt-1 text-blue-100 text-sm leading-relaxed">
            Consolidating or downgrading a few plans could free up{' '}
            <span className="font-medium text-white">{formatCurrency(annualSavings)}</span> annually
            — worth prioritising before your next renewal cycle.
          </p>
        </div>
      )}

      {/* Zero-savings state */}
      {!hasSavings && totalTools > 0 && (
        <div className="bg-white/10 rounded-2xl p-5 mt-2">
          <p className="font-semibold text-base">✓ Looking good</p>
          <p className="mt-1 text-blue-100 text-sm">
            No major cost optimisations found. Revisit this audit if your team size or tool usage changes.
          </p>
        </div>
      )}
    </div>
  );
}
