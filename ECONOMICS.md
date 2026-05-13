# Economics

## What a Converted Lead Is Worth to Credex

Credex sells AI infrastructure credits. Assume:
- Average credit purchase: $500/month
- Gross margin on credits: ~30% (reselling compute)
- Average customer lifetime: 12 months

**LTV per converted customer = $500 × 30% × 12 = $1,800**

If Credex upsells to an annual plan at a discount, cash collected upfront is $5,000–$6,000, but LTV stays similar.

---

## CAC at Each GTM Channel

| Channel | Effort | Estimated Conversions | CAC |
|---------|--------|----------------------|-----|
| Show HN / Reddit organic | 2 hrs/post | 3–8 customers/post | ~$0 (time only) |
| Shareable audit link virality | 0 ongoing | 1–2 customers/100 shares | ~$0 |
| Credex existing customer email | 1 hr | 5–15 customers/blast | ~$0 |
| Targeted X/Reddit replies | 3 hrs/week | 2–4 customers/week | ~$0 |
| Paid (future) | $500/mo | ~5 customers/mo | $100 |

At zero paid budget, blended CAC is effectively $0 in cash (founder time only) for the first 6 months.

---

## Conversion Funnel

```
Visits tool:              1,000
Completes audit:            400   (40% — low friction, no signup)
Enters email:                80   (20% of completions)
Opens follow-up email:       32   (40% open rate)
Books Credex consultation:    8   (25% of openers)
Purchases credits:            3   (35% close rate)
```

**Audit → purchase conversion: 0.3%**

At 1,000 visitors/month and $1,800 LTV:
- 3 customers × $1,800 = **$5,400 revenue/month from 1k visits**

This is the unit that needs to scale.

---

## What Would Have to Be True for $1M ARR in 18 Months

**$1M ARR = ~$83k MRR = ~46 new customers/month** (at $1,800 LTV amortised, or ~$150/mo revenue per customer at 30% margin)

Working backwards:

| Month | Monthly Visitors | Audits | Emails | Customers |
|-------|-----------------|--------|--------|-----------|
| 1–3   | 2,000           | 800    | 160    | 5         |
| 4–6   | 5,000           | 2,000  | 400    | 12        |
| 7–12  | 15,000          | 6,000  | 1,200  | 36        |
| 13–18 | 40,000          | 16,000 | 3,200  | 96        |

To reach 40k monthly visitors by month 13:
1. **Viral coefficient > 1** — each user shares the audit link with 1+ person. The shareable URL is designed for this.
2. **SEO from audit results pages** — public `/audit/[id]` pages get indexed. Search terms like "AI tool cost audit" start driving passive traffic by month 6.
3. **1 viral moment** — one Show HN or tweet that drives 10k+ visitors in a week. These happen roughly once per 3–4 genuine community posts.
4. **Credex email list conversion** — if Credex has 500+ existing customers and converts 5%, that's 25 customers from a single email.

**The assumptions that have to hold:**
- 40% audit completion rate (reasonable — no signup, immediate value)
- 20% email capture rate (reasonable if savings number is $500+/mo)
- 0.3% visit-to-purchase (conservative — most lead-gen tools see 0.5–2%)
- $1,800 LTV (depends on retention; if customers churn at 6 months, LTV halves)

**The one thing that breaks this model:** if average savings identified is consistently low (under $200/mo), email capture drops and the tool doesn't generate enough urgency to convert. The audit engine quality is directly tied to business viability.
