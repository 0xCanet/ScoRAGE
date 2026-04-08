'use client';

import { useMemo, useState, type FormEvent } from 'react';

import type { ReportAnnotation } from '@/types/report';

const MAX_LENGTH = 1200;

function formatAnnotationDate(value: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function ReportAnnotations({
  reportId,
  initialAnnotations,
}: {
  reportId: string;
  initialAnnotations: ReportAnnotation[];
}) {
  const [annotations, setAnnotations] = useState(initialAnnotations);
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remaining = useMemo(() => MAX_LENGTH - content.trim().length, [content]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = content.trim();
    if (!trimmed) {
      setError('Écris quelque chose avant d’enregistrer.');
      return;
    }

    if (trimmed.length > MAX_LENGTH) {
      setError(`Information trop longue. Maximum ${MAX_LENGTH} caractères.`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/reports/${reportId}/annotations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: trimmed }),
      });

      const payload = (await response.json()) as { annotation?: ReportAnnotation; error?: string };

      if (!response.ok || !payload.annotation) {
        setError(payload.error ?? 'Impossible d’enregistrer cette information.');
        return;
      }

      setAnnotations((current) => [payload.annotation as ReportAnnotation, ...current]);
      setContent('');
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="card report-annotations">
      <div className="report-section-card__header report-annotations__header">
        <div>
          <p className="eyebrow">Informations complémentaires</p>
          <h2>Ajouter une information</h2>
          <p className="report-section-card__copy report-annotations__copy">
            Note une observation, une source, ou un contexte utile pour les prochaines vérifications.
          </p>
        </div>
        <span className="badge badge--neutral">{annotations.length} note{annotations.length > 1 ? 's' : ''}</span>
      </div>

      <form className="report-annotations__form" onSubmit={handleSubmit}>
        <label className="report-annotations__field">
          <span>Nouvelle information</span>
          <textarea
            rows={4}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Ex. Token listé sur CoinGecko, équipe anonyme, LP verrouillée 6 mois..."
          />
          <div className="report-annotations__field-meta">
            <small>{remaining >= 0 ? `${remaining} caractères restants` : `${Math.abs(remaining)} caractères en trop`}</small>
            <small>Visible dans ce rapport et réutilisable sur refresh.</small>
          </div>
        </label>

        {error ? <p className="report-annotations__error">{error}</p> : null}

        <div className="btn-group report-annotations__actions">
          <button type="submit" className="btn-primary btn-primary--sm" disabled={isSaving}>
            {isSaving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>

      <div className="report-annotations__list">
        {annotations.length > 0 ? (
          annotations.map((annotation) => (
            <article key={annotation.id} className="report-annotations__item">
              <div className="report-annotations__item-head">
                <strong>Information ajoutée</strong>
                <span>{formatAnnotationDate(annotation.createdAt)}</span>
              </div>
              <p>{annotation.content}</p>
            </article>
          ))
        ) : (
          <div className="report-annotations__empty">
            Aucune information complémentaire pour le moment. Tu peux en ajouter une juste au-dessus.
          </div>
        )}
      </div>
    </section>
  );
}
