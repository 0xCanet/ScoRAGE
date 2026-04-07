import { buildPdfResponse } from '@/lib/reports/pdf';
import { getReportBundle } from '@/lib/reports/store';

export async function GET(_: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const bundle = await getReportBundle(reportId);

  if (!bundle) {
    return new Response('Report not found.', { status: 404 });
  }

  return buildPdfResponse(bundle);
}
