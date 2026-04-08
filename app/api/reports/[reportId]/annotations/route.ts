import { NextResponse } from 'next/server';

import { appendReportAnnotation, getReportBundle } from '@/lib/reports/store';

const MAX_LENGTH = 1200;

export async function GET(_: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const bundle = await getReportBundle(reportId);

  if (!bundle) {
    return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
  }

  return NextResponse.json({ annotations: bundle.annotations ?? [] });
}

export async function POST(request: Request, { params }: { params: Promise<{ reportId: string }> }) {
  const { reportId } = await params;
  const bundle = await getReportBundle(reportId);

  if (!bundle) {
    return NextResponse.json({ error: 'Report not found.' }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const content = typeof body === 'object' && body !== null ? Reflect.get(body as Record<string, unknown>, 'content') : undefined;
  const trimmed = typeof content === 'string' ? content.trim() : '';

  if (!trimmed) {
    return NextResponse.json({ error: 'Content is required.' }, { status: 400 });
  }

  if (trimmed.length > MAX_LENGTH) {
    return NextResponse.json({ error: `Content must be at most ${MAX_LENGTH} characters.` }, { status: 400 });
  }

  const annotation = await appendReportAnnotation(reportId, trimmed);

  if (!annotation) {
    return NextResponse.json({ error: 'Unable to add information to this report.' }, { status: 500 });
  }

  return NextResponse.json({ annotation }, { status: 201 });
}
