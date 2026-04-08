import { chainLabels } from '@/types/project';

export type SolanaRpcAccountInfo = {
  exists: boolean;
  owner?: string;
  lamports?: number;
  executable?: boolean;
  dataLength?: number;
  supply?: string;
  decimals?: number;
  mintAuthority?: string | null;
  freezeAuthority?: string | null;
  parsedType?: string;
};

export type SolanaRpcObservation = {
  reachable: boolean;
  endpoint?: string;
  slot?: number;
  latestBlockhash?: string;
  account?: SolanaRpcAccountInfo;
  addressType: 'token_mint' | 'program' | 'wallet' | 'account' | 'unknown';
  notes: string[];
  error?: string;
};

const rpcUrl = (): string | undefined => process.env.SOLANA_RPC_URL?.trim() || undefined;

const requestRpc = async <T>(method: string, params: unknown[] = []): Promise<T> => {
  const endpoint = rpcUrl();
  if (!endpoint) {
    throw new Error('SOLANA_RPC_URL manquant');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'scorage-solana',
      method,
      params,
    }),
  });

  if (!response.ok) {
    throw new Error(`Solana RPC HTTP ${response.status}`);
  }

  const payload = (await response.json()) as { error?: { message?: string }; result?: T };
  if (payload.error) {
    throw new Error(payload.error.message ?? 'Solana RPC error');
  }

  if (typeof payload.result === 'undefined') {
    throw new Error('Solana RPC result absent');
  }

  return payload.result;
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

export async function inspectSolanaToken(address: string): Promise<SolanaRpcObservation> {
  const endpoint = rpcUrl();
  if (!endpoint) {
    return {
      reachable: false,
      addressType: 'unknown',
      notes: ['SOLANA_RPC_URL non configuré'],
      error: 'SOLANA_RPC_URL manquant',
    };
  }

  const notes: string[] = [];

  try {
    await requestRpc<unknown>('getHealth');
    const slot = await requestRpc<number>('getSlot');
    const latestBlockhash = await requestRpc<{ value?: { blockhash?: string } }>('getLatestBlockhash');

    let accountInfo: SolanaRpcAccountInfo | undefined;
    let addressType: SolanaRpcObservation['addressType'] = 'unknown';

    try {
      const account = await requestRpc<{
        value: {
          executable: boolean;
          lamports: number;
          owner: string;
          data?: unknown;
        } | null;
      }>('getAccountInfo', [address, { encoding: 'jsonParsed' }]);

      const parsedData = (() => {
        const value = account.value;
        const data = value?.data as { parsed?: { type?: string; info?: Record<string, unknown> } } | undefined;
        return data?.parsed;
      })();
      const parsedInfo = parsedData?.info;

      accountInfo = account.value
        ? {
            exists: true,
            owner: account.value.owner,
            lamports: account.value.lamports,
            executable: account.value.executable,
            dataLength: Array.isArray(account.value.data) ? toNumber(account.value.data[1] as unknown) : undefined,
            supply: typeof parsedInfo?.supply === 'string' ? parsedInfo.supply : undefined,
            decimals: toNumber(parsedInfo?.decimals),
            mintAuthority: typeof parsedInfo?.mintAuthority === 'string' ? parsedInfo.mintAuthority : null,
            freezeAuthority: typeof parsedInfo?.freezeAuthority === 'string' ? parsedInfo.freezeAuthority : null,
            parsedType: typeof parsedData?.type === 'string' ? parsedData.type : undefined,
          }
        : { exists: false };

      if (!account.value) {
        notes.push('Aucun compte Solana trouvé pour cette adresse');
        addressType = 'unknown';
      } else if (account.value.executable) {
        notes.push('Programme Solana exécutable détecté');
        addressType = 'program';
      } else if (parsedData?.type === 'mint' || accountInfo.decimals !== undefined || accountInfo.supply !== undefined) {
        notes.push('Mint SPL détecté');
        addressType = 'token_mint';
      } else if (account.value.owner === '11111111111111111111111111111111') {
        notes.push('Compte système / wallet détecté');
        addressType = 'wallet';
      } else {
        notes.push('Compte Solana non mint détecté');
        addressType = 'account';
      }

      if (account.value && parsedInfo?.mintAuthority) {
        notes.push('Mint authority active');
      }
      if (account.value && parsedInfo?.freezeAuthority) {
        notes.push('Freeze authority active');
      }
    } catch (accountError) {
      const accountMessage = accountError instanceof Error ? accountError.message : 'Compte Solana non lisible';
      notes.push(`Lecture du compte impossible: ${accountMessage}`);
      accountInfo = { exists: false };
      addressType = 'unknown';
    }

    notes.push(`Réseau Solana joignable (${chainLabels.solana})`);
    notes.push(`Slot actuel: ${slot}`);

    return {
      reachable: true,
      endpoint,
      slot,
      latestBlockhash: latestBlockhash.value?.blockhash,
      account: accountInfo,
      addressType,
      notes,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur Solana RPC';
    return {
      reachable: false,
      endpoint,
      addressType: 'unknown',
      notes: [...notes, message],
      error: message,
    };
  }
}
