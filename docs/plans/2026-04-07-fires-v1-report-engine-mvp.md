# ScoRAGE — Architecture FIRES V1 / moteur de rapport réel

Objectif
Construire un premier moteur de rapports ScoRAGE réellement utile, sans repartir dans une usine à gaz. Le but n'est pas de couvrir toutes les blockchains et toutes les sources de données dès maintenant. Le but est d'obtenir un MVP capable de générer un rapport crédible, structuré et reproductible à partir d'un contrat et de quelques URLs projet.

Principes de décision
- Priorité au parcours produit réel : input -> collecte -> scoring -> synthèse -> rapport web/PDF.
- Priorité à Solana + EVM simple avant toute couverture exhaustive.
- Priorité à des APIs qui enrichissent directement le verdict.
- Le moteur principal doit vivre dans le code du produit, pas dans Make.com.
- Make.com peut rester utile plus tard pour l'automatisation secondaire, pas comme cœur du moteur de scoring.

---

## 1. Ce qu'on cherche à construire

### Ce que l'utilisateur final fera
1. Ouvrir ScoRAGE.
2. Coller une adresse de contrat.
3. Ajouter optionnellement : site, X, Telegram, nom projet.
4. Lancer l'analyse.
5. Recevoir un rapport :
   - score global /100
   - sous-scores F.I.R.E.S.
   - verdict
   - red flags
   - points rassurants
   - preuves détaillées et traçables
   - export PDF

### Ce que le produit doit faire en interne
1. Valider l'input.
2. Appeler les bons providers.
3. Transformer les réponses hétérogènes en `Evidence` normalisées.
4. Appliquer les règles FIRES.
5. Agréger les scores.
6. Produire une synthèse lisible.
7. Sauvegarder le rapport.
8. Le rendre dans l'UI et en PDF.

---

## 2. Décision structurante : ce qu'on ne fait pas maintenant

On ne fait pas maintenant :
- une API publique ScoRAGE vendable
- une couverture multi-chaîne profonde et homogène
- des dizaines de providers branchés à moitié
- un moteur temps réel complexe
- un pipeline Make.com central
- une notation "magique" non traçable

On fait maintenant :
- un pipeline simple, lisible, testable
- quelques providers à forte valeur
- un objet `Report` unique
- un moteur de scoring codé dans le repo
- un rapport compréhensible par un humain

---

## 3. APIs à brancher par priorité

### P0 — indispensables

#### A. RPC par chaîne
Rôle : fondation on-chain minimale.

À brancher :
- Solana RPC
- Ethereum/Base/BSC RPC

Permet de récupérer :
- existence du token/contrat
- métadonnées de base
- supply / owner / informations contractuelles de base selon chaîne
- base commune pour les autres règles

Pourquoi c'est indispensable
Sans RPC, ScoRAGE n'a pas de socle technique fiable.

#### B. Dexscreener
Rôle : vision marché / pair / liquidité / activité.

Permet de récupérer :
- existence d'une pair
- liquidité
- volume
- market data de base
- trading activity

Pourquoi c'est indispensable
Une grosse partie du verdict pré-investissement dépend de la liquidité et de l'existence réelle du marché.

#### C. Birdeye (priorité Solana)
Rôle : enrichissement Solana sérieux.

Permet de récupérer selon endpoints utilisés :
- token overview
- market/activity
- holders/concentration
- liquidité / trading enrichi

Pourquoi c'est très utile
Solana est la priorité naturelle du wedge ScoRAGE. Birdeye permet d'aller plus vite et plus proprement que du RPC brut sur tous les sujets.

### P1 — très utiles

#### D. Explorer API (Etherscan / BscScan / équivalent explorer)
Rôle : signaux de vérification et détails contrat.

Permet de récupérer :
- contrat vérifié ou non
- signaux proxy / source / ABI / metadata

Pourquoi c'est utile
Améliore fortement Integrity et Security.

#### E. Security API type GoPlus
Rôle : heuristiques sécurité prêtes à l'emploi.

Permet de récupérer :
- honeypot flags
- taxes anormales
- blacklist / trading restrictions
- ownership risk selon chaîne

Pourquoi c'est utile
Gros levier MVP si l'API est propre et exploitable.

### P2 — utiles plus tard
- CoinGecko
- données exchange centralisés
- GitHub score
- De.Fi
- scoring réputation plus complexes
- providers coûteux ou redondants

Conclusion produit
Pour un MVP sérieux, le meilleur point de départ est :
- RPC
- Dexscreener
- Birdeye
- éventuellement GoPlus ensuite

---

## 4. Architecture FIRES V1 recommandée

### 4.1 Input
Entrées minimales :
- chain
- contractAddress
- projectName optionnel
- websiteUrl optionnel
- xUrl optionnel
- telegramUrl optionnel
- notes optionnel

Objectif
Créer un payload propre et normalisé.

### 4.2 Evidence Collection
Le système interroge plusieurs adapters.

Adapters prévus :
- `rpc`
- `dexscreener`
- `birdeye`
- `explorer`
- `security`
- `social`
- `website`

Chaque adapter retourne non pas un rapport final, mais des faits normalisés.

### 4.3 Evidence Normalization
Toutes les réponses doivent être transformées en objets `Evidence` homogènes.

Exemple de structure :

