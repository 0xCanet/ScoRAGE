import Link from 'next/link';

import type { ReportBundle } from '@/types/report';
import { chainLabels } from '@/types/project';
import { scoreCategoryLabels, scoreToVerdict } from '@/types/score';

import { getReportStatusMeta, getVerdictBadgeTone, getVerdictMeta } from '@/lib/reports/verdict';
import { formatReportDate, reportProjectLabel, shortAddress } from '@/lib/reports/summary';

import { ReportActions } from './report-actions';

const fireCategories = ['financials', 'integrity', 'reputation', 'ecosystem', 'security'] as const;

const severityToneMap = {
  critical: 'critical',
  warning: 'high',
  positive: 'safe',
} as const;

const scoreVerdictLabelMap: Record<'critical' | 'high' | 'moderate' | 'low', string> = {
  critical: 'Critical',
  high: 'High',
  moderate: 'Moderate',
  low: 'Low',
};

export function ReportView({ bundle }: { bundle: ReportBundle }) {
  const { project, report, evidences } = bundle;
  const verdict = getVerdictMeta(report.verdict);
  const status = getReportStatusMeta(report.status);
  const projectLabel = reportProjectLabel(project);
  const generatedLabel = formatReportDate(report.generatedAt ?? report.createdAt);
  const redFlagCount = report.redFlags.length;
  const positiveCount = report.positives.length;

  return (
    <div className="report-layout">
      <section className="card report-hero">
        <div className="report-hero__copy">
          <p className="eyebrow">Report / {report.id.slice(0, 8)}</p>
          <h1>{projectLabel}</h1>
          <p className="report-hero__lead">{report.summary}</p>
          <div className="report-hero__chips">
            <span className={`badge badge--${getVerdictBadgeTone(report.verdict)}`}>{verdict.badgeLabel}</span>
            <span className={`badge badge--${status.tone}`}>{status.label}</span>
            <span className="badge badge--neutral">{chainLabels[project.chain]}</span>
            <span className="badge badge--neutral">{shortAddress(project.contractAddress)}</span>
          </div>
          <div className="report-hero__meta-row">
            <div>
              <p className="report-hero__meta-label">Generated</p>
              <p className="report-hero__meta-value">{generatedLabel}</p>
            </div>
            <div>
              <p className="report-hero__meta-label">Methodology</p>
              <p className="report-hero__meta-value">{report.methodologyVersion}</p>
            </div>
            <div>
              <p className="report-hero__meta-label">Risk model</p>
              <p className="report-hero__meta-value">F.I.R.E.S.</p>
            </div>
          </div>
          <ReportActions reportId={report.id} />
        </div>

        <aside className="report-score-panel">
          <p className="eyebrow">ScoRAGE score</p>
          <div className={`report-score-panel__value report-score-panel__value--${verdict.tone}`}>{report.score.total}</div>
          <p className="report-score-panel__label">/ 100</p>
          <p className="report-score-panel__description">{verdict.description}</p>
          <div className="report-score-panel__stats">
            <div>
              <span>Status</span>
              <strong>{status.label}</strong>
            </div>
            <div>
              <span>Red flags</span>
              <strong>{redFlagCount}</strong>
            </div>
            <div>
              <span>Positives</span>
              <strong>{positiveCount}</strong>
            </div>
            <div>
              <span>Report ID</span>
              <strong>{report.id.slice(0, 12)}…</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="report-grid report-grid--fires">
        <article className="card report-section-card">
          <div className="report-section-card__header">
            <div>
              <p className="eyebrow">F.I.R.E.S.</p>
              <h2>Breakdown</h2>
            </div>
            <p className="report-section-card__copy">Each score contributes to the combined verdict.</p>
          </div>
          <div className="report-fires-list">
            {fireCategories.map((key) => (
              <div key={key} className="report-fires-row">
                <span className="report-fires-row__letter">{key.slice(0, 1).toUpperCase()}</span>
                <div>
                  <strong>{scoreCategoryLabels[key]}</strong>
                  <p>{scoreVerdictLabelMap[scoreToVerdict(report.score[key])]}</p>
                </div>
                <span className="report-fires-row__score">{report.score[key]}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="card report-section-card report-section-card--stacked">
          <div>
            <p className="eyebrow">What stands out</p>
            <h2>Signal mix</h2>
          </div>
          <div className="report-signal-grid">
            <div className="report-signal-card report-signal-card--critical">
              <p className="report-signal-card__label">Red flags</p>
              <strong>{redFlagCount}</strong>
              <ul className="stack-list stack-list--tight">
                {report.redFlags.length > 0 ? report.redFlags.map((item) => <li key={item}>{item}</li>) : <li>No severe red flags detected in this pass.</li>}
              </ul>
            </div>
            <div className="report-signal-card report-signal-card--safe">
              <p className="report-signal-card__label">Positives</p>
              <strong>{positiveCount}</strong>
              <ul className="stack-list stack-list--tight">
                {report.positives.length > 0 ? report.positives.map((item) => <li key={item}>{item}</li>) : <li>No strong positives captured yet.</li>}
              </ul>
            </div>
          </div>
        </article>
      </section>

      <section className="card report-section-card">
        <div className="report-section-card__header">
          <div>
            <p className="eyebrow">Evidence</p>
            <h2>Detail cards</h2>
          </div>
          <p className="report-section-card__copy">Evidence is grouped as compact, high-contrast cards for fast review.</p>
        </div>

        <div className="report-evidence-grid">
          {evidences.map((evidence) => (
            <article key={evidence.id} className="report-evidence-card">
              <div className="report-evidence-card__top">
                <div>
                  <p className="report-evidence-card__kicker">{scoreCategoryLabels[evidence.category]}</p>
                  <h3>{evidence.title}</h3>
                </div>
                <span className={`badge badge--${severityToneMap[evidence.severity]}`}>{evidence.severity}</span>
              </div>
              <p className="report-evidence-card__detail">{evidence.detail}</p>
              <div className="report-evidence-card__footer">
                <span>Raw value: {evidence.rawValue ?? '—'}</span>
                <span>{evidence.sourceLabel ?? 'ScoRAGE engine'}</span>
                {evidence.sourceUrl ? (
                  <a href={evidence.sourceUrl} target="_blank" rel="noreferrer">
                    Source
                  </a>
                ) : (
                  <span>Internal signal</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="report-grid report-grid--meta">
        <article className="card report-section-card">
          <p className="eyebrow">Metadata</p>
          <div className="report-meta-list">
            <div>
              <span>Report ID</span>
              <strong>{report.id}</strong>
            </div>
            <div>
              <span>Project ID</span>
              <strong>{project.id}</strong>
            </div>
            <div>
              <span>Status</span>
              <strong>{report.status}</strong>
            </div>
            <div>
              <span>Generated</span>
              <strong>{generatedLabel}</strong>
            </div>
          </div>
        </article>

        <article className="card report-section-card">
          <p className="eyebrow">Next action</p>
          <h2>Keep moving</h2>
          <p className="report-section-card__copy">
            Export the PDF for sharing, or trigger a fresh scan if the token moved since this pass.
          </p>
          <div className="btn-group report-section-card__actions">
            <a href={`/api/pdf/${report.id}`} className="btn-primary btn-primary--sm" download>
              Download PDF
            </a>
            <Link href="/dashboard" className="btn-secondary btn-secondary--sm">
              Open dashboard
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
