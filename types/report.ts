import type { Evidence } from '@/types/evidence';
import type { Project } from '@/types/project';
import type { ScoreBreakdown, VerdictLevel } from '@/types/score';

export type ReportStatus = 'processing' | 'completed' | 'failed';

export type ReportRequestInput = {
  chain: Project['chain'];
  contractAddress: string;
  projectName?: string;
  websiteUrl?: string;
  xUrl?: string;
  telegramUrl?: string;
  notes?: string;
  email?: string;
};

export type ReportRequest = {
  id: string;
  projectId: string;
  reportId: string;
  payload: ReportRequestInput;
  createdAt: string;
};

export type Report = {
  id: string;
  projectId: string;
  status: ReportStatus;
  verdict: VerdictLevel;
  summary: string;
  score: ScoreBreakdown;
  positives: string[];
  redFlags: string[];
  methodologyVersion: string;
  generatedAt?: string;
  createdAt: string;
};

export type ReportBundle = {
  project: Project;
  report: Report;
  evidences: Evidence[];
  request?: ReportRequest;
};