```ts
export type EvidenceCategory = 'financials' | 'integrity' | 'reputation' | 'ecosystem' | 'security'
export type EvidenceSeverity = 'positive' | 'warning' | 'critical' | 'unknown'

export type Evidence = {
  id: string
  provider: string
  category: EvidenceCategory
  severity: EvidenceSeverity
  title: string
  detail: string
  rawValue?: string
  sourceLabel?: string
  sourceUrl?: string
  confidence?: number
  weight?: number
  createdAt: string
}
```

Pourquoi c'est critique
Le produit ne doit pas scorer directement des réponses API brutes. Il doit scorer des preuves normalisées.

### 4.4 Scoring Rules
Chaque règle FIRES prend des evidences et produit un impact.

Exemples :
- pas de pair détectée -> Financials critique
- liquidité très faible -> Financials warning/critical
- concentration top holders élevée -> Financials/Integrity warning
- contrat non vérifié -> Integrity warning
- honeypot flag -> Security critical
- site absent -> Reputation warning
- X absent -> Reputation warning
- Telegram absent -> Ecosystem warning
- signaux cohérents sur site + X + Telegram -> positives

Structure suggérée :

```ts
export type ScoreImpact = {
  ruleId: string
  category: EvidenceCategory
  delta: number
  severity: 'positive' | 'warning' | 'critical'
  rationale: string
  evidenceIds: string[]
}
```

### 4.5 Score Aggregation
Le moteur agrège par catégorie :
- Financials
- Integrity
- Reputation
- Ecosystem
- Security

Puis calcule :
- sous-scores
- score total
- verdict

### 4.6 Synthesis
À partir des impacts + evidences, produire :
- résumé exécutif
- red flags prioritaires
- points rassurants
- message final de décision

Important
La synthèse ne doit jamais inventer. Elle reformule ce qui a été réellement collecté et scoré.

### 4.7 Rendering
Un même objet `Report` sert à :
- page web
- PDF
- future API JSON

---

## 5. Structure technique recommandée dans le repo

### Fichiers à créer ou solidifier

```text
lib/
  analysis/
    collect.ts
    normalize.ts
    providers/
      rpc/
        solana.ts
        evm.ts
      dexscreener.ts
      birdeye.ts
      explorer.ts
      security.ts
      social.ts
      website.ts
  scoring/
    index.ts
    aggregate.ts
    rules/
      financials.ts
      integrity.ts
      reputation.ts
      ecosystem.ts
      security.ts
  reports/
    build-report.ts
    serializer.ts
    store.ts
types/
  evidence.ts
  report.ts
  score.ts
```

### Logique cible
- `createReportFromRequest()` ne doit plus construire un mock report.
- `createReportFromRequest()` doit faire :
  1. validate input
  2. collect evidences
  3. run scoring rules
  4. build report
  5. persist report
  6. return report

---

## 6. Ce que tu auras à fournir en tant que porteur produit

Tu n'as pas besoin de coder.
Tu auras surtout à fournir :

### A. Clés API
Exemples probables :
- Solana RPC provider key ou endpoint
- EVM RPC provider key ou endpoint
- Birdeye API key
- explorer keys éventuelles
- GoPlus ou autre security provider si retenu

### B. Décisions produit
- quelles chaînes en vrai MVP ?
- quels verdicts on affiche ?
- quelles règles sont bloquantes ?
- quel niveau de sévérité est toléré ?
- quels signaux doivent être visibles à l'écran ?

### C. Arbitrages business
- gratuit / payant
- nombre de scans
- PDF inclus ou non
- priorité solo vs B2B

---

## 7. Roadmap MVP recommandée

### Phase 1 — Moteur réel minimal
But : remplacer le mock par un vrai pipeline.

À faire :
- brancher RPC
- brancher Dexscreener
- brancher Birdeye
- normaliser les evidences
- coder 10 à 20 règles FIRES simples
- générer un vrai rapport exploitable

### Phase 2 — Crédibilisation
But : rendre le rapport plus solide.

À faire :
- ajouter explorer / verification
- ajouter security API
- mieux gérer les cas unknown / données manquantes
- améliorer la synthèse

### Phase 3 — Productisation
But : rendre le MVP vendable.

À faire :
- quotas
- auth si nécessaire
- historique solide
- PDF propre
- instrumentation
- tests

---

## 8. Ce qu'il faut retenir si on engage des devs plus tard

Le plus important à leur transmettre sera :
- le rapport ScoRAGE ne doit pas être une page design avec du faux texte
- le cœur du produit est le pipeline Evidence -> FIRES -> Report
- chaque score doit être traçable à des preuves
- on privilégie la lisibilité et la crédibilité, pas la complexité technique gratuite

En une phrase
ScoRAGE devient un vrai produit le jour où `buildMockReportBundle()` disparaît du chemin principal et est remplacé par un pipeline réel branché à quelques providers bien choisis.

---

## 9. Prochain plan d'action immédiat

### Ce que Hermes peut faire ensuite
1. Préparer la liste exacte des variables d'environnement à créer.
2. Préparer l'architecture fichiers/fonctions pour le moteur FIRES V1.
3. Lister précisément les endpoints API utiles par provider.
4. Implémenter les adapters un par un.
5. Remplacer le mock report par le pipeline réel.
6. Mettre à jour Notion au fur et à mesure pour que le projet reste compréhensible.

### Ce que toi tu fais
- fournir les clés API quand on te les demandera
- valider les arbitrages produit
- piloter la direction du MVP
- laisser Hermes documenter et dérouler le chantier
