export type EvidenceSeverity = 'positive' | 'warning' | 'critical';

export type EvidenceCategory = 'financials' | 'integrity' | 'reputation' | 'ecosystem' | 'security';

export type EvidenceSignalType = 'positive' | 'risk' | 'missing_data' | 'incompatible_object' | 'provider_unavailable';

export type Evidence = {
  id: string;
  reportId: string;
  category: EvidenceCategory;
  title: string;
  detail: string;
  severity: EvidenceSeverity;
  signalType?: EvidenceSignalType;
  impact?: number;
  sourceLabel?: string;
  sourceUrl?: string;
  rawValue?: string;
  createdAt: string;
};

export const evidenceCategoryLabels: Record<EvidenceCategory, string> = {
  financials: 'Financials',
  integrity: 'Integrity',
  reputation: 'Reputation',
  ecosystem: 'Ecosystem',
  security: 'Security',
};

export const evidenceSeverityLabels: Record<EvidenceSeverity, string> = {
  positive: 'Positif',
  warning: 'Alerte',  critical: 'Critique',
};