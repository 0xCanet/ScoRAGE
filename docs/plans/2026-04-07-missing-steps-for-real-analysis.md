# ScoRAGE — étapes manquantes pour obtenir une vraie analyse

> Pour Hermes : utiliser ce document comme source de vérité pour transformer le MVP actuel en moteur d’analyse réellement utile, pas seulement en agrégateur de signaux rapides.

Objectif
Passer d’un rapport “techniquement vivant mais encore trop mince” à un rapport qui aide vraiment à décider si un projet crypto mérite de l’attention, une vérification manuelle ou un rejet immédiat.

Constat actuel
Le moteur actuel fait déjà des choses réelles :
- RPC Solana / EVM
- Dexscreener
- GoPlus public
- génération web/PDF

Mais le ressenti produit reste insuffisant parce qu’il manque encore :
- la qualification du bon objet analysé
- l’analyse du site et des documents
- l’analyse réputationnelle et sociale
- une vraie synthèse FIRES utile
- une hiérarchisation des signaux

En clair
Aujourd’hui ScoRAGE sait détecter des signaux.
Il ne sait pas encore raconter une analyse convaincante.

---

## 1. Problème principal à résoudre

Le rapport ne doit plus se contenter de :
- répéter les champs du formulaire
- afficher 2 ou 3 signaux machine
- sortir un score sans assez de matière

Le rapport doit pouvoir dire des choses comme :
- l’adresse fournie n’est pas un token fungible analysable normalement
- le site existe mais il est vide / pauvre / trop marketing
- aucun whitepaper ni page tokenomics n’a été trouvé
- le projet n’a pas de présence sociale crédible
- les claims sont trop vagues ou trop agressifs
- la liquidité est absente ou trop faible
- le contrat est lisible ou au contraire trop opaque

---

## 2. Étapes manquantes par priorité

## P0 — indispensable pour une vraie analyse

### Étape 1 — qualifier le type d’adresse avant toute analyse

But
Éviter d’analyser n’importe quoi comme si c’était automatiquement un token exploitable.

À faire
- déterminer si l’adresse est :
  - un token fungible
  - un programme / contrat générique
  - un wallet
  - un proxy
  - une adresse sans marché
- si l’objet n’est pas le bon, le dire immédiatement dans le rapport

Résultat attendu
Le rapport doit pouvoir afficher en haut :
- “adresse compatible avec une analyse token”
ou
- “adresse détectée comme programme / contrat non token”
ou
- “adresse non reliée à un marché détectable”

Pourquoi c’est critique
Sans cette étape, ScoRAGE peut avoir l’air de rater son analyse alors qu’on lui a donné le mauvais objet.

---

### Étape 2 — analyser réellement le site web

But
Ne plus dépendre uniquement de ce que l’utilisateur a collé dans le formulaire.

À faire
- fetch du HTML du site
- extraction du texte utile
- récupération du title / meta description / headings
- détection de pages clés :
  - home
  - about
  - docs
  - tokenomics
  - roadmap
  - team
  - legal
- détection des liens sortants :
  - X
  - Telegram
  - Discord
  - GitHub
  - whitepaper PDF

Résultat attendu
Créer de vraies evidences de type :
- site joignable ou non
- site minimal ou riche
- docs trouvées ou absentes
- whitepaper présent ou absent
- équipe visible ou absente
- mentions légales visibles ou absentes

Pourquoi c’est critique
C’est ce qui transforme une simple lecture on-chain en vraie analyse projet.

---

### Étape 3 — détecter et analyser le whitepaper / litepaper

But
Pouvoir dire si le projet explique quelque chose de sérieux ou s’il ne vend que du vide.

À faire
- détecter les liens PDF / docs
- télécharger le document si trouvé
- extraire le texte
- repérer :
  - tokenomics
  - use case
  - roadmap
  - gouvernance
  - équipe
  - risques
- produire une synthèse courte :
  - document sérieux
  - document léger
  - document creux
  - aucun document trouvé

Résultat attendu
Nouvelles evidences Fundamentals / Signals IA / Reputation.

Pourquoi c’est critique
Le whitepaper est l’une des meilleures sources pour distinguer un projet minimum sérieux d’un scam paresseux.

---

### Étape 4 — enrichir la couche Fundamentals

But
Faire exister réellement le pilier F.

À faire
- whois / âge du domaine
- vérifier HTTPS / cohérence domaine
- détecter si le domaine est jeune
- repérer les signaux de structure :
  - footer
  - mentions légales
  - contact
  - pages équipe

Résultat attendu
Le score F ne doit plus être une conséquence indirecte du formulaire.
Il doit reposer sur des preuves web et domaine.

---

### Étape 5 — enrichir la couche Reputation

But
Savoir si le projet a une vraie présence ou juste une coquille vide.

À faire
- extraire les URLs sociales depuis le site quand elles existent
- analyser la présence publique minimale :
  - X
  - Telegram
  - Discord
  - GitHub
- vérifier si le projet a un historique visible
- repérer les claims douteux / promesses absurdes

Résultat attendu
Le rapport doit pouvoir dire :
- présence publique crédible
- présence faible
- aucune présence sérieuse détectée
- communication agressive ou trop belle pour être vraie

