# ScoRAGE — Design System V1

> Direction artistique : **cyber · premium · anti-scam · risk intelligence**
> Univers : tension, vigilance, détection, contrôle.
> Pas de template SaaS mou. Pas de gentillesse visuelle. Pas de glow IA cliché.

---

## 1. Design Tokens — Palette finale

### Fondamentaux

| Token | Valeur | Usage |
|---|---|---|
| `--color-void` | `#0a0a0a` | Fond principal absolu |
| `--color-abyss` | `#111111` | Fond secondaire (cartes, blocs) |
| `--color-graphite` | `#1a1a1a` | Fond tertiaire (hover, séparateurs) |
| `--color-steel` | `#2a2a2a` | Bordures subtiles, dividers |
| `--color-ash` | `#837676` | Texte secondaire, labels, metadata |
| `--color-smoke` | `#b0a8a8` | Texte tertiaire, placeholders |
| `--color-bone` | `#e8e4e4` | Texte courant / body |
| `--color-white` | `#ffffff` | Titres, contrastes forts, CTA text |

### Signature — Rouge

| Token | Valeur | Usage |
|---|---|---|
| `--color-blood` | `#ff223b` | CTA principal, alertes, score critique, accents forts |
| `--color-crimson` | `#7a0c18` | Arrière-plans danger, badges critiques, bordures d'alerte |
| `--color-ember` | `#cc1a2e` | Hover / états intermédiaires sur rouge |
| `--color-blood-glow` | `rgba(255, 34, 59, 0.15)` | Glow subtil autour d'éléments critiques |
| `--color-blood-ghost` | `rgba(255, 34, 59, 0.06)` | Fond ultra-léger teinté rouge (sections hero) |

### Accents utilitaires (usage rare et fonctionnel uniquement)

| Token | Valeur | Usage |
|---|---|---|
| `--color-signal-green` | `#40e5aa` | Score positif, "safe", points rassurants |
| `--color-signal-yellow` | `#f9fe08` | Avertissement modéré, attention |
| `--color-signal-green-ghost` | `rgba(64, 229, 170, 0.08)` | Fond de badge vert |
| `--color-signal-yellow-ghost` | `rgba(249, 254, 8, 0.08)` | Fond de badge jaune |

> [!IMPORTANT]
> Le vert et le jaune ne sont **jamais** décoratifs. Ils servent exclusivement à encoder un niveau de risque ou un statut de verdict. Pas de vert dans le branding, pas de jaune dans les CTA.

---

## 2. Hiérarchie typographique

### Choix final

| Rôle | Police | Poids | Justification |
|---|---|---|---|
| **Display / Hero** | **Space Grotesk** | 700 (Bold) | Géométrique, technique, forte personnalité sans être décorative. Parfaite pour les accroches "anti-bullshit". |
| **Headings H2–H4** | **Space Grotesk** | 600 (Semi-Bold) | Continuité avec le display, lisibilité optimale |
| **Body / Paragraphes** | **Inter** | 400 (Regular) | Lisibilité maximale corps de texte, neutralité professionnelle |
| **Body emphasis** | **Inter** | 500 (Medium) | Labels, sous-titres, metadata mise en valeur |
| **Mono / Data** | **JetBrains Mono** | 400 | Scores, adresses crypto, données techniques, code |
| **Micro / Legal** | **Inter** | 400 | Petits textes, disclaimers |

> [!NOTE]
> **Alfa Slab One** est retiré de la V1 — trop éditorial/presse pour un produit d'intelligence. **Montserrat** est trop générique. **Technos PKDZP** peut servir en décoration très ponctuelle (un watermark, un arrière-plan subtil) mais jamais pour du texte fonctionnel.

### Échelle typographique

