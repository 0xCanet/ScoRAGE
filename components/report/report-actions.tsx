'use client';

import { useState } from 'react';
import Link from 'next/link';

export function ReportActions({ reportId }: { reportId: string }) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const handleCopy = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const url = new URL(`/report/${reportId}`, window.location.origin).toString();

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        throw new Error('clipboard-unavailable');
      }

      setCopyError(null);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      try {
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        setCopyError(null);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1800);
      } catch {
        setCopied(false);
        setCopyError('Copie manuelle requise');
      }    }
  };

  return (
    <div className="report-actions-block">
      <div className="report-actions">
        <a href={`/api/pdf/${reportId}`} className="btn-primary btn-primary--sm" download>
          Exporter en PDF
        </a>
        <button type="button" className="btn-secondary btn-secondary--sm" onClick={handleCopy}>
          {copied ? 'Lien copié' : 'Copier le lien'}
        </button>
        <Link href="/request" className="btn-ghost">
          Nouvelle analyse
        </Link>
      </div>
      {copyError ? <p className="report-actions__hint">{copyError}</p> : null}    </div>
  );
}
