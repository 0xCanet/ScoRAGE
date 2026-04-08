import Link from 'next/link';

import type { ReportBundle } from '@/types/report';
import { chainLabels } from '@/types/project';
import { scoreCategoryLabels, scoreToVerdict } from '@/types/score';
import { evidenceSeverityLabels } from '@/types/evidence';

import { buildAnalysisPanels, formatAddress, formatCurrency } from '@/lib/reports/analysis-panels';
import { getReportStatusMeta, getVerdictBadgeTone, getVerdictMeta } from '@/lib/reports/verdict';
import { formatReportDate, reportProjectLabel, shortAddress } from '@/lib/reports/summary';

import { ReportActions } from './report-actions';
import { ReportAnnotations } from './report-annotations';
import { SignalList } from './signal-list';
import { ScoreBar } from '@/components/ui/score-bar';

const fireCategories = ['financials', 'integrity', 'reputation', 'ecosystem', 'security'] as const;

const severityToneMap = {
  critical: 'critical',
  warning: 'high',
  positive: 'safe',
} as const;

const severityLabelMap: Record<'critical' | 'warning' | 'positive', string> = {
  critical: 'Critique',
  warning: 'Attention',
  positive: 'OK',
};

const scoreVerdictLabelMap: Record<'critical' | 'high' | 'moderate' | 'low', string> = {
  critical: 'Critique',
  high: 'Élevé',
  moderate: 'Modéré',
  low: 'Faible',
};

