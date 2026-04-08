'use client';

import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import Link from 'next/link';
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

const analysisSteps = [
  'Qualification',
  'Sécurité on-chain',
  'Marché / liquidité',
  'Website + social',
  'Scoring FIRES',
  'Rapport final',
];

export function RequestForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(-1);
  const timersRef = useRef<number[]>([]);

  const helperText = useMemo(
    () => reportChainOptions.find((option) => option.value === form.chain)?.hint ?? 'Adresse de contrat',
    [form.chain],
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current = [];
    };
  }, []);

  const clearTimers = () => {
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    timersRef.current = [];
  };

  const startProgress = () => {
    clearTimers();
    setActiveStep(0);

    analysisSteps.forEach((_, index) => {
      const timer = window.setTimeout(() => {
        setActiveStep(index);
      }, 450 + index * 620);
      timersRef.current.push(timer);
    });
  };

  const finishProgress = () => {
    clearTimers();
    setActiveStep(analysisSteps.length - 1);
  };

  const resetProgress = () => {
    clearTimers();
    setActiveStep(-1);
    setIsSubmitting(false);
  };

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
      setSubmitError(validation.errors.find((error) => error.field === 'root')?.message ?? 'Corrigez les champs ci-dessus.');
      return;
    }

    setIsSubmitting(true);
    startProgress();

    void (async () => {
      try {
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
          resetProgress();
          return;
        }

        finishProgress();
        window.setTimeout(() => {
          router.push(`/report/${payload.reportId}`);
          router.refresh();
        }, 320);
      } catch {
        setSubmitError('Impossible de contacter le serveur.');
        resetProgress();
      }
    })();
  };

  return (
    <section className="card request-form-card" id="request-form">
      <div className="request-form-card__header">
        <p className="eyebrow">Formulaire</p>
        <h2>Lancer une analyse</h2>
        <p>Commence avec le minimum. Ajoute les liens publics si tu veux un verdict plus documenté.</p>
      </div>

      <form className="request-form" onSubmit={handleSubmit} noValidate>
        <div className="request-form__section">
          <div className="request-form__section-head">
            <p className="request-form__section-kicker">Obligatoire</p>
            <h3>Token cible</h3>
          </div>

          <div className="request-form__grid request-form__grid--2-compact">
            <label className="request-field">
              <span className="request-label-row">
                <span>Réseau</span>
                <span className="request-chip request-chip--required">Obligatoire</span>
              </span>
              <select value={form.chain} onChange={(event) => updateField('chain', event.target.value)}>
                {reportChainOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <small>Active les bons contrôles.</small>
              {errors.chain ? <em>{errors.chain}</em> : null}
            </label>

            <label className="request-field">
              <span className="request-label-row">
                <span>Adresse du token / contrat</span>
                <span className="request-chip request-chip--required">Obligatoire</span>
              </span>
              <input
                type="text"
                inputMode="text"
                autoComplete="off"
                spellCheck={false}
                placeholder="0x... ou adresse Solana"
                value={form.contractAddress}
                onChange={(event) => updateField('contractAddress', event.target.value)}
              />
              <small>Format attendu : {helperText.toLowerCase()}.</small>
              {errors.contractAddress ? <em>{errors.contractAddress}</em> : null}
            </label>
          </div>
        </div>

        <div className="request-form__section">
          <div className="request-form__section-head">
            <p className="request-form__section-kicker">Recommandé</p>
            <h3>Signaux publics</h3>
          </div>

          <div className="request-form__grid request-form__grid--3">
            <label className="request-field">
              <span className="request-label-row">
                <span>Site officiel</span>
                <span className="request-chip">Recommandé</span>
              </span>
              <input value={form.websiteUrl} onChange={(event) => updateField('websiteUrl', event.target.value)} placeholder="https://projet.xyz" />
              <small>Docs et preuves publiques.</small>
              {errors.websiteUrl ? <em>{errors.websiteUrl}</em> : null}
            </label>

            <label className="request-field">
              <span className="request-label-row">
                <span>X / Twitter</span>
                <span className="request-chip">Recommandé</span>
              </span>
              <input value={form.xUrl} onChange={(event) => updateField('xUrl', event.target.value)} placeholder="https://x.com/projet" />
              <small>Présence et communication.</small>
              {errors.xUrl ? <em>{errors.xUrl}</em> : null}
            </label>

            <label className="request-field">
              <span className="request-label-row">
                <span>Telegram</span>
                <span className="request-chip">Recommandé</span>
              </span>
              <input value={form.telegramUrl} onChange={(event) => updateField('telegramUrl', event.target.value)} placeholder="https://t.me/projet" />
              <small>Lecture de communauté.</small>
              {errors.telegramUrl ? <em>{errors.telegramUrl}</em> : null}
            </label>
          </div>
        </div>

        <div className="request-progress" aria-live="polite">
          <div className="request-progress__header">
            <div>
              <p className="request-progress__eyebrow">{isSubmitting ? 'Analyse lancée' : 'Étapes de traitement'}</p>
              <p className="request-progress__copy">
                {isSubmitting
                  ? 'Tu peux continuer à naviguer. Le rapport restera disponible dans le dashboard.'
                  : 'Qualification, sécurité, marché, social, scoring, verdict.'}
              </p>
            </div>
            <Link href="/dashboard" className="btn-secondary btn-secondary--sm">
              Dashboard
            </Link>
          </div>

          <ol className="request-progress__steps">
            {analysisSteps.map((step, index) => {
              const state = !isSubmitting ? 'idle' : index < activeStep ? 'done' : index === activeStep ? 'active' : 'pending';
              return (
                <li key={step} className={`request-progress__step request-progress__step--${state}`}>
                  <span className="request-progress__marker">{index < activeStep ? '✓' : index + 1}</span>
                  <span>{step}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <Disclosure title="Contexte facultatif">
          <div className="request-form__section-head request-form__section-head--compact">
            <h3>Compléments</h3>
            <p>Utile si tu veux orienter la lecture du rapport.</p>
          </div>

          <div className="request-form__grid request-form__grid--2-compact">
            <label className="request-field">
              <span className="request-label-row">
                <span>Nom du projet</span>
                <span className="request-chip request-chip--muted">Optionnel</span>
              </span>
              <input value={form.projectName} onChange={(event) => updateField('projectName', event.target.value)} placeholder="Ex. MoonDoge Finance" />
              <small>Pour l’affichage du rapport.</small>
              {errors.projectName ? <em>{errors.projectName}</em> : null}
            </label>

            <label className="request-field">
              <span className="request-label-row">
                <span>Email</span>
                <span className="request-chip request-chip--muted">Optionnel</span>
              </span>
              <input type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="toi@exemple.com" />
              <small>Non utilisé dans le score.</small>
              {errors.email ? <em>{errors.email}</em> : null}
            </label>
          </div>

          <label className="request-field">
            <span className="request-label-row">
              <span>Notes</span>
              <span className="request-chip request-chip--muted">Optionnel</span>
            </span>
            <textarea
              rows={4}
              value={form.notes}
              onChange={(event) => updateField('notes', event.target.value)}
              placeholder="Ex. suspicion de honeypot, LP non verrouillée, wallet team identifié..."
            />
            <small>Ajoute ici un angle d’enquête précis.</small>
            {errors.notes ? <em>{errors.notes}</em> : null}
          </label>
        </Disclosure>

        {submitError ? <p className="request-form__error">{submitError}</p> : null}

        <div className="btn-group request-form__actions">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Analyse en cours…' : 'Lancer l’analyse'}
          </button>
          <p className="request-form__meta">Minimum requis : réseau + adresse.</p>
        </div>
      </form>
    </section>
  );
}
