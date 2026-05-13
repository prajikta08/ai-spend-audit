'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuditStore } from '@/store/useAuditStore';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface EmailCaptureProps {
  auditId: string;
  monthlySavings: number;
}

type SubmitState = 'idle' | 'submitting' | 'success';

export default function EmailCapture({ auditId, monthlySavings }: EmailCaptureProps) {
  const { teamSize } = useAuditStore();

  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (value: string): boolean => {
    if (!value.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!EMAIL_REGEX.test(value.trim())) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail(email)) return;
    if (submitState === 'submitting') return;

    setSubmitState('submitting');

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          auditId,
          email: email.trim().toLowerCase(),
          companyName: companyName.trim() || undefined,
          teamSize,       
          monthlySavings,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to submit. Please try again.');
        setSubmitState('idle');
        return;
      }

      setSubmitState('success');
    } catch {
      toast.error('Network error — check your connection and try again.');
      setSubmitState('idle');
    }
  };

  if (submitState === 'success') {
    return (
      <div className="mt-12 bg-white dark:bg-zinc-900 border rounded-3xl p-8 md:p-10 text-center">
        <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
        <h3 className="text-2xl font-semibold mb-2">You're all set</h3>
        <p className="text-gray-500 dark:text-gray-400">
          We've got your audit. Check <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span> for a copy of your report.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12 bg-white dark:bg-zinc-900 border rounded-3xl p-8 md:p-10">
      <h3 className="text-2xl font-semibold text-center mb-2">
        Get Your Full Report
      </h3>
      <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
        We'll email you a copy of this audit so you can share it with your team.
      </p>

      <div className="max-w-md mx-auto space-y-4">
        <div>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) validateEmail(e.target.value);
            }}
            className="w-full p-4 border rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {emailError && (
            <p className="text-sm text-red-500 mt-1 ml-1">{emailError}</p>
          )}
        </div>

        <input
          type="text"
          placeholder="Company name (optional)"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className="w-full p-4 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          onClick={handleSubmit}
          disabled={submitState === 'submitting'}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {submitState === 'submitting' ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Sending…
            </>
          ) : (
            'Send My Report'
          )}
        </button>

        <p className="text-xs text-center text-gray-400">
          No spam. Just your audit results.
        </p>
      </div>
    </div>
  );
}
