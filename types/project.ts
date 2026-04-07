export type Chain = 'solana' | 'bsc' | 'base' | 'ethereum';

export type Project = {
  id: string;
  chain: Chain;
  contractAddress: string;
  projectName?: string;
  websiteUrl?: string;
  xUrl?: string;
  telegramUrl?: string;
  createdByUserId?: string;
  createdAt: string;
};

export const chainLabels: Record<Chain, string> = {
  solana: 'Solana',
  bsc: 'BSC',
  base: 'Base',
  ethereum: 'Ethereum',
};