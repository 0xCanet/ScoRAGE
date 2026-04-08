import { RequestForm } from '@/components/request/request-form';
import { AppTopbar } from '@/components/app/app-topbar';

const firesPreview = [
  { key: 'F', title: 'Financials', detail: 'Contrat, marché, liquidité', tone: 'high' },
  { key: 'I', title: 'Integrity', detail: 'Site, docs, cohérence', tone: 'critical' },
  { key: 'R', title: 'Reputation', detail: 'X, Telegram, signaux publics', tone: 'safe' },
  { key: 'E', title: 'Ecosystem', detail: 'Positionnement, traction, utilité', tone: 'high' },
  { key: 'S', title: 'Security', detail: 'Permissions, risques, protections', tone: 'critical' },
] as const;

export default function RequestPage() {
  return (
    <main className="request-shell">
      <AppTopbar />
      <div className="noise-overlay" aria-hidden="true" />
      <div className="container request-shell__inner">
        <section className="request-page__hero">
          <div className="request-page__hero-copy">
            <p className="eyebrow">Nouvelle analyse</p>
            <h1>Analyse un token avant d&apos;acheter.</h1>
            <p className="request-shell__copy">
              ScoRAGE croise contrat, marché et signaux publics pour produire un verdict FIRES lisible et sourcé.
            </p>
            <div className="request-shell__bullets">
              <span>Contrat</span>
              <span>Marché</span>
              <span>FIRES</span>
            </div>
          </div>

          <div className="request-page__hero-card">
            <p className="eyebrow">Minimum requis</p>
            <strong>Réseau + adresse du token</strong>
            <p>Le reste améliore la précision, mais n&apos;est pas nécessaire pour lancer l&apos;analyse.</p>
          </div>
        </section>

        <section className="request-grid">
          <div className="request-form-wrapper">
            <RequestForm />
          </div>

          <aside className="card request-panel">
            <div className="request-panel__section">
              <p className="eyebrow">Repères</p>
              <h2>Ce qui compte vraiment</h2>
              <ul className="request-panel__list">
                <li><strong>Obligatoire</strong> — réseau et adresse du token.</li>
                <li><strong>Recommandé</strong> — site, X, Telegram.</li>
                <li><strong>Optionnel</strong> — nom du projet, notes, email.</li>
              </ul>
            </div>

            <div className="request-panel__section request-panel__section--coverage">
              <p className="eyebrow">FIRES coverage</p>
              <h3>Ce que tes infos débloquent</h3>
              <div className="request-coverage">
                {firesPreview.map((pillar) => (
                  <div key={pillar.key} className="request-coverage__item">
                    <div className="request-coverage__head">
                      <span className={`badge badge--${pillar.tone}`}>{pillar.key}</span>
                      <div>
                        <strong>{pillar.title}</strong>
                        <p>{pillar.detail}</p>
                      </div>
                    </div>
                    <div className="request-coverage__bar">
                      <span className={`request-coverage__fill request-coverage__fill--${pillar.tone}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
