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
          <h1>Lance une analyse avant d&apos;acheter.</h1>
          <p className="request-shell__copy">
            Donne-nous l&apos;adresse du contrat. ScoRAGE prépare un verdict lisible, partageable et structuré par le framework F.I.R.E.S. en 2 à 5 minutes.
          </p>
          <div className="request-shell__bullets">
            <span>Score /100</span>
            <span>Red flags priorisés</span>
            <span>Rapport web + PDF</span>
          </div>
        </div>

        <div className="request-form-wrapper">
          <RequestForm />
        </div>
      </div>
    </main>
  );
}
