import { randomUUID } from 'node:crypto';

import type { Evidence } from '@/types/evidence';
import { evidenceCategoryLabels } from '@/types/evidence';
import type { Project } from '@/types/project';
import { chainLabels } from '@/types/project';
import type { Report, ReportBundle, ReportRequest, ReportRequestInput } from '@/types/report';
import { scoreToVerdict, type ScoreBreakdown } from '@/types/score';

const methodologyVersion = 'fires-mock-v1';

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
    return `${label}: ${category} signal is materially weak for ${shortAddress(address)}.`;
  }

  if (score <= 55) {
    return `${label}: ${category} profile is mixed for ${shortAddress(address)} and needs closer review.`;
  }

  return `${label}: ${category} checks are currently acceptable for ${shortAddress(address)}.`;
};

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
  const projectLabel = request.projectName ?? `${chainLabels[request.chain]} contract`;

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
      critical: `${label} red flag`,
      warning: `${label} caution`,
      positive: `${label} check passed`,
    };

    return {
      id: randomUUID(),
      reportId,
      category,
      title: titleMap[severity],
      detail: evidenceDetail(label, request.chain, request.contractAddress, categoryScore),
      severity,
      sourceLabel: index === 0 ? 'ScoRAGE mock engine' : undefined,
      sourceUrl: request.websiteUrl ?? undefined,
      rawValue: String(categoryScore),
      createdAt,
    };
  });

  const positives = [
    request.websiteUrl ? 'Official website attached to the request.' : 'No website URL supplied, but the contract request is complete.',
    request.xUrl ? 'Public X profile supplied for reputation review.' : 'Request can be analysed without social links.',
    request.telegramUrl ? 'Telegram community URL available.' : 'No Telegram URL attached.',
  ].filter((value): value is string => Boolean(value));

  const redFlags = evidences
    .filter((evidence) => evidence.severity !== 'positive')
    .map((evidence) => evidence.title);

  const summary =
    verdict === 'critical'
      ? `${projectLabel} on ${chainLabels[request.chain]} shows a critical risk profile. Treat the token as untrusted until the contract, supply and ownership model are independently verified.`
      : verdict === 'high'
        ? `${projectLabel} on ${chainLabels[request.chain]} is high risk. The mock F.I.R.E.S. engine found several weak signals that deserve manual review.`
        : verdict === 'moderate'
          ? `${projectLabel} on ${chainLabels[request.chain]} is mixed-risk. Some signals are acceptable, but the contract still needs a deeper look.`
          : `${projectLabel} on ${chainLabels[request.chain]} looks comparatively healthier in this mock pass, though all tokens should still be verified before purchase.`;

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