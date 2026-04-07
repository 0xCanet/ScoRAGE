import { randomUUID } from 'node:crypto';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { validateReportRequest } from '@/lib/validation/report-request';
import type { Project } from '@/types/project';
import type { ReportBundle, ReportRequestInput } from '@/types/report';
import { scoreToVerdict } from '@/types/score';

import { buildMockReportBundle } from './mock-report';
import { fromEvidenceRow, fromProjectRow, fromReportRequestRow, fromReportRow, toEvidenceRow, toProjectRow, toReportRequestRow, toReportRow, type EvidenceRow, type ProjectRow, type ReportRequestRow, type ReportRow } from './serializer';
import { summarizeReportBundles } from './summary';

type CachedBundle = ReportBundle;

export type ReportSummary = {
  reportId: string;
  projectId: string;
  projectName?: string;
  chain: Project['chain'];
  contractAddress: string;
  status: CachedBundle['report']['status'];
  verdict: CachedBundle['report']['verdict'];
  score: number;
  generatedAt?: string;
  createdAt: string;
};

declare global {
  var __scorageReportCache: Map<string, CachedBundle> | undefined;
  var __scorageSeedReportsInitialized: boolean | undefined;
}

const reportCache = globalThis.__scorageReportCache ?? new Map<string, CachedBundle>();

globalThis.__scorageReportCache = reportCache;

const seedSpecs: Array<{ projectId: string; reportId: string; requestId: string; request: ReportRequestInput; createdAt: string }> = [
  {
    projectId: 'seed-project-nightfox',
    reportId: 'seed-report-nightfox',
    requestId: 'seed-request-nightfox',
    createdAt: '2026-04-06T19:12:00.000Z',
    request: {
      chain: 'base',
      contractAddress: '0x7f2e52d9c2a1b4c8d1e0f9a7b6c5d4e3f2a1b0c9',
      projectName: 'Nightfox',
      websiteUrl: 'https://nightfox.example',
      xUrl: 'https://x.com/nightfox',
      telegramUrl: 'https://t.me/nightfox',
      notes: 'Seeded dashboard sample.',
    },
  },
  {
    projectId: 'seed-project-pulse',
    reportId: 'seed-report-pulse',
    requestId: 'seed-request-pulse',
    createdAt: '2026-04-05T14:08:00.000Z',
    request: {
      chain: 'solana',
      contractAddress: 'PuLsE5x7Y7Y7Y7Y7Y7Y7Y7Y7Y7Y7Y7Y7Y7Y7Y7Y7',
      projectName: 'Pulse Router',
      websiteUrl: 'https://pulserouter.example',
      xUrl: 'https://x.com/pulserouter',
      notes: 'Seeded dashboard sample.',
    },
  },
  {
    projectId: 'seed-project-iron',
    reportId: 'seed-report-iron',
    requestId: 'seed-request-iron',
    createdAt: '2026-04-03T09:40:00.000Z',
    request: {
      chain: 'ethereum',
      contractAddress: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9',
      projectName: 'Iron Finch',
      websiteUrl: 'https://ironfinch.example',
      xUrl: 'https://x.com/ironfinch',
      telegramUrl: 'https://t.me/ironfinch',
      notes: 'Seeded dashboard sample.',
    },
  },
];

const cacheBundle = (bundle: CachedBundle): void => {
  reportCache.set(bundle.report.id, bundle);
};

const seedReportBundles = (): CachedBundle[] => {
  if (globalThis.__scorageSeedReportsInitialized) {
    return Array.from(reportCache.values()).filter((bundle) => bundle.report.id.startsWith('seed-report-'));
  }

  const bundles = seedSpecs.map((spec) => buildMockReportBundle({
    request: spec.request,
    projectId: spec.projectId,
    reportId: spec.reportId,
    requestId: spec.requestId,
    createdAt: spec.createdAt,
  }));

  bundles.forEach(cacheBundle);
  globalThis.__scorageSeedReportsInitialized = true;
  return bundles;
};


const persistBundleToSupabase = async (bundle: CachedBundle): Promise<boolean> => {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return false;
  }

  const request = bundle.request;

  try {
    const { error: projectError } = await supabase.from('projects').upsert(toProjectRow(bundle.project));

    if (projectError) {
      throw projectError;
    }

    const { error: reportError } = await supabase.from('reports').upsert(toReportRow(bundle.report));

    if (reportError) {
      throw reportError;
    }

    if (request) {
      const { error: requestError } = await supabase.from('report_requests').upsert(toReportRequestRow(request));

      if (requestError) {
        throw requestError;
      }
    }

    const evidenceRows = bundle.evidences.map(toEvidenceRow);
    if (evidenceRows.length > 0) {
      const { error: evidenceError } = await supabase.from('evidences').upsert(evidenceRows);

      if (evidenceError) {
        throw evidenceError;
      }
    }

    return true;
  } catch {
    return false;
  }
};

