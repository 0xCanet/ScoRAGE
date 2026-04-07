import { NextResponse } from 'next/server';

import { createReportFromRequest } from '@/lib/reports/store';
import { validateReportRequest } from '@/lib/validation/report-request';

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload.' },
      {
        status: 400,
      },
    );
  }

  const validation = validateReportRequest(payload);

  if (!validation.success) {
    return NextResponse.json(
      {
        error: 'Validation failed.',
        errors: validation.errors,
      },
      { status: 400 },
    );
  }

  try {
    const bundle = await createReportFromRequest(validation.data);

    return NextResponse.json(
      {
        reportId: bundle.report.id,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Report creation failed.';

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    );
  }
}