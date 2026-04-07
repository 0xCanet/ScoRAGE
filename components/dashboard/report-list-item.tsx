import Link from 'next/link';

import type { ReportSummary } from '@/lib/reports/store';
import { chainLabels } from '@/types/project';

import { getReportStatusMeta, getVerdictBadgeTone, getVerdictMeta } from '@/lib/reports/verdict';
import { formatReportDay, shortAddress } from '@/lib/reports/summary';

export function ReportListItem({ report }: { report: ReportSummary }) {
  const verdict = getVerdictMeta(report.verdict);
  const status = getReportStatusMeta(report.status);

  return (
    <article className="dashboard-item dashboard-item--compact">
      <div className="dashboard-item__main">
        <div className="dashboard-item__info">
          <div className="dashboard-item__title-group">
            <span className="dashboard-item__network">{chainLabels[report.chain]}</span>
            <p className="dashboard-item__title">{report.projectName ?? shortAddress(report.contractAddress)}</p>
          </div>
          <p className="dashboard-item__meta">
            {formatReportDay(report.generatedAt ?? report.createdAt)}
          </p>
        </div>
        <div className="dashboard-item__stats">
          {report.status === 'completed' && (
            <span className={`badge badge--${getVerdictBadgeTone(report.verdict)}`}>{verdict.badgeLabel}</span>
          )}
          <span className={`badge badge--${status.tone}`}>{status.label}</span>
          <strong className="dashboard-item__score-val">{report.score}</strong>
          <Link href={`/report/${report.reportId}`} className="btn-secondary btn-secondary--sm">
            Ouvrir
          </Link>
        </div>
      </div>
    </article>
  );
}
