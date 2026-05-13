'use client';

import { useState } from 'react';
import { Toaster, toast } from 'sonner';
import { BarChart2 } from 'lucide-react';

import AuditForm, { type AuditCompletePayload } from '@/components/AuditForm';
import AuditResults from '@/components/AuditResults';
import EmailCapture from '@/components/EmailCapture';
import { saveAudit } from '@/lib/supabase';
import { generateAuditId } from '@/lib/utils';
import { useAuditStore } from '@/store/useAuditStore';

type Step = 'form' | 'results';

export default function Home() {
  const { reset } = useAuditStore();

  const [step, setStep] = useState<Step>('form');
  const [auditPayload, setAuditPayload] = useState<AuditCompletePayload | null>(null);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAuditComplete = async (payload: AuditCompletePayload) => {
    setAuditPayload(payload);
    setStep('results');
    setIsSaving(true);

    const id = generateAuditId();

    try {
      await saveAudit({
        id,
        team_size: payload.teamSize,
        primary_use_case: payload.primaryUseCase,
        tools: [], // populated from store — pass through if you want to persist tool inputs
        results: payload.results,
        monthly_savings: payload.totals.monthlySavings,
        annual_savings: payload.totals.annualSavings,
      });
      setAuditId(id);
    } catch {
      setAuditId(`demo-${id}`);
      toast.info("Running in demo mode — results won't be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStartOver = () => {
    reset(); 
    setStep('form');
    setAuditPayload(null);
    setAuditId(null);
  };

  const shareUrl =
    auditId && !auditId.startsWith('demo-')
      ? `${window.location.origin}/audit/${auditId}`
      : null;

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Toaster position="top-center" richColors />

      <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
              <BarChart2 size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SpendAudit</span>
          </div>

          {step === 'results' && (
            <button
              onClick={handleStartOver}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              ← Start over
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {step === 'form' && (
          <>
            <div className="text-center mb-14">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-tighter mb-4 leading-tight">
                Stop overspending<br />on AI tools
              </h1>
              <p className="text-lg text-zinc-400 max-w-xl mx-auto">
                Enter your current AI subscriptions and get an instant breakdown
                of where you can cut costs.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 md:p-12">
              <AuditForm onAuditComplete={handleAuditComplete} />
            </div>
          </>
        )}

        {step === 'results' && auditPayload && (
          <div key={auditId ?? 'results'} className="space-y-8">
            <AuditResults
              results={auditPayload.results}
              totals={auditPayload.totals}
            />

            {shareUrl && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">Share this audit</p>
                  <p className="text-xs text-zinc-500 mt-0.5 break-all">{shareUrl}</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    toast.success('Link copied');
                  }}
                  className="shrink-0 text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Copy link
                </button>
              </div>
            )}

            {isSaving && (
              <p className="text-center text-sm text-zinc-500 animate-pulse">
                Saving your audit…
              </p>
            )}
            {auditId && (
              <EmailCapture
                auditId={auditId}
                monthlySavings={auditPayload.totals.monthlySavings}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}