const readBundleFromSupabase = async (reportId: string): Promise<CachedBundle | null> => {
  const supabase = createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const { data: reportRow } = await supabase.from('reports').select('*').eq('id', reportId).maybeSingle<ReportRow>();

  if (!reportRow) {
    return null;
  }

  const { data: projectRow } = await supabase.from('projects').select('*').eq('id', reportRow.project_id).maybeSingle<ProjectRow>();

  if (!projectRow) {
    return null;
  }

  const { data: evidenceRows } = await supabase.from('evidences').select('*').eq('report_id', reportId);
  const { data: requestRow } = await supabase
    .from('report_requests')
    .select('*')
    .eq('report_id', reportId)
    .maybeSingle<ReportRequestRow>();

  const evidences = ((evidenceRows ?? []) as EvidenceRow[]).map(fromEvidenceRow);
  const request = requestRow ? fromReportRequestRow(requestRow) : undefined;
  const positives = [
    request?.payload.websiteUrl ? 'Official website attached to the request.' : undefined,
    request?.payload.xUrl ? 'Public X profile supplied for reputation review.' : undefined,
    request?.payload.telegramUrl ? 'Telegram community URL available.' : undefined,
    ...evidences.filter((evidence) => evidence.severity === 'positive').map((evidence) => evidence.title),
  ].filter((value): value is string => Boolean(value));

  const redFlags = evidences.filter((evidence) => evidence.severity !== 'positive').map((evidence) => evidence.title);

  const bundle: CachedBundle = {
    project: fromProjectRow(projectRow),
    report: {
      ...fromReportRow(reportRow),
      positives,
      redFlags,
    },
    evidences,
    request,
  };

  cacheBundle(bundle);
  return bundle;
};

export async function createReportFromRequest(input: ReportRequestInput): Promise<CachedBundle> {
  const validation = validateReportRequest(input);

  if (!validation.success) {
    throw new Error(validation.errors.map((error) => `${error.field}: ${error.message}`).join('; '));
  }

  const now = new Date().toISOString();
  const projectId = randomUUID();
  const reportId = randomUUID();
  const requestId = randomUUID();

  const bundle = buildMockReportBundle({
    request: validation.data,
    projectId,
    reportId,
    requestId,
    createdAt: now,
  });

  cacheBundle(bundle);
  await persistBundleToSupabase(bundle);

  return bundle;
}

export async function getReportBundle(reportId: string): Promise<CachedBundle | null> {
  const cached = reportCache.get(reportId);
  if (cached) {
    return cached;
  }

  return readBundleFromSupabase(reportId);
}

export async function listReportSummaries(): Promise<ReportSummary[]> {
  const cached = Array.from(reportCache.values());

  if (cached.length > 0) {
    return summarizeReportBundles(cached);
  }

  const supabase = createSupabaseServerClient();

  if (supabase) {
    try {
      const { data: reportRows } = await supabase.from('reports').select('*').order('created_at', { ascending: false }).limit(24);
      const rows = (reportRows ?? []) as ReportRow[];

      if (rows.length > 0) {
        const projectIds = Array.from(new Set(rows.map((row) => row.project_id)));
        const { data: projectRows } = await supabase.from('projects').select('*').in('id', projectIds);
        const projectMap = new Map(((projectRows ?? []) as ProjectRow[]).map((row) => [row.id, row] as const));

        const summaries = rows
          .map((row) => {
            const projectRow = projectMap.get(row.project_id);
            if (!projectRow) {
              return null;
            }

            return {
              reportId: row.id,
              projectId: row.project_id,
              projectName: projectRow.project_name ?? undefined,
              chain: projectRow.chain,
              contractAddress: projectRow.contract_address,
              status: row.status,
              verdict: row.verdict ?? scoreToVerdict(row.score_total ?? 0),
              score: row.score_total ?? 0,
              generatedAt: row.generated_at ?? undefined,
              createdAt: row.created_at,
            } satisfies ReportSummary;
          })
          .filter(Boolean) as ReportSummary[];

        if (summaries.length > 0) {
          return summaries;
        }
      }
    } catch {
      // ignore and use fallback below
    }
  }

  return summarizeReportBundles(seedReportBundles());
}

export async function createReportRequest(input: ReportRequestInput): Promise<{ reportId: string }> {
  const bundle = await createReportFromRequest(input);
  return { reportId: bundle.report.id };
}