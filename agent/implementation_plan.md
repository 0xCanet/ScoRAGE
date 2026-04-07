# ScoRAGE V2 — Plan de refonte exécutable

---

## 1. Vision V2

ScoRAGE V2 est un **terminal d'investigation crypto**. Chaque page est une interface de contrôle : dense, froide, monospace-heavy, où le rouge ne signale que le danger et où aucun mot ne parle du produit lui-même. La landing est un briefing opérationnel. Le formulaire est un sas d'entrée à 2 champs. Le rapport est une console d'investigation avec des sections d'evidence empilées. Le dashboard est un centre de surveillance. Le tout parle français, sauf le jargon technique anglais du domaine (F.I.R.E.S., Financials, Security, red flags). Le bruit de fond, les bordures fines et les fonds opaques noirs créent un univers de **vigilance permanente** — pas de douceur, pas de blur, pas de glow décoratif, pas de méta-commentaire.

---

## 2. Architecture finale par page

### 2.1 Landing

```
┌─────────────────────────────────────────────┐
│ TOPBAR (sticky, opaque)                     │
│ Logo ScoRAGE | liens ancre | CTA btn-sm     │
├─────────────────────────────────────────────┤
│ HERO                                        │
│ ┌──────────────────┐ ┌────────────────────┐ │
│ │ eyebrow chains   │ │ SCORE CARD         │ │
│ │ H1 display       │ │ scan-line animée   │ │
│ │ lead 2 lignes    │ │ score count-up     │ │
│ │ terminal-input   │ │ badge pulse-danger │ │
│ │ [CTA] [ghost]    │ │ 3 red flags        │ │
│ └──────────────────┘ └────────────────────┘ │
├─────────────────────────────────────────────┤
│ PREUVE PRODUIT (section--abyss)             │
│ eyebrow + H2                                │
│ ┌─────────────────────────────────────────┐ │
│ │ MOCKUP-FRAME (barre terminal + 3 dots) │ │
│ │ ┌────────────┐ ┌──────────────────────┐ │ │
│ │ │ Score 12   │ │ F.I.R.E.S. rows     │ │ │
│ │ │ /100       │ │ F 8 │ I 5 │ R 18 …  │ │ │
│ │ └────────────┘ └──────────────────────┘ │ │
│ │ badges red-flag + badge safe            │ │
│ │ verdict block                           │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ PROCESS (3 colonnes)                        │
│ eyebrow + H2                                │
│ [01 Colle] [02 Scan] [03 Verdict]           │
│ — chaque step = icône mono + titre + desc   │
├─────────────────────────────────────────────┤
│ F.I.R.E.S. (section--abyss)                │
│ eyebrow + H2                                │
│ tabs gauche | panel droit                   │
│ — transition fade entre tabs                │
├─────────────────────────────────────────────┤
│ CHAINS                                      │
│ eyebrow + H2                                │
│ 4 cards avec icône chain + stat clé         │
├─────────────────────────────────────────────┤
│ PRICING (section--abyss)                    │
│ eyebrow + H2                                │
│ 2 cartes Starter / Pro côte à côte          │
│ — Pro featured avec bordure blood           │
├─────────────────────────────────────────────┤
│ FAQ                                         │
│ narrow-container, accordéon +/−             │
├─────────────────────────────────────────────┤
│ CTA FINAL (section--abyss)                  │
│ H2 + terminal-input + CTA + meta reassurance│
├─────────────────────────────────────────────┤
│ FOOTER                                      │
│ logo | © 2026 | Mentions légales | Contact  │
└─────────────────────────────────────────────┘
```

**Changements** :
- Navbar : fond opaque `--color-void`, suppression du `backdrop-filter: blur()`
- Hero : score card avec `scan-line` animée + count-up + pulse-danger sur badge
- Preuve produit : wrappé dans `mockup-frame` avec barre terminal (3 dots, titre JetBrains Mono)
- Chains : ajout icône SVG monochrome par chain + une stat chiffrée
- CTA final : ajout d'un compteur social proof ou d'un micro-verdict
- Footer : **nouveau composant** — minimal, 1 ligne

