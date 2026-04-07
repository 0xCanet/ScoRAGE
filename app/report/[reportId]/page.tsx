import Link from 'next/link';

import { ReportView } from '@/components/report/report-view';
import { getReportBundle } from '@/lib/reports/store';

function MissingReportState() {
  return (
    <main className="report-shell">
      <div className="noise-overlay" aria-hidden="true" />
      <div className="container report-shell__inner">
        <section className="card report-shell__empty">
          <p className="eyebrow">Report</p>
          <h1>Report unavailable</h1>
          <p className="report-shell__copy">
            This report id does not exist in the current cache or Supabase dataset. Create a new scan to generate a fresh report bundle.
          </p>
          <div className="btn-group">
            <Link href="/request" className="btn-primary">
              New scan
            </Link>
            <Link href="/dashboard" className="btn-secondary">
              Dashboard
            </Link>
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
      <div className="noise-overlay" aria-hidden="true" />
      <div className="container report-shell__inner">
        <div className="btn-group report-shell__header-actions">
          <Link href="/request" className="btn-secondary">
            New scan
          </Link>
          <Link href="/dashboard" className="btn-ghost">
            Dashboard
          </Link>
        </div>

        <ReportView bundle={bundle} />
      </div>
    </main>
  );
}
