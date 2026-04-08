import { randomUUID } from 'node:crypto';

import type { Evidence } from '@/types/evidence';
import { evidenceCategoryLabels } from '@/types/evidence';
import type { Project } from '@/types/project';
import { chainLabels } from '@/types/project';
import type { Report, ReportBundle, ReportRequest, ReportRequestInput } from '@/types/report';
import { scoreToVerdict, type ScoreBreakdown } from '@/types/score';

const methodologyVersion = 'fires-v1';

const clampScore = (value: number): number => Math.max(0, Math.min(100, Math.round(value)));

const hashString = (value: string): number => {
  let hash = 0;

  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash;
};

const shortAddress = (value: string): string => `${value.slice(0, 6)}…${value.slice(-4)}`;

const buildBaseScore = (chain: Project['chain'], seed: number, metadataBonus: number): number => {
  const chainBase: Record<Project['chain'], number> = {
    solana: 35,
    bsc: 28,
    base: 42,
    ethereum: 48,
  };

  const jitter = (seed % 13) - 6;
  return clampScore(chainBase[chain] + metadataBonus + jitter);
};

const buildScoreBreakdown = (total: number, seed: number): ScoreBreakdown => {
  return {
    financials: clampScore(total - 8 + (seed % 7) - 3),
    integrity: clampScore(total - 10 + (seed % 5)),
    reputation: clampScore(total - 5 + (seed % 9) - 4),
    ecosystem: clampScore(total + 5 - (seed % 6)),
    security: clampScore(total - 12 + (seed % 11) - 5),
    total,
  };
};

const scoreSeverity = (score: number): 'positive' | 'warning' | 'critical' => {
  if (score <= 25) {
    return 'critical';
  }

  if (score <= 55) {
    return 'warning';
  }

  return 'positive';
};

const evidenceDetail = (category: string, chain: Project['chain'], address: string, score: number): string => {
  const label = chainLabels[chain];

  if (score <= 25) {
    return `${label} : signal critique détecté pour ${shortAddress(address)}. La vérification manuelle est prioritaire.`;
  }

  if (score <= 55) {
    return `${label} : profil mitigé pour ${shortAddress(address)}. Des vérifications complémentaires sont nécessaires.`;
  }

  return `${label} : les signaux disponibles restent corrects pour ${shortAddress(address)} à ce stade.`;};

export function buildMockReportBundle({
  request,
  projectId,
  reportId,
  requestId,
  createdAt,
}: {
  request: ReportRequestInput;
  projectId: string;
  reportId: string;
  requestId: string;
  createdAt: string;
}): ReportBundle {
  const seed = hashString(`${request.chain}:${request.contractAddress}:${request.projectName ?? ''}:${request.email ?? ''}`);
  const metadataBonus = [request.projectName, request.websiteUrl, request.xUrl, request.telegramUrl, request.notes, request.email]
    .filter(Boolean)
    .length * 2;
  const total = buildBaseScore(request.chain, seed, metadataBonus);
  const score = buildScoreBreakdown(total, seed);

  const project: Project = {
    id: projectId,
    chain: request.chain,
    contractAddress: request.contractAddress,
    projectName: request.projectName,
    websiteUrl: request.websiteUrl,
    xUrl: request.xUrl,
    telegramUrl: request.telegramUrl,
    createdAt,
  };

  const verdict = scoreToVerdict(score.total);
  const projectLabel = request.projectName ?? `Contrat ${chainLabels[request.chain]}`;

  const evidenceScaffold = [
    ['financials', score.financials],
    ['integrity', score.integrity],
    ['reputation', score.reputation],
    ['ecosystem', score.ecosystem],
    ['security', score.security],
  ] as const;

  const evidences: Evidence[] = evidenceScaffold.map(([category, categoryScore], index) => {
    const severity = scoreSeverity(categoryScore);
    const label = evidenceCategoryLabels[category];
    const titleMap: Record<'critical' | 'warning' | 'positive', string> = {
      critical: `${label} à risque`,
      warning: `${label} à surveiller`,
      positive: `${label} rassurant`,    };

    return {
      id: randomUUID(),
      reportId,
      category,
      title: titleMap[severity],
      detail: evidenceDetail(label, request.chain, request.contractAddress, categoryScore),
      severity,
      sourceLabel: index === 0 ? 'Moteur ScoRAGE' : undefined,
      sourceUrl: request.websiteUrl ?? undefined,
      rawValue: String(categoryScore),
      createdAt,
    };
  });

  const positives = [
    request.websiteUrl ? 'Site officiel fourni pour vérifier la présence publique du projet.' : 'Aucun site officiel fourni à ce stade.',
    request.xUrl ? 'Compte X fourni pour enrichir la lecture réputationnelle.' : 'Aucun compte X fourni pour la revue réputationnelle.',
    request.telegramUrl ? 'Lien Telegram disponible pour vérifier la communauté.' : 'Aucun lien Telegram fourni.',  ].filter((value): value is string => Boolean(value));

  const redFlags = evidences
    .filter((evidence) => evidence.severity !== 'positive')
    .map((evidence) => evidence.title);

  const summary =
    verdict === 'critical'
      ? `${projectLabel} sur ${chainLabels[request.chain]} présente un profil de risque critique. Le token doit être considéré comme non fiable tant que le contrat, le supply et les privilèges owner ne sont pas vérifiés.`
      : verdict === 'high'
        ? `${projectLabel} sur ${chainLabels[request.chain]} présente un risque élevé. Plusieurs signaux faibles appellent une revue manuelle avant toute décision.`
        : verdict === 'moderate'
          ? `${projectLabel} sur ${chainLabels[request.chain]} reste mitigé. Certains signaux sont corrects, mais le contrat mérite encore une analyse plus poussée.`
          : `${projectLabel} sur ${chainLabels[request.chain]} ressort comme relativement plus sain sur ce premier passage, mais une vérification reste nécessaire avant achat.`;
  const report: Report = {
    id: reportId,
    projectId,
    status: 'completed',
    verdict,
    summary,
    score,
    positives,
    redFlags,
    methodologyVersion,
    generatedAt: createdAt,
    createdAt,
  };

  const requestRecord: ReportRequest = {
    id: requestId,
    projectId,
    reportId,
    payload: request,
    createdAt,
  };

  return {
    project,
    report,
    evidences,
    request: requestRecord,
  };
}

export { methodologyVersion };