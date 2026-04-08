# ScoRAGE — spécification produit complète pour une vraie analyse documentée

Date: 2026-04-08
Statut: working spec
Auteur: Hermes
Source de vérité complémentaire: ce document doit servir de mémoire de développement pour les prochaines briques ScoRAGE.

## 1. Objectif produit

Faire passer ScoRAGE d'un moteur "déjà vivant mais encore trop textuel / trop mince" à un moteur de due diligence crypto capable de:
- qualifier correctement l'objet analysé
- montrer les faits principaux du token / contrat
- documenter les marchés et pools de liquidité associés
- détailler chaque pilier FIRES avec preuves et sources
- enrichir la réputation avec signaux sociaux utiles
- produire une conclusion actionnable et crédible

Promesse visée:
- un rapport web lisible en 2 à 5 minutes
- des sources cliquables
- une séparation claire entre faits confirmés, risques, données manquantes et incertitudes
- une conclusion orientée décision, pas seulement un score

## 2. Etat actuel réel

### Déjà présent dans le repo
Le moteur ScoRAGE sait déjà faire:
- RPC Solana
- RPC EVM
- Dexscreener
- GoPlus public
- fetch du site officiel
- détection de pages clés
- parsing whitepaper / docs
- RDAP pour l'âge du domaine
- scoring FIRES
- rendu des evidences avec sourceLabel / sourceUrl / rawValue

### Limites actuelles
Le problème principal n'est plus l'absence totale de data. Le problème est le packaging produit de cette data.

Aujourd'hui ScoRAGE:
- récupère des observations utiles
- convertit trop tôt la data en phrases d'evidence
- n'affiche pas encore une vraie fiche token / marché / socials / conclusion
- ne détaille pas encore FIRES pilier par pilier comme un raisonnement auditif

En clair:
- le backend commence à devenir sérieux
- le rapport ne montre pas encore toute la valeur qu'il a déjà

## 3. Principe produit à respecter

ScoRAGE ne doit pas prétendre faire un audit formel.
ScoRAGE doit produire un dossier d'évaluation pré-investissement / pré-screening.

Le rapport doit toujours répondre à 5 questions:
1. Est-ce bien un token / contrat analysable ?
2. Qu'est-ce qu'on a confirmé objectivement ?
3. Qu'est-ce qui est réellement inquiétant ?
4. Qu'est-ce qui manque encore pour conclure ?
5. Quelle décision rapide recommander ?

## 4. Architecture cible du rapport

Le rapport final doit comporter au minimum les sections suivantes:

1. Header / verdict
- nom projet
- chaîne
- adresse
- date d'analyse
- verdict ScoRAGE
- score global
- badge de décision

2. Compatibilité d'analyse
- type d'objet détecté
- token / contrat / wallet / programme / objet incompatible
- impact sur la fiabilité de la lecture

3. Fiche contrat / token
- nom
- symbole
- decimals
- total supply
- type d'objet
- bytecode / mint trouvé
- owner / authorities / proxy / metadata mutable si disponible
- source(s)

4. Market overview
- nombre de paires trouvées
- meilleure paire
- liquidité principale
- volume 24h
- market cap
- FDV
- âge de la paire
- volatilité 24h

5. Table des pools / paires
- DEX
- pair address
- base token
- quote token
- liquidity USD
- volume 24h
- market cap
- FDV
- pair age
- buys / sells 24h
- source Dexscreener

6. Website / docs / whitepaper
- site joignable ou non
- HTTPS
- richesse du contenu
- pages clés trouvées
- domaine ancien / récent
- whitepaper sérieux / léger / mince / absent
- sources

7. Social / réputation
- X
- Telegram
- Discord
- GitHub
- présence détectée
- activité minimale
- taille relative des communautés
- anomalies de cohérence
- tonalité / patterns de communication

8. FIRES détaillé
- score par pilier
- résumé par pilier
- faits confirmés
- red flags
- données manquantes
- sources contributrices

9. Conclusion
- synthèse finale en français
- raison dominante du verdict
- prochaine action recommandée
- niveau de confiance

## 5. Brique 1 — qualification de l'objet analysé

### Objectif
Ne jamais analyser un wallet ou un programme comme s'il s'agissait d'un token standard sans le dire.

