# SpendAudit

An instant AI tool spend auditor for small teams. Enter your current AI subscriptions — Cursor, Claude, ChatGPT, GitHub Copilot, and more — and get a per-tool breakdown of where you're overspending and what to switch to.

Built for engineering managers and CTOs at 5–25 person startups who pay the AI bills themselves and have been meaning to audit the stack "at some point."

**[→ Live demo](https://ai-spend-audit-jcqeuy4lu-prajikta08s-projects.vercel.app)**

---

## Screenshots

<!-- Add 3 screenshots here before submitting:
  1. The form with tools filled in
  2. The results page showing savings
  3. The shareable audit link
-->

---

## Quick Start

### Local development

```bash
git clone https://github.com/YOUR_USERNAME/ai-spend-audit.git
cd ai-spend-audit
npm install
```

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ANTHROPIC_API_KEY=your-anthropic-key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Supabase setup

Run this SQL in your Supabase SQL Editor:

```sql
create table audits (
  id text primary key,
  team_size integer,
  primary_use_case text,
  tools jsonb,
  results jsonb,
  monthly_savings numeric,
  annual_savings numeric,
  created_at timestamptz default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  audit_id text references audits(id),
  email text not null,
  company_name text,
  role text,
  team_size integer,
  savings_monthly numeric,
  created_at timestamptz default now()
);

alter table audits disable row level security;
alter table leads disable row level security;
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Add the same environment variables in the Vercel dashboard under Settings → Environment Variables.

### Run tests

```bash
npm test
```

---

## Decisions

### 1. Deterministic audit engine, no LLM for core logic

The savings recommendations in `auditEngine.ts` are derived entirely from static pricing data in `pricing.ts` — no model involvement. This means results are reproducible, auditable, and don't depend on API availability. The only LLM call is for the summary paragraph, which is cosmetic and has a static fallback.

### 2. Savings calculated from plan prices, not entered spend

Users enter their actual monthly spend, which may reflect annual billing, team discounts, or just a rough number. Using that figure as the benchmark for savings produced $0 results whenever entered spend was lower than the expected alternative plan cost. Savings are now calculated as `currentPlanPrice × seats - alternativePlanPrice × seats`, which gives consistent results regardless of what the user typed.

### 3. Enterprise prices are `null`, not a placeholder number

Several tools show `$999` as a placeholder for Enterprise pricing. This was tempting to include but produces misleading savings estimates — if Enterprise is really $200/seat under a negotiated contract, telling a user they can save $979/seat by downgrading is wrong. `null` prices return a `low` confidence result with a note to benchmark at renewal, which is honest.

### 4. Zustand over Redux or React Context

The audit state (tools, team size, use case) is shared between `AuditForm`, `ToolInputRow`, and `EmailCapture`. Zustand provides this with no boilerplate and adds `persist` middleware for free, so users don't lose their input on refresh. Redux would be 5x the code for the same outcome at this scale.

### 5. Shareable link as the primary distribution mechanic

The `/audit/[id]` page isn't just a feature — it's the main way new users discover the tool. When someone sees "$2,400/month in potential savings," they share it. Each share is an acquisition with zero cost. This drove the decision to save audits to Supabase immediately on completion rather than requiring a signup first.
