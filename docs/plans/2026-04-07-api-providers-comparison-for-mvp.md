# ScoRAGE — quels providers choisir pour le MVP ?

Objectif
Choisir les bonnes sources de données pour lancer ScoRAGE sans complexité inutile.

Important
Le but n'est pas d'avoir toutes les APIs du marché.
Le but est d'avoir les quelques briques qui donnent un vrai rapport utile.

---

## 1. La recommandation simple

### Si on veut aller vite
Prendre :
- QuickNode pour la base blockchain EVM
- GoPlus pour les signaux anti-scam
- Dexscreener pour voir si le token a une vraie vie de marché

### Si Solana devient prioritaire tout de suite
Ajouter :
- Helius pour Solana
- Birdeye si on veut enrichir les signaux marché

---

## 2. Tableau ultra simple

| Outil | À quoi ça sert | Facilité | Coût de départ | Utile maintenant ? | Verdict |
|---|---|---:|---:|---|---|
| QuickNode | Connexion technique aux blockchains | Facile | Gratuit puis ~29$/mois | Oui | À prendre |
| GoPlus | Détection de risques / signaux anti-scam | Facile | Gratuit puis payant plus tard | Oui | À prendre |
| Dexscreener | Voir liquidité, volume, activité marché | Très facile | Gratuit | Oui | À prendre |
| Helius | Version Solana plus puissante et plus propre | Moyen | Gratuit puis ~49$/mois | Oui si Solana est clé | À prendre si Solana prioritaire |
| Birdeye | Données marché plus riches, surtout utiles sur Solana | Moyen | Gratuit puis ~99$/mois | Oui mais pas obligatoire day 1 | Utile en phase 2 |
| Alchemy | Très bon provider blockchain mais moins simple à choisir pour démarrer | Moyen | Variable / moins lisible | Pas nécessaire au début | Plus tard |

---

## 3. À quoi sert chaque provider, en mots simples

### QuickNode
C'est la prise électrique blockchain.
Sans lui, ScoRAGE ne peut pas lire proprement les données de base d'un contrat.

Ce qu'il débloque
- lire un contrat
- lire une adresse
- interroger Ethereum / Base / BSC
- faire tourner le moteur proprement

Pourquoi je le recommande
- simple à comprendre
- plan gratuit
- prix lisible
- bon pour un MVP

### GoPlus
C'est le détecteur anti-scam rapide.
Il donne des signaux sécurité déjà exploitables.

Ce qu'il débloque
- honeypot
- taxes bizarres
- signaux de blacklist
- signaux de risque contrat

Pourquoi je le recommande
- très aligné avec ScoRAGE
- gain de temps énorme
- permet de sortir une V1 plus crédible vite

### Dexscreener
C'est le radar marché.
Il permet de voir si le token existe vraiment dans un univers de trading réel.

Ce qu'il débloque
- liquidité
- volume
- pair détectée
- activité de base

Pourquoi je le recommande
- simple
- gratuit
- parfait pour enrichir rapidement un rapport

### Helius
C'est une version Solana plus intelligente qu'un simple accès technique brut.

Ce qu'il débloque
- meilleure lecture de Solana
- données plus pratiques
- moins de bricolage côté technique

Pourquoi je le recommande
- seulement si Solana est vraiment prioritaire
- très bon choix si ScoRAGE veut devenir fort sur Solana

### Birdeye
C'est un enrichisseur de signaux marché.
Très utile si on veut aller plus loin que “le token existe”.

Ce qu'il débloque
- vision marché plus riche
- plus de contexte sur activité, prix, certains signaux de traction

Pourquoi je ne le mets pas en premier
- plus utile après les briques de base
- moins indispensable au tout premier MVP

### Alchemy
Très bon outil, mais moins simple à choisir pour toi à ce stade.

Pourquoi je ne le recommande pas en premier
- on a déjà plus simple avec QuickNode
- pour ton besoin actuel, ça n'apporte pas un avantage assez clair pour justifier plus de complexité

---

## 4. La vraie stack MVP recommandée

### Option A — la plus simple et la plus logique
- QuickNode
- GoPlus
- Dexscreener

Pourquoi
Avec ça, on peut déjà faire un premier vrai rapport utile.

### Option B — la meilleure si on veut pousser Solana
- QuickNode
- GoPlus
- Dexscreener
- Helius
- Birdeye ensuite

Pourquoi
On garde une base simple, puis on renforce Solana proprement.

---

## 5. Budget simple à retenir

### MVP très sobre
- Dexscreener : 0€
- QuickNode : gratuit au début, puis environ 29$/mois si besoin
- GoPlus : gratuit au début

### MVP renforcé Solana
- Dexscreener : 0€
- QuickNode : gratuit ou 29$/mois
- GoPlus : gratuit au début
- Helius : gratuit ou 49$/mois
- Birdeye : gratuit pour tester, puis environ 99$/mois si on monte

Conclusion budget
Tu peux commencer très léger.
Tu n'as pas besoin de partir tout de suite sur une stack chère.

---

## 6. Mon conseil final

Si j'étais à ta place, je ferais dans cet ordre :
1. QuickNode
2. GoPlus
3. Dexscreener
4. Helius seulement si Solana devient central
5. Birdeye quand on veut améliorer la qualité du score

En une phrase
Pour un MVP simple, crédible et rapide à sortir : QuickNode + GoPlus + Dexscreener.

---

## 7. Ce que tu peux faire maintenant

Le plus simple :
- choisir si Solana est une priorité immédiate ou non
- me donner d'abord les accès les plus utiles

### Si tu veux aller vite
Envoie-moi :
- QuickNode ou autre RPC EVM
- GoPlus
- et on utilise Dexscreener en plus

### Si tu veux une vraie priorité Solana
Envoie-moi aussi :
- Helius
- puis Birdeye plus tard si besoin

---

## 8. Traduction ultra simple

### Ce qu'il faut retenir sans jargon
- QuickNode = accès à la blockchain
- GoPlus = détecteur anti-scam
- Dexscreener = vision marché
- Helius = Solana plus propre
- Birdeye = marché plus détaillé

La bonne question n'est pas :
"Quelle API est la plus impressionnante ?"

La bonne question est :
"Quelle combinaison me permet d'avoir un premier rapport utile le plus vite possible ?"

Réponse :
QuickNode + GoPlus + Dexscreener.
