# ScoRAGE V1 Rebuild Plan

> For Hermes: use subagent-driven-development to execute this plan task by task.

Goal: transformer l’actuelle landing statique ScoRAGE en vraie V1 fonctionnelle vendable, avec parcours complet landing -> request -> rapport web -> export PDF, architecture prête pour une future API.

Architecture: on repart d’un socle Next.js App Router déployable sur Vercel, avec Supabase pour auth/data/storage et un moteur d’analyse modulaire côté serveur. Le repo actuel sert de référence design/copy, mais pas de base applicative. Le rendu du rapport web et le PDF doivent partir du même objet métier `Report`.

Tech stack: Next.js 15, TypeScript, App Router, Tailwind ou CSS variables issues du design system existant, Supabase, Zod, React Hook Form, Vercel, génération PDF via React/HTML print-friendly ou route dédiée.

---

## 0. Diagnostic du repo actuel

État constaté dans le repo cloné:
- `index.html`
- `index.css`
- `index.js`
- `DESIGN_SYSTEM.md`

Conclusion:
- la landing marketing est déjà bien avancée
- il n’y a pas d’application Next.js
- il n’y a pas de backend métier
- il n’y a pas de modèle de données
- il n’y a pas de page de soumission réelle
- il n’y a pas de page rapport réelle
- il n’y a pas d’export PDF branché

Décision:
- conserver le repo actuel comme référence UI/copy/design system
- rebuilder la V1 proprement dans une app Next.js structurée

---

## 1. Arborescence cible du repo

Structure recommandée:

```text
ScoRAGE/
  docs/
    plans/
      2026-04-07-scorage-v1-rebuild-plan.md
    architecture/
      product-flow.md
      data-model.md
      scoring-pipeline.md
  app/
    (marketing)/
      page.tsx                    # landing
    (app)/
      request/page.tsx            # soumission projet/token
      report/[reportId]/page.tsx  # rapport web
      dashboard/page.tsx          # historique minimal
    api/
      reports/route.ts            # création analyse
      reports/[reportId]/route.ts # lecture rapport
      pdf/[reportId]/route.ts     # export PDF
      health/route.ts
    layout.tsx
    globals.css
  components/
    marketing/
    request/
    report/
    dashboard/
    ui/
  lib/
    env.ts
    supabase/
      client.ts
      server.ts
    validation/
      report-request.ts
    scoring/
      index.ts
      types.ts
      normalize.ts
      aggregate.ts
      rules/
        shared.ts
        solana.ts
        evm.ts
    analysis/
      index.ts
      providers/
        birdeye.ts
        dexscreener.ts
        explorer.ts
        social.ts
      mock/
        sample-report.ts
    reports/
      serializer.ts
      verdict.ts
      pdf.ts
  types/
    report.ts
    project.ts
    evidence.ts
    score.ts
  public/
    brand/
    icons/
  scripts/
    seed-demo.ts
  supabase/
    migrations/
  tests/
    unit/
    integration/
    e2e/
  legacy/
    landing-static/
      index.html
      index.css
      index.js
      DESIGN_SYSTEM.md
  package.json
  tsconfig.json
  next.config.ts
  .env.example
  README.md
```

Règle:
- le contenu actuel (`index.html`, `index.css`, `index.js`, `DESIGN_SYSTEM.md`) doit être déplacé sous `legacy/landing-static/`
- la nouvelle source de vérité produit devient l’app Next.js

---

## 2. Pages V1 à figer

### Page 1 — Landing `/`

Objectif:
- vendre la promesse
- montrer un rapport exemple
- pousser vers la soumission

Sections minimales:
- hero
- preuve produit
- comment ça marche
- framework F.I.R.E.S.
- chains supportées
- pricing V1
- FAQ
- CTA final

Source actuelle:
- reprendre le copy/design de `index.html`

### Page 2 — Request `/request`

Objectif:
- transformer l’intérêt en demande exploitable

Champs minimum:
- `chain` (solana, bsc, base, ethereum)
- `contractAddress`
- `projectName` optionnel
- `websiteUrl` optionnel
- `xUrl` optionnel
- `telegramUrl` optionnel
- `notes` optionnel
- `email` optionnel si usage guest

Comportement:
- validation stricte
- création d’un `Project`
- création d’un `ReportRequest`
- lancement de l’analyse
- redirection vers `/report/[reportId]`

### Page 3 — Report `/report/[reportId]`

Objectif:
- afficher le verdict actionnable

Blocs minimum:
- header projet
- score global /100
- verdict textuel
- scores F.I.R.E.S.
- red flags
- points rassurants
- synthèse narrative
- evidences détaillées
- metadata analyse
- CTA export PDF
- CTA partage/copier lien

