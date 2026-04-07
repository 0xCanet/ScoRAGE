export type ScoreBreakdown = {
  financials: number;
  integrity: number;
  reputation: number;
  ecosystem: number;
  security: number;
  total: number;
};

export type ScoreCategory = Exclude<keyof ScoreBreakdown, 'total'>;

export type VerdictLevel = 'low' | 'moderate' | 'high' | 'critical';

export const scoreCategoryLabels: Record<ScoreCategory, string> = {
  financials: 'Financials',
  integrity: 'Integrity',
  reputation: 'Reputation',
  ecosystem: 'Ecosystem',
  security: 'Security',
};

export const scoreBands: Array<{ min: number; label: VerdictLevel }> = [
  { min: 0, label: 'critical' },
  { min: 26, label: 'high' },
  { min: 51, label: 'moderate' },
  { min: 76, label: 'low' },
];

export function scoreToVerdict(total: number): VerdictLevel {
  if (total <= 25) {
    return 'critical';
  }

  if (total <= 50) {
    return 'high';
  }

  if (total <= 75) {
    return 'moderate';
  }

  return 'low';
}