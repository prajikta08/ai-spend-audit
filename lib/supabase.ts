// lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { AuditResultItem, ToolInput } from './auditEngine';

export interface AuditRow {
  id: string;
  team_size: number;
  primary_use_case: string;
  tools: ToolInput[];
  results: AuditResultItem[];
  monthly_savings: number;
  annual_savings: number;
  created_at?: string;
}

export interface LeadRow {
  audit_id: string;
  email: string;
  company_name: string | null;
  role: string | null;
  team_size: number | null;
  savings_monthly: number | null;
}

let _client: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? // prefer service key on server
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ' +
      'SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY) in your .env.'
    );
  }

  _client = createClient(url, key);
  return _client;
}

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export async function saveAudit(audit: AuditRow): Promise<AuditRow> {
  if (!isSupabaseConfigured()) {
    console.warn('[supabase] Not configured — audit will not be saved.');
    return audit;
  }

  const { data, error } = await getSupabase()
    .from('audits')
    .insert(audit)
    .select()
    .single();

  if (error) {
    console.error('[supabase] saveAudit failed:', error.message);
    throw new Error(`Failed to save audit: ${error.message}`);
  }

  return data as AuditRow;
}

export async function getAuditById(id: string): Promise<AuditRow> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured — cannot fetch audit by ID.');
  }

  const { data, error } = await getSupabase()
    .from('audits')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('[supabase] getAuditById failed:', error.message);
    throw new Error(`Audit not found: ${error.message}`);
  }

  return data as AuditRow;
}

export async function saveLead(lead: LeadRow): Promise<void> {
  if (!isSupabaseConfigured()) {
    console.warn('[supabase] Not configured — lead will not be saved.');
    return;
  }

  const { error } = await getSupabase().from('leads').insert(lead);

  if (error) {
    console.error('[supabase] saveLead failed:', error.message);
    throw new Error(`Failed to save lead: ${error.message}`);
  }
}