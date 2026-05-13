// lib/auditEngine.ts
import { getPlanPrice, getCheapestPaidPlan, getPlansForTool } from './pricing';

export interface ToolInput {
  id: string;
  tool: string;
  plan: string;
  seats: number;
  useCase: 'coding' | 'writing' | 'data' | 'research' | 'mixed';
  // monthlySpend is what the user actually pays — could differ from seats * planPrice
  // if they're on an annual contract, have discounts, etc.
  monthlySpend: number;
}

export interface AuditResultItem {
  tool: string;
  currentPlan: string;
  currentSpend: number;
  recommendedPlan: string;
  recommendedMonthlySpend: number;
  monthlySavings: number;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

export function runAudit(tools: ToolInput[], teamSize: number): AuditResultItem[] {
  return tools.map((entry) => auditTool(entry, teamSize));
}

function auditTool(entry: ToolInput, teamSize: number): AuditResultItem {
  const currentPrice = getPlanPrice(entry.tool, entry.plan);

  // If we can't determine the current plan price (e.g. Enterprise quote-based),
  // we still try to give a useful recommendation but flag confidence as low.
  if (currentPrice === null) {
    return {
      tool: entry.tool,
      currentPlan: entry.plan,
      currentSpend: entry.monthlySpend,
      recommendedPlan: entry.plan,
      recommendedMonthlySpend: entry.monthlySpend,
      monthlySavings: 0,
      reason: `We can't benchmark Enterprise plans without a quote. If your contract is up for renewal, it's worth comparing against individual or team plans — especially if headcount has changed.`,
      confidence: 'low',
    };
  }

  // For coding workflows, check if Cursor would be a better fit than a general LLM.
  const codingAlternative = getCodingAlternative(entry);
  if (codingAlternative) return codingAlternative;

  // Otherwise, look for a cheaper plan within the same tool.
  const downgrade = findDowngradeOption(entry, teamSize);
  if (downgrade) return downgrade;

  // No better option found — current setup looks fine.
  return {
    tool: entry.tool,
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    recommendedPlan: entry.plan,
    recommendedMonthlySpend: entry.monthlySpend,
    monthlySavings: 0,
    reason: `${entry.tool} ${entry.plan} looks like a reasonable fit for ${entry.useCase} work at your team size.`,
    confidence: 'high',
  };
}

// If someone is paying for a general AI tool (Claude, ChatGPT) primarily for coding,
// a coding-specific tool like Cursor is usually cheaper and better suited.
function getCodingAlternative(entry: ToolInput): AuditResultItem | null {
  const codingTools = ['Claude', 'ChatGPT'];
  if (entry.useCase !== 'coding' || !codingTools.includes(entry.tool)) return null;

  const cursorPro = getPlanPrice('Cursor', 'Pro')!; 
  const cursorMonthly = cursorPro * entry.seats;

  const currentMonthly = (getPlanPrice(entry.tool, entry.plan) ?? 0) * entry.seats;
  if (cursorMonthly >= currentMonthly) return null;

  const savings = currentMonthly - cursorMonthly;

  return {
    tool: entry.tool,
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    recommendedPlan: 'Cursor Pro',
    recommendedMonthlySpend: cursorMonthly,
    monthlySavings: Math.round(savings),
    reason: `For coding-focused work, Cursor Pro ($${cursorPro}/seat) tends to be more cost-effective than ${entry.tool} ${entry.plan}. It also has tighter IDE integration which reduces context-switching.`,
    confidence: 'medium',
  };
}

function findDowngradeOption(
  entry: ToolInput,
  teamSize: number
): AuditResultItem | null {
  const currentPrice = getPlanPrice(entry.tool, entry.plan);
  if (currentPrice === null) return null;

  const allPlans = getPlansForTool(entry.tool);

  const cheaperPaidPlans = allPlans.filter(
    (p) => p.price !== null && p.price > 0 && p.price < currentPrice
  );

  if (cheaperPaidPlans.length === 0) return null;

  const bestAlternative = cheaperPaidPlans.sort((a, b) => b.price! - a.price!)[0];
  const altMonthly = bestAlternative.price! * entry.seats;

  const currentMonthly = currentPrice * entry.seats;
  const savings = currentMonthly - altMonthly;

  if (savings <= 0) return null;

  return {
    tool: entry.tool,
    currentPlan: entry.plan,
    currentSpend: entry.monthlySpend,
    recommendedPlan: bestAlternative.plan,
    recommendedMonthlySpend: altMonthly,
    monthlySavings: Math.round(savings),
    reason: buildDowngradeReason(entry, bestAlternative.plan, bestAlternative.price!, savings),
    confidence: savings > 50 ? 'high' : 'medium',
  };
}

function buildDowngradeReason(
  entry: ToolInput,
  targetPlan: string,
  targetPrice: number,
  savings: number
): string {
  const perSeat = `$${targetPrice}/seat vs $${getPlanPrice(entry.tool, entry.plan)}/seat`;
  const annualSavings = Math.round(savings * 12);

  return (
    `Dropping to ${entry.tool} ${targetPlan} (${perSeat}) would save roughly $${savings}/mo ` +
    `($${annualSavings}/yr) across ${entry.seats} seat${entry.seats !== 1 ? 's' : ''}. ` +
    `Worth reviewing which ${entry.tool} features your team actually uses before switching.`
  );
}

// Aggregates savings across all audit results.
export function calculateTotals(results: AuditResultItem[]): {
  monthlySavings: number;
  annualSavings: number;
  currentMonthlySpend: number;
} {
  const monthlySavings = results.reduce((sum, r) => sum + r.monthlySavings, 0);
  const currentMonthlySpend = results.reduce((sum, r) => sum + r.currentSpend, 0);

  return {
    monthlySavings: Math.round(monthlySavings),
    annualSavings: Math.round(monthlySavings * 12),
    currentMonthlySpend: Math.round(currentMonthlySpend),
  };
}