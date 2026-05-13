// app/api/summary/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import type { AuditResultItem } from '@/lib/auditEngine';

// Initialise once per module — but guard against missing key at request time,
// not at startup, so the rest of the app still boots in dev without the key set.
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { results, teamSize, primaryUseCase, totalMonthlySavings } = body as {
    results: AuditResultItem[];
    teamSize: number;
    primaryUseCase: string;
    totalMonthlySavings: number;
  };

  // If there's nothing to summarise, return a static fallback immediately.
  // No point calling the AI for an empty audit.
  if (!results || results.length === 0) {
    return NextResponse.json({ summary: getFallbackSummary(totalMonthlySavings ?? 0) });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('[summary] ANTHROPIC_API_KEY is not set — returning fallback summary');
    return NextResponse.json({ summary: getFallbackSummary(totalMonthlySavings) });
  }

  try {
    const summary = await generateSummary({ results, teamSize, primaryUseCase, totalMonthlySavings });
    return NextResponse.json({ summary });
  } catch (error) {
    // AI call failed — fall back gracefully rather than returning a 500.
    // The client still gets a usable summary; we just log the real error.
    console.error('[summary] Anthropic API error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ summary: getFallbackSummary(totalMonthlySavings) });
  }
}

// Separated from the route handler so it's easy to test in isolation.
async function generateSummary({
  results,
  teamSize,
  primaryUseCase,
  totalMonthlySavings,
}: {
  results: AuditResultItem[];
  teamSize: number;
  primaryUseCase: string;
  totalMonthlySavings: number;
}): Promise<string> {
  const auditLines = results
    .map((r) => `- ${r.tool} (${r.currentPlan}): ${r.reason} — $${r.monthlySavings}/mo potential saving`)
    .join('\n');

  const prompt = `You are an AI tools cost consultant reviewing a spend audit for a startup.

Team size: ${teamSize}
Primary use case: ${primaryUseCase}
Total potential monthly savings: $${totalMonthlySavings}

Per-tool breakdown:
${auditLines}

Write a concise (~100 word) summary of the audit findings. Be direct and specific — 
name the tools with the biggest opportunities. Use a professional but plain tone. 
Do not use bullet points. Do not include any sales language or upsells.`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    // Lower temperature for financial/advisory content — we want consistent,
    // factual output rather than creative variation.
    temperature: 0.3,
    system: 'You are a concise, trustworthy financial advisor specialising in SaaS and AI tool costs. Respond only with the summary text, no preamble.',
    messages: [{ role: 'user', content: prompt }],
  });

  const block = response.content[0];
  if (block.type !== 'text') {
    throw new Error(`Unexpected response block type: ${block.type}`);
  }

  return block.text.trim();
}

// Used when the AI call fails or there are no results to summarise.
// Kept deliberately generic — no upsells, no brand names.
function getFallbackSummary(monthlySavings: number): string {
  if (monthlySavings > 500) {
    return `This audit identified $${monthlySavings}/month in potential savings across your AI tool stack. Review the per-tool recommendations above — a few plan changes could meaningfully reduce your monthly spend without impacting your team's workflow.`;
  }

  if (monthlySavings > 0) {
    return `Your AI tool setup is fairly well-optimised, with around $${monthlySavings}/month in potential savings identified. The suggestions above are worth a quick review, especially as your team grows.`;
  }

  return `Your current AI tool setup looks well-matched to your team's needs. No major cost optimisations were identified, though it's worth revisiting this audit if your team size or use cases change.`;
}