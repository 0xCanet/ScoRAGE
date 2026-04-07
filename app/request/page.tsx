import Link from 'next/link';

import { RequestForm } from '@/components/request/request-form';
import { AppTopbar } from '@/components/app/app-topbar';

export default function RequestPage() {
  return (
    <main className="request-shell">
      <AppTopbar />
      <div className="noise-overlay" aria-hidden="true" />
      <div className="container request-shell__inner">
        <div className="request-page__hero">
          <p className="eyebrow">Nouvelle analyse</p>
          <h1>Colle l&apos;adresse. On vérifie.</h1>
          <p className="request-shell__copy">
            Analyse complète on-chain et off-chain en 2 à 5 minutes pour Solana, BSC, Base et Ethereum. 
            Le rapport généré suit le framework F.I.R.E.S.
          </p>
        </div>

        <div className="request-form-wrapper">
          <RequestForm />
        </div>
      </div>
    </main>
  );
}