### Sortie cible
Bloc "Compatibilité d'analyse" avec:
- type d'objet
- explication claire
- conséquence produit

### Cas à couvrir
Solana:
- mint SPL
- programme exécutable
- wallet / system account
- account non mint
- inconnu

EVM:
- token ERC-20 détecté
- contrat générique
- wallet / EOA
- inconnu

### Critères d'acceptation
- l'utilisateur comprend en 3 secondes si l'adresse est compatible avec une analyse token
- si ce n'est pas le bon objet, le rapport le dit en haut avant le score

## 6. Brique 2 — fiche contrat / token

### Objectif
Afficher les infos principales du contrat ou du token dans un format produit clair.

### Données minimales à montrer
EVM:
- contract address
- token name
- token symbol
- decimals
- total supply
- bytecode detected
- contract type
- proxy yes/no
- open source / verified si disponible

Solana:
- mint address
- decimals
- supply
- mint authority
- freeze authority
- owner program
- parsed type

### Sources
- RPC EVM
- RPC Solana
- GoPlus

### Critères d'acceptation
- plus besoin de fouiller les evidences pour savoir ce qu'est le token
- la fiche est lisible même sans être technique

## 7. Brique 3 — market overview + pools de liquidité

### Objectif
Montrer le marché réel du token, pas seulement "une paire existe".

### Ce qui est déjà récupéré techniquement
Le provider Dexscreener normalise déjà:
- pairs[]
- bestPair
- liquidityUsd
- volume24hUsd
- volume7dUsd
- fdv
- marketCap
- pairCreatedAt
- pairAgeDays
- priceChange24h
- txns24hBuys
- txns24hSells
- baseToken
- quoteToken
- dexId

### Ce qu'il faut maintenant faire
- exposer toutes les paires exploitables dans le rapport
- choisir une meilleure paire de référence pour le résumé
- afficher une table des pools
- indiquer la quote asset
- rendre la liquidité et la profondeur de marché visibles

### UI cible
Une table ou liste structurée par paire:
- DEX
- base/quote
- pair address
- liquidity
- volume 24h
- age
- buys/sells

### Interprétation produit
- aucune paire = donnée marché absente ou objet incompatible
- liquidité très basse = vrai risque financier
- paire très récente = drapeau de prudence, pas condamnation automatique
- forte activité = signal ecosystem / market

### Critères d'acceptation
- l'utilisateur voit immédiatement où se traite le token
- l'utilisateur peut juger la profondeur et la crédibilité du marché

## 8. Brique 4 — FIRES détaillé pilier par pilier

### Objectif
Transformer FIRES en raisonnement lisible, pas juste en score.

### Positionnement
FIRES doit rester un cadre d'analyse visible, explicable et traçable.

### Structure cible par pilier
Pour chaque pilier:
- score
- résumé court
- faits confirmés
- risques détectés
- données manquantes
- sources

### Mapping recommandé
F — Fundamentals
- site
- docs
- whitepaper
- domaine
- équipe / legal / structure minimale

I — Infra & Tokenomics
- qualification objet
- contrat / mint lisible
- pair(s)
- liquidité
- supply / mint / proxy / taxes / honeypot / ownership

R — Reputation
- présence publique
- cohérence claims / projet
- crédibilité du discours
- signaux web et socials

E — Engagement
- taille relative des canaux
- fraîcheur de l'activité
- cohérence X / Telegram / Discord
- existence de communauté réelle

S — Signals IA
- contradictions
- ton scammy / FOMO
- patterns de communication douteux
- incohérences cross-source

### Critères d'acceptation
- chaque pilier raconte quelque chose
- le score n'est jamais orphelin de preuves

## 9. Brique 5 — website / docs / whitepaper

### Objectif
Donner de la matière aux piliers Fundamentals, Reputation et Signals IA.

### Déjà présent
Le provider website sait déjà:
- fetch le HTML
- extraire title / meta / headings / text
- classifier les liens
- détecter docs / whitepaper / tokenomics / roadmap / team / legal
- détecter X / Telegram / Discord / GitHub
- visiter quelques pages internes clés

Le provider whitepaper sait déjà:
- télécharger PDF si besoin
- parser texte
- détecter sections structurantes
- classer le document: serious / light / thin / missing

