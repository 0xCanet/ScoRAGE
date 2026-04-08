"use client";

import { useMemo, useState } from 'react';
import Link from 'next/link';

import type { ReportSummary } from '@/lib/reports/store';

import { ReportListItem } from './report-list-item';
import { AppTopbar } from '@/components/app/app-topbar';
import { StatCard } from './stat-card';
import { FilterBar, type DashboardFilter } from './filter-bar';

export function DashboardView({ reports }: { reports: ReportSummary[] }) {
  const [activeFilter, setActiveFilter] = useState<DashboardFilter>('all');

  const visibleReports = useMemo(() => {
    if (activeFilter === 'all') {
      return reports;
    }

    return reports.filter((report) => report.status === activeFilter);
  }, [activeFilter, reports]);

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
          <div className="dashboard-hero__content">
            <p className="eyebrow">Centre de surveillance</p>            <h1>Centre de surveillance</h1>
            <p className="dashboard-hero__copy">
              Retrouve chaque analyse, son score et son niveau de risque sans repasser par la landing.
            </p>
            <div className="dashboard-hero__meta">
              <span>Score /100</span>
              <span>Verdict immédiat</span>
              <span>Historique partageable</span>
            </div>
          </div>
          <div className="dashboard-hero__actions">
            <Link href="/request" className="btn-primary">
              Lancer une analyse
            </Link>
            <Link href="/" className="btn-secondary">
              Voir le site            </Link>
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
            <FilterBar activeFilter={activeFilter} onChange={setActiveFilter} />
            <p className="dashboard-list__legend">
              {visibleReports.length} analyse{visibleReports.length > 1 ? 's' : ''} affichée{visibleReports.length > 1 ? 's' : ''}
            </p>
          </div>
          {visibleReports.length > 0 ? (
            visibleReports.map((report) => <ReportListItem key={report.reportId} report={report} />)
          ) : (
            <article className="card dashboard-empty">
              <p className="eyebrow">Aucune analyse</p>
              <h2>Aucune analyse dans ce filtre</h2>
              <p>
                Aucun rapport ne correspond à la vue sélectionnée. Lance une analyse pour alimenter le centre de surveillance.              </p>
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