| Token | Desktop | Mobile | Line-height | Letter-spacing |
|---|---|---|---|---|
| `--text-display` | 72px | 40px | 1.0 | -0.03em |
| `--text-h1` | 56px | 32px | 1.05 | -0.025em |
| `--text-h2` | 40px | 26px | 1.1 | -0.02em |
| `--text-h3` | 28px | 22px | 1.2 | -0.015em |
| `--text-h4` | 22px | 18px | 1.3 | -0.01em |
| `--text-body` | 17px | 16px | 1.6 | 0 |
| `--text-body-sm` | 15px | 14px | 1.5 | 0 |
| `--text-caption` | 13px | 12px | 1.4 | 0.02em |
| `--text-mono` | 14px | 13px | 1.4 | 0.05em |
| `--text-micro` | 11px | 10px | 1.3 | 0.04em |

### Règles typographiques

- **Titres** : toujours `text-transform: none` — pas de ALL CAPS sauf badges risk-level
- **Letter-spacing négatif** sur les titres pour la tension visuelle
- **Line-height serrée** sur Display/H1 (1.0–1.05) = impact maximal
- **Line-height généreuse** sur body (1.6) = lisibilité texte long
- **Mots-clés en rouge** dans les titres via `<span class="text-blood">` — jamais plus de 2–3 mots par titre

---

## 3. Système d'espacements

### Échelle 4px-base (progression géométrique)

| Token | Valeur | Usage typique |
|---|---|---|
| `--space-1` | 4px | Micro-gaps internes (badge padding) |
| `--space-2` | 8px | Gap entre icône et texte |
| `--space-3` | 12px | Padding interne léger |
| `--space-4` | 16px | Gap grille, padding carte léger |
| `--space-5` | 20px | - |
| `--space-6` | 24px | Padding carte standard |
| `--space-8` | 32px | Gap entre blocs adjacents |
| `--space-10` | 40px | Marge section mobile |
| `--space-12` | 48px | - |
| `--space-16` | 64px | Marge entre composants desktop |
| `--space-20` | 80px | - |
| `--space-24` | 96px | Padding vertical de section |
| `--space-32` | 128px | Séparation de section majeure |
| `--space-40` | 160px | Hero vertical breathing |

### Règles de layout

- **Max-width contenu** : `1200px`
- **Max-width texte** : `720px` (pour les blocs éditoriaux)
- **Gouttière grille** : `24px` mobile → `32px` desktop
- **Padding horizontal page** : `20px` mobile → `80px` tablette → `120px` desktop (au-delà de max-width)
- **Sections** : padding vertical `96px` desktop / `64px` mobile — jamais moins

---

## 4. Boutons

### Bouton primaire — `btn-primary`

```css
background: var(--color-blood);
color: var(--color-white);
font-family: 'Space Grotesk', sans-serif;
font-weight: 600;
font-size: 16px;
letter-spacing: 0.02em;
padding: 14px 32px;
border: none;
border-radius: 2px;
cursor: pointer;
transition: all 180ms ease-out;
text-transform: uppercase;
```

**Hover :**
```css
background: var(--color-ember);
box-shadow: 0 0 24px rgba(255, 34, 59, 0.3), 0 0 60px rgba(255, 34, 59, 0.1);
transform: translateY(-1px);
```

**Active :**
```css
background: var(--color-crimson);
transform: translateY(0);
box-shadow: none;
```

> [!TIP]
> Le border-radius est **2px**, pas arrondi. Des boutons tranchants = tension, pas de douceur startup.

### Bouton secondaire — `btn-secondary`

```css
background: transparent;
color: var(--color-bone);
border: 1px solid var(--color-steel);
font-family: 'Space Grotesk', sans-serif;
font-weight: 500;
font-size: 15px;
padding: 12px 28px;
border-radius: 2px;
transition: all 180ms ease-out;
```

**Hover :**
```css
border-color: var(--color-blood);
color: var(--color-white);
box-shadow: 0 0 16px rgba(255, 34, 59, 0.15);
```

### Bouton ghost — `btn-ghost`

```css
background: transparent;
color: var(--color-ash);
border: none;
font-family: 'Inter', sans-serif;
font-weight: 500;
font-size: 14px;
padding: 8px 16px;
text-decoration: underline;
text-underline-offset: 3px;
text-decoration-color: var(--color-steel);
transition: color 150ms ease;
```