### Ce qu'il faut maintenant faire
- rendre ces résultats visibles dans des blocs dédiés
- mieux relier ces faits aux piliers FIRES
- afficher les pages détectées comme sous-sources
- ajouter un mini résumé documentaire exploitable

### Critères d'acceptation
- le rapport ne dépend plus uniquement du formulaire
- l'utilisateur voit si le projet est documenté ou vide

## 10. Brique 6 — social intelligence minimale utile

### Objectif
Faire exister une couche réputation / engagement crédible sans suringénierie.

### Règle produit
On ne cherche pas une surveillance social media exhaustive au départ.
On cherche une lecture décisionnelle minimale mais utile.

### 10.1 X / Twitter

Contrainte opérationnelle connue:
- un scraping via cookies d'un compte dédié a déjà fonctionné correctement pour le user
- cette voie est prioritaire pour l'implémentation réelle

#### Ce qu'on veut récupérer
Minimum:
- handle
- nom affiché
- bio
- lien externe
- nombre de followers si récupérable
- nombre de following si récupérable
- date / fraîcheur des 10 derniers tweets si récupérable
- texte des 10 derniers tweets
- présence de médias / liens / hashtags
- pinned tweet si récupérable

#### Analyse souhaitée sur les 10 derniers tweets
Objectif: détecter des patterns compatibles avec un projet potentiellement scam ou ultra opportuniste.

Features à calculer:
- proportion de tweets promotionnels purs
- répétition de slogans / motifs
- intensité du ton FOMO
- fréquence des promesses de gains
- densité de mots-clés douteux
- présence de chiffres agressifs
- niveau de variation du wording
- cohérence entre tweets, bio et site officiel

#### Patterns à surveiller
Exemples de signaux:
- guaranteed returns
- risk free
- moon / 100x / life changing
- passive income
- next big thing
- early alpha / insiders only
- accumulation d'emojis et d'injonctions buy now
- répétition de mêmes structures ou phrases sur plusieurs tweets
- volume énorme de promo sans contenu produit réel

#### Sortie produit cible
- présence X crédible / faible / douteuse
- activité récente: oui/non
- ton: informatif / promotionnel / agressif / scammy
- anomalies détectées sur les 10 derniers tweets
- exemples de tweets signalés

#### Utilité FIRES
- Reputation
- Engagement
- Signals IA

### 10.2 Telegram

#### Objectif
Mesurer la présence communautaire publique minimale.

#### Données utiles
- lien public valide ou non
- nom du canal / groupe
- description si visible
- nombre d'abonnés / membres si visible
- fraîcheur approximative si accessible

#### Sortie produit
- Telegram détecté / non détecté
- taille visible
- actif / peu lisible / inaccessible

### 10.3 Discord

#### Objectif spécifique donné par le user
Pour Discord, le besoin principal n'est pas de lire les messages.
Le but est surtout d'obtenir le nombre d'utilisateurs pour alimenter un score comparatif.

#### Données utiles
- serveur détecté via lien d'invite
- taille de la communauté si visible ou récupérable
- validité de l'invite

#### Utilité produit
Comparer:
- taille sur X
- taille sur Telegram
- taille sur Discord

Puis produire un score de cohérence de traction.

Exemple de logique:
- X énorme mais Discord et Telegram quasi vides = suspicion de traction artificielle ou audience peu qualifiée
- Discord fort et Telegram fort mais X inexistant = projet niche / early / pas forcément scam
- les trois présents et cohérents = signal engagement plus robuste

### 10.4 GitHub

#### Pourquoi c'est utile
GitHub est souvent plus fiable que les réseaux sociaux pour juger un minimum de réalité produit.

#### Données utiles
- repo détecté ou non
- org ou compte personnel
- stars
- forks
- nombre de repos visibles
- dernier commit / activité récente
- readme / docs / releases

#### Utilité FIRES
- Fundamentals
- Reputation
- Engagement

## 11. Brique 7 — score de cohérence communautaire

### Objectif
Utiliser la distribution des tailles de communautés pour enrichir la conclusion.

### Entrées
- followers X
- membres Discord
- membres Telegram
- activité GitHub si disponible

### Logique MVP simple
Créer un score de cohérence, pas un score de popularité brute.

