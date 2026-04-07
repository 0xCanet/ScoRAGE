/* eslint-disable @next/next/no-head-element */

import type { ReportBundle } from '@/types/report';
import { chainLabels } from '@/types/project';

import { getReportStatusMeta, getVerdictBadgeTone, getVerdictMeta } from '@/lib/reports/verdict';
import { formatReportDate, reportProjectLabel, shortAddress } from '@/lib/reports/summary';

const fireCategories = ['financials', 'integrity', 'reputation', 'ecosystem', 'security'] as const;
const severityToneMap = {
  critical: 'critical',
  warning: 'high',
  positive: 'safe',
} as const;

export function ReportPrintDocument({ bundle }: { bundle: ReportBundle }) {
  const { project, report, evidences } = bundle;
  const verdict = getVerdictMeta(report.verdict);
  const status = getReportStatusMeta(report.status);
  const projectLabel = reportProjectLabel(project);
  const generatedLabel = formatReportDate(report.generatedAt ?? report.createdAt);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <title>ScoRAGE report {report.id}</title>
        <style>{`
          :root { color-scheme: dark; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 32px;
            background: #0a0a0a;
            color: #e8e4e4;
            font-family: Inter, Arial, sans-serif;
          }
          .page {
            max-width: 1100px;
            margin: 0 auto;
            background: linear-gradient(180deg, rgba(26, 26, 26, 0.96), rgba(10, 10, 10, 0.98));
            border: 1px solid #2a2a2a;
            padding: 28px;
          }
          h1, h2, h3, p { margin: 0; }
          h1, h2, h3 { color: #fff; font-family: 'Space Grotesk', Inter, Arial, sans-serif; }
          h1 { font-size: 42px; line-height: 1.02; margin-bottom: 14px; }
          h2 { font-size: 24px; margin-bottom: 12px; }
          h3 { font-size: 18px; }
          .muted { color: #b0a8a8; }
          .eyebrow {
            margin-bottom: 8px;
            color: #837676;
            font-size: 11px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }
          .hero {
            display: grid;
            grid-template-columns: minmax(0, 1.4fr) minmax(300px, 380px);
            gap: 20px;
            margin-bottom: 20px;
          }
          .panel {
            border: 1px solid #2a2a2a;
            padding: 20px;
            background: rgba(17, 17, 17, 0.92);
          }
          .chips, .footer-chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 14px 0; }
          .chip {
            display: inline-flex;
            align-items: center;
            padding: 6px 10px;
            border: 1px solid #2a2a2a;
            background: rgba(255,255,255,0.02);
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
          }
          .chip--critical,
          .chip--high { color: #ff223b; border-color: rgba(255,34,59,.28); background: rgba(255,34,59,.08); }
          .chip--safe { color: #40e5aa; border-color: rgba(64,229,170,.24); background: rgba(64,229,170,.06); }
          .chip--neutral { color: #e8e4e4; }
          .score {
            font-family: 'Space Grotesk', Inter, Arial, sans-serif;
            font-size: 72px;
            line-height: 1;
            color: ${report.score.total <= 25 ? '#ff223b' : report.score.total <= 50 ? '#ff223b' : report.score.total <= 75 ? '#f9fe08' : '#40e5aa'};
            margin-bottom: 4px;
          }
          .columns {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }
          .grid-5 {
            display: grid;
            grid-template-columns: repeat(5, minmax(0, 1fr));
            gap: 12px;
          }
          .fires {
            display: grid;
            gap: 10px;
          }
          .fires-row {
            display: grid;
            grid-template-columns: 28px 1fr auto;
            align-items: center;
            gap: 10px;
            padding: 10px 12px;
            border: 1px solid #2a2a2a;
            background: rgba(255,255,255,0.02);
          }
          .fires-row strong { color: #fff; }
          .list {
            margin: 0;
            padding-left: 18px;
            display: grid;
            gap: 8px;
            color: #b0a8a8;
          }
          .evidence-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }
          .evidence-card {
            border: 1px solid #2a2a2a;
            background: rgba(255,255,255,0.02);
            padding: 16px;
          }
          .evidence-top {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            margin-bottom: 12px;
          }
          .evidence-card p { color: #b0a8a8; }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 16px;
          }
          .meta-grid div {
            border-top: 1px solid #2a2a2a;
            padding-top: 12px;
          }
          .meta-grid span { display: block; color: #837676; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 4px; }
          .footer {
            margin-top: 20px;
            padding-top: 14px;
            border-top: 1px solid #2a2a2a;
            color: #837676;
            font-size: 12px;
          }
          @media print {
            body { padding: 0; }
            .page { border: 0; }
          }
        `}</style>
      </head>
      <body>
        <div className="page">
          <section className="hero">
            <div className="panel">
              <p className="eyebrow">ScoRAGE PDF export</p>
              <h1>{projectLabel}</h1>
              <p className="muted">{report.summary}</p>
              <div className="chips">
                <span className={`chip chip--${getVerdictBadgeTone(report.verdict)}`}>{verdict.badgeLabel}</span>
                <span className={`chip ${status.tone === 'safe' ? 'chip--safe' : status.tone === 'critical' ? 'chip--critical' : 'chip--neutral'}`}>{status.label}</span>
                <span className="chip chip--neutral">{chainLabels[project.chain]}</span>
                <span className="chip chip--neutral">{shortAddress(project.contractAddress)}</span>
              </div>
              <p className="muted">Generated {generatedLabel} · Methodology {report.methodologyVersion}</p>
            </div>
            <aside className="panel">
              <p className="eyebrow">Score / 100</p>
              <div className="score">{report.score.total}</div>
              <p className="muted">{verdict.description}</p>
            </aside>
          </section>

          <section className="columns">
            <article className="panel">
              <p className="eyebrow">F.I.R.E.S.</p>
              <div className="fires">
                {fireCategories.map((key) => (
                  <div key={key} className="fires-row">
                    <strong>{key.slice(0, 1).toUpperCase()}</strong>
                    <span>{key}</span>
                    <strong>{report.score[key]}</strong>
                  </div>
                ))}
              </div>
            </article>
            <article className="panel">
              <p className="eyebrow">Key signals</p>
              <h2>Red flags / positives</h2>
              <div className="footer-chips">
                <span className="chip chip--critical">{report.redFlags.length} red flags</span>
                <span className="chip chip--safe">{report.positives.length} positives</span>
              </div>
              <h3>Red flags</h3>
              <ul className="list">
                {report.redFlags.length > 0 ? report.redFlags.map((item) => <li key={item}>{item}</li>) : <li>No severe red flags detected in this pass.</li>}
              </ul>
              <div style={{ height: 16 }} />
              <h3>Positives</h3>
              <ul className="list">
                {report.positives.length > 0 ? report.positives.map((item) => <li key={item}>{item}</li>) : <li>No positive signals captured.</li>}
              </ul>
            </article>
          </section>

          <section className="panel" style={{ marginBottom: 20 }}>
            <p className="eyebrow">Evidence</p>
            <div className="evidence-grid">
              {evidences.map((evidence) => (
                <article key={evidence.id} className="evidence-card">
                  <div className="evidence-top">
                    <div>
                      <p className="eyebrow" style={{ marginBottom: 4 }}>{evidence.category}</p>
                      <h3>{evidence.title}</h3>
                    </div>
                    <span className={`chip chip--${severityToneMap[evidence.severity]}`}>{evidence.severity}</span>
                  </div>
                  <p>{evidence.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <p className="eyebrow">Metadata</p>
            <div className="meta-grid">
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
            <div className="footer">ScoRAGE premium report export · same data model as the web report.</div>
          </section>
        </div>
      </body>
    </html>
  );
}