export function ReportView({ bundle }: { bundle: ReportBundle }) {
  const { project, report, evidences } = bundle;
  const verdict = getVerdictMeta(report.verdict);
  const status = getReportStatusMeta(report.status);
  const projectLabel = reportProjectLabel(project);
  const generatedLabel = formatReportDate(report.generatedAt ?? report.createdAt);
  const analysis = buildAnalysisPanels(bundle);
  const redFlagCount = report.redFlags.length;
  const positiveCount = report.positives.length;
  const compatibility = evidences.find((evidence) => evidence.title.startsWith('Compatibilité :'));
  const confirmed = evidences.filter((evidence) => evidence.severity === 'positive').map((evidence) => evidence.title).slice(0, 5);
  const missing = evidences.filter((evidence) => evidence.signalType === 'missing_data').map((evidence) => evidence.title).slice(0, 5);
  const concerns = evidences.filter((evidence) => evidence.signalType === 'risk' || evidence.signalType === 'incompatible_object').map((evidence) => evidence.title).slice(0, 5);
  const nextChecks = [
    missing.length > 0 ? 'Compléter d’abord les éléments manquants signalés par ScoRAGE.' : undefined,
    concerns.some((item) => item.toLowerCase().includes('liquidité')) ? 'Vérifier manuellement la liquidité, la profondeur de marché et la sortie de position.' : undefined,
    concerns.some((item) => item.toLowerCase().includes('mint') || item.toLowerCase().includes('freeze')) ? 'Vérifier les authorities / ownership avant toute décision.' : undefined,
    analysis.compatibilityLabel.toLowerCase().includes('incompatible') ? 'Fournir une vraie adresse de token si l’objectif est une analyse pré-investissement.' : undefined,
    !compatibility ? 'Confirmer manuellement la nature exacte de l’adresse analysée.' : undefined,
  ].filter((value): value is string => Boolean(value));

  return (
    <div className="report-layout">
      <section className="card report-hero">
        <div className="report-hero__copy">
          <p className="eyebrow">Rapport / {report.id.slice(0, 8)}</p>
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
              <p className="report-hero__meta-label">Généré le</p>
              <p className="report-hero__meta-value">{generatedLabel}</p>
            </div>
            <div>
              <p className="report-hero__meta-label">Méthodologie</p>
              <p className="report-hero__meta-value">{report.methodologyVersion}</p>
            </div>
            <div>
              <p className="report-hero__meta-label">Modèle de risque</p>
              <p className="report-hero__meta-value">F.I.R.E.S.</p>
            </div>
          </div>
          <ReportActions reportId={report.id} />
        </div>

        <aside className="report-score-panel">
          <p className="eyebrow">Score ScoRAGE</p>
          <div className={`report-score-panel__value report-score-panel__value--${verdict.tone}`}>{report.score.total}</div>
          <p className="report-score-panel__label">/ 100</p>
          <p className="report-score-panel__description">{verdict.description}</p>
          <div className="report-score-panel__stats">
            <div>
              <span>Statut</span>
              <strong>{status.label}</strong>
            </div>
            <div>
              <span>Alertes</span>
              <strong>{redFlagCount}</strong>
            </div>
            <div>
              <span>Signaux positifs</span>              <strong>{positiveCount}</strong>
            </div>
            <div>
              <span>ID rapport</span>
              <strong>{report.id.slice(0, 12)}…</strong>
            </div>
          </div>
        </aside>
      </section>

      <ReportAnnotations reportId={report.id} initialAnnotations={bundle.annotations ?? []} />

      <section className="report-grid report-grid--meta">
        <article className="card report-section-card">
          <p className="eyebrow">Compatibilité d’analyse</p>
          <h2>{analysis.compatibilityLabel}</h2>
          <p className="report-section-card__copy">{analysis.compatibilityDetail}</p>
        </article>

        <article className="card report-section-card">
          <p className="eyebrow">Lecture rapide</p>
          <h2>Ce que ScoRAGE a vraiment trouvé</h2>
          <div className="report-signal-grid">
            <div className="report-signal-card report-signal-card--safe">
              <p className="report-signal-card__label">Confirmé</p>
              <SignalList items={confirmed} type="positive" emptyMessage="Aucun élément confirmé." />
            </div>
            <div className="report-signal-card report-signal-card--critical">
              <p className="report-signal-card__label">Ce qui inquiète</p>
              <SignalList items={concerns} type="critical" emptyMessage="Aucune inquiétude majeure détectée sur ce pass." />
            </div>
            <div className="report-signal-card report-signal-card--neutral">
              <p className="report-signal-card__label">Ce qui manque</p>
              <SignalList items={missing} type="neutral" emptyMessage="Aucun manque majeur remonté." />
            </div>
            <div className="report-signal-card report-signal-card--neutral">
              <p className="report-signal-card__label">Prochaine vérif recommandée</p>
              <SignalList items={nextChecks} type="neutral" emptyMessage="Aucune vérification prioritaire supplémentaire." />
            </div>
          </div>
        </article>
      </section>

      <section className="report-grid report-grid--analysis">
        <article className="card report-section-card">
          <div className="report-section-card__header">
            <div>
              <p className="eyebrow">Contrat / token</p>
              <h2>Fiche principale</h2>
            </div>
          </div>
          <div className="report-facts-grid">
            {analysis.contractFacts.map((fact) => (
              <div key={`${fact.label}-${fact.value}`} className="report-fact-card">
                <span>{fact.label}</span>
                <strong>{fact.value}</strong>
                {fact.sourceLabel ? <p>{fact.sourceLabel}</p> : null}
                {fact.sourceUrl ? (
                  <a href={fact.sourceUrl} target="_blank" rel="noreferrer">
                    Ouvrir la source
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </article>

        <article className="card report-section-card">
          <div className="report-section-card__header">
            <div>
              <p className="eyebrow">Marché / pools</p>
              <h2>Liquidité et paires</h2>
            </div>
          </div>
          <div className="report-market-overview">
            <div className="report-market-overview__stat">
              <span>Paires détectées</span>
              <strong>{analysis.marketPairs.length}</strong>
            </div>
            <div className="report-market-overview__stat">
              <span>Meilleure liquidité</span>
              <strong>{analysis.bestMarketPair ? formatCurrency(analysis.bestMarketPair.liquidityUsd) : '—'}</strong>            </div>
            <div className="report-market-overview__stat">
              <span>Volume 24h</span>
              <strong>{analysis.bestMarketPair ? formatCurrency(analysis.bestMarketPair.volume24hUsd) : '—'}</strong>
            </div>
            <div className="report-market-overview__stat">
              <span>Âge paire</span>
              <strong>{analysis.bestMarketPair?.pairAgeDays !== undefined ? `${Math.round(analysis.bestMarketPair.pairAgeDays)} j` : '—'}</strong>
            </div>
          </div>
          <div className="report-section-card__copy" style={{ maxWidth: 'none' }}>
            <SignalList items={analysis.marketNotes} type="neutral" emptyMessage="Aucun commentaire marché disponible." />
          </div>
          <div className="report-market-table">
            <div className="report-market-table__head">
              <span>DEX</span>
              <span>Paire</span>
              <span>Liquidité</span>
              <span>Volume 24h</span>
              <span>FDV</span>
              <span>Âge</span>
            </div>
            {analysis.marketPairs.length > 0 ? (
              analysis.marketPairs.map((pair) => (
                <div key={pair.pairAddress} className="report-market-table__row">
                  <strong>{pair.dexId ?? pair.chainId}</strong>
                  <span>{pair.baseLabel} / {pair.quoteLabel}</span>
                  <span>{formatCurrency(pair.liquidityUsd)}</span>
                  <span>{formatCurrency(pair.volume24hUsd)}</span>
                  <span>{pair.fdv !== undefined ? formatCurrency(pair.fdv) : '—'}</span>
                  <span>{pair.pairAgeDays !== undefined ? `${Math.round(pair.pairAgeDays)} j` : '—'}</span>
                  <p className="report-market-table__meta">{formatAddress(pair.pairAddress)}</p>
                </div>
              ))
            ) : (
              <div className="report-market-table__empty">Aucune paire structurable pour le moment.</div>
            )}
          </div>
        </article>
      </section>

      <section className="card report-section-card">
        <div className="report-section-card__header">
          <div>
            <p className="eyebrow">Social intelligence</p>
            <h2>X / Telegram / Discord</h2>
          </div>
        </div>
        <div className="report-social-grid">
          {analysis.socialOverview.channels.length > 0 ? (
            analysis.socialOverview.channels.map((channel) => (
              <article key={channel.key} className="report-social-card">
                <div className="report-social-card__head">
                  <div>
                    <p className="report-social-card__kicker">{channel.label}</p>
                    <strong>{channel.detail}</strong>
                  </div>
                  <span className="badge badge--neutral">{channel.key.toUpperCase()}</span>
                </div>
                <div className="report-social-card__meta">
                  {channel.handle ? <span>@{channel.handle}</span> : null}
                  {channel.memberCount !== undefined ? <span>{channel.memberCount.toLocaleString('fr-FR')} membres</span> : null}
                  {channel.onlineCount !== undefined ? <span>{channel.onlineCount.toLocaleString('fr-FR')} en ligne</span> : null}
                  {channel.method ? <span>{channel.method}</span> : null}
                </div>
                {channel.sourceUrl ? (
                  <a href={channel.sourceUrl} target="_blank" rel="noreferrer">
                    Ouvrir la source
                  </a>
                ) : null}
              </article>
            ))
          ) : (
            <p className="report-section-card__copy">Aucun signal social structuré pour le moment.</p>
          )}
        </div>
        {analysis.socialOverview.notes.length > 0 ? (
          <div className="report-section-card__copy report-section-card__copy--wide">
            <SignalList items={analysis.socialOverview.notes} type="neutral" emptyMessage="Aucune note sociale additionnelle." />
          </div>
        ) : null}
      </section>

      <section className="card report-section-card">
        <div className="report-section-card__header">
          <div>
            <p className="eyebrow">Scores</p>
            <h2>F.I.R.E.S. détaillé</h2>
          </div>
        </div>
        <div className="report-fires-detail-grid">
          {analysis.fires.map((pillar) => {
            const verdictLevel = scoreToVerdict(pillar.score);
            const tone = verdictLevel === 'critical' ? 'critical' : verdictLevel === 'high' ? 'critical' : verdictLevel === 'moderate' ? 'warning' : 'safe';

            return (
              <article key={pillar.key} className="report-fire-card">
                <div className="report-fire-card__head">
                  <span className="report-fires-row__letter">{pillar.key.slice(0, 1).toUpperCase()}</span>
                  <div>
                    <strong>{pillar.label}</strong>
                    <p>{scoreVerdictLabelMap[verdictLevel]}</p>
                  </div>
                  <span className="report-fires-row__score">{pillar.score}</span>
                </div>
                <ScoreBar score={pillar.score} tone={tone} />
                <div className="report-fire-card__grid">
                  <div>
                    <p className="report-fire-card__kicker">Confirmé</p>
                    <SignalList
                      items={pillar.positives.map((item) => item.title)}
                      type="positive"
                      emptyMessage="Aucun signal positif dans ce pilier."
                    />
                  </div>
                  <div>
                    <p className="report-fire-card__kicker">Risques</p>
                    <SignalList
                      items={pillar.risks.map((item) => item.title)}
                      type="critical"
                      emptyMessage="Aucun risque critique dans ce pilier."
                    />
                  </div>
                  <div>
                    <p className="report-fire-card__kicker">Données manquantes</p>
                    <SignalList
                      items={pillar.missing.map((item) => item.title)}
                      type="neutral"
                      emptyMessage="Aucun manque majeur dans ce pilier."
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="card report-section-card">
        <div className="report-section-card__header">
          <div>
            <p className="eyebrow">Analyse approfondie</p>
            <h2>Preuves et signaux</h2>          </div>
        </div>

        <div className="report-evidence-grid">
          {evidences.map((evidence) => (
            <article key={evidence.id} className="report-evidence-card">
              <div className="report-evidence-card__top">
                <div>
                  <p className="report-evidence-card__kicker">{scoreCategoryLabels[evidence.category]}</p>
                  <h3>{evidence.title}</h3>
                </div>
                <span className={`badge badge--${severityToneMap[evidence.severity]}`}>{evidenceSeverityLabels[evidence.severity]}</span>              </div>
              <p className="report-evidence-card__detail">{evidence.detail}</p>
              <div className="report-evidence-card__footer">
                <span>Valeur brute : {evidence.rawValue ?? '—'}</span>
                <span>{evidence.sourceLabel ?? 'Moteur ScoRAGE'}</span>
                {evidence.sourceUrl ? (
                  <a href={evidence.sourceUrl} target="_blank" rel="noreferrer">
                    Ouvrir la source
                  </a>
                ) : (
                  <span>Signal interne</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="report-grid report-grid--meta">
        <article className="card report-section-card">
          <p className="eyebrow">Métadonnées</p>
          <div className="report-meta-list">
            <div>
              <span>ID rapport</span>
              <strong>{report.id}</strong>
            </div>
            <div>
              <span>ID projet</span>
              <strong>{project.id}</strong>
            </div>
            <div>
              <span>Statut</span>
              <strong>{status.label}</strong>
            </div>
            <div>
              <span>Généré le</span>
              <strong>{generatedLabel}</strong>
            </div>
          </div>
        </article>

        <article className="card report-section-card">
          <p className="eyebrow">Actions</p>
          <h2>Étapes suivantes</h2>
          <p className="report-section-card__copy">
            Exportez le rapport pour le partager, ou consultez votre tableau de bord.
          </p>
          <div className="btn-group report-section-card__actions">
            <a href={`/api/pdf/${report.id}`} className="btn-primary btn-primary--sm" download>
              Télécharger PDF
            </a>
            <Link href="/dashboard" className="btn-secondary btn-secondary--sm">
              Ouvrir le centre            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
