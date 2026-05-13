'use client';

import type { AuditResultItem } from '@/lib/auditEngine';
import { formatCurrency, savingsPercent } from '@/lib/utils';
import { cn } from '@/lib/utils';
import SummaryCard from './SummaryCard';

interface Totals {
  monthlySavings: number;
  annualSavings: number;
  currentMonthlySpend: number;
}

interface AuditResultsProps {
  results: AuditResultItem[];
  totals: Totals;
}

export default function AuditResults({ results, totals }: AuditResultsProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <SummaryCard results={results} totals={totals} />

      <div className="space-y-6">
        <h3 className="text-2xl font-semibold text-center">Breakdown by Tool</h3>

        {results.map((item) => (
          <ToolResultCard key={item.tool} item={item} />
        ))}
      </div>
    </div>
  );
}

// Extracted into its own component so the map above stays readable
// and this card can be tested or reused independently.
function ToolResultCard({ item }: { item: AuditResultItem }) {
  const hasSavings = item.monthlySavings > 0;
  const pct = savingsPercent(item.monthlySavings, item.currentSpend);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 transition-shadow hover:shadow-md">
      {/* Header row */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-xl font-semibold">{item.tool}</h4>
            <ConfidenceBadge confidence={item.confidence} />
          </div>
          <p className="text-gray-500 text-sm mt-0.5">
            Current plan: {item.currentPlan}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-sm text-gray-500">Monthly spend</p>
          <p className="text-2xl font-bold">{formatCurrency(item.currentSpend)}</p>
        </div>
      </div>

      {/* Recommendation row */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex-1">
            <p className={cn('font-semibold text-lg', hasSavings ? 'text-green-600' : 'text-gray-500')}>
              {hasSavings ? `Switch to: ${item.recommendedPlan}` : 'No change recommended'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
              {item.reason}
            </p>
          </div>

          {hasSavings && (
            <div className="text-right shrink-0 min-w-[140px]">
              <p className="text-sm text-green-600 font-medium">Monthly savings</p>
              <p className="text-4xl font-bold text-green-600">
                +{formatCurrency(item.monthlySavings)}
              </p>
              {pct > 0 && (
                <p className="text-xs text-green-500 mt-1">{pct}% reduction</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Small badge indicating how confident the audit engine is in this recommendation.
// Low confidence = quote-based pricing or missing data, not a bad recommendation.
function ConfidenceBadge({ confidence }: { confidence: AuditResultItem['confidence'] }) {
  const styles: Record<AuditResultItem['confidence'], string> = {
    high:   'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    low:    'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
  };

  const labels: Record<AuditResultItem['confidence'], string> = {
    high:   'High confidence',
    medium: 'Estimate',
    low:    'Quote-based',
  };

  return (
    <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', styles[confidence])}>
      {labels[confidence]}
    </span>
  );
}
