// app/api/lead/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { saveLead } from '@/lib/supabase';

// Basic email regex — not RFC-perfect but catches the obvious junk.
// We do real validation on the Supabase side anyway.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email.trim().toLowerCase());
}

function isValidTeamSize(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value > 0 && value <= 100_000;
}

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  // Narrow the shape before trusting any values
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { auditId, email, companyName, role, teamSize, monthlySavings } = body as Record<string, unknown>;

  // Required fields
  if (!auditId || typeof auditId !== 'string') {
    return NextResponse.json({ error: 'auditId is required' }, { status: 400 });
  }

  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
  }

  // Optional fields — coerce to safe values rather than rejecting
  const safeCompanyName = typeof companyName === 'string' ? companyName.trim() || null : null;
  const safeRole = typeof role === 'string' ? role.trim() || null : null;
  const safeTeamSize = isValidTeamSize(teamSize) ? teamSize : null;
  const safeSavings = typeof monthlySavings === 'number' && monthlySavings >= 0
    ? Math.round(monthlySavings)
    : null;

  try {
    await saveLead({
      audit_id: auditId,
      email: email.trim().toLowerCase(),
      company_name: safeCompanyName,
      role: safeRole,
      team_size: safeTeamSize,
      savings_monthly: safeSavings,
    });

    // TODO: Send transactional email via Resend or Postmark.
    // Pull the template into a separate lib/email.ts file when you add this.
    // import { sendAuditEmail } from '@/lib/email';
    // await sendAuditEmail({ email, monthlySavings: safeSavings });

    return NextResponse.json({ success: true });

  } catch (error) {
    // Log the real error server-side but never send internal details to the client
    console.error('[lead] Supabase write failed:', error instanceof Error ? error.message : error);

    return NextResponse.json(
      { error: 'Failed to save your details. Please try again.' },
      { status: 500 }
    );
  }
}