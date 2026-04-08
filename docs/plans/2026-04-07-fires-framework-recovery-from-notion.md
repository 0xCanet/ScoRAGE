# ScoRAGE — Recovery du framework historique FIRES (5 x 20 pts)

Objectif
Reconnecter le moteur MVP à la logique historique déjà définie dans Notion, pour éviter de réinventer le scoring. Le framework d'origine est clair : 5 piliers, 20 points chacun, soit un total sur 100.

Piliers retrouvés
- Fundamentals = F
- Infra & Tokenomics = I
- Reputation = R
- Engagement = E
- Signals IA = S

Conclusion immédiate
Le framework historique est parfaitement réutilisable pour le MVP actuel. Il n'a pas besoin d'être remplacé. Il doit être :
1. normalisé en règles codées dans le repo
2. alimenté par quelques APIs bien choisies
3. rendu dans un rapport lisible et traçable

---

## 1. Mapping direct des 5 piliers

### F — Fundamentals (20 pts)
Ce pilier mesure la solidité de base du projet.

Sous-critères retrouvés
- Site web
- Whitepaper
- Équipe / identité
- Légalité
- Whois / domaine

Sens produit
Ce pilier répond à :
- le projet existe-t-il vraiment ?
- est-il documenté ?
- y a-t-il un minimum de cadre ?

Automatisation réaliste MVP
- Vérification du site reachable / HTTPS / domaine cohérent
- Détection du whitepaper PDF ou litepaper
- Whois / âge du domaine
- Détection de pages équipe / LinkedIn / X
- Détection de mentions légales ou structure footer
- Analyse LLM du whitepaper si présent

APIs / méthodes utiles
- WhoisXML ou équivalent whois/domain age
- fetch/scraping site
- parsing liens PDF
- LLM pour résumé + red flags documentaires

Ce qu'on peut faire en V1 sans se perdre
- score site
- score whitepaper
- score domaine
- score équipe visible ou non
- score minimum de structure légale/documentaire

---

### I — Infra & Tokenomics (20 pts)
Ce pilier mesure la robustesse technique et économique du token/contrat.

Sous-critères retrouvés
- Contrat vérifié
- Code du contrat
- Supply & mint
- Liquidity lock
- Taxes & mécanismes
- malus explicites : mint infini, proxy, honeypot, LP non verrouillée, concentration wallets, taxes > 10%

Sens produit
Ce pilier répond à :
- le contrat est-il dangereux ?
- la tokenomics peut-elle être manipulée ?
- le token est-il techniquement ruggable ?

Automatisation réaliste MVP
- Contrat/token détecté et lisible
- Vérification source / explorer si dispo
- Liquidité, pair, volume
- Signaux mint / honeypot / taxes / blacklist
- Concentration holders
- LP lock si récupérable proprement

APIs / méthodes utiles
- RPC chaîne
- Dexscreener
- Birdeye (Solana)
- Explorer APIs (Etherscan/BscScan ou équivalent)
- GoPlus / TokenSniffer / équivalent security

Ce qu'on fait en V1
- pair détectée ?
- liquidité suffisante ?
- concentration anormale ?
- contrat vérifié ?
- honeypot/taxes/mint flags si provider dispo ?

C'est le pilier le plus critique pour un MVP anti-scam.

---

### R — Reputation (20 pts)
Ce pilier mesure la réputation web et sociale du projet.

Sous-critères retrouvés
- Présence sur X / Web
- Alertes & blacklists
- IA reputation
- Cohérence des claims
- Réseaux pro / fondateurs

Sens produit
Ce pilier répond à :
- l'écosystème connaît-il ce projet ?
- est-il déjà signalé comme douteux ?
- sa communication est-elle crédible ?

Automatisation réaliste MVP
- présence X / site / agrégateurs
- recherche alertes / blacklists
- LLM sur ton et crédibilité du discours
- détection promesses abusives
- vérification présence minimale des fondateurs ou réseaux associés

APIs / méthodes utiles
- X scraping léger ou API si disponible
- blacklists / providers sécurité
- recherche web légère
- LLM pour ton / claims / crédibilité

Ce qu'on fait en V1
- présence publique minimale
- alertes critiques existantes ou non
- claims raisonnables ou bullshit
- fondateurs visibles ou non

