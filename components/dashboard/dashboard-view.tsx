import Link from 'next/link';

import type { ReportSummary } from '@/lib/reports/store';

import { ReportListItem } from './report-list-item';
import { AppTopbar } from '@/components/app/app-topbar';
import { StatCard } from './stat-card';
import { FilterBar } from './filter-bar';

export function DashboardView({ reports }: { reports: ReportSummary[] }) {
  const completed = reports.filter((report) => report.status === 'completed').length;
  const processing = reports.filter((report) => report.status === 'processing').length;
  const failed = reports.filter((report) => report.status === 'failed').length;

  return (
    <>
      <AppTopbar />
      <main className="dashboard-shell">
        <div className="noise-overlay" aria-hidden="true" />
        <div className="container dashboard-shell__inner">
        <section className="card dashboard-hero">
          <div>
            <p className="eyebrow">Tableau de bord</p>
            <h1>Centre de surveillance</h1>
            <p className="dashboard-hero__copy">
              Historique de vos analyses et verdicts.
            </p>
          </div>
          <div className="dashboard-hero__actions">
            <Link href="/request" className="btn-primary">
              Nouvelle analyse
            </Link>
          </div>
        </section>

        <section className="dashboard-stats">
          <StatCard label="Terminées" value={completed} />
          <StatCard label="En cours" value={processing} />
          <StatCard label="Échecs" value={failed} />
          <StatCard label="Total" value={reports.length} />
        </section>

        <section className="dashboard-list">
          <div className="dashboard-list__header">
            <FilterBar />
          </div>
          {reports.length > 0 ? (
            reports.map((report) => <ReportListItem key={report.reportId} report={report} />)
          ) : (
            <article className="card dashboard-empty">
              <p className="eyebrow">Aucune analyse</p>
              <h2>Lancez votre première analyse</h2>
              <p>
                Votre historique est vide. Analysez un contrat pour générer votre premier rapport.
              </p>
              <Link href="/request" className="btn-primary btn-primary--sm">
                Nouvelle analyse
              </Link>
            </article>
          )}
        </section>
      </div>
    </main>
    </>
  );
}
