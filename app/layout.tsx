import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'ScoRAGE — Analyse de risque crypto avant investissement',
  description:
    "Analyse un projet crypto avant d'investir. Rapport de risque clair en 2 à 5 minutes. Due diligence anti-scam pour Solana, BSC, Base, Ethereum.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable}`}>
        {children}
      </body>
    </html>
  );
}