**Hover :**
```css
color: var(--color-blood);
text-decoration-color: var(--color-blood);
```

### Bouton icon — `btn-icon`

```css
width: 44px;
height: 44px;
display: inline-flex;
align-items: center;
justify-content: center;
background: var(--color-graphite);
border: 1px solid var(--color-steel);
border-radius: 2px;
color: var(--color-ash);
transition: all 150ms ease;
```

**Hover :**
```css
border-color: var(--color-blood);
color: var(--color-blood);
```

---

## 5. Cartes

### Carte standard — `card`

```css
background: var(--color-abyss);
border: 1px solid var(--color-steel);
border-radius: 3px;
padding: var(--space-6);
position: relative;
overflow: hidden;
transition: border-color 200ms ease, box-shadow 200ms ease;
```

**Hover :**
```css
border-color: rgba(255, 34, 59, 0.4);
box-shadow: 0 0 32px rgba(255, 34, 59, 0.06);
```

**Élément optionnel — trait supérieur de danger :**
```css
.card--danger::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-blood);
}
```

### Carte feature — `card-feature`

Identique à `card` + :
```css
background: linear-gradient(
  180deg,
  rgba(26, 26, 26, 0.8) 0%,
  rgba(10, 10, 10, 0.95) 100%
);
```

- L'icône en haut est **monochrome blanche**, 24px, trait fin.
- Titre de feature en `--text-h4`, Space Grotesk 600
- Description en `--text-body-sm`, Inter 400, color `--color-ash`

### Carte score — `card-score`

```css
background: var(--color-void);
border: 1px solid var(--color-steel);
border-radius: 3px;
padding: var(--space-8);
text-align: center;
```

- Le score numérique est en **JetBrains Mono**, 64px, bold
- Couleur du score dynamique selon le verdict (voir section badges)
- Sous le score : un label de verdict en badge

### Règle anti-pattern

> [!CAUTION]
> **Jamais de `border-radius` > 6px sur une carte.**
> Jamais de `backdrop-filter: blur()` pour un effet glass.
> Jamais de gradient multicolore.
> Une carte est un bloc dur, angulaire, qui inspire la rigueur, pas la douceur.

---

## 6. Badges, Verdicts & Labels de risque

### Système de verdict

| Niveau | Token couleur | Label | Style |
|---|---|---|---|
| 🔴 CRITICAL | `--color-blood` | `CRITICAL RISK` | Fond `crimson`, texte blanc, border `blood` |
| 🟠 HIGH | `--color-blood` à 70% opacité | `HIGH RISK` | Fond blood-ghost, texte `blood`, border blood à 30% |
| 🟡 MODERATE | `--color-signal-yellow` | `MODERATE RISK` | Fond signal-yellow-ghost, texte `signal-yellow`, border yellow à 20% |
| 🟢 LOW | `--color-signal-green` | `LOW RISK` | Fond signal-green-ghost, texte `signal-green`, border green à 20% |
| ⚪ UNRATED | `--color-ash` | `UNRATED` | Fond transparent, texte `ash`, border `steel` |

### Badge verdict — `badge-verdict`

```css
display: inline-flex;
align-items: center;
gap: 6px;
font-family: 'JetBrains Mono', monospace;
font-size: 11px;
font-weight: 700;
letter-spacing: 0.12em;
text-transform: uppercase;
padding: 5px 12px;
border-radius: 2px;
border: 1px solid [couleur-niveau à 30%];
background: [couleur-niveau-ghost];
color: [couleur-niveau];
```

**Pulsation optionnelle pour CRITICAL :**
```css
@keyframes pulse-danger {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 34, 59, 0.4); }
  50% { box-shadow: 0 0 12px 4px rgba(255, 34, 59, 0.15); }
}
.badge-verdict--critical {
  animation: pulse-danger 2.5s ease-in-out infinite;
}
```

### Badge red-flag — `badge-flag`

```css
display: inline-flex;
align-items: center;
gap: 4px;
font-family: 'Inter', sans-serif;
font-size: 12px;
font-weight: 500;
padding: 4px 10px;
border-radius: 2px;
background: rgba(255, 34, 59, 0.08);
color: var(--color-blood);
border: 1px solid rgba(255, 34, 59, 0.2);
```

