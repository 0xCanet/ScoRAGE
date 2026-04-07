import Link from 'next/link';

import { chains, pricingTiers, processSteps } from '@/components/marketing/data';
import { FAQList } from '@/components/marketing/faq-list';
import { FiresFramework } from '@/components/marketing/fires-framework';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';

export function MarketingPage() {
  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />
      <Navbar />
      <main>
        <section className="hero section" id="hero">
          <div className="container hero__grid">
            <div className="hero__copy">
              <p className="eyebrow">Solana · BSC · Base · Ethereum</p>
              <h1>
                Avant d&apos;acheter,
                <br />
                <span className="text-blood">vérifie.</span>
              </h1>
              <p className="hero__lead">
                Colle l&apos;adresse d&apos;un token. ScoRAGE passe au crible le contrat, la liquidité,
                l&apos;équipe et chaque red flag — verdict clair en 2 à 5 minutes. Score sur 100.
                Rapport Web + PDF. Framework F.I.R.E.S.
              </p>
              <div className="terminal-hint">
                <span>$</span>
                <span>0x8f3c...a91d</span>
              </div>
              <div className="btn-group">
                <Link href="/request" className="btn-primary">
                  Scanner un token
                </Link>
                <a href="#proof" className="btn-secondary">
                  Voir un rapport réel
                </a>
              </div>
            </div>

            <div className="card score-card">
              <p className="score-card__label">Résultat d&apos;analyse</p>
              <div className="score-card__value score-card__value--high">27</div>
              <p className="score-card__label">/ 100</p>
              <span className="badge badge--high">HIGH RISK</span>
              <div className="flag-list">
                <span className="badge badge--critical">✕ Liquidité verrouillée 0%</span>
                <span className="badge badge--critical">⚠ 82% supply in 1 wallet</span>
                <span className="badge badge--critical">✕ Aucun audit</span>
              </div>
            </div>
          </div>
        </section>

        <section className="section section--abyss" id="proof">
          <div className="container">
            <div className="section-header section-header--center">
              <p className="eyebrow">Preuve produit</p>
              <h2>
                Ce que tu reçois. <span className="text-blood">Vraies données, vrai verdict.</span>
              </h2>
              <p>
                Pas une note sans contexte. Un rapport complet que tu lis, que tu partages, et sur
                lequel tu décides.
              </p>
            </div>
            <div className="mockup-frame">
              <div className="mockup-frame__topbar">
                <div className="mockup-frame__dots">
                  <span /><span /><span />
                </div>
                <div className="mockup-frame__url">scorage.io/report/0x8f3c...</div>
              </div>
              <div className="report-mockup card">
              <div className="report-mockup__header">
                <div>
                  <p className="report-project">MoonDoge Finance</p>
                  <p className="report-meta">
                    Contract: 0x8f3c...a91d
                    <br />
                    Chain: BSC · BEP-20
                    <br />
                    Analysé le 06 avr. 2026
                  </p>
                </div>
                <span className="badge badge--critical">CRITICAL RISK</span>
              </div>

              <div className="report-grid">
                <div className="report-score">
                  <div className="score-card__value score-card__value--critical">12</div>
                  <p className="score-card__label">Score global / 100</p>
                </div>
                <div className="fires-score-list">
                  {[
                    ['F', 'Financials', '8'],
                    ['I', 'Integrity', '5'],
                    ['R', 'Reputation', '18'],
                    ['E', 'Ecosystem', '10'],
                    ['S', 'Security', '19'],
                  ].map(([letter, label, value]) => (
                    <div key={letter} className="fires-score-row">
                      <span>{letter}</span>
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flag-list">
                <span className="badge badge--critical">✕ Honeypot pattern détecté</span>
                <span className="badge badge--critical">✕ Liquidité non verrouillée</span>
                <span className="badge badge--critical">⚠ Équipe 100% anonyme</span>
                <span className="badge badge--safe">✓ Contract vérifié BSCScan</span>
                <span className="badge badge--safe">✓ Pas de proxy upgradeable</span>
              </div>

              <div className="analysis-block">
                <p className="eyebrow">Verdict ScoRAGE</p>
                <p>
                  Le contrat MoonDoge Finance présente des signaux critiques incompatibles avec un
                  investissement. La fonction mint() permet la création illimitée de tokens. 92%
                  du supply est concentré dans un seul wallet. Aucune liquidité verrouillée.
                </p>
              </div>
            </div>
            </div>
          </div>
        </section>

        <section className="section" id="process">
          <div className="container">
            <div className="section-header section-header--center">
              <p className="eyebrow">Process</p>
              <h2>
                En 3 étapes. <span className="text-blood">C&apos;est tout.</span>
              </h2>
            </div>
            <div className="process-grid">
              {processSteps.map((step) => (
                <article key={step.number} className="process-step">
                  <p className="process-step__number">{step.number}</p>
                  <div className="card feature-card">
                    <h3>{step.title}</h3>
                    <p>{step.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--abyss" id="fires">
          <div className="container">
            <div className="section-header">
              <p className="eyebrow">Méthodologie</p>
              <h2>
                Framework <span className="text-blood">F.I.R.E.S.</span>
              </h2>
              <p>
                5 dimensions d&apos;analyse. 1 score consolidé. 0 bullshit. Chaque projet est évalué
                sur une grille structurée — pas un algorithme opaque.
              </p>
            </div>
            <FiresFramework />
          </div>
        </section>

        <section className="section" id="chains">
          <div className="container">
            <div className="section-header section-header--center">
              <p className="eyebrow">Réseaux couverts</p>
              <h2>
                Les chaînes où <span className="text-blood">ça brûle.</span>
              </h2>
              <p>V1 cible les 4 réseaux avec le plus de tokens à risque lancés par jour.</p>
            </div>
            <div className="simple-grid simple-grid--4">
              {chains.map((chain) => (
                <article key={chain.name} className="card chain-card">
                  <p className="chain-card__name">{chain.name}</p>
                  <p>{chain.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--abyss" id="pricing">
          <div className="container">
            <div className="section-header section-header--center">
              <p className="eyebrow">Pricing</p>
              <h2>
                Le prix d&apos;une <span className="text-blood">décision éclairée.</span>
              </h2>
              <p>Moins cher que le prochain token que tu aurais dû éviter.</p>
            </div>
            <div className="simple-grid simple-grid--2 pricing-grid">
              {pricingTiers.map((tier) => (
                <article key={tier.name} className={`card pricing-card${tier.featured ? ' pricing-card--featured' : ''}`}>
                  {tier.featured ? <p className="badge badge--neutral">Pour ceux qui investissent vraiment</p> : null}
                  <h3>{tier.name}</h3>
                  <p className="pricing-card__price">{tier.price}</p>
                  <p className="pricing-card__period">{tier.period}</p>
                  <ul className="stack-list">
                    {tier.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <Link href="/request" className={tier.ctaClassName}>
                    {tier.cta}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="faq">
          <div className="container narrow-container">
            <div className="section-header section-header--center">
              <p className="eyebrow">FAQ</p>
              <h2>Questions fréquentes</h2>
            </div>
            <FAQList />
          </div>
        </section>

        <section className="section section--abyss cta-section" id="cta-final">
          <div className="container narrow-container cta-section__inner">
            <h2>
              Le prochain token que tu achètes est peut-être un <span className="text-blood">piège.</span>
            </h2>
            <p>Colle l&apos;adresse. Verdict en 3 minutes.</p>
            <div className="terminal-hint terminal-hint--large">
              <span>$</span>
              <span>Adresse du contrat (SOL, BSC, Base, ETH)</span>
            </div>
            <Link href="/request" className="btn-primary btn-primary--lg">
              Lancer le scan
            </Link>
            <p className="cta-section__meta">Gratuit · 3 scans/mois · sans carte bancaire</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
