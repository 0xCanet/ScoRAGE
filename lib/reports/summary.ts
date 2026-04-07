import type { ReportBundle } from '@/types/report';
import type { VerdictLevel } from '@/types/score';
import { scoreToVerdict } from '@/types/score';
import type { Project } from '@/types/project';

import type { ReportSummary } from './store';

export const formatReportDate = (value?: string): string => {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
};

export const formatReportDay = (value?: string): string => {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
  }).format(new Date(value));
};

export const shortAddress = (value: string): string => `${value.slice(0, 6)}…${value.slice(-4)}`;

export const reportProjectLabel = (project: Pick<Project, 'chain' | 'projectName'>): string => {
  return project.projectName ?? `${project.chain.toUpperCase()} contract`;
};

export const summarizeReportBundle = (bundle: ReportBundle): ReportSummary => ({
  reportId: bundle.report.id,
  projectId: bundle.project.id,
  projectName: bundle.project.projectName,
  chain: bundle.project.chain,
  contractAddress: bundle.project.contractAddress,
  status: bundle.report.status,
  verdict: bundle.report.verdict ?? scoreToVerdict(bundle.report.score.total),
  score: bundle.report.score.total,
  generatedAt: bundle.report.generatedAt,
  createdAt: bundle.report.createdAt,
});

export const summarizeReportBundles = (bundles: ReportBundle[]): ReportSummary[] =>
  bundles.map((bundle) => summarizeReportBundle(bundle)).sort((left, right) => {
    const leftDate = new Date(left.generatedAt ?? left.createdAt).getTime();
    const rightDate = new Date(right.generatedAt ?? right.createdAt).getTime();
    return rightDate - leftDate;
  });

export const reportVerdictFromScore = (total: number): VerdictLevel => scoreToVerdict(total);
