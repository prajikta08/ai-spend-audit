# Dev Log

## Day 1 — 2025-05-07

**Hours worked:** 4

**What I did:** Set up the Next.js project with TypeScript, Tailwind, and shadcn/ui. Defined the core data types — `ToolInput`, `AuditResultItem` — and wrote the initial `pricing.ts` with plan data for Cursor, Claude, ChatGPT, GitHub Copilot, Gemini, Windsurf, and both APIs. Built a rough `AuditForm` with tool rows and a basic `runAudit` function that could return results for a hardcoded test input.

**What I learned:** Defining the types first before writing any logic forced me to think clearly about what the audit engine actually needs as input vs what it produces. Starting with `any` everywhere would have caused more pain later.

**Blockers / what I'm stuck on:** The audit engine was returning $0 savings for every input because I was comparing `entry.monthlySpend` (what the user typed) against the alternative plan price, rather than the real `seats × planPrice`. Didn't catch it until I tested with real numbers.

**Plan for tomorrow:** Fix the savings calculation, build out `AuditResults` and `SummaryCard`, wire up Zustand store.

---

## Day 2 — 2025-05-08

**Hours worked:** 5

**What I did:** Fixed the core $0 savings bug — changed savings calculation to use `currentPrice * seats` from `pricing.ts` rather than `entry.monthlySpend`. This was the biggest logic error in the whole project. Also built `AuditResults`, `SummaryCard` with confidence badges, and `ToolInputRow` with per-tool plan selects derived from `pricing.ts` (single source of truth). Set up Zustand store with `persist` middleware.

**What I learned:** Having two sources of truth for tool/plan data (`toolsList` array + `toolPricing` object) caused a subtle bug where adding a new tool to one didn't update the other. Deriving `TOOL_NAMES` from `Object.keys(toolPricing)` directly fixed this permanently.

**Blockers / what I'm stuck on:** Tailwind classes weren't applying — the form looked completely unstyled. Spent time diagnosing whether it was a v3/v4 config mismatch.

**Plan for tomorrow:** Fix Tailwind, set up Supabase, build API routes.

---

## Day 3 — 2025-05-09

**Hours worked:** 5

**What I did:** Diagnosed the Tailwind issue — the project was using v3 syntax (`@tailwind base/components/utilities`) but I had accidentally tried v4 syntax (`@import "tailwindcss"`) which broke everything. Reverted to v3. Set up Supabase project, created `audits` and `leads` tables via SQL editor, added `.env.local` with credentials. Built `/api/lead` route with proper email validation and typed request body. Built `/api/summary` route calling Claude API at temperature 0.3.

**What I learned:** Tailwind v4 is a breaking change from v3 — the config file structure, the CSS directives, and the theme system all changed. Mixing syntax from both versions silently breaks the entire stylesheet.

**Blockers / what I'm stuck on:** Supabase `saveAudit` was failing with "table not found" — turns out I needed to run the SQL to create the tables first, and also disable RLS for dev.

**Plan for tomorrow:** Wire up `EmailCapture`, build shareable audit page, test end-to-end flow.

---

## Day 4 — 2025-05-10

**Hours worked:** 4

**What I did:** Built `EmailCapture` with client-side email validation, persistent success state, and `teamSize` pulled from Zustand store (was previously hardcoded to 5). Built `app/audit/[id]/page.tsx` — the shareable results page that fetches an audit by ID from Supabase and renders a read-only view. Added share link UI to the results screen. Tested the full flow: fill form → run audit → save to Supabase → copy share link → open in new tab.

**What I learned:** The `key` prop on the results container matters — without it, running a second audit in the same session would show stale state from the first run because React reused the same component tree.

**Blockers / what I'm stuck on:** The UI is still fully dark — wanted to switch to a light theme but Tailwind classes controlling background colour weren't applying due to specificity from `layout.tsx`.

**Plan for tomorrow:** Fix light theme, write markdown docs, write tests, set up CI.

---

## Day 5 — 2025-05-11

**Hours worked:** 5

**What I did:** Fixed light theme by removing `bg-zinc-950 text-white` from `layout.tsx` body and `className="dark"` from the html tag, and adding inline style fallbacks for width constraints since Tailwind wasn't fully applying. Spoke with my sister (potential user — runs a small design agency that uses ChatGPT and Midjourney) to validate the concept. Wrote all markdown documentation files. Set up Vitest with 7 tests covering the audit engine. Configured GitHub Actions CI workflow.

**What I learned:** Inline styles are a useful escape hatch when you need to guarantee a CSS property applies regardless of framework issues. They're not elegant but they ship.

**Blockers / what I'm stuck on:** Lighthouse accessibility score needs work — some inputs are missing proper label associations and colour contrast on the confidence badges is borderline.

**Plan for tomorrow:** Deploy to Vercel, fix accessibility issues, final review.
