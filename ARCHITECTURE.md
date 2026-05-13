# Architecture

## What This Is

SpendAudit is a Next.js web app that takes a team's AI tool subscriptions as input and returns a per-tool cost optimisation report. It runs entirely client-side for the audit itself, with two lightweight API routes handling persistence and AI-generated summaries.

---

## System Diagram

```mermaid
flowchart TD
    A[User fills AuditForm] --> B[useAuditStore - Zustand]
    B --> C[runAudit - auditEngine.ts]
    C --> D[pricing.ts - plan price lookup]
    D --> C
    C --> E[AuditResultItem array]
    E --> F[calculateTotals]
    F --> G[AuditResults + SummaryCard UI]
    E --> H[POST /api/summary - Claude]
    H --> I[AI-generated summary text]
    G --> J[POST /api/lead - email capture]
    J --> K[(Supabase - leads table)]
    G --> L[saveAudit - supabase.ts]
    L --> M[(Supabase - audits table)]
    M --> N[/audit/id - shareable page]
```

---

## Data Flow: Input → Audit Result

1. **User input** — `AuditForm` collects team size, primary use case, and per-tool entries (tool name, plan, seats, monthly spend, use case). State is held in Zustand and persisted to localStorage.

2. **Audit engine** — `runAudit()` in `auditEngine.ts` maps over each tool entry and runs three checks in order:
   - Is this an Enterprise/quote-based plan? → return low-confidence note
   - Is this a general LLM used for coding? → check if Cursor Pro is cheaper per seat
   - Is there a cheaper paid plan within the same tool? → find best downgrade option
   
   Savings are calculated using `seats × planPrice` from `pricing.ts`, not the user-entered spend — this prevents users entering discounted/annual amounts from getting zero savings when a real opportunity exists.

3. **Totals** — `calculateTotals()` aggregates monthly savings, annual savings, and current spend across all results.

4. **Persistence** — the audit object is saved to Supabase (`audits` table) and an 8-character ID is generated. This ID powers the shareable `/audit/[id]` route.

5. **AI summary** — `POST /api/summary` sends the audit results to Claude (`claude-sonnet-4-20250514`) with a low-temperature prompt (0.3) to generate a consistent, factual 100-word summary. Falls back to a static template if the API call fails.

6. **Lead capture** — `EmailCapture` posts to `POST /api/lead` which validates the email and writes to the `leads` table in Supabase.

---

## Stack Choices

| Decision | Choice | Reason |
|----------|--------|--------|
| Framework | Next.js 14 (App Router) | File-based routing, API routes, and SSR in one package. The shareable audit page (`/audit/[id]`) benefits from server-side rendering for OG metadata. |
| Language | TypeScript | The audit engine has a non-trivial type surface (`AuditResultItem`, `ToolInput`, `AuditRow`). Catching field name mismatches at compile time saved real debugging time. |
| State | Zustand + persist | Lightweight, no boilerplate, localStorage persistence means users don't lose their audit on refresh. Redux would be overkill for this scope. |
| Styling | Tailwind CSS | Utility-first keeps component files self-contained. No context switching between CSS files and JSX. |
| UI primitives | shadcn/ui + lucide-react | Headless, accessible components without enforcing a design system. We only use what we need. |
| Database | Supabase | Postgres with a REST API, auth, and a generous free tier. Sufficient for MVP scale without managing infrastructure. |
| AI | Anthropic Claude API | The summary feature uses Claude directly. Low temperature (0.3) keeps financial advisory output consistent rather than creative. |

---

## What I'd Change at 10k Audits/Day

**Current bottlenecks:**

1. **Client-side audit engine** — `runAudit()` runs in the browser. At scale, moving it to a dedicated API route means we can cache results, add rate limiting, and log inputs for model improvement without shipping pricing data to the client.

2. **Supabase free tier** — the free tier handles ~500 concurrent connections. At 10k audits/day we'd hit this during peak hours. Moving to Supabase Pro or self-hosted Postgres on Railway/Fly.io handles this.

3. **AI summary latency** — the Claude API call adds ~1-2 seconds. At scale, pre-generating summaries in a background job (triggered after audit save) and polling for the result gives a better UX than blocking the page render.

4. **Pricing data staleness** — `pricing.ts` is a static file. At scale, pricing changes would require a code deploy. Moving plan prices to a database table with a simple admin UI (or even a Google Sheet synced via cron) decouples pricing updates from deployments.

5. **No queue** — lead capture and audit saves are fire-and-forget from the client. A proper job queue (Inngest, QStash) would handle retries, deduplication, and observability.
