# Reflection

## 1. The Hardest Bug

The hardest bug was the $0 savings result — every audit I ran came back with zero savings regardless of input, and it took me an embarrassingly long time to find because the UI rendered correctly (the cards showed, the tool names appeared) just with `$0` and "No change recommended" everywhere.

My first hypothesis was that the plan comparison logic was wrong — maybe the `getCheapestPaidPlan` function wasn't finding cheaper plans. I added console logs and confirmed it was returning the right alternatives. Still $0.

Second hypothesis: the `savings <= 0` guard was incorrectly filtering everything out. I logged `savings` before the check and saw it printing negative numbers. That was the lead.

Tracing back: `savings = entry.monthlySpend - altMonthly`. For Cursor Ultra with 12 seats, `altMonthly = $60 * 12 = $720`. But `entry.monthlySpend` was `200` — the number the user typed. `200 - 720 = -520`. Negative. Filtered out.

The fix was to stop using `entry.monthlySpend` as the benchmark for savings and instead derive `currentMonthly = currentPrice * entry.seats` from `pricing.ts` directly. The user-entered spend is what they actually pay (could be annual, discounted, etc.) — it's useful to display but not reliable for benchmarking. Once I made that change, every test case with a real overspend started returning correct savings figures.

---

## 2. A Decision I Reversed

I originally wrote `runAudit()` with a hardcoded 35% savings multiplier — `savings = Math.round(tool.monthlySpend * 0.35)`. The reasoning was: the tool needs to show something during development before the pricing logic is complete, and 35% is a "reasonable estimate."

I reversed this within a day. The problem isn't that 35% is wrong — it's that it's disconnected from reality. A user on GitHub Copilot Individual ($10/seat) would see "you could save $3.50/mo" which is meaningless. A user on Cursor Ultra ($200/seat × 10 seats = $2000) would see "you could save $700" when the real savings from switching to Pro is $1800. The multiplier was producing numbers that bore no relationship to actual plan pricing.

More importantly, the whole value proposition of the tool is specificity — "switch from X to Y and save $Z" is useful. "Save approximately 35%" is not. Once I saw this clearly I deleted the multiplier entirely and rebuilt the engine around `pricing.ts` data.

---

## 3. What I'd Build in Week 2

The most valuable week-2 addition would be **usage-based audit support**. Right now the tool only handles fixed subscription plans. But a meaningful chunk of AI spend for technical teams is API usage — Anthropic API, OpenAI API — which has no fixed seat price. Those rows currently return a `null` price and get skipped.

To handle this properly I'd add an API spend input (monthly dollar amount from the billing dashboard), then compare it against the equivalent fixed-plan cost. For example: if a team is spending $800/month on the OpenAI API for a writing workflow, Claude Team at $25/seat × 10 seats = $250/month is worth surfacing.

Beyond that: a **before/after stack comparison** showing two configurations side by side, a **team size sensitivity slider** (what does the saving look like at 5 vs 20 vs 50 seats), and **email delivery of the report** via Resend so users have something to forward to their finance team.

---

## 4. How I Used AI Tools

I used Claude (Sonnet) throughout the project — primarily for code review and refinement rather than generation. My workflow was: write a file, identify what's wrong with it structurally, ask Claude to refine it with specific constraints ("make this more human-written, fix the type safety, remove any hardcoded values").

I didn't trust Claude with the pricing data — I pulled every number from vendor pricing pages directly and verified them manually. Claude's training data has a cutoff and AI tool pricing changes frequently; a wrong price in the engine produces wrong savings numbers which is the core output of the product.

One specific time Claude was wrong: it suggested using `@import "tailwindcss"` in `globals.css`, claiming my project was on Tailwind v4. It wasn't — I was on v3, and that import syntax broke the entire stylesheet. The error was plausible because v4 was released recently and Claude confidently framed it as the right approach for a new project. I caught it by checking the actual installed version (`npm list tailwindcss`) and reverting to `@tailwind base/components/utilities`.

---

## 5. Self-Ratings

**Discipline: 8/10** — Worked consistently across all 5 days without skipping sessions, though I spent more time on the audit engine than I planned which left the UI polish rushed.

**Code quality: 8/10** — The type safety across the codebase is solid, helper functions are well-separated, and there's a clear data flow. The main weakness is the inline style fallbacks in `page.tsx` which are a workaround rather than a proper fix.

**Design sense: 8/10** — The confidence badges, empty states, and zero-savings state all show attention to real UX edge cases. The layout is clean but not distinctive — it looks like a competent developer built it, not a designer.

**Problem-solving: 8/10** — The $0 savings bug and the Tailwind v3/v4 confusion were both diagnosed systematically. I formed hypotheses, tested them in order, and found the root cause rather than applying patches.

**Entrepreneurial thinking: 8/10** — The decision to remove the Credex upsell from the audit engine and component logic (keeping it at the page level) was the right call — a tool that feels neutral earns more trust than one that constantly pushes a product. The shareable audit link is a genuine distribution mechanic, not just a feature.
