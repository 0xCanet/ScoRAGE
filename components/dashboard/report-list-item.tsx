import Link from 'next/link';

import type { ReportSummary } from '@/lib/reports/store';
import { chainLabels } from '@/types/project';

import { getReportStatusMeta, getVerdictBadgeTone, getVerdictMeta } from '@/lib/reports/verdict';
import { formatReportDay, shortAddress } from '@/lib/reports/summary';

export function ReportListItem({ report }: { report: ReportSummary }) {
  const verdict = getVerdictMeta(report.verdict);
  const status = getReportStatusMeta(report.status);

  return (
    <article className="dashboard-item">
      <div className="dashboard-item__main">
        <div>
          <p className="dashboard-item__title">{report.projectName ?? `${chainLabels[report.chain]} contract`}</p>
          <p className="dashboard-item__meta">
            {chainLabels[report.chain]} · {shortAddress(report.contractAddress)}
          </p>
        </div>
        <div className="dashboard-item__stats">
          <span className={`badge badge--${status.tone}`}>{status.label}</span>
          <span className={`badge badge--${getVerdictBadgeTone(report.verdict)}`}>{verdict.badgeLabel}</span>
          <strong>{report.score}</strong>
        </div>
      </div>
      <div className="dashboard-item__footer">
        <span>{formatReportDay(report.generatedAt ?? report.createdAt)}</span>
        <Link href={`/report/${report.reportId}`} className="btn-ghost">
          Open report
        </Link>
      </div>
    </article>
  );
}
