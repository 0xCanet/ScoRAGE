import type { Chain } from '@/types/project';
import type { ReportRequestInput } from '@/types/report';

export const supportedChains = ['solana', 'bsc', 'base', 'ethereum'] as const satisfies readonly Chain[];

export const reportChainOptions: Array<{ value: Chain; label: string; hint: string }> = [
  { value: 'solana', label: 'Solana', hint: 'Base58 address' },
  { value: 'bsc', label: 'BSC', hint: '0x contract address' },
  { value: 'base', label: 'Base', hint: '0x contract address' },
  { value: 'ethereum', label: 'Ethereum', hint: '0x contract address' },
];

export type ReportRequestError = {
  field: keyof ReportRequestInput | 'root';
  message: string;
};

export type ReportRequestValidationResult =
  | { success: true; data: ReportRequestInput }
  | { success: false; errors: ReportRequestError[] };

const normalizeString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const isValidUrl = (value: string): boolean => {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
};

const isValidEmail = (value: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidSolanaAddress = (value: string): boolean => /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value);

const isValidEvmAddress = (value: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(value);

const validateContractAddress = (chain: Chain, value: string): boolean => {
  if (chain === 'solana') {
    return isValidSolanaAddress(value);
  }

  return isValidEvmAddress(value);
};

export function validateReportRequest(input: unknown): ReportRequestValidationResult {
  const errors: ReportRequestError[] = [];

  if (!input || typeof input !== 'object') {
    return {
      success: false,
      errors: [{ field: 'root', message: 'Payload invalide.' }],
    };
  }

  const record = input as Record<string, unknown>;
  const chainValue = normalizeString(record.chain)?.toLowerCase();

  if (!chainValue || !supportedChains.includes(chainValue as Chain)) {
    errors.push({
      field: 'chain',
      message: 'Chaîne non supportée. Utilise Solana, BSC, Base ou Ethereum.',
    });
  }

  const contractAddress = normalizeString(record.contractAddress);
  const chain = chainValue as Chain | undefined;

  if (!contractAddress) {
    errors.push({ field: 'contractAddress', message: 'Adresse du contrat requise.' });
  } else if (chain && !validateContractAddress(chain, contractAddress)) {
    errors.push({
      field: 'contractAddress',
      message:
        chain === 'solana'
          ? 'Adresse Solana invalide.'
          : 'Adresse EVM invalide. Attendu: 0x + 40 caractères hexadécimaux.',
    });
  }

  const projectName = normalizeString(record.projectName);
  if (projectName && projectName.length > 80) {
    errors.push({ field: 'projectName', message: 'Nom de projet trop long.' });
  }

  const websiteUrl = normalizeString(record.websiteUrl);
  if (websiteUrl && !isValidUrl(websiteUrl)) {
    errors.push({ field: 'websiteUrl', message: 'URL du site invalide.' });
  }

  const xUrl = normalizeString(record.xUrl);
  if (xUrl && !isValidUrl(xUrl)) {
    errors.push({ field: 'xUrl', message: 'URL X invalide.' });
  }

  const telegramUrl = normalizeString(record.telegramUrl);
  if (telegramUrl && !isValidUrl(telegramUrl)) {
    errors.push({ field: 'telegramUrl', message: 'URL Telegram invalide.' });
  }

  const notes = normalizeString(record.notes);
  if (notes && notes.length > 1200) {
    errors.push({ field: 'notes', message: 'Notes trop longues.' });
  }

  const email = normalizeString(record.email);
  if (email && !isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Adresse email invalide.' });
  }

  if (errors.length > 0 || !chain || !contractAddress) {
    return {
      success: false,
      errors,
    };
  }

  return {
    success: true,
    data: {
      chain,
      contractAddress,
      projectName,
      websiteUrl,
      xUrl,
      telegramUrl,
      notes,
      email,
    },
  };
}