---

### Étape 6 — rendre la synthèse FIRES beaucoup plus utile

But
Sortir d’un rapport qui ressemble à un tableau de signaux.

À faire
- rédiger une synthèse basée sur les evidences réelles
- séparer clairement :
  - ce qui est confirmé
  - ce qui manque
  - ce qui est inquiétant
- limiter le résumé à quelque chose de lisible en 20 secondes

Résultat attendu
Le haut du rapport doit répondre à :
- qu’est-ce qu’on a vraiment trouvé ?
- pourquoi c’est risqué ou rassurant ?
- faut-il approfondir ou rejeter ?

---

## P1 — très important pour rendre ScoRAGE crédible

### Étape 7 — consolider la couche tokenomics / marché

But
Avoir des signaux marché plus intéressants qu’une simple présence de pair.

À faire
- enrichir Dexscreener avec :
  - market cap
  - FDV
  - âge de la pair
  - activité 24h / 7j si disponible
- ajouter Birdeye pour Solana si la clé est fournie
- ajouter une logique de concentration holders quand possible

Résultat attendu
Un verdict plus utile sur la liquidité et la crédibilité marché.

---

### Étape 8 — améliorer l’interprétation GoPlus

But
Transformer les réponses GoPlus en signaux vraiment utiles.

À faire
- mapper proprement les champs EVM et Solana
- détecter :
  - proxy
  - taxes élevées
  - honeypot
  - blacklist
  - mintable
  - freeze authority
  - metadata mutable
- convertir ça en evidences claires

Résultat attendu
Des alertes produit lisibles, pas juste des flags techniques.

---

### Étape 9 — ajouter une vraie gestion de l’incertitude

But
Éviter les faux sentiments de confiance.

À faire
- distinguer clairement :
  - signal absent
  - donnée introuvable
  - provider indisponible
  - objet non compatible
- ne pas pénaliser pareil un vrai risque et une simple absence de donnée

Résultat attendu
Des rapports plus honnêtes et plus crédibles.

---

## P2 — gros gain qualité / démo premium

### Étape 10 — ajouter une couche Signals IA utile

But
Faire intervenir l’IA là où elle apporte une vraie valeur : le texte, la cohérence et le bullshit detection.

À faire
- analyser le site
- analyser le whitepaper
- analyser les claims
- détecter :
  - promesses irréalistes
  - ton FOMO
  - contradictions internes
  - narration floue

Résultat attendu
Une couche S réellement différenciante.

---

### Étape 11 — construire un moteur de règles FIRES plus explicite

But
Rendre le score plus traçable.

À faire
- chaque règle doit avoir :
  - un nom
  - un impact
  - une catégorie
  - les evidences associées
- éviter les scores implicites trop opaques

Résultat attendu
Un score défendable devant un utilisateur, un dev ou un futur investisseur.

---

### Étape 12 — améliorer la mise en scène produit du rapport

But
Faire comprendre le rapport immédiatement.

À faire
- message d’ouverture ultra clair
- bloc “ce que ScoRAGE a vraiment trouvé”
- bloc “ce qui manque encore”
- bloc “ce qui inquiète le plus”
- bloc “prochaine vérification recommandée”

Résultat attendu
Un rapport montrable en démo sans avoir besoin d’expliquer pendant 10 minutes.

---

## 3. Plan d’exécution recommandé

### Phase 1 — rendre l’analyse réellement utile
Ordre recommandé :
1. qualification du type d’adresse
2. fetch + parsing du site
3. détection du whitepaper / docs / socials
4. synthèse FIRES plus intelligente

### Phase 2 — enrichir le moteur crypto
5. market enrichment (Birdeye / holders / âge de pair)
6. mapping GoPlus complet
7. meilleure lecture tokenomics / verify / proxy / mint

### Phase 3 — rendre le produit impressionnant
8. couche Signals IA
9. règles FIRES explicites
10. rapport premium démo-ready

---

## 4. Définition simple de “vraie analyse” pour ScoRAGE

Un rapport mérite le label “vraie analyse” s’il répond clairement à ces questions :
- est-ce la bonne adresse à analyser ?
- le projet existe-t-il réellement sur le web ?
- a-t-il des documents crédibles ?
- a-t-il une présence sociale crédible ?
- y a-t-il un marché réel et une liquidité exploitable ?
- y a-t-il des signaux contractuels inquiétants ?
- qu’est-ce qui est objectivement rassurant ?
- qu’est-ce qui manque encore avant d’acheter ?

Tant que ScoRAGE ne répond pas à ces 8 questions, l’analyse reste partielle.

---

## 5. Conclusion produit

Le MVP actuel est utile pour prouver la tuyauterie.
Il n’est pas encore suffisant pour impressionner par la qualité d’analyse.

Le prochain vrai saut de valeur ne vient pas d’un nouveau design.
Il vient de :
- l’analyse du site
- la lecture documentaire
- la qualification de l’objet analysé
- la qualité de synthèse

C’est là que ScoRAGE commence à devenir un vrai produit d’analyse, et plus seulement un tableau de signaux crypto.
