import Link from 'next/link';

import { ReportView } from '@/components/report/report-view';
import { getReportBundle } from '@/lib/reports/store';
import { AppTopbar } from '@/components/app/app-topbar';

function MissingReportState() {
  return (
    <main className="report-shell">
      <AppTopbar />
      <div className="noise-overlay" aria-hidden="true" />
      <div className="container report-shell__inner">
        <section className="card report-shell__empty">
          <p className="eyebrow">Rapport</p>
          <h1>Rapport introuvable</h1>
          <p className="report-shell__copy">
            Ce rapport n&apos;existe pas ou a expiré.
          </p>
          <div className="btn-group">
            <Link href="/request" className="btn-primary">
              Nouvelle analyse
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Centre de surveillance            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

export default async function ReportPage({ params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const bundle = await getReportBundle(reportId);

  if (!bundle) {
    return <MissingReportState />;
  }

  return (
    <main className="report-shell">
      <AppTopbar />
      <div className="noise-overlay" aria-hidden="true" />
      <div className="container report-shell__inner">
        <ReportView bundle={bundle} />
      </div>
    </main>
  );
}