---

### E — Engagement (20 pts)
Ce pilier mesure la traction communautaire réelle.

Sous-critères retrouvés
- Activité X
- Discord / Telegram
- Bot detection
- Antériorité & suivi
- Qualité des échanges

Sens produit
Ce pilier répond à :
- y a-t-il une vraie communauté ?
- ou seulement du bruit et des bots ?

Automatisation réaliste MVP
- vérifier que X, Telegram, Discord existent
- mesurer activité récente minimale
- détecter si communauté morte / vide
- éventuellement score qualitatif simple sur volume et fraîcheur
- LLM possible sur quelques messages si récupérables

APIs / méthodes utiles
- X API/scraping
- Telegram metadata accessible si public
- Discord seulement si serveur public exploitable
- scraping simple + signaux de fraîcheur
- LLM en second temps

Ce qu'on fait en V1
- existence des canaux
- fraîcheur de l'activité
- cohérence basique engagement vs taille affichée

Ce qu'on évite en V1
- suringénierie de bot detection complexe
- dépendance à des APIs sociales coûteuses si peu utiles au départ

---

### S — Signals IA (20 pts)
Ce pilier mesure les signaux transverses détectés par modèle.

Sous-critères retrouvés
- Similarité avec scams
- Contradictions internes
- Claims & promesses
- Qualité technique globale
- Ton & wording

Sens produit
Ce pilier répond à :
- le projet ressemble-t-il à des scams déjà vus ?
- le discours est-il incohérent ou manipulatoire ?
- le niveau global paraît-il crédible ?

Automatisation réaliste MVP
- LLM sur site + whitepaper + bio sociale
- détection buzzwords, promesses irréalistes, contradictions
- matching simple avec patterns de scam connus
- score IA comme couche de synthèse, pas comme vérité absolue

APIs / méthodes utiles
- LLM
- base interne de patterns / red flags
- text extraction site + whitepaper + socials

Ce qu'on fait en V1
- contradictions
- promesses absurdes
- ton FOMO / agressif
- drapeaux de scam pattern simples

Ce qu'on ne doit pas faire
- laisser le LLM inventer un score opaque sans preuves

---

## 2. Traduction en moteur MVP concret

### Architecture cible
Le moteur doit suivre :
- input
- evidence collection
- evidence normalization
- scoring FIRES
- synthesis
- rendering

### Règle clé
Chaque pilier doit être alimenté par des preuves réelles.
Le score final ne doit jamais sortir de nulle part.

### Objet minimum à produire
- score F /20
- score I /20
- score R /20
- score E /20
- score S /20
- total /100
- verdict
- red flags
- positives
- evidences liées à chaque pilier

---

## 3. Priorisation MVP à partir du framework historique

### MVP v1.0
À brancher absolument
- F : site / whitepaper / domaine
- I : RPC + Dexscreener + Birdeye + security flags minimum
- R : présence web + blacklists + claims
- E : existence + fraîcheur basique des canaux
- S : LLM contradictions + bullshit detection

### MVP v1.1
À ajouter ensuite
- explorer verification plus profonde
- LP lock mieux fiabilisé
- meilleure lecture holders/concentration
- réputation enrichie
- patterns de scam plus solides

---

## 4. APIs recommandées après recovery du framework

### Priorité P0
- RPC Solana
- RPC EVM
- Dexscreener
- Birdeye
- Whois/domain age
- LLM

### Priorité P1
- explorer APIs
- GoPlus ou équivalent security
- scraping X plus solide

### Priorité P2
- enrichissements sociaux avancés
- matching scam DB plus évolué
- providers premium additionnels

---

## 5. Décision produit claire

Le framework historique Notion ne doit pas rester un document.
Il doit devenir :
- des adapters API
- des règles FIRES codées
- des evidences normalisées
- un rapport traçable

En une phrase
L'ancien framework est déjà la bonne recette produit. Il faut maintenant l'implémenter proprement dans le repo au lieu de le laisser dans Make/Notion seulement.

---

## 6. Prochaine action recommandée

Construire maintenant la page suivante :
"Variables d'environnement et clés API à fournir"
avec :
- nom de chaque clé
- usage
- pilier FIRES concerné
- obligatoire ou optionnel
- ordre d'intégration
