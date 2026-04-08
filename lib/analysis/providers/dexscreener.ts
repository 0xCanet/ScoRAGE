export type DexscreenerPair = {
  chainId: string;
  dexId?: string;
  pairAddress: string;
  priceUsd?: number;
  liquidityUsd?: number;
  volume24hUsd?: number;
  volume7dUsd?: number;
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: string;
  pairAgeDays?: number;
  priceChange24h?: number;
  txns24hBuys?: number;
  txns24hSells?: number;
  baseToken?: { address?: string; symbol?: string; name?: string };
  quoteToken?: { address?: string; symbol?: string; name?: string };
};

export type DexscreenerObservation = {
  found: boolean;
  pairs: DexscreenerPair[];
  bestPair?: DexscreenerPair;
  notes: string[];
  error?: string;
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const normalizePair = (pair: Record<string, unknown>): DexscreenerPair | null => {
  const pairAddress = typeof pair.pairAddress === 'string' ? pair.pairAddress : undefined;
  const chainId = typeof pair.chainId === 'string' ? pair.chainId : undefined;

  if (!pairAddress || !chainId) {
    return null;
  }

  const pairCreatedAt = typeof pair.pairCreatedAt === 'number' ? new Date(pair.pairCreatedAt).toISOString() : undefined;
  const pairAgeDays = pairCreatedAt ? Math.max(0, Math.round((Date.now() - new Date(pairCreatedAt).getTime()) / 86_400_000)) : undefined;

  return {
    chainId,
    dexId: typeof pair.dexId === 'string' ? pair.dexId : undefined,
    pairAddress,
    priceUsd: toNumber(pair.priceUsd),
    liquidityUsd: toNumber((pair.liquidity as Record<string, unknown> | undefined)?.usd),
    volume24hUsd: toNumber((pair.volume as Record<string, unknown> | undefined)?.h24),
    volume7dUsd: toNumber((pair.volume as Record<string, unknown> | undefined)?.h7d),
    fdv: toNumber(pair.fdv),
    marketCap: toNumber(pair.marketCap),
    pairCreatedAt,
    pairAgeDays,
    priceChange24h: toNumber((pair.priceChange as Record<string, unknown> | undefined)?.h24),
    txns24hBuys: toNumber(((pair.txns as Record<string, unknown> | undefined)?.h24 as Record<string, unknown> | undefined)?.buys),
    txns24hSells: toNumber(((pair.txns as Record<string, unknown> | undefined)?.h24 as Record<string, unknown> | undefined)?.sells),
    baseToken: typeof pair.baseToken === 'object' && pair.baseToken
      ? {
          address: typeof (pair.baseToken as Record<string, unknown>).address === 'string' ? (pair.baseToken as Record<string, unknown>).address as string : undefined,
          symbol: typeof (pair.baseToken as Record<string, unknown>).symbol === 'string' ? (pair.baseToken as Record<string, unknown>).symbol as string : undefined,
          name: typeof (pair.baseToken as Record<string, unknown>).name === 'string' ? (pair.baseToken as Record<string, unknown>).name as string : undefined,
        }
      : undefined,
    quoteToken: typeof pair.quoteToken === 'object' && pair.quoteToken
      ? {
          address: typeof (pair.quoteToken as Record<string, unknown>).address === 'string' ? (pair.quoteToken as Record<string, unknown>).address as string : undefined,
          symbol: typeof (pair.quoteToken as Record<string, unknown>).symbol === 'string' ? (pair.quoteToken as Record<string, unknown>).symbol as string : undefined,
          name: typeof (pair.quoteToken as Record<string, unknown>).name === 'string' ? (pair.quoteToken as Record<string, unknown>).name as string : undefined,
        }
      : undefined,
  };
};

const pickBestPair = (pairs: DexscreenerPair[]): DexscreenerPair | undefined => {
  return [...pairs].sort((left, right) => {
    const leftScore = (left.liquidityUsd ?? 0) * 1_000_000 + (left.volume24hUsd ?? 0);
    const rightScore = (right.liquidityUsd ?? 0) * 1_000_000 + (right.volume24hUsd ?? 0);
    return rightScore - leftScore;
  })[0];
};

export async function inspectDexscreenerToken(address: string): Promise<DexscreenerObservation> {
  const urls = [
    `https://api.dexscreener.com/latest/dex/tokens/${address}`,
    `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(address)}`,
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: {
          accept: 'application/json',
          'user-agent': 'ScoRAGE/1.0',
        },
      });
      if (!response.ok) {
        continue;
      }

      const payload = (await response.json()) as { pairs?: unknown[] };
      const pairs = (payload.pairs ?? [])
        .map((pair) => (pair && typeof pair === 'object' ? normalizePair(pair as Record<string, unknown>) : null))
        .filter((pair): pair is DexscreenerPair => Boolean(pair));

      if (pairs.length === 0) {
        continue;
      }

      const bestPair = pickBestPair(pairs);
      const notes = [`${pairs.length} paire(s) trouvée(s) sur Dexscreener`];
      if (bestPair?.liquidityUsd !== undefined) {
        notes.push(`Liquidité principale: ${Math.round(bestPair.liquidityUsd).toLocaleString('fr-FR')} USD`);
      }
      if (bestPair?.volume24hUsd !== undefined) {
        notes.push(`Volume 24h principal: ${Math.round(bestPair.volume24hUsd).toLocaleString('fr-FR')} USD`);
      }
      if (bestPair?.pairAgeDays !== undefined) {
        notes.push(`Âge estimé de la paire: ${bestPair.pairAgeDays} jour(s)`);
      }

      return {
        found: true,
        pairs,
        bestPair,
        notes,
      };
    } catch {
      continue;
    }
  }

  return {
    found: false,
    pairs: [],
    notes: ['Aucune paire Dexscreener trouvée'],
  };
}
