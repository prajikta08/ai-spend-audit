# Tests

## Running Tests

```bash
npm test
```

All tests use **Vitest** with no DOM dependency — the audit engine is pure TypeScript functions, so tests run in Node without a browser environment.

```bash
npm install --save-dev vitest
```

Add to `package.json`:
```json
"scripts": {
  "test": "vitest run"
}
```

---

## Test File: `__tests__/auditEngine.test.ts`

### Test 1 — Coding LLM switches to Cursor Pro
**File:** `__tests__/auditEngine.test.ts`
**What it covers:** When a user has Claude or ChatGPT set to `useCase: 'coding'`, and Cursor Pro would be cheaper per seat, the engine recommends switching.

```ts
it('recommends Cursor Pro for coding use case on Claude Max', () => {
  const tools = [{
    id: '1', tool: 'Claude', plan: 'Max',
    monthlySpend: 300, seats: 3, useCase: 'coding'
  }];
  const results = runAudit(tools, 5);
  expect(results[0].recommendedPlan).toBe('Cursor Pro');
  expect(results[0].monthlySavings).toBeGreaterThan(0);
});
```

### Test 2 — Cheaper plan downgrade detected
**File:** `__tests__/auditEngine.test.ts`
**What it covers:** Cursor Ultra at $200/seat with multiple seats should recommend Pro+ or Pro as a cheaper alternative.

```ts
it('recommends downgrade from Cursor Ultra to cheaper plan', () => {
  const tools = [{
    id: '2', tool: 'Cursor', plan: 'Ultra',
    monthlySpend: 400, seats: 2, useCase: 'coding'
  }];
  const results = runAudit(tools, 3);
  expect(results[0].monthlySavings).toBeGreaterThan(0);
  expect(results[0].recommendedPlan).not.toBe('Ultra');
});
```

### Test 3 — No savings on cheapest paid plan
**File:** `__tests__/auditEngine.test.ts`
**What it covers:** GitHub Copilot Individual ($10/seat) is the cheapest paid plan — no downgrade should be suggested.

```ts
it('returns no savings for already cheapest plan', () => {
  const tools = [{
    id: '3', tool: 'GitHub Copilot', plan: 'Individual',
    monthlySpend: 10, seats: 1, useCase: 'coding'
  }];
  const results = runAudit(tools, 2);
  expect(results[0].monthlySavings).toBe(0);
});
```

### Test 4 — Enterprise plan returns low confidence
**File:** `__tests__/auditEngine.test.ts`
**What it covers:** Enterprise plans have `null` prices — the engine should return a `low` confidence result without crashing.

```ts
it('handles Enterprise plan gracefully with low confidence', () => {
  const tools = [{
    id: '4', tool: 'Claude', plan: 'Enterprise',
    monthlySpend: 500, seats: 10, useCase: 'mixed'
  }];
  const results = runAudit(tools, 10);
  expect(results[0].confidence).toBe('low');
  expect(results[0].monthlySavings).toBe(0);
});
```

### Test 5 — calculateTotals aggregates correctly
**File:** `__tests__/auditEngine.test.ts`
**What it covers:** `calculateTotals` sums monthly savings and multiplies to annual correctly.

```ts
it('calculateTotals returns correct monthly and annual figures', () => {
  const mockResults = [
    { monthlySavings: 100, currentSpend: 200, tool: 'A', currentPlan: 'Pro',
      recommendedPlan: 'Free', recommendedMonthlySpend: 100, reason: '', confidence: 'high' },
    { monthlySavings: 250, currentSpend: 300, tool: 'B', currentPlan: 'Max',
      recommendedPlan: 'Pro', recommendedMonthlySpend: 50, reason: '', confidence: 'medium' },
  ] as AuditResultItem[];
  const totals = calculateTotals(mockResults);
  expect(totals.monthlySavings).toBe(350);
  expect(totals.annualSavings).toBe(4200);
  expect(totals.currentMonthlySpend).toBe(500);
});
```

### Test 6 — Savings use plan price not entered spend
**File:** `__tests__/auditEngine.test.ts`
**What it covers:** If a user enters $100/mo for Cursor Ultra with 12 seats, savings should still be calculated from the real plan price ($200/seat), not the entered amount.

```ts
it('calculates savings from plan price not entered monthlySpend', () => {
  const tools = [{
    id: '6', tool: 'Cursor', plan: 'Ultra',
    monthlySpend: 100, // deliberately low — annual deal
    seats: 12, useCase: 'coding'
  }];
  const results = runAudit(tools, 12);
  // Real Ultra cost: $200 * 12 = $2400. Pro+: $60 * 12 = $720. Savings: $1680
  expect(results[0].monthlySavings).toBeGreaterThan(500);
});
```

### Test 7 — Empty tools array returns empty results
**File:** `__tests__/auditEngine.test.ts`
**What it covers:** Edge case — `runAudit([])` should return `[]` without throwing.

```ts
it('handles empty tools array', () => {
  const results = runAudit([], 5);
  expect(results).toEqual([]);
});
```

---

## How to Run

```bash
npm test
```

Expected output:
```
✓ __tests__/auditEngine.test.ts (7 tests)
  ✓ recommends Cursor Pro for coding use case on Claude Max
  ✓ recommends downgrade from Cursor Ultra to cheaper plan
  ✓ returns no savings for already cheapest plan
  ✓ handles Enterprise plan gracefully with low confidence
  ✓ calculateTotals returns correct monthly and annual figures
  ✓ calculates savings from plan price not entered monthlySpend
  ✓ handles empty tools array

Test Files  1 passed (1)
Tests       7 passed (7)
```
