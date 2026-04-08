import type { Chain } from '@/types/project';

export type GoPlusObservation = {
  available: boolean;
  tokenType: 'solana' | 'evm' | 'unknown';
  raw?: unknown;
  records: Record<string, unknown>[];
  notes: string[];
  error?: string;
};

const chainIdMap: Record<Exclude<Chain, 'solana'>, string> = {
  ethereum: '1',
  bsc: '56',
  base: '8453',
};

const parseRecords = (payload: unknown): Record<string, unknown>[] => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const root = payload as Record<string, unknown>;
  const result = root.result;
  if (!result || typeof result !== 'object') {
    return [];
  }

  return Object.values(result as Record<string, unknown>).filter(
    (value): value is Record<string, unknown> => Boolean(value) && typeof value === 'object',
  );
};

export async function inspectGoPlusToken(chain: Chain, contractAddress: string): Promise<GoPlusObservation> {
  const url =
    chain === 'solana'
      ? `https://api.gopluslabs.io/api/v1/solana/token_security?contract_addresses=${encodeURIComponent(contractAddress)}`
      : `https://api.gopluslabs.io/api/v1/token_security/${chainIdMap[chain as Exclude<Chain, 'solana'>]}?contract_addresses=${encodeURIComponent(contractAddress)}`;

  try {
    const response = await fetch(url, { headers: { accept: '*/*' } });
    if (!response.ok) {
      throw new Error(`GoPlus HTTP ${response.status}`);
    }

    const raw = (await response.json()) as { code?: number; message?: string } & Record<string, unknown>;
    const records = parseRecords(raw);

    if (raw.code !== 1 || records.length === 0) {
      const message = typeof raw.message === 'string' ? raw.message : 'Aucune donnée GoPlus exploitable';
      return {
        available: false,
        tokenType: chain === 'solana' ? 'solana' : 'evm',
        records: [],
        notes: [message],
        error: message,
      };
    }

    return {
      available: true,
      tokenType: chain === 'solana' ? 'solana' : 'evm',
      raw,
      records,
      notes: ['GoPlus public utilisé'],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'GoPlus error';
    return {
      available: false,
      tokenType: chain === 'solana' ? 'solana' : 'evm',
      records: [],
      notes: [message],
      error: message,
    };
  }
}
