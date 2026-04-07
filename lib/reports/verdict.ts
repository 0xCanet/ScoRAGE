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
    description: "Le profil de risque est élevé. Considérez cet actif comme non fiable tant que le contrat et le modèle de supply n'ont pas été vérifiés indépendamment.",
  },
  high: {
    label: 'Élevé',
    tone: 'high',
    badgeLabel: 'Risque élevé',
    description: 'Plusieurs signaux faibles ont été identifiés. Une revue manuelle est fortement recommandée avant toute prise de position.',
  },
  moderate: {
    label: 'Modéré',
    tone: 'moderate',
    badgeLabel: 'Risque modéré',
    description: "Le profil est mixte. Certains contrôles sont acceptables, mais le contrat mérite un examen approfondi.",
  },
  low: {
    label: 'Faible',
    tone: 'low',
    badgeLabel: 'Risque faible',
    description: "L'analyse actuelle montre un profil comparativement plus sain, mais chaque token doit être vérifié avant achat.",
  },
};

const statusMetaMap: Record<ReportStatus, ReportStatusMeta> = {
  processing: {
    status: 'processing',
    label: 'En cours',
    tone: 'neutral',
  },
  completed: {
    status: 'completed',
    label: 'Terminé',
    tone: 'safe',
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