Exemples:
- X très gros + Discord très faible + Telegram très faible = incohérent
- X moyen + Telegram moyen + Discord moyen = cohérent
- aucun canal = manque de traction publique
- Telegram très gros + X vide + site pauvre = signal suspect à vérifier

### Sortie produit
- cohérence communautaire: forte / moyenne / faible / douteuse
- raison courte
- impact sur Engagement + Reputation

## 12. Brique 8 — vraie conclusion produit

### Objectif
Finir le rapport avec une décision claire, crédible et mémorable.

### Ce que la conclusion doit contenir
- verdict court
- raison dominante
- ce qui est confirmé
- ce qui inquiète le plus
- ce qui manque encore
- action recommandée
- niveau de confiance

### Style recommandé
Le rapport doit rester sérieux, mais mémorable.
Le framework peut rester FIRES, mais la conclusion doit être naturelle en français.

### Recommandation éditoriale
Ne pas utiliser "Vous êtes viré" comme formulation principale.
Raison:
- trop TV / gimmick
- moins naturel en français
- moins crédible en contexte produit crypto risk

### Alternative recommandée
Conserver:
- FIRES comme nom de framework

Utiliser pour la conclusion:
- Verdict ScoRAGE
avec badge final:
- Feu vert
- Feu orange
- Feu rouge
- Hors périmètre

### Pourquoi c'est meilleur
- très compréhensible en français
- cohérent avec FIRES
- mémorable
- compatible avec une UX sérieuse

### Mapping proposé
- Feu vert = faible niveau de risque détecté à ce stade
- Feu orange = dossier mitigé, besoin de vérification manuelle
- Feu rouge = trop de signaux d'alerte / manque de confiance
- Hors périmètre = objet incompatible ou données insuffisantes pour juger le token

## 13. Modèle de données cible à ajouter côté moteur

Le backend doit conserver des objets structurés, pas seulement des evidences textuelles.

### Objets recommandés
- contractFacts
- marketOverview
- marketPairs[]
- websiteOverview
- documentOverview
- socialOverview
- firesBreakdownDetailed
- finalDecision

### Pourquoi
Si on transforme tout trop tôt en texte:
- l'UI ne peut pas faire de sections riches
- le PDF reste pauvre
- la conclusion ne peut pas s'appuyer sur des facts bien structurés

## 14. Priorités de shipping

### P1 — impact produit maximal immédiat
1. fiche contrat / token
2. market overview + table des paires
3. FIRES détaillé par pilier
4. vraie conclusion finale

### P2 — réputation crédible
5. social overview minimal
6. X via cookies + analyse 10 derniers tweets
7. Telegram public metadata
8. Discord size / invite validity
9. GitHub presence / activity

### P3 — raffinement
10. score de cohérence communautaire
11. audit trail plus riche
12. meilleure synthèse cross-source

## 15. Critères d'acceptation globaux

Le rapport sera jugé crédible quand:
- on voit les infos principales du token / contrat sans lire toutes les evidences
- on voit les pools / paires et la liquidité
- chaque pilier FIRES raconte quelque chose de tangible
- la couche sociale alimente réellement la conclusion
- les sources sont visibles et cliquables
- la conclusion ressemble à une décision, pas à un résumé machine

## 16. Décision produit actuelle

Décision recommandée pour la suite du développement:
- ship d'abord la lisibilité du rapport à partir des providers déjà branchés
- puis brancher la couche sociale avec priorité X cookies + Telegram + Discord size + GitHub
- garder FIRES comme framework
- utiliser "Verdict ScoRAGE" + badges Feu vert / orange / rouge / hors périmètre comme sortie éditoriale

## 17. Notes d'implémentation importantes

- ne jamais documenter les secrets ou cookies réels dans Notion
- documenter seulement les noms, usages et contraintes des accès privés
- séparer dans le scoring:
  - risque réel
  - donnée manquante
  - provider indisponible
  - objet incompatible
- ne pas sur-pondérer les absences de data comme si c'était un scam confirmé
- la conclusion doit mentionner le niveau de confiance de l'analyse

## 18. Résumé ultra-court

Ce qui manque le plus à ScoRAGE n'est plus la collecte brute.
Ce qui manque le plus, c'est:
- une fiche token claire
- une lecture marché visible
- un vrai drill-down FIRES
- une couche sociale minimale mais intelligente
- une conclusion éditoriale forte et française
