import type { Chain } from '@/types/project';

export type EvmRpcObservation = {
  reachable: boolean;
  endpoint?: string;
  blockNumber?: number;
  codeFound: boolean;
  codeSize?: number;
  isTokenLike: boolean;
  contractType: 'token' | 'contract' | 'wallet' | 'unknown';
  tokenName?: string;
  tokenSymbol?: string;
  tokenDecimals?: number;
  totalSupply?: string;
  notes: string[];
  error?: string;
};

const envMap: Partial<Record<Exclude<Chain, 'solana'>, string | undefined>> = {
  ethereum: process.env.ETHEREUM_RPC_URL?.trim() || process.env.EVM_RPC_URL?.trim() || undefined,
  base: process.env.BASE_RPC_URL?.trim() || process.env.EVM_RPC_URL?.trim() || undefined,
  bsc: process.env.BSC_RPC_URL?.trim() || process.env.EVM_RPC_URL?.trim() || undefined,
};

const publicFallbacks: Record<Exclude<Chain, 'solana'>, string[]> = {
  ethereum: ['https://eth.llamarpc.com', 'https://ethereum-rpc.publicnode.com'],
  base: ['https://base.llamarpc.com', 'https://base-rpc.publicnode.com'],
  bsc: ['https://bsc-dataseed.binance.org'],
};

const rpcCandidates = (chain: Exclude<Chain, 'solana'>): string[] => {
  const values = [envMap[chain], ...publicFallbacks[chain]].filter((value): value is string => Boolean(value));
  return Array.from(new Set(values));
};

const rpcCall = async <T>(url: string, method: string, params: unknown[] = []): Promise<T> => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'ScoRAGE/1.0',
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const payload = (await response.json()) as { result?: T; error?: { message?: string } };
  if (payload.error) {
    throw new Error(payload.error.message ?? 'RPC error');
  }
  if (typeof payload.result === 'undefined') {
    throw new Error('RPC result absent');
  }
  return payload.result;
};

const hexToString = (hex: string): string | undefined => {
  if (!hex || hex === '0x') {
    return undefined;
  }

  try {
    const value = hex.startsWith('0x') ? hex.slice(2) : hex;
    const cleaned = value.replace(/^0+/, '');
    if (!cleaned) {
      return undefined;
    }
    return Buffer.from(cleaned, 'hex').toString('utf8').replace(/\u0000/g, '').trim() || undefined;
  } catch {
    return undefined;
  }
};

const hexToBigIntString = (hex: string): string | undefined => {
  if (!hex || hex === '0x') {
    return undefined;
  }

  try {
    return BigInt(hex).toString(10);
  } catch {
    return undefined;
  }
};

const hexToNumber = (hex: string): number | undefined => {
  const asString = hexToBigIntString(hex);
  if (!asString) {
    return undefined;
  }

  const value = Number(asString);
  return Number.isFinite(value) ? value : undefined;
};

const erc20Call = async (endpoint: string, address: string, data: string): Promise<string | undefined> => {
  try {
    return await rpcCall<string>(endpoint, 'eth_call', [{ to: address, data }, 'latest']);
  } catch {
    return undefined;
  }
};

export async function inspectEvmContract(chain: Exclude<Chain, 'solana'>, address: string): Promise<EvmRpcObservation> {
  const notes: string[] = [];

  for (const endpoint of rpcCandidates(chain)) {
    try {
      const blockHex = await rpcCall<string>(endpoint, 'eth_blockNumber');
      const code = await rpcCall<string>(endpoint, 'eth_getCode', [address, 'latest']);
      const blockNumber = Number.parseInt(blockHex, 16);
      const codeSize = code && code !== '0x' ? Math.max(0, (code.length - 2) / 2) : 0;

      if (codeSize === 0) {
        notes.push(`RPC ${chain} joignable`);
        notes.push(`Bloc actuel: ${blockNumber}`);
        notes.push('Adresse EVM sans bytecode détecté');
        return {
          reachable: true,
          endpoint,
          blockNumber,
          codeFound: false,
          codeSize: 0,
          isTokenLike: false,
          contractType: 'wallet',
          notes,
        };
      }

      const [rawName, rawSymbol, rawDecimals, rawSupply] = await Promise.all([
        erc20Call(endpoint, address, '0x06fdde03'),
        erc20Call(endpoint, address, '0x95d89b41'),
        erc20Call(endpoint, address, '0x313ce567'),
        erc20Call(endpoint, address, '0x18160ddd'),
      ]);

      const tokenName = hexToString(rawName ?? '');
      const tokenSymbol = hexToString(rawSymbol ?? '');
      const tokenDecimals = hexToNumber(rawDecimals ?? '');
      const totalSupply = hexToBigIntString(rawSupply ?? '');
      const isTokenLike = Boolean(tokenSymbol) || tokenDecimals !== undefined || totalSupply !== undefined;

      notes.push(`RPC ${chain} joignable`);
      notes.push(`Bloc actuel: ${blockNumber}`);
      notes.push('Code de contrat détecté');
      if (tokenName || tokenSymbol) {
        notes.push(`Métadonnées ERC-20 détectées${tokenSymbol ? ` (${tokenSymbol})` : ''}`);
      }

      return {
        reachable: true,
        endpoint,
        blockNumber,
        codeFound: true,
        codeSize,
        isTokenLike,
        contractType: isTokenLike ? 'token' : 'contract',
        tokenName,
        tokenSymbol,
        tokenDecimals,
        totalSupply,
        notes,
      };
    } catch (error) {
      notes.push(`${endpoint}: ${error instanceof Error ? error.message : 'error'}`);
      continue;
    }
  }

  return {
    reachable: false,
    codeFound: false,
    isTokenLike: false,
    contractType: 'unknown',
    notes,
    error: notes.at(-1) ?? 'Aucun endpoint EVM disponible',
  };
}
