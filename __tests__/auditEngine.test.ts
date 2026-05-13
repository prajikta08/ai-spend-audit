// __tests__/auditEngine.test.ts
import { describe, it, expect } from 'vitest';
import { runAudit, calculateTotals, type AuditResultItem } from '../lib/auditEngine';

describe('auditEngine', () => {
  it('recommends Cursor Pro for coding use case on Claude Max', () => {
    const tools = [{
      id: '1', tool: 'Claude', plan: 'Max',
      monthlySpend: 300, seats: 3, useCase: 'coding' as const,
    }];
    const results = runAudit(tools, 5);
    expect(results[0].recommendedPlan).toBe('Cursor Pro');
    expect(results[0].monthlySavings).toBeGreaterThan(0);
  });

  it('recommends downgrade from Cursor Ultra to cheaper plan', () => {
    const tools = [{
      id: '2', tool: 'Cursor', plan: 'Ultra',
      monthlySpend: 400, seats: 2, useCase: 'coding' as const,
    }];
    const results = runAudit(tools, 3);
    expect(results[0].monthlySavings).toBeGreaterThan(0);
    expect(results[0].recommendedPlan).not.toBe('Ultra');
  });

  it('returns no savings for already cheapest paid plan', () => {
    const tools = [{
      id: '3', tool: 'GitHub Copilot', plan: 'Individual',
      monthlySpend: 10, seats: 1, useCase: 'coding' as const,
    }];
    const results = runAudit(tools, 2);
    expect(results[0].monthlySavings).toBe(0);
  });

  it('handles Enterprise plan gracefully with low confidence', () => {
    const tools = [{
      id: '4', tool: 'Claude', plan: 'Enterprise',
      monthlySpend: 500, seats: 10, useCase: 'mixed' as const,
    }];
    const results = runAudit(tools, 10);
    expect(results[0].confidence).toBe('low');
    expect(results[0].monthlySavings).toBe(0);
  });

  it('calculateTotals returns correct monthly and annual figures', () => {
    const mockResults: AuditResultItem[] = [
      {
        monthlySavings: 100, currentSpend: 200, tool: 'A', currentPlan: 'Pro',
        recommendedPlan: 'Free', recommendedMonthlySpend: 100, reason: '', confidence: 'high',
      },
      {
        monthlySavings: 250, currentSpend: 300, tool: 'B', currentPlan: 'Max',
        recommendedPlan: 'Pro', recommendedMonthlySpend: 50, reason: '', confidence: 'medium',
      },
    ];
    const totals = calculateTotals(mockResults);
    expect(totals.monthlySavings).toBe(350);
    expect(totals.annualSavings).toBe(4200);
    expect(totals.currentMonthlySpend).toBe(500);
  });

  it('calculates savings from plan price not entered monthlySpend', () => {
    const tools = [{
      id: '6', tool: 'Cursor', plan: 'Ultra',
      monthlySpend: 100, // deliberately low — simulates annual billing
      seats: 12, useCase: 'coding' as const,
    }];
    const results = runAudit(tools, 12);
    // Real Ultra: $200 * 12 = $2400. Pro+: $60 * 12 = $720. Savings: $1680
    expect(results[0].monthlySavings).toBeGreaterThan(500);
  });

  it('handles empty tools array without throwing', () => {
    const results = runAudit([], 5);
    expect(results).toEqual([]);
  });
});
