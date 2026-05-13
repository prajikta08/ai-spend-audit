# User Interviews

Three conversations conducted between May 9–10, 2025 with potential users. Each was 10–15 minutes, done over WhatsApp call or in person.

---

## Interview 1 — S.M., Freelance Designer & Agency Owner, 3-person team

**Context:** My sister runs a small design agency. They use ChatGPT Plus (3 seats), Midjourney, and recently added Claude Pro for writing client briefs. I asked her to walk me through how she thinks about the subscriptions.

**Direct quotes:**
- "I have no idea what we're actually spending on all these AI things combined. I just pay the invoices."
- "I added Claude because someone said it was better for writing but we still use ChatGPT for everything. I don't think anyone's touched Claude in two weeks."
- "If someone could just tell me 'you're wasting money on this one, drop it,' I would just do it. I don't have time to compare."

**Most surprising thing:** She had no idea ChatGPT Team ($25/seat) was a different product from ChatGPT Plus ($20/seat). She thought "Team" just meant buying multiple Plus seats. The pricing page confused her.

**What it changed:** I added the "Expected: $X/mo" hint next to the monthly spend input in `ToolInputRow` — partly to help users like her sanity-check that they're paying the right amount for their plan. I also realised the tool needs to handle the case where users genuinely don't know which plan they're on, not just users who know but haven't optimised.

---

## Interview 2 — R.K., Founding Engineer, Pre-seed SaaS startup, 4-person team

**Context:** Friend from college, building a B2B analytics tool. Uses Cursor Pro (4 seats), Claude API (pay-as-you-go), and recently cancelled their GitHub Copilot subscription.

**Direct quotes:**
- "The Anthropic API bill is the one I actually watch. The fixed subscriptions I kind of forget about."
- "We cancelled Copilot because everyone switched to Cursor anyway. But we were paying for both for like two months before someone noticed."
- "I'd use something like this at the start of every month, honestly. Or just set it and forget it — tell me when something changes."

**Most surprising thing:** He mentioned paying for overlapping tools for two months without noticing — not because of negligence but because the billing cycles didn't align and nobody had a single place to see all AI spend together. The problem isn't that people don't care, it's that there's no aggregated view.

**What it changed:** Reinforced the decision to show `currentMonthlySpend` in the summary card alongside savings — the "you spend X total" number is valuable even when savings are $0. Also made me want to build a recurring audit reminder (email monthly) as a week-2 feature.

---

## Interview 3 — A.P., CTO, Seed-stage fintech, 12-person engineering team

**Context:** Met through a mutual contact. Agreed to a quick call. They use GitHub Copilot Business, Claude Team, and are evaluating Cursor for their engineering team.

**Direct quotes:**
- "We're about to add Cursor for the whole eng team. That's going to be $40 per person per month. I want to know if we should drop Copilot at the same time."
- "The thing I don't trust with tools like this is the data. Where are you getting the pricing from? Vendor pages change."
- "If the recommendation is wrong even once, people stop trusting it. It's like a spell checker — the moment it misses something, you stop using it."

**Most surprising thing:** His primary concern wasn't the savings number — it was data provenance. He wanted to know the source and date of every price before he'd trust a recommendation. This was not something I had anticipated from a "quick audit" user.

**What it changed:** Directly motivated `PRICING_DATA.md` — a full list of sources and verification dates for every price in the engine. I also added the `confidence` field to `AuditResultItem` and the `ConfidenceBadge` UI component so users can see how certain each recommendation is. Enterprise plans showing `null` prices now display "Quote-based" rather than a fake number, which is the honest answer.
