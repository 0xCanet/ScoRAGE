import Link from 'next/link';

import { RequestForm } from '@/components/request/request-form';

export default function RequestPage() {
  return (
    <main className="request-shell">
      <div className="noise-overlay" aria-hidden="true" />
      <div className="container request-shell__inner">
        <div className="request-page__hero">
          <p className="eyebrow">Request flow</p>
          <h1>Colle l&apos;adresse. ScoRAGE prépare le rapport.</h1>
          <p className="request-shell__copy">
            Support initial: Solana, BSC, Base, Ethereum. La soumission crée un projet, un report
            et un payload de requête prêt pour Supabase. Sans variables d&apos;environnement, le flux
            tombe sur un mock local.
          </p>
          <div className="btn-group">
            <Link href="/" className="btn-secondary">
              Retour à la landing
            </Link>
            <Link href="#request-form" className="btn-ghost">
              Aller au formulaire
            </Link>
          </div>
        </div>

        <div className="request-grid">
          <section className="card request-panel">
            <p className="eyebrow">Données requises</p>
            <h2>Scanner un token</h2>
            <p>
              Le backend valide la chaîne, l&apos;adresse du contrat et les métadonnées optionnelles
              avant de générer un rapport F.I.R.E.S. mock mais structuré.
            </p>
          </section>

          <RequestForm />
        </div>
      </div>
    </main>
  );
}