### Page 4 — Dashboard `/dashboard`

Objectif:
- historique minimal utilisateur

Contenu minimum:
- liste des rapports créés
- statut (processing, completed, failed)
- score global
- date
- lien vers rapport

YAGNI:
- pas de workspace complexe
- pas d’analytics avancée
- pas d’admin panel V1

---

## 3. Objets métier à figer

### `User`

```ts
export type User = {
  id: string
  email: string
  createdAt: string
}
```

### `Project`

```ts
export type Chain = 'solana' | 'bsc' | 'base' | 'ethereum'

export type Project = {
  id: string
  chain: Chain
  contractAddress: string
  projectName?: string
  websiteUrl?: string
  xUrl?: string
  telegramUrl?: string
  createdByUserId?: string
  createdAt: string
}
```

### `Evidence`

```ts
export type EvidenceSeverity = 'positive' | 'warning' | 'critical'
export type EvidenceCategory = 'financials' | 'integrity' | 'reputation' | 'ecosystem' | 'security'

export type Evidence = {
  id: string
  reportId: string
  category: EvidenceCategory
  title: string
  detail: string
  severity: EvidenceSeverity
  sourceLabel?: string
  sourceUrl?: string
  rawValue?: string
  createdAt: string
}
```

### `ScoreBreakdown`

```ts
export type ScoreBreakdown = {
  financials: number
  integrity: number
  reputation: number
  ecosystem: number
  security: number
  total: number
}
```

### `Report`

```ts
export type ReportStatus = 'processing' | 'completed' | 'failed'
export type VerdictLevel = 'low' | 'moderate' | 'high' | 'critical'

export type Report = {
  id: string
  projectId: string
  status: ReportStatus
  verdict: VerdictLevel
  summary: string
  score: ScoreBreakdown
  positives: string[]
  redFlags: string[]
  methodologyVersion: string
  generatedAt?: string
}
```

Principe clé:
- le rendu web et le PDF lisent ce même objet `Report`
- aucune logique de présentation ne doit recalculer le scoring

---

## 4. Flux produit V1 à figer

Flux exact:
1. utilisateur arrive sur la landing
2. clique sur CTA
3. remplit `/request`
4. création du projet + rapport en statut `processing`
5. pipeline d’analyse collecte les faits disponibles
6. moteur de scoring transforme les faits en sous-scores F.I.R.E.S.
7. une synthèse produit le verdict textuel
8. le rapport devient `completed`
9. l’utilisateur lit `/report/[reportId]`
10. il peut exporter le PDF
11. il peut partager le lien du rapport

Version V1 pragmatique:
- commencer avec analyse synchrone ou quasi synchrone mockée / semi-réelle
- brancher d’abord Solana proprement
- ajouter EVM en second avec adaptateurs séparés

---

## 5. Pipeline technique recommandé

### Phase A — Input
- validation Zod
- normalisation chain/address/urls
- rejet immédiat si input invalide

### Phase B — Evidence collection
- on-chain basics
- token metadata
- top holders / concentration
- liquidité / pair / lock si dispo
- présence audit / site / socials
- signaux de contrat (mint, proxy, taxes, honeypot heuristics selon chaîne)

### Phase C — Scoring
- chaque règle renvoie:
  - catégorie FIRES
  - poids
  - sévérité
  - justification
- agrégation vers 5 sous-scores puis score total

### Phase D — Synthesis
- produire:
  - verdict level
  - résumé court
  - red flags triés par gravité
  - positives triés par impact

### Phase E — Rendering
- page report web
- PDF export
- future API JSON-ready

---

## 6. Base de données Supabase minimale

Tables minimales:

### `projects`
- `id` uuid pk
- `chain` text not null
- `contract_address` text not null
- `project_name` text null
- `website_url` text null
- `x_url` text null
- `telegram_url` text null
- `created_by_user_id` uuid null
- `created_at` timestamptz not null default now()

### `reports`
- `id` uuid pk
- `project_id` uuid references projects(id)
- `status` text not null
- `verdict` text null
- `summary` text null
- `score_total` int null
- `score_financials` int null
- `score_integrity` int null
- `score_reputation` int null
- `score_ecosystem` int null
- `score_security` int null
- `methodology_version` text not null
- `generated_at` timestamptz null
- `created_at` timestamptz not null default now()

### `evidences`
- `id` uuid pk
- `report_id` uuid references reports(id)
- `category` text not null
- `severity` text not null
- `title` text not null
- `detail` text not null
- `source_label` text null
- `source_url` text null
- `raw_value` text null
- `created_at` timestamptz not null default now()

