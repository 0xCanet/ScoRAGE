'use client';

import { useState } from 'react';
import Link from 'next/link';

export function ReportActions({ reportId }: { reportId: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (typeof window === 'undefined' || !navigator.clipboard) {
      return;
    }

    const url = new URL(`/report/${reportId}`, window.location.origin).toString();
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="report-actions">
      <a href={`/api/pdf/${reportId}`} className="btn-primary btn-primary--sm" download>
        Export PDF
      </a>
      <button type="button" className="btn-secondary btn-secondary--sm" onClick={handleCopy}>
        {copied ? 'Link copied' : 'Copy report link'}
      </button>
      <Link href="/request" className="btn-ghost">
        New scan
      </Link>
    </div>
  );
}
