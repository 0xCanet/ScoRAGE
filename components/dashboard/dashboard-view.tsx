import Link from 'next/link';

import type { ReportSummary } from '@/lib/reports/store';

import { ReportListItem } from './report-list-item';

export function DashboardView({ reports }: { reports: ReportSummary[] }) {
  const completed = reports.filter((report) => report.status === 'completed').length;
  const processing = reports.filter((report) => report.status === 'processing').length;
  const failed = reports.filter((report) => report.status === 'failed').length;

  return (
    <main className="dashboard-shell">
      <div className="noise-overlay" aria-hidden="true" />
      <div className="container dashboard-shell__inner">
        <section className="card dashboard-hero">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Report history</h1>
            <p className="dashboard-hero__copy">
              A minimal working list of available reports. Pulls from live data when present, or falls back to seeded demo scans.
            </p>
          </div>
          <div className="dashboard-hero__actions">
            <Link href="/request" className="btn-primary">
              New scan
            </Link>
            <Link href="/" className="btn-secondary">
              Landing
            </Link>
          </div>
        </section>

        <section className="dashboard-stats">
          <article className="card dashboard-stat">
            <span>Completed</span>
            <strong>{completed}</strong>
          </article>
          <article className="card dashboard-stat">
            <span>Processing</span>
            <strong>{processing}</strong>
          </article>
          <article className="card dashboard-stat">
            <span>Failed</span>
            <strong>{failed}</strong>
          </article>
          <article className="card dashboard-stat">
            <span>Total</span>
            <strong>{reports.length}</strong>
          </article>
        </section>

        <section className="dashboard-list">
          {reports.length > 0 ? (
            reports.map((report) => <ReportListItem key={report.reportId} report={report} />)
          ) : (
            <article className="card dashboard-empty">
              <p className="eyebrow">No reports yet</p>
              <h2>Generate the first scan</h2>
              <p>
                There is no cached or Supabase-backed report history available right now. Create a request to populate the dashboard.
              </p>
              <Link href="/request" className="btn-primary btn-primary--sm">
                Go to request
              </Link>
            </article>
          )}
        </section>
      </div>
    </main>
  );
}
