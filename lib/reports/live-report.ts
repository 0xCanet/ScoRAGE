import type { ReportBundle, ReportRequestInput } from '@/types/report';

import { buildAnalyzedReportBundle } from '@/lib/analysis/engine';

export async function buildLiveReportBundle({
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
}): Promise<ReportBundle> {
  return buildAnalyzedReportBundle({ request, projectId, reportId, requestId, createdAt });
}
