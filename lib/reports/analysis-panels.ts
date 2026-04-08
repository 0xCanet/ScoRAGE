import type { Evidence, EvidenceCategory } from '@/types/evidence';
import type { ReportBundle } from '@/types/report';
import { scoreCategoryLabels } from '@/types/score';

const fireCategories = ['financials', 'integrity', 'reputation', 'ecosystem', 'security'] as const;

type JsonLike = Record<string, unknown> | unknown[];

export type ContractFactLine = {
  label: string;
  value: string;
  sourceLabel?: string;
  sourceUrl?: string;
};

export type MarketPairLine = {
  chainId: string;
  dexId?: string;
  pairAddress: string;
  baseLabel: string;
  quoteLabel: string;
  liquidityUsd?: number;
  volume24hUsd?: number;
  marketCap?: number;
  fdv?: number;
  pairAgeDays?: number;
  priceChange24h?: number;
  txns24hBuys?: number;
  txns24hSells?: number;
  sourceUrl?: string;
};

export type FiresPillarDigest = {
  key: (typeof fireCategories)[number];
  label: string;
  score: number;
  positives: Evidence[];
  risks: Evidence[];
  missing: Evidence[];
};

export type SocialChannelLine = {
  key: 'x' | 'telegram' | 'discord' | 'coherence';
  label: string;
  detail: string;
  sourceUrl?: string;
  memberCount?: number;
  onlineCount?: number;
  handle?: string;
  method?: string;
};

export type SocialOverview = {
  channels: SocialChannelLine[];
  notes: string[];
};

export type AnalysisPanels = {
  compatibilityLabel: string;
  compatibilityDetail: string;
  contractFacts: ContractFactLine[];
  marketNotes: string[];
  marketPairs: MarketPairLine[];
  bestMarketPair?: MarketPairLine;
  socialOverview: SocialOverview;
  fires: FiresPillarDigest[];
};

const safeParseJson = (value?: string): JsonLike | undefined => {
  if (!value) {
    return undefined;
  }

  try {
    return JSON.parse(value) as JsonLike;
  } catch {
    return undefined;
  }
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const toText = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === 'boolean') {
    return value ? 'Oui' : 'Non';
  }

  return undefined;
};

const formatNumber = (value?: number): string => {
  if (value === undefined || !Number.isFinite(value)) {
    return '—';
  }

  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 2,
  }).format(value);
};

const formatCurrency = (value?: number): string => {
  if (value === undefined || !Number.isFinite(value)) {
    return '—';
  }

  return `${Math.round(value).toLocaleString('fr-FR')} USD`;
};