Préfixé d'une icône `⚠` ou `✕` en `font-size: 10px`.

### Badge point rassurant — `badge-safe`

```css
background: rgba(64, 229, 170, 0.08);
color: var(--color-signal-green);
border: 1px solid rgba(64, 229, 170, 0.2);
```

Préfixé d'une icône `✓`.

### Label F.I.R.E.S. — `label-fires`

Chaque lettre du framework est un tag individuel :

```css
font-family: 'JetBrains Mono', monospace;
font-size: 13px;
font-weight: 600;
padding: 3px 8px;
border-radius: 2px;
background: var(--color-graphite);
color: var(--color-bone);
border: 1px solid var(--color-steel);
```

La lettre active (en focus) reçoit :
```css
background: var(--color-blood-ghost);
color: var(--color-blood);
border-color: rgba(255, 34, 59, 0.3);
```

---

## 7. Blocs FAQ

### Structure — `faq-item`

```css
border-bottom: 1px solid var(--color-steel);
padding: var(--space-5) 0;
cursor: pointer;
transition: all 200ms ease;
```

**Question (fermée) :**
```css
font-family: 'Space Grotesk', sans-serif;
font-size: var(--text-h4);
font-weight: 600;
color: var(--color-bone);
display: flex;
justify-content: space-between;
align-items: center;
```

L'indicateur d'ouverture est un `+` en JetBrains Mono, `--color-ash`, qui se transforme en `−` à l'ouverture.

**Hover sur la question :**
```css
color: var(--color-white);
```
Le `+` prend `color: var(--color-blood)`.

**Réponse (ouverte) :**
```css
font-family: 'Inter', sans-serif;
font-size: var(--text-body-sm);
color: var(--color-ash);
padding-top: var(--space-3);
max-height: 0; /* → max-height: 500px (animation) */
overflow: hidden;
transition: max-height 300ms ease, opacity 300ms ease;
```

### Règles

- Pas d'icône chevron, pas d'accordéon SaaS
- Le `+` / `−` est minimal, technique, monospace
- Une seule FAQ ouverte à la fois
- Pas de fond coloré derrière la réponse
- Le séparateur `border-bottom` reste toujours visible

---

## 8. Mockups produit (rapport web / PDF)

### Présentation des captures d'écran

**Cadre mockup — `mockup-frame`**
```css
background: var(--color-abyss);
border: 1px solid var(--color-steel);
border-radius: 4px;
padding: 3px;
position: relative;
box-shadow:
  0 4px 24px rgba(0, 0, 0, 0.5),
  0 0 80px rgba(255, 34, 59, 0.04);
```

**Barre supérieure type terminal :**
```css
height: 28px;
background: var(--color-graphite);
border-bottom: 1px solid var(--color-steel);
display: flex;
align-items: center;
padding: 0 12px;
gap: 6px;
```

- 3 dots (8px circles) : `--color-crimson`, `--color-steel`, `--color-steel`
- Titre optionnel en `JetBrains Mono`, 11px, `--color-ash`

### Mise en page des mockups

- Les mockups sont **flottants** avec une légère rotation (`transform: perspective(1200px) rotateY(-3deg) rotateX(2deg)`)
- Ombre portée profonde, pas de reflet
- **Responsive** : plein cadre sur mobile (pas de perspective)
- Grille asymétrique possible : mockup principal + détail en superposition décalée

### Annotations sur mockup

Des lignes de connexion ultra-fines (`1px`, `--color-steel`) + labels en `badge-flag` ou `badge-safe` reliés à des zones du mockup.

---

## 9. Textures, Bordures, Ombres, Bruit & Glow

### Texture de fond — Noise

Un overlay de bruit subtil sur toute la page :
```css
.noise-overlay {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,..."); /* grain pattern */
  /* Alternative : image PNG de grain 200x200, repeat */
  mix-blend-mode: overlay;
}
```

