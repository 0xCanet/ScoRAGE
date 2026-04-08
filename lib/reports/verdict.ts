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
    label: 'Critique',
    tone: 'critical',
    badgeLabel: 'Risque critique',
    description: 'Le profil de risque est critique. Considère cet actif comme non fiable tant que le contrat, le supply et les privilèges owner ne sont pas vérifiés.',  },
  high: {
    label: 'Élevé',
    tone: 'high',
    badgeLabel: 'Risque élevé',
    description: 'Plusieurs signaux faibles ont été détectés. Une revue manuelle sérieuse est recommandée avant toute prise de position.',  },
  moderate: {
    label: 'Modéré',
    tone: 'moderate',
    badgeLabel: 'Risque modéré',
    description: 'Le profil est mitigé. Certains signaux sont corrects, mais le contrat mérite encore une revue plus approfondie.',  },
  low: {
    label: 'Faible',
    tone: 'low',
    badgeLabel: 'Risque contenu',
    description: 'Le premier passage est plutôt rassurant, mais tout token doit encore être validé avant achat.',  },
};

const statusMetaMap: Record<ReportStatus, ReportStatusMeta> = {
  processing: {
    status: 'processing',
    label: 'En cours',
    tone: 'neutral',
  },
  completed: {
    status: 'completed',
    label: 'Terminée',    tone: 'safe',
  },
  failed: {
    status: 'failed',
    label: 'Échec',
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