const formatAddress = (value?: string): string => {
  if (!value) {
    return '—';
  }

  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 6)}…${value.slice(-4)}`;
};

const normalizeMarketPair = (pair: Record<string, unknown>): MarketPairLine | null => {
  const pairAddress = toText(pair.pairAddress);
  const chainId = toText(pair.chainId);
  if (!pairAddress || !chainId) {
    return null;
  }

  const base = pair.baseToken as Record<string, unknown> | undefined;
  const quote = pair.quoteToken as Record<string, unknown> | undefined;

  return {
    chainId,
    dexId: toText(pair.dexId),
    pairAddress,
    baseLabel: [toText(base?.symbol), toText(base?.name)].filter(Boolean).join(' • ') || 'Base',
    quoteLabel: [toText(quote?.symbol), toText(quote?.name)].filter(Boolean).join(' • ') || 'Quote',
    liquidityUsd: toNumber((pair.liquidity as Record<string, unknown> | undefined)?.usd),
    volume24hUsd: toNumber((pair.volume as Record<string, unknown> | undefined)?.h24),
    marketCap: toNumber(pair.marketCap),
    fdv: toNumber(pair.fdv),
    pairAgeDays: toNumber(pair.pairAgeDays),
    priceChange24h: toNumber((pair.priceChange as Record<string, unknown> | undefined)?.h24),
    txns24hBuys: toNumber(((pair.txns as Record<string, unknown> | undefined)?.h24 as Record<string, unknown> | undefined)?.buys),
    txns24hSells: toNumber(((pair.txns as Record<string, unknown> | undefined)?.h24 as Record<string, unknown> | undefined)?.sells),
    sourceUrl: toText(pair.url),
  };
};

const parseMarketPairs = (evidences: Evidence[]): MarketPairLine[] => {
  const marketEvidence = evidences.find((evidence) => evidence.title === 'Marché : paires détectées');
  const parsed = safeParseJson(marketEvidence?.rawValue);
  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .map((value) => (value && typeof value === 'object' ? normalizeMarketPair(value as Record<string, unknown>) : null))
    .filter((value): value is MarketPairLine => Boolean(value))
    .sort((left, right) => {
      const leftScore = (left.liquidityUsd ?? 0) * 1_000_000 + (left.volume24hUsd ?? 0);
      const rightScore = (right.liquidityUsd ?? 0) * 1_000_000 + (right.volume24hUsd ?? 0);
      return rightScore - leftScore;
    });
};

const parseSocialOverview = (evidences: Evidence[]): SocialOverview => {
  const channels: SocialChannelLine[] = [];

  for (const evidence of evidences.filter((item) => item.title.startsWith('Social :'))) {
    const parsed = safeParseJson(evidence.rawValue);
    const record = parsed && !Array.isArray(parsed) && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : undefined;

    if (evidence.title === 'Social : X détecté') {
      channels.push({
        key: 'x',
        label: 'X',
        detail: evidence.detail,
        sourceUrl: evidence.sourceUrl,
        handle: typeof record?.handle === 'string' ? record.handle : undefined,
      });
      continue;
    }

    if (evidence.title === 'Social : Telegram') {
      channels.push({
        key: 'telegram',
        label: 'Telegram',
        detail: evidence.detail,
        sourceUrl: evidence.sourceUrl,
        memberCount: toNumber(record?.memberCount),
        method: toText(record?.method),
      });
      continue;
    }

    if (evidence.title === 'Social : Discord') {
      channels.push({
        key: 'discord',
        label: 'Discord',
        detail: evidence.detail,
        sourceUrl: evidence.sourceUrl,
        memberCount: toNumber(record?.memberCount),
        onlineCount: toNumber(record?.onlineCount),
        method: toText(record?.method),
      });
      continue;
    }

    if (evidence.title === 'Social : cohérence Discord / Telegram') {
      const ratio = toNumber(record?.ratio);
      channels.push({
        key: 'coherence',
        label: 'Cohérence Discord / Telegram',
        detail: ratio !== undefined ? `Ratio approximatif ${ratio.toFixed(1)}x.` : evidence.detail,
        sourceUrl: evidence.sourceUrl,
        method: 'comparison',
      });
    }
  }

  const notes = channels.map((channel) => channel.detail).slice(0, 4);
  return { channels, notes };
};

const parseContractFacts = (evidences: Evidence[]): ContractFactLine[] => {
  const evidence = evidences.find((item) => item.title.startsWith('Fiche contrat :'));
  const payload = safeParseJson(evidence?.rawValue);
  if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
    return [];
  }

  const record = payload as Record<string, unknown>;
  const lines: ContractFactLine[] = [];

  const push = (label: string, value: unknown, sourceLabel?: string, sourceUrl?: string) => {
    const text = toText(value);
    if (!text) {
      return;
    }

    lines.push({ label, value: text, sourceLabel, sourceUrl });
  };

  push('Type détecté', record.addressType);
  push('Nom', record.tokenName);
  push('Symbole', record.tokenSymbol);
  push('Decimals', record.tokenDecimals);
  push('Total supply', record.totalSupply);
  push('Owner / programme', record.owner);
  push('Bytecode', record.codeFound);
  push('Proxy', record.isProxy);
  push('Mint authority', record.mintAuthority);
  push('Freeze authority', record.freezeAuthority);
  push('Honeypot', record.isHoneypot);

  return lines;
};

const deriveCompatibility = (evidences: Evidence[]): { label: string; detail: string } => {
  const compatibility = evidences.find((evidence) => evidence.title.startsWith('Compatibilité :'));
  const title = compatibility?.title.replace('Compatibilité : ', '') ?? 'Objet non confirmé';
  const detail = compatibility?.detail ?? 'ScoRAGE n’a pas pu déterminer clairement la nature de l’adresse.';
  return { label: title, detail };
};

const buildFires = (bundle: ReportBundle): FiresPillarDigest[] =>
  fireCategories.map((key) => {
    const pillarEvidences = bundle.evidences.filter((evidence) => evidence.category === key);
    return {
      key,
      label: scoreCategoryLabels[key],
      score: bundle.report.score[key],
      positives: pillarEvidences.filter((evidence) => evidence.severity === 'positive').slice(0, 3),
      risks: pillarEvidences.filter((evidence) => evidence.signalType === 'risk' || evidence.signalType === 'incompatible_object').slice(0, 3),
      missing: pillarEvidences.filter((evidence) => evidence.signalType === 'missing_data' || evidence.signalType === 'provider_unavailable').slice(0, 3),
    };
  });

const bestPair = (pairs: MarketPairLine[]): MarketPairLine | undefined => pairs[0];

export function buildAnalysisPanels(bundle: ReportBundle): AnalysisPanels {
  const marketPairs = parseMarketPairs(bundle.evidences);
  const contractFacts = parseContractFacts(bundle.evidences);
  const socialOverview = parseSocialOverview(bundle.evidences);
  const compatibility = deriveCompatibility(bundle.evidences);
  const fires = buildFires(bundle);
  const best = bestPair(marketPairs);

  const marketNotes: string[] = [];
  if (best) {
    marketNotes.push(`Paire principale : ${best.baseLabel} / ${best.quoteLabel}.`);
    marketNotes.push(`Liquidité principale : ${formatCurrency(best.liquidityUsd)}.`);
    if (best.pairAgeDays !== undefined) {
      marketNotes.push(`Âge estimé de la paire : ${Math.round(best.pairAgeDays)} jour(s).`);
    }
  } else {
    marketNotes.push('Aucune paire exploitable n’a été structurée pour le moment.');
  }

  return {
    compatibilityLabel: compatibility.label,
    compatibilityDetail: compatibility.detail,
    contractFacts: contractFacts.length > 0
      ? contractFacts
      : [
          { label: 'Adresse', value: formatAddress(bundle.project.contractAddress) },
          { label: 'Chaîne', value: bundle.project.chain.toUpperCase() },
        ],
    marketNotes,
    marketPairs,
    bestMarketPair: best,
    socialOverview,
    fires,
  };
}

export { formatCurrency, formatNumber, formatAddress };
