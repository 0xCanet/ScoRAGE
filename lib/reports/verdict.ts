import type { ReportStatus } from '@/types/report';
import type { VerdictLevel } from '@/types/score';

export type VerdictTone = 'critical' | 'high' | 'moderate' | 'low';

export type VerdictMeta = {
  level: VerdictLevel;
  label: string;
  tone: VerdictTone;
  badgeLabel: string;
  description: string;
};

export type ReportStatusMeta = {
  status: ReportStatus;
  label: string;
  tone: 'neutral' | 'safe' | 'critical';
};

const verdictMetaMap: Record<VerdictLevel, Omit<VerdictMeta, 'level'>> = {
  critical: {
    label: 'Critical',
    tone: 'critical',
    badgeLabel: 'Critical risk',
    description: 'The risk profile is acute. Treat the asset as untrusted until the contract and supply model are independently verified.',
  },
  high: {
    label: 'High',
    tone: 'high',
    badgeLabel: 'High risk',
    description: 'Several weak signals were found. A manual review is strongly recommended before any position is taken.',
  },
  moderate: {
    label: 'Moderate',
    tone: 'moderate',
    badgeLabel: 'Moderate risk',
    description: 'The profile is mixed. Some checks are acceptable, but the contract still deserves a deeper look.',
  },
  low: {
    label: 'Low',
    tone: 'low',
    badgeLabel: 'Lower risk',
    description: 'The current pass looks comparatively healthier, though every token should still be validated before purchase.',
  },
};

const statusMetaMap: Record<ReportStatus, ReportStatusMeta> = {
  processing: {
    status: 'processing',
    label: 'Processing',
    tone: 'neutral',
  },
  completed: {
    status: 'completed',
    label: 'Completed',
    tone: 'safe',
  },
  failed: {
    status: 'failed',
    label: 'Failed',
    tone: 'critical',
  },
};

export function getVerdictMeta(verdict: VerdictLevel): VerdictMeta {
  return {
    level: verdict,
    ...verdictMetaMap[verdict],
  };
}

export function getReportStatusMeta(status: ReportStatus): ReportStatusMeta {
  return statusMetaMap[status];
}

export function getVerdictBadgeTone(verdict: VerdictLevel): 'critical' | 'high' | 'neutral' | 'safe' {
  const tone = getVerdictMeta(verdict).tone;

  if (tone === 'moderate') {
    return 'neutral';
  }

  if (tone === 'low') {
    return 'safe';
  }

  return tone;
}

export function getStatusBadgeTone(status: ReportStatus): 'critical' | 'neutral' | 'safe' {
  return getReportStatusMeta(status).tone;
}
