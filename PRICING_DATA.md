# Pricing Data Sources

Every price in `lib/pricing.ts` is sourced from the vendor's official pricing page. Prices are per user per month on monthly billing unless noted.

---

## Cursor
- Hobby: $0/month — https://cursor.com/pricing — verified 2025-05-07
- Pro: $20/user/month — https://cursor.com/pricing — verified 2025-05-07
- Pro+: $60/user/month — https://cursor.com/pricing — verified 2025-05-07
- Ultra: $200/user/month — https://cursor.com/pricing — verified 2025-05-07
- Teams: $40/user/month — https://cursor.com/pricing — verified 2025-05-07
- Enterprise: quote-based (listed as `null` in engine) — https://cursor.com/pricing

---

## GitHub Copilot
- Individual: $10/user/month — https://github.com/features/copilot#pricing — verified 2025-05-07
- Business: $19/user/month — https://github.com/features/copilot#pricing — verified 2025-05-07
- Enterprise: quote-based (listed as `null` in engine) — https://github.com/features/copilot#pricing

---

## Claude (Anthropic)
- Free: $0/month — https://claude.ai/upgrade — verified 2025-05-07
- Pro: $20/user/month — https://claude.ai/upgrade — verified 2025-05-07
- Max: $100/user/month — https://claude.ai/upgrade — verified 2025-05-07
- Team: $25/user/month — https://claude.ai/upgrade — verified 2025-05-07
- Enterprise: quote-based (listed as `null` in engine) — https://www.anthropic.com/claude/enterprise

---

## ChatGPT (OpenAI)
- Free: $0/month — https://openai.com/chatgpt/pricing — verified 2025-05-07
- Plus: $20/user/month — https://openai.com/chatgpt/pricing — verified 2025-05-07
- Team: $25/user/month — https://openai.com/chatgpt/pricing — verified 2025-05-07
- Enterprise: quote-based (listed as `null` in engine) — https://openai.com/chatgpt/enterprise

---

## Gemini (Google)
- Free: $0/month — https://one.google.com/about/google-ai — verified 2025-05-07
- Pro: $20/user/month — https://one.google.com/about/google-ai — verified 2025-05-07
- Ultra: $150/user/month — https://one.google.com/about/google-ai — verified 2025-05-07

---

## Anthropic API
- Pay As You Go: usage-based, no fixed seat price (listed as `null` in engine)
- Pricing per token: https://www.anthropic.com/pricing — verified 2025-05-07

---

## OpenAI API
- Pay As You Go: usage-based, no fixed seat price (listed as `null` in engine)
- Pricing per token: https://openai.com/api/pricing — verified 2025-05-07

---

## Windsurf (Codeium)
- Free: $0/month — https://windsurf.com/pricing — verified 2025-05-07
- Pro: $15/user/month — https://windsurf.com/pricing — verified 2025-05-07
- Teams: $35/user/month — https://windsurf.com/pricing — verified 2025-05-07

---

## Notes

- Enterprise prices are intentionally excluded from the audit engine. Showing a fake number (e.g. $999) as a placeholder is worse than showing nothing — it would produce misleading savings estimates. Enterprise rows return a `low` confidence result with a note to benchmark at renewal.
- All prices are in USD.
- Prices change frequently. The audit engine is designed so that updating a price in `pricing.ts` automatically propagates to all audit logic and UI without any other changes.
