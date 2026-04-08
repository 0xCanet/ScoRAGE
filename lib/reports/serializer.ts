import type { Evidence, EvidenceCategory, EvidenceSeverity } from '@/types/evidence';
import type { Project, Chain } from '@/types/project';
import type { Report, ReportAnnotation, ReportRequest, ReportRequestInput } from '@/types/report';
import type { ScoreBreakdown, VerdictLevel } from '@/types/score';

export type ProjectRow = {
  id: string;
  chain: Chain;
  contract_address: string;
  project_name: string | null;
  website_url: string | null;
  x_url: string | null;
  telegram_url: string | null;
  created_by_user_id: string | null;
  created_at: string;
};

export type ReportRow = {
  id: string;
  project_id: string;
  status: Report['status'];
  verdict: VerdictLevel | null;
  summary: string | null;
  score_total: number | null;
  score_financials: number | null;
  score_integrity: number | null;
  score_reputation: number | null;
  score_ecosystem: number | null;
  score_security: number | null;
  methodology_version: string;
  generated_at: string | null;
  created_at: string;
};

export type EvidenceRow = {
  id: string;
  report_id: string;
  category: EvidenceCategory;
  severity: EvidenceSeverity;
  title: string;
  detail: string;
  source_label: string | null;
  source_url: string | null;
  raw_value: string | null;
  created_at: string;
};

export type ReportRequestRow = {
  id: string;
  project_id: string;
  report_id: string;
  request_payload: ReportRequestInput;
  created_at: string;
};

export type ReportAnnotationRow = {
  id: string;
  report_id: string;
  content: string;
  created_at: string;
};

export const toProjectRow = (project: Project): ProjectRow => ({
  id: project.id,
  chain: project.chain,
  contract_address: project.contractAddress,
  project_name: project.projectName ?? null,
  website_url: project.websiteUrl ?? null,
  x_url: project.xUrl ?? null,
  telegram_url: project.telegramUrl ?? null,
  created_by_user_id: project.createdByUserId ?? null,
  created_at: project.createdAt,
});

export const fromProjectRow = (row: ProjectRow): Project => ({
  id: row.id,
  chain: row.chain,
  contractAddress: row.contract_address,
  projectName: row.project_name ?? undefined,
  websiteUrl: row.website_url ?? undefined,
  xUrl: row.x_url ?? undefined,
  telegramUrl: row.telegram_url ?? undefined,
  createdByUserId: row.created_by_user_id ?? undefined,
  createdAt: row.created_at,
});

export const toReportRow = (report: Report): ReportRow => ({
  id: report.id,
  project_id: report.projectId,
  status: report.status,
  verdict: report.verdict,
  summary: report.summary,
  score_total: report.score.total,
  score_financials: report.score.financials,
  score_integrity: report.score.integrity,
  score_reputation: report.score.reputation,
  score_ecosystem: report.score.ecosystem,
  score_security: report.score.security,
  methodology_version: report.methodologyVersion,
  generated_at: report.generatedAt ?? null,
  created_at: report.createdAt,
});

export const fromReportRow = (row: ReportRow): Report => ({
  id: row.id,
  projectId: row.project_id,
  status: row.status,
  verdict: (row.verdict ?? 'critical') as VerdictLevel,
  summary: row.summary ?? '',
  score: {
    financials: row.score_financials ?? 0,
    integrity: row.score_integrity ?? 0,
    reputation: row.score_reputation ?? 0,
    ecosystem: row.score_ecosystem ?? 0,
    security: row.score_security ?? 0,
    total: row.score_total ?? 0,
  } satisfies ScoreBreakdown,
  positives: [],
  redFlags: [],
  methodologyVersion: row.methodology_version,
  generatedAt: row.generated_at ?? undefined,
  createdAt: row.created_at,
});

export const toEvidenceRow = (evidence: Evidence): EvidenceRow => ({
  id: evidence.id,
  report_id: evidence.reportId,
  category: evidence.category,
  severity: evidence.severity,
  title: evidence.title,
  detail: evidence.detail,
  source_label: evidence.sourceLabel ?? null,
  source_url: evidence.sourceUrl ?? null,
  raw_value: evidence.rawValue ?? null,
  created_at: evidence.createdAt,
});

export const fromEvidenceRow = (row: EvidenceRow): Evidence => ({
  id: row.id,
  reportId: row.report_id,
  category: row.category,
  severity: row.severity,
  title: row.title,
  detail: row.detail,
  sourceLabel: row.source_label ?? undefined,
  sourceUrl: row.source_url ?? undefined,
  rawValue: row.raw_value ?? undefined,
  createdAt: row.created_at,
});

export const toReportRequestRow = (request: ReportRequest): ReportRequestRow => ({
  id: request.id,
  project_id: request.projectId,
  report_id: request.reportId,
  request_payload: request.payload,
  created_at: request.createdAt,
});

export const fromReportRequestRow = (row: ReportRequestRow): ReportRequest => ({
  id: row.id,
  projectId: row.project_id,
  reportId: row.report_id,
  payload: row.request_payload,
  createdAt: row.created_at,
});

export const toReportAnnotationRow = (annotation: ReportAnnotation): ReportAnnotationRow => ({
  id: annotation.id,
  report_id: annotation.reportId,
  content: annotation.content,
  created_at: annotation.createdAt,
});

export const fromReportAnnotationRow = (row: ReportAnnotationRow): ReportAnnotation => ({
  id: row.id,
  reportId: row.report_id,
  content: row.content,
  createdAt: row.created_at,
});