---

### 2.2 Request

```
┌─────────────────────────────────────────────┐
│ APP-TOPBAR (sticky, opaque)                 │
│ Logo ScoRAGE | ← Dashboard | Nouvelle analyse│
├─────────────────────────────────────────────┤
│ HERO compact                                │
│ eyebrow "Nouvelle analyse"                  │
│ H1 "Colle l'adresse. On vérifie."           │
│ lead: réassurance (2-5 min, 4 chaînes, PDF) │
├─────────────────────────────────────────────┤
│ FORM CARD (pleine largeur, max-width 640px) │
│ ┌─────────────────────────────────────────┐ │
│ │ Chain  [Select ▾]                       │ │
│ │ Adresse du contrat [________________]   │ │
│ │                                         │ │
│ │ [▸ Informations complémentaires]        │ │
│ │   Project name | Email                  │ │
│ │   Website | X | Telegram                │ │
│ │   Notes                                 │ │
│ │                                         │ │
│ │ [■ LANCER L'ANALYSE]                    │ │
│ │  Gratuit · 3 scans/mois                 │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Changements** :
- **Suppression** du panel gauche "Données requises / Scanner un token" — inutile, duplique l'info
- **Suppression** de tout texte dev (Supabase, mock, payload, backend)
- Layout **single-column centré** au lieu de grid 2 colonnes
- Champs optionnels cachés dans un `<details>` / disclosure
- Eyebrow : "Nouvelle analyse" au lieu de "Request flow" / "/request"
- App-topbar produit au lieu de la navbar marketing
- Meta footer du bouton : "Gratuit · 3 scans/mois" au lieu du texte mock

---

### 2.3 Report

```
┌─────────────────────────────────────────────┐
│ APP-TOPBAR                                  │
│ Logo | ← Dashboard | Nouvelle analyse | PDF │
├─────────────────────────────────────────────┤
│ REPORT HERO                                 │
│ ┌────────────────────────┐ ┌──────────────┐ │
│ │ eyebrow Report/ID      │ │ SCORE PANEL  │ │
│ │ H1 project name        │ │ score /100   │ │
│ │ summary                │ │ verdict desc │ │
│ │ [badges row]           │ │ ─────────── │ │
│ │ meta: date|method|model│ │ stats 2×2   │ │
│ │ actions: PDF|Copy|New  │ │              │ │
│ └────────────────────────┘ └──────────────┘ │
├─────────────────────────────────────────────┤
│ F.I.R.E.S. BREAKDOWN        │ SIGNAUX      │
│ ┌──────────────────────┐     │ ┌──────────┐ │
│ │ F row [■■■■░░] 46    │     │ │ Red flags│ │
│ │ I row [■■■■░░] 48    │     │ │ ⚠ item   │ │
│ │ R row [■■■■░░] 52    │     │ │ ✕ item   │ │
│ │ E row [■■■■░░] 56    │     │ ├──────────┤ │
│ │ S row [■■■░░░] 45    │     │ │ Positifs │ │
│ └──────────────────────┘     │ │ ✓ item   │ │
│                              │ └──────────┘ │
├─────────────────────────────────────────────┤
│ EVIDENCE CARDS (grille 2 col)               │
│ eyebrow "Evidence"                          │
│ ┌──────────────┐ ┌──────────────┐           │
│ │ kicker+title │ │ kicker+title │           │
│ │ [severity]   │ │ [severity]   │           │
│ │ detail       │ │ detail       │           │
│ │ ─── footer   │ │ ─── footer   │           │
│ └──────────────┘ └──────────────┘           │
├─────────────────────────────────────────────┤
│ METADATA + ACTIONS                          │
│ meta 2×2        │ "Étapes suivantes"        │
│ IDs, status,    │ PDF download              │
│ date            │ → Dashboard               │
└─────────────────────────────────────────────┘
```

**Changements** :
- **Suppression** de toute méta-description ("Evidence is grouped as...", "Each score contributes...")
- Section titres : "Breakdown" → "Scores F.I.R.E.S." / "Signal mix" → "Signaux détectés" / "Detail cards" → "Evidence" / "Keep moving" → "Étapes suivantes"
- Red flags : remplacer `stack-list` (✓ vert) par `signal-list` composant dédié avec icônes sévérité (✕ critical, ⚠ warning, ✓ positif)
- F.I.R.E.S. rows : ajouter une barre de progression visuelle (segment bar 0-100)
- App-topbar produit
- "fires-mock-v1" → "F.I.R.E.S. v1"

---

### 2.4 Dashboard

```
┌─────────────────────────────────────────────┐
│ APP-TOPBAR                                  │
│ Logo | Dashboard (active) | Nouvelle analyse│
├─────────────────────────────────────────────┤
│ HEADER BAR                                  │
│ H1 "Centre de surveillance"                 │
│ eyebrow "Dashboard"  [■ NOUVELLE ANALYSE]   │
├─────────────────────────────────────────────┤
│ STAT ROW (4 colonnes)                       │
│ [Analyses ✓ 3] [En cours ◌ 0]              │
│ [Échecs ✕ 0]   [Total ▣ 3]                 │
├─────────────────────────────────────────────┤
│ FILTER BAR                                  │
│ [Toutes ▾] [Chain ▾] [Tri: récent ▾]       │
├─────────────────────────────────────────────┤
│ REPORT TABLE / LIST                         │
│ ┌─────────────────────────────────────────┐ │
│ │ Nightfox  Base·0x7f2e  [MOD] 56  → Open│ │
│ ├─────────────────────────────────────────┤ │
│ │ Pulse Rtr Solana·PuLs  [HIGH] 47 → Open│ │
│ ├─────────────────────────────────────────┤ │
│ │ Iron Finch ETH·0x9a8b  [MOD] 57  → Open│ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ FOOTER                                      │
└─────────────────────────────────────────────┘
```

**Changements** :
- **Suppression** de tous les textes dev ("minimal working list", "seeded demo scans", "Supabase")
- **Suppression** du bouton "Landing" — n'a rien à faire dans le produit
- Titre : "Report history" → "Centre de surveillance"
- Copy : "Historique de vos analyses et verdicts."
- Stat cards : ajouter une icône monochrome devant chaque label
- Report items : **compactés en table-rows denses** au lieu de grandes cartes
- Ajout de la **filter bar** (chain, status, tri)
- Ajout du score-bar mini (barre 30px) dans chaque row
- Empty state : "Aucune analyse. Lancez votre premier scan." + CTA
- App-topbar produit

---

## 3. Liste des composants

### Composants à CRÉER

| Composant | Fichier | Usage |
|---|---|---|
| `AppTopbar` | `components/app/app-topbar.tsx` | Navigation produit (request, report, dashboard). Logo + liens contextuels. Fond opaque. |
| `Footer` | `components/marketing/footer.tsx` | Landing + pages produit. Logo, ©, mentions légales, contact. |
| `MockupFrame` | `components/marketing/mockup-frame.tsx` | Wrapper barre terminal (3 dots + titre mono) pour la preuve produit. |
| `ScoreBar` | `components/ui/score-bar.tsx` | Barre horizontale segmentée 0-100 pour les scores F.I.R.E.S. Couleur dynamique par seuil. |
| `SignalList` | `components/report/signal-list.tsx` | Liste de signaux avec icône de sévérité (✕ critical rouge, ⚠ warning jaune, ✓ positif vert). Remplace `stack-list` dans le report. |
| `FilterBar` | `components/dashboard/filter-bar.tsx` | Filtres dashboard : chain, status, tri. Composants select stylés. |
| `StatCard` | `components/ui/stat-card.tsx` | Carte stat avec icône + label + valeur. Dashboard + potentiel report. |
| `CountUp` | `components/ui/count-up.tsx` | Animation count-up pour les scores numériques affichés (hero, report). Client component. |
| `Disclosure` | `components/ui/disclosure.tsx` | Accordéon pour les champs optionnels du formulaire request. |

### Composants à CORRIGER

| Composant | Fichier | Correction |
|---|---|---|
| `Navbar` | `components/marketing/navbar.tsx` | Supprimer `backdrop-filter: blur()`. Fond opaque `rgba(10,10,10,0.98)`. |
| `MarketingPage` | `components/marketing/marketing-page.tsx` | Intégrer `MockupFrame`, `Footer`, score animé, icons chains. |
| `RequestForm` | `components/request/request-form.tsx` | Réduire à 2 champs visibles + disclosure pour optionnels. Purger textes dev. |
| `ReportView` | `components/report/report-view.tsx` | Purger méta-descriptions. Titres FR. `SignalList` au lieu de `stack-list`. `ScoreBar` sur F.I.R.E.S. rows. |
| `DashboardView` | `components/dashboard/dashboard-view.tsx` | Purger textes dev. Layout table dense. Intégrer `FilterBar`. Supprimer bouton "Landing". |
| `ReportListItem` | `components/dashboard/report-list-item.tsx` | Compacter en row dense. Ajouter score-bar mini. |
| `FAQList` | `components/marketing/faq-list.tsx` | Ajouter transition CSS `max-height` au lieu de `display: none/block`. |
| `FiresFramework` | `components/marketing/fires-framework.tsx` | Transition fade entre panels. |
| `RequestPage` | `app/request/page.tsx` | Single-column. Supprimer panel gauche. Intégrer `AppTopbar`. |
| `ReportPage` | `app/report/[reportId]/page.tsx` | Intégrer `AppTopbar`. |
| `DashboardPage` | `app/(app)/dashboard/page.tsx` | Intégrer `AppTopbar`. |

### Composants / éléments à SUPPRIMER

| Élément | Raison |
|---|---|
| Panel gauche request ("Données requises / Scanner un token") | Duplique l'info du formulaire, contient du texte dev |
| Texte "Le mock local s'active si Supabase n'est pas configuré" | Texte dev |
| Texte "Evidence is grouped as compact, high-contrast cards..." | Méta-description |
| Texte "Each score contributes to the combined verdict." | Méta-description |
| Texte "A minimal working list of available reports..." | Texte dev |
| Bouton "Landing" dans le dashboard | Hors contexte produit |
| Eyebrow `/request` | Nom de route technique |
| Bouton "Retour à la landing" bare dans request | Remplacé par topbar |

---

## 4. Règles UI systématiques

### 4.1 Hiérarchie visuelle

| Niveau | Traitement | Exemple |
|---|---|---|
| **Donnée critique** | JetBrains Mono, grande taille, couleur sémantique | Score 27, badge CRITICAL |
| **Titre de section** | Space Grotesk 600, `--color-white`, H2 | "Scores F.I.R.E.S." |
| **Corps de contenu** | Inter 400, `--color-bone`, 17px | Paragraphes, descriptions |
| **Metadata** | JetBrains Mono 11px uppercase, `--color-ash`, letter-spacing 0.1em | "GENERATED", "CHAIN", labels |
| **Action secondaire** | Inter 500, `--color-ash`, underline | "Étapes suivantes", ghost links |

### 4.2 Spacing

| Contexte | Règle |
|---|---|
| Entre sections landing | `padding: 96px 0` desktop, `64px 0` mobile — jamais moins |
| Entre blocs dans une section | `gap: 24px` à `32px` |
| Padding interne carte | `24px` standard, `32px` cartes héro, `16px` cartes compactes (dashboard rows) |
| Gap dans grilles de données | `12px` — plus serré que le marketing |
| Pages produit (request/report/dashboard) | Spacing **réduit de 20%** par rapport au marketing pour la densité |

### 4.3 Couleur

| Règle | Application |
|---|---|
| Rouge = danger ou CTA, **jamais décoration** | Boutons CTA, badges critical/high, score critique, bordure d'alerte |
| Vert = positif/safe **uniquement** | Badge safe, ✓ devant un point rassurant, score low |
| Jaune = avertissement modéré | Badge moderate — et le jaune passe de `#f9fe08` à `#d4a017` (ambre désaturé) |
| Fond de page = `--color-void` (#0a0a0a) | Jamais de blanc, jamais de gris clair |
| Sections alternées = void / abyss | Rythme vertical clair |
| Glow = hover et danger actif uniquement | Jamais en repos, jamais décoratif |

### 4.4 Densité d'information

| Page | Niveau de densité |
|---|---|
| Landing | **Moyenne** — sections aérées mais chaque bloc a du contenu substantif (pas de cartes vides) |
| Request | **Basse** — focus mono-tâche, rien ne distrait du formulaire |
| Report | **Haute** — console d'investigation, données empilées, peu de vide |
| Dashboard | **Haute** — tableau, stats, filtres, tout sur un écran si possible |

### 4.5 États Loading / Empty / Error

| État | Traitement visuel |
|---|---|
| **Loading** | Skeleton cards avec fond `--color-graphite` pulsant à `--color-abyss` (animation CSS `pulse` 1.5s). Pas de spinner. Pas de texte "Chargement…". |
| **Empty (dashboard)** | Card simple : eyebrow "Aucune analyse", H2 "Lancez votre premier scan", CTA `btn-primary`. Pas de texte technique. |
| **Empty (report missing)** | Card : "Rapport introuvable", H2 "Ce rapport n'existe pas ou a expiré.", CTA "Nouvelle analyse" + "Dashboard". |
| **Error (form submit)** | Message inline rouge sous le bouton : phrase concise. Champs en erreur = bordure `--color-blood` + message sous le champ. |
| **Error (API)** | Card : badge `ERREUR` rouge, texte descriptif, CTA retry. Pas de stack trace. |
| **Processing (report)** | Page report avec skeleton + indicateur "Analyse en cours" + animation scan-line. Score affiché `--` en gris. |

---

## 5. Copy Rules

| Règle | Explication |
|---|---|
| **Langue = français** | Tout le copy utilisateur est en français. Exception : les termes techniques du domaine restent en anglais (F.I.R.E.S., Financials, Integrity, Reputation, Ecosystem, Security, red flags, honeypot). |
| **Aucun texte ne décrit le produit** | Supprimer "Evidence is grouped as...", "Each score contributes...", "A minimal working list...". Le produit montre, il ne se raconte pas. |
| **Aucun terme technique backend** | Supprimer Supabase, payload, mock, seed, cache, API, backend de tout texte visible. |
| **Aucun nom de route** | Supprimer `/request`, `Request flow`, etc. Utiliser des labels humains : "Nouvelle analyse", "Rapport", "Dashboard". |
| **Ton = factuel, froid, direct** | Pas de tutoiement excessif. Phrases courtes. Pas d'exclamation. "Colle l'adresse. On vérifie." pas "Hey! Teste notre outil !!" |
| **Labels de section** | Eyebrows en monospace uppercase sont des **catégories factuelles** ("Méthodologie", "Pricing", "Evidence"), pas des descriptions ("Preuve produit" → ok, "Ce que tu reçois" → trop narratif pour l'eyebrow). |
| **Methodology version** | "fires-mock-v1" → "F.I.R.E.S. v1" partout. |

---

## 6. Anti-patterns absolus

| ❌ Interdit | Pourquoi |
|---|---|
| `backdrop-filter: blur()` | Glassmorphism. Adoucit l'interface. Viole le design system. |
| `border-radius > 6px` | Arrondi startup. Détruit la tension angulaire. |
| Glow en repos (pas hover/danger) | Décoration gratuite. Le glow est une réaction, pas un état. |
| Texte qui décrit le design | "Cards are compact and high-contrast" — syndrome du template. |
| Texte backend/dev visible | "Supabase", "mock", "payload", "seed" — tue la crédibilité. |
| ✓ vert devant un red flag | Incohérence sémantique fatale sur un outil de risque. |
| Mélange FR/EN dans le même bloc | Choisir une langue par contexte et s'y tenir. |
| Bouton "Landing" dans le produit | Le produit n'a pas de lien vers sa propre pub. |
| Score jaune `#f9fe08` en grand | Trop saturé, esthétique jeu vidéo. Utiliser `#d4a017`. |
| Sections vides / cartes avec juste un chiffre | Pas de densité. Ajouter contexte, icône, tendance. |
| Spinner loading | Pas de spinner. Skeleton pulse uniquement. |
| Placeholder "lorem ipsum" ou texte non finalisé | Chaque mot est définitif ou absent. |

---

## 7. Todo exécutable — ordre exact

> [!IMPORTANT]
> Chaque étape est séquentielle. Ne pas commencer l'étape N+1 avant que N soit fait et vérifié.

### Phase 1 — Assainissement (P0, pas de nouveau composant)

| # | Action | Fichiers |
|---|---|---|
| 1 | **Purger tous les textes dev** de request page, request form, dashboard view, report view, report page. Remplacer par du copy utilisateur FR. | `app/request/page.tsx`, `components/request/request-form.tsx`, `components/dashboard/dashboard-view.tsx`, `components/report/report-view.tsx`, `app/report/[reportId]/page.tsx` |
| 2 | **Supprimer le backdrop-filter blur** de la navbar. Fond opaque `rgba(10,10,10,0.98)` + `border-bottom: 1px solid var(--color-steel)`. | `app/globals.css` (`.navbar-shell`) |
| 3 | **Fixer les ✓ verts sur red flags** dans le report. Créer `SignalList` avec icônes sévérité (✕/⚠/✓). Remplacer `stack-list` dans report-view pour les red flags et positives. | `components/report/signal-list.tsx` (nouveau), `components/report/report-view.tsx` |
| 4 | **Changer le jaune saturé** `--color-signal-yellow` de `#f9fe08` à `#d4a017` et ajuster `--color-signal-yellow-ghost`. | `app/globals.css` (:root) |
| 5 | **Uniformiser la langue** : passer les titres report en FR ("Scores F.I.R.E.S.", "Signaux détectés", "Evidence", "Métadonnées", "Étapes suivantes"). Garder les noms de catégories F.I.R.E.S. en anglais. | `components/report/report-view.tsx` |

### Phase 2 — Composants structurels

| # | Action | Fichiers |
|---|---|---|
| 6 | **Créer `AppTopbar`** : logo, navigation contextuelle (Dashboard, Nouvelle analyse), fond opaque void. | `components/app/app-topbar.tsx`, `app/globals.css` |
| 7 | **Créer `Footer`** : logo left, liens center (Mentions légales, Contact), © right. 1 ligne, `--color-abyss` fond, `border-top: 1px solid var(--color-steel)`. | `components/marketing/footer.tsx`, `app/globals.css` |
| 8 | **Intégrer AppTopbar** dans request, report, dashboard. **Intégrer Footer** dans landing et pages produit. | `app/request/page.tsx`, `app/report/[reportId]/page.tsx`, `app/(app)/dashboard/page.tsx`, `components/marketing/marketing-page.tsx` |

### Phase 3 — Request V2

| # | Action | Fichiers |
|---|---|---|
| 9 | **Refondre la page request** : supprimer le panel gauche, layout single-column centré (max-width 640px), hero compact (eyebrow "Nouvelle analyse", H1, lead réassurance). | `app/request/page.tsx`, `app/globals.css` |
| 10 | **Refondre le formulaire** : 2 champs visibles (chain + address), champs optionnels dans un `Disclosure` expandable. Footer bouton : "Gratuit · 3 scans/mois". | `components/request/request-form.tsx`, `components/ui/disclosure.tsx` (nouveau) |

### Phase 4 — Report V2

| # | Action | Fichiers |
|---|---|---|
| 11 | **Créer `ScoreBar`** : barre horizontale 100% width, hauteur 6px, segmentée avec couleur dynamique (`--color-blood` < 25, ambre < 50, vert > 75). | `components/ui/score-bar.tsx`, `app/globals.css` |
| 12 | **Intégrer ScoreBar** dans les F.I.R.E.S. rows du report. Chaque row affiche : lettre | nom | barre | score. | `components/report/report-view.tsx` |
| 13 | **Supprimer toutes les méta-descriptions** restantes dans report-view. Vérifier qu'aucun texte ne décrit le design. | `components/report/report-view.tsx` |

### Phase 5 — Dashboard V2

| # | Action | Fichiers |
|---|---|---|
| 14 | **Créer `FilterBar`** : row de selects stylés (statut, chain, tri). Style cohérent avec les inputs request. | `components/dashboard/filter-bar.tsx`, `app/globals.css` |
| 15 | **Créer `StatCard`** : icône monochrome + label uppercase mono + valeur grande. | `components/ui/stat-card.tsx` |
| 16 | **Refondre DashboardView** : titre "Centre de surveillance", stat row avec `StatCard`, filter bar, liste compacte. Supprimer bouton "Landing". | `components/dashboard/dashboard-view.tsx` |
| 17 | **Compacter ReportListItem** : row dense, score-bar mini inline, lien "Ouvrir" plus visible. | `components/dashboard/report-list-item.tsx`, `app/globals.css` |

### Phase 6 — Landing polish

| # | Action | Fichiers |
|---|---|---|
| 18 | **Créer `MockupFrame`** : barre terminal (hauteur 28px, 3 dots, titre JetBrains Mono 11px) + conteneur avec shadow et border. | `components/marketing/mockup-frame.tsx`, `app/globals.css` |
| 19 | **Wrapper la preuve produit** dans MockupFrame. | `components/marketing/marketing-page.tsx` |
| 20 | **Créer `CountUp`** : animation client-side, IntersectionObserver + requestAnimationFrame, durée 1.2s ease-out. | `components/ui/count-up.tsx` |
| 21 | **Animer le score hero** : CountUp sur la valeur 27, scan-line CSS derrière la card, pulse-danger sur le badge. | `components/marketing/marketing-page.tsx`, `app/globals.css` |
| 22 | **Ajouter transition fade** sur les panels F.I.R.E.S. | `components/marketing/fires-framework.tsx`, `app/globals.css` |

### Phase 7 — Vérification

| # | Action |
|---|---|
| 23 | **Audit visuel complet** : ouvrir chaque page dans le browser, vérifier la cohérence, capturer des screenshots. |
| 24 | **Vérifier le responsive** : chaque page à 375px, 768px, 1440px. |
| 25 | **Vérifier la print/PDF** : s'assurer que `ReportPrintDocument` reflète les changements (FR, pas de ✓ sur red flags, pas de texte dev). |

---

## User Review Required

> [!IMPORTANT]
> **Langue** : Le plan impose le français partout sauf jargon technique. Confirmer que c'est la bonne direction (vs. tout en anglais).

> [!IMPORTANT]
> **Jaune** : Le plan change `--color-signal-yellow` de `#f9fe08` à `#d4a017` (ambre). C'est un changement du design system. Confirmer.

> [!IMPORTANT]
> **Dashboard** : Le plan ajoute des filtres UI (chain, status, tri). Cela suppose que le backend/store supporte le filtrage. Si `listReportSummaries()` ne supporte pas de paramètres, le filtrage sera côté client. Confirmer que c'est acceptable en V2.

> [!WARNING]
> **Scope** : Ce plan ne touche pas au backend, à l'API, ou à Supabase. C'est une refonte **front-end et copy uniquement**. Les données mock restent en place. Le plan ne crée pas de vraies pages légales (mentions légales, contact) — il crée les liens dans le footer qui pointeront vers des pages à créer plus tard.
