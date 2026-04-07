'use client';

import { useMemo, useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Disclosure } from '@/components/ui/disclosure';

import { reportChainOptions, validateReportRequest } from '@/lib/validation/report-request';

type FormState = {
  chain: string;
  contractAddress: string;
  projectName: string;
  websiteUrl: string;
  xUrl: string;
  telegramUrl: string;
  notes: string;
  email: string;
};

const initialState: FormState = {
  chain: 'solana',
  contractAddress: '',
  projectName: '',
  websiteUrl: '',
  xUrl: '',
  telegramUrl: '',
  notes: '',
  email: '',
};

export function RequestForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const helperText = useMemo(
    () => reportChainOptions.find((option) => option.value === form.chain)?.hint ?? 'Contract address',
    [form.chain],
  );

  const updateField = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) {
        return current;
      }

      const next = { ...current };
      delete next[field];
      return next;
    });
    setSubmitError(null);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);

    const validation = validateReportRequest({
      chain: form.chain,
      contractAddress: form.contractAddress,
      projectName: form.projectName,
      websiteUrl: form.websiteUrl,
      xUrl: form.xUrl,
      telegramUrl: form.telegramUrl,
      notes: form.notes,
      email: form.email,
    });

    if (!validation.success) {
      const nextErrors = validation.errors.reduce<Record<string, string>>((accumulator, error) => {
        if (error.field !== 'root') {
          accumulator[error.field] = error.message;
        }

        return accumulator;
      }, {});

      setErrors(nextErrors);
      setSubmitError(validation.errors.find((error) => error.field === 'root')?.message ?? 'Corrige les champs ci-dessus.');
      return;
    }

    startTransition(() => {
      void (async () => {
        const response = await fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validation.data),
        });

        const payload = (await response.json()) as { reportId?: string; error?: string; errors?: Array<{ field: string; message: string }> };

        if (!response.ok || !payload.reportId) {
          const apiErrors = payload.errors ?? [];
          if (apiErrors.length > 0) {
            setErrors(apiErrors.reduce<Record<string, string>>((accumulator, error) => ({ ...accumulator, [error.field]: error.message }), {}));
          }

          setSubmitError(payload.error ?? 'Impossible de créer le rapport.');
          return;
        }

        router.push(`/report/${payload.reportId}`);
        router.refresh();
      })();
    });
  };

  return (
    <section className="card request-form-card" id="request-form">
      <div className="request-form-card__header">
        <p className="eyebrow">Nouvelle analyse</p>
        <h2>Créer un report</h2>
        <p>Renseignez l&apos;adresse du contrat. Le reste est optionnel.</p>
      </div>

      <form className="request-form" onSubmit={handleSubmit} noValidate>
        <label className="request-field">
          <span>Chain</span>
          <select value={form.chain} onChange={(event) => updateField('chain', event.target.value)}>
            {reportChainOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <small>{helperText}</small>
          {errors.chain ? <em>{errors.chain}</em> : null}
        </label>

        <label className="request-field">
          <span>Contract address</span>
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            placeholder="0x... ou adresse Solana"
            value={form.contractAddress}
            onChange={(event) => updateField('contractAddress', event.target.value)}
          />
          <small>{helperText}</small>
          {errors.contractAddress ? <em>{errors.contractAddress}</em> : null}
        </label>

        <Disclosure title="Informations complémentaires">
          <div className="request-form__grid">
            <label className="request-field">
              <span>Project name</span>
              <input value={form.projectName} onChange={(event) => updateField('projectName', event.target.value)} placeholder="Optionnel" />
              {errors.projectName ? <em>{errors.projectName}</em> : null}
            </label>

            <label className="request-field">
              <span>Email</span>
              <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="Optionnel" />
              {errors.email ? <em>{errors.email}</em> : null}
            </label>
          </div>

          <div className="request-form__grid request-form__grid--3">
            <label className="request-field">
              <span>Website</span>
              <input value={form.websiteUrl} onChange={(event) => updateField('websiteUrl', event.target.value)} placeholder="https://..." />
              {errors.websiteUrl ? <em>{errors.websiteUrl}</em> : null}
            </label>

            <label className="request-field">
              <span>X / Twitter</span>
              <input value={form.xUrl} onChange={(event) => updateField('xUrl', event.target.value)} placeholder="https://x.com/..." />
              {errors.xUrl ? <em>{errors.xUrl}</em> : null}
            </label>

            <label className="request-field">
              <span>Telegram</span>
              <input value={form.telegramUrl} onChange={(event) => updateField('telegramUrl', event.target.value)} placeholder="https://t.me/..." />
              {errors.telegramUrl ? <em>{errors.telegramUrl}</em> : null}
            </label>
          </div>

          <label className="request-field">
            <span>Notes</span>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="Contexte, red flags déjà vus, notes internes..."
            />
            {errors.notes ? <em>{errors.notes}</em> : null}
          </label>
        </Disclosure>

        {submitError ? <p className="request-form__error">{submitError}</p> : null}

        <div className="btn-group request-form__actions">
          <button type="submit" className="btn-primary" disabled={isPending}>
            {isPending ? 'Création en cours…' : 'Générer le rapport'}
          </button>
          <p className="request-form__meta">Gratuit · 3 scans/mois</p>
        </div>
      </form>
    </section>
  );
}