- Opacité : **0.03–0.04** maximum
- Ne doit jamais gêner la lisibilité
- Donne de la matière au noir plat

### Lignes de scanning

Un élément décoratif optionnel simulant un "scan line" qui traverse un bloc :
```css
.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 34, 59, 0.3) 20%,
    rgba(255, 34, 59, 0.6) 50%,
    rgba(255, 34, 59, 0.3) 80%,
    transparent 100%
  );
  animation: scan 4s ease-in-out infinite;
}

@keyframes scan {
  0% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}
```

Usage : hero section, derrière le score principal. **Max 1 par page.**

### Bordures

| Usage | Style |
|---|---|
| Carte au repos | `1px solid var(--color-steel)` |
| Carte hover / focus | `1px solid rgba(255, 34, 59, 0.4)` |
| Séparateur horizontal | `1px solid var(--color-steel)` — jamais `<hr>` stylé |
| Bordure d'alerte | `1px solid var(--color-crimson)` |
| Bordure haute d'accent | `2px solid var(--color-blood)` sur `top` uniquement |

> [!WARNING]
> **Jamais de `border-radius` > 6px** nulle part sauf éléments circulaires (avatars, dots).
> Le système est angulaire : 2–3px standard, 4px maximum pour les frames.

### Ombres

| Token | Valeur | Usage |
|---|---|---|
| `--shadow-sm` | `0 2px 8px rgba(0, 0, 0, 0.3)` | Boutons, petit élévation |
| `--shadow-md` | `0 4px 24px rgba(0, 0, 0, 0.5)` | Cartes, modals |
| `--shadow-lg` | `0 8px 48px rgba(0, 0, 0, 0.6)` | Mockups, blocs hero |
| `--shadow-blood` | `0 0 24px rgba(255, 34, 59, 0.2)` | Glow rouge sur CTA hover |
| `--shadow-blood-deep` | `0 0 60px rgba(255, 34, 59, 0.08)` | Ambiance rouge subtile, halo de fond |

> Pas de `box-shadow` coloré en bleu, violet ou autre. Uniquement noir ou rouge.

### Glow

- Le glow rouge est **réservé** aux éléments interactifs (CTA hover, score critique, badge CRITICAL)
- Intensité max : `0.3` en opacité
- Toujours en `box-shadow`, jamais en `filter: drop-shadow` (performance)
- Le glow est une **réaction**, pas une décoration : il apparaît sur hover ou pour signaler un danger

### Anti-patterns formellement interdits

| ❌ Interdit | ✅ Alternative |
|---|---|
| `backdrop-filter: blur()` (glassmorphism) | Fond opaque `--color-abyss` |
| Gradient pastel / startup | Gradient noir → noir-transparent uniquement |
| Glow violet / bleu | Glow rouge `--color-blood` uniquement |
| Border-radius > 6px | 2–4px, angulaire |
| Ombre colorée non-rouge | `rgba(0,0,0,x)` ou `rgba(255,34,59,x)` |
| Textures lourdes / parallax | Noise overlay subtil, scan-line ponctuel |
| Icônes colorées / emoji-style | Icônes monochrome trait fin (Lucide, Phosphor) |
| Animations rebond / playful | Transitions `ease-out` courtes (150–300ms) |

---

## 10. Récapitulatif de cohérence inter-supports

### Landing page

- Dark, noise, tension rouge
- Rythme éditorial : bloc texte/impact → preuve produit → CTA
- Sections alternées void / abyss pour rythme vertical

### Web app (rapport)

- Même palette, mêmes tokens
- Plus dense : spacing réduit, cartes compactes
- Data-first : JetBrains Mono dominant pour les scores et données
- Badges de risque = communication principale

### PDF (rapport)

- Fond blanc optionnel **ou** fond noir (au choix de l'utilisateur)
- Même hiérarchie typo (Space Grotesk + Inter)
- Badges en aplat (pas de glow, pas d'animation)
- Rouge = danger, vert = positif, même logique
- Bordures fines pour structure, pas de shadow

---

## Annexe — Import des polices

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600;700&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
```