### `report_requests`
- `id` uuid pk
- `project_id` uuid references projects(id)
- `report_id` uuid references reports(id)
- `request_payload` jsonb not null
- `created_at` timestamptz not null default now()

---

## 7. Exécution recommandée en 8 lots

### Lot 1 — Bootstrap app
Objective: créer le nouveau socle Next.js TypeScript propre.

Files:
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/(marketing)/page.tsx`
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `.env.example`
- Create: `README.md`
- Create: `legacy/landing-static/*`

Verification:
- `npm install`
- `npm run dev`
- la home charge sans erreur

### Lot 2 — Intégration design system
Objective: porter les tokens et composants essentiels du design actuel dans la nouvelle app.

Files:
- Create: `components/ui/button.tsx`
- Create: `components/ui/card.tsx`
- Modify: `app/globals.css`
- Reference: `legacy/landing-static/DESIGN_SYSTEM.md`

Verification:
- la home reprend l’ADN visuel existant
- les CTA, cartes et headings sont cohérents

### Lot 3 — Landing Next.js
Objective: migrer la landing validée dans `app/(marketing)/page.tsx`.

Files:
- Modify: `app/(marketing)/page.tsx`
- Create: `components/marketing/*`

Verification:
- le contenu marketing principal est présent
- les CTA pointent vers `/request`

### Lot 4 — Request flow
Objective: construire la vraie page de soumission et la validation.

Files:
- Create: `app/(app)/request/page.tsx`
- Create: `components/request/request-form.tsx`
- Create: `lib/validation/report-request.ts`
- Create: `app/api/reports/route.ts`

Verification:
- formulaire soumis avec succès
- un report mock est créé
- redirection vers `/report/[reportId]`

### Lot 5 — Data model + Supabase
Objective: figer les tables et brancher le stockage.

Files:
- Create: `supabase/migrations/001_init.sql`
- Create: `lib/supabase/client.ts`
- Create: `lib/supabase/server.ts`
- Create: `types/*.ts`

Verification:
- migration exécutable
- insertion / lecture d’un report OK

### Lot 6 — Report rendering
Objective: afficher un rapport réel basé sur l’objet métier.

Files:
- Create: `app/(app)/report/[reportId]/page.tsx`
- Create: `components/report/*`
- Create: `lib/reports/serializer.ts`
- Create: `lib/reports/verdict.ts`

Verification:
- score global visible
- sections FIRES visibles
- red flags / positives rendus depuis données

### Lot 7 — Export PDF
Objective: produire un PDF cohérent depuis le même report.

Files:
- Create: `app/api/pdf/[reportId]/route.ts`
- Create: `lib/reports/pdf.ts`

Verification:
- téléchargement d’un PDF valide
- cohérence contenu report web / PDF

### Lot 8 — Dashboard minimal
Objective: permettre de retrouver les rapports existants.

Files:
- Create: `app/(app)/dashboard/page.tsx`
- Create: `components/dashboard/*`

Verification:
- liste des rapports
- tri date / statut
- navigation vers chaque rapport

---

## 8. Règles de build à ne pas casser

- ne pas repartir d’un template SaaS générique
- ne pas surconstruire la plateforme
- ne pas mélanger collecte, scoring et rendu dans le même fichier
- ne pas faire dépendre le PDF d’un deuxième format métier
- ne pas optimiser multi-chaîne avant d’avoir Solana propre
- ne pas brancher l’API publique avant d’avoir le parcours V1 fonctionnel

---

## 9. Ordre d’exécution immédiat recommandé

Ordre concret maintenant:
1. bootstrap Next.js propre
2. déplacer la landing actuelle en `legacy/landing-static/`
3. recréer la landing dans App Router
4. créer `/request`
5. créer le contrat `Report` + types
6. brancher Supabase
7. créer une première génération de rapport mocké réaliste
8. rendre `/report/[reportId]`
9. brancher PDF
10. ajouter dashboard minimal

---

## 10. Définition de done V1

La V1 est “done” quand:
- la landing est en Next.js et fidèle à la DA
- `/request` accepte une vraie soumission
- un rapport est généré et stocké
- `/report/[reportId]` affiche un verdict complet
- le PDF est exportable
- `/dashboard` liste les rapports
- le système est prêt à remplacer le moteur mock par un moteur réel par chaîne

---

## 11. Prochaine action Hermes

Action suivante recommandée:
- exécuter le Lot 1 immédiatement
- puis enchaîner Lot 2 et Lot 3 pour remettre la landing en ligne sur une vraie base applicative
