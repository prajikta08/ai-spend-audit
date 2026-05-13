# Prompts

## Summary Generation (`/api/summary`)

### The Prompt

```
You are an AI tools cost consultant reviewing a spend audit for a startup.

Team size: {teamSize}
Primary use case: {primaryUseCase}
Total potential monthly savings: ${totalMonthlySavings}

Per-tool breakdown:
{auditLines}

Write a concise (~100 word) summary of the audit findings. Be direct and specific —
name the tools with the biggest opportunities. Use a professional but plain tone.
Do not use bullet points. Do not include any sales language or upsells.
```

### System Prompt

```
You are a concise, trustworthy financial advisor specialising in SaaS and AI tool costs.
Respond only with the summary text, no preamble.
```

### Why Written This Way

**Temperature: 0.3** — Financial advisory content needs to be consistent and factual, not creative. Higher temperatures (0.7+) produced varied outputs where the same audit would get meaningfully different summaries on each run, which feels untrustworthy for a cost report.

**"Do not use bullet points"** — Early versions returned bulleted lists which looked fine in isolation but broke the visual flow when rendered below the already-structured per-tool breakdown cards. Prose reads better in context.

**"Do not include any sales language or upsells"** — Without this instruction, the model would occasionally include generic lines like "consider consolidating your AI spend with a single provider." This is technically accurate but reads as a sales pitch. The tool earns trust by being neutral.

**"Respond only with the summary text, no preamble"** — Without this, responses started with "Here is the summary:" or "Based on the audit data provided..." which required stripping before rendering.

**Named tools explicitly** — Early versions of the prompt said "summarise the findings." The model would write vague summaries like "some tools have optimisation potential." Adding "name the tools with the biggest opportunities" produced specific, actionable output.

### What Didn't Work

**High temperature (0.7):** The same $2,700/mo savings audit would sometimes get a cautious "modest optimisations available" summary and sometimes an enthusiastic "significant savings identified" summary. Inconsistent framing on identical data erodes trust.

**No system prompt:** Without the system prompt, the model sometimes added a sign-off ("Let me know if you have questions!") or wrote in first person ("I recommend..."). The system prompt establishes the right voice immediately.

**Asking for 200+ words:** Longer summaries added filler. At 100 words the model is forced to prioritise the most impactful finding, which is what the user actually wants to read.

---

## Audit Engine (No LLM)

The core audit logic in `auditEngine.ts` is deterministic — no LLM is involved. Recommendations are derived entirely from `pricing.ts` data and rule-based logic. This was a deliberate choice: LLM-generated savings numbers would be non-reproducible and difficult to verify. A user should be able to see exactly why a recommendation was made (plan A costs $X/seat, plan B costs $Y/seat, saving $Z) without trusting a model's judgment on pricing.
