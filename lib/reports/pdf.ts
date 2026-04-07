import type { ReportBundle } from '@/types/report';
import { chainLabels } from '@/types/project';
import { scoreCategoryLabels } from '@/types/score';

import { getReportStatusMeta, getVerdictBadgeTone, getVerdictMeta } from './verdict';
import { formatReportDate, reportProjectLabel, shortAddress } from './summary';

const fireCategories = ['financials', 'integrity', 'reputation', 'ecosystem', 'security'] as const;

const severityToneMap = {
  critical: 'critical',
  warning: 'high',
  positive: 'safe',
} as const;

const escapeHtml = (value: string): string =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

export function buildReportPdfHtml(bundle: ReportBundle): string {
  const { project, report, evidences } = bundle;
  const verdict = getVerdictMeta(report.verdict);
  const status = getReportStatusMeta(report.status);
  const projectLabel = reportProjectLabel(project);
  const generatedLabel = formatReportDate(report.generatedAt ?? report.createdAt);
  const scoreColor = report.score.total <= 25 ? '#ff223b' : report.score.total <= 50 ? '#ff223b' : report.score.total <= 75 ? '#f9fe08' : '#40e5aa';

  const firesMarkup = fireCategories
    .map((key) => {
      const score = report.score[key];
      return `
        <div class="fires-row">
          <strong>${key.slice(0, 1).toUpperCase()}</strong>
          <span>${scoreCategoryLabels[key]}</span>
          <strong>${score}</strong>
        </div>
      `;
    })
    .join('');

  const redFlagsMarkup = report.redFlags.length > 0 ? report.redFlags.map((item) => `<li>${escapeHtml(item)}</li>`).join('') : '<li>No severe red flags detected in this pass.</li>';
  const positivesMarkup = report.positives.length > 0 ? report.positives.map((item) => `<li>${escapeHtml(item)}</li>`).join('') : '<li>No positive signals captured.</li>';

  const evidencesMarkup = evidences
    .map((evidence) => {
      return `
        <article class="evidence-card">
          <div class="evidence-top">
            <div>
              <p class="eyebrow" style="margin-bottom:4px">${escapeHtml(scoreCategoryLabels[evidence.category])}</p>
              <h3>${escapeHtml(evidence.title)}</h3>
            </div>
            <span class="chip chip--${severityToneMap[evidence.severity]}">${escapeHtml(evidence.severity)}</span>
          </div>
          <p>${escapeHtml(evidence.detail)}</p>
        </article>
      `;
    })
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>ScoRAGE report ${escapeHtml(report.id)}</title>
    <style>
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
        color: ${scoreColor};
        margin-bottom: 4px;
      }
      .columns {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 20px;
        margin-bottom: 20px;
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
    </style>
  </head>
  <body>
    <div class="page">
      <section class="hero">
        <div class="panel">
          <p class="eyebrow">ScoRAGE PDF export</p>
          <h1>${escapeHtml(projectLabel)}</h1>
          <p class="muted">${escapeHtml(report.summary)}</p>
          <div class="chips">
            <span class="chip chip--${getVerdictBadgeTone(report.verdict)}">${escapeHtml(verdict.badgeLabel)}</span>
            <span class="chip ${status.tone === 'safe' ? 'chip--safe' : status.tone === 'critical' ? 'chip--critical' : 'chip--neutral'}">${escapeHtml(status.label)}</span>
            <span class="chip chip--neutral">${escapeHtml(chainLabels[project.chain])}</span>
            <span class="chip chip--neutral">${escapeHtml(shortAddress(project.contractAddress))}</span>
          </div>
          <p class="muted">Generated ${escapeHtml(generatedLabel)} · Methodology ${escapeHtml(report.methodologyVersion)}</p>
        </div>
        <aside class="panel">
          <p class="eyebrow">Score / 100</p>
          <div class="score">${report.score.total}</div>
          <p class="muted">${escapeHtml(verdict.description)}</p>
        </aside>
      </section>

      <section class="columns">
        <article class="panel">
          <p class="eyebrow">F.I.R.E.S.</p>
          <div class="fires">${firesMarkup}</div>
        </article>
        <article class="panel">
          <p class="eyebrow">Key signals</p>
          <h2>Red flags / positives</h2>
          <div class="footer-chips">
            <span class="chip chip--critical">${report.redFlags.length} red flags</span>
            <span class="chip chip--safe">${report.positives.length} positives</span>
          </div>
          <h3>Red flags</h3>
          <ul class="list">${redFlagsMarkup}</ul>
          <div style="height: 16px"></div>
          <h3>Positives</h3>
          <ul class="list">${positivesMarkup}</ul>
        </article>
      </section>

      <section class="panel" style="margin-bottom: 20px;">
        <p class="eyebrow">Evidence</p>
        <div class="evidence-grid">${evidencesMarkup}</div>
      </section>

      <section class="panel">
        <p class="eyebrow">Metadata</p>
        <div class="meta-grid">
          <div>
            <span>Report ID</span>
            <strong>${escapeHtml(report.id)}</strong>
          </div>
          <div>
            <span>Project ID</span>
            <strong>${escapeHtml(project.id)}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>${escapeHtml(report.status)}</strong>
          </div>
          <div>
            <span>Generated</span>
            <strong>${escapeHtml(generatedLabel)}</strong>
          </div>
        </div>
        <div class="footer">ScoRAGE premium report export · same data model as the web report.</div>
      </section>
    </div>
  </body>
</html>`;
}

export function buildPdfResponse(bundle: ReportBundle): Response {
  const html = buildReportPdfHtml(bundle);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="scorage-report-${bundle.report.id}.html"`,
      'Cache-Control': 'no-store',
    },
  });
}
