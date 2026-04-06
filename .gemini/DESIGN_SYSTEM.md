# ScoRAGE — Agent Design System Reference

> This file instructs the AI agent to follow the ScoRAGE design system strictly.

## Directive

When generating code, UI components, styles, or any visual output for the ScoRAGE project, you **MUST** follow the design system documented in `/DESIGN_SYSTEM.md` at the project root.

### Key Rules

1. **Palette**: Use only the defined design tokens (`--color-void`, `--color-abyss`, `--color-blood`, etc.). Never introduce colors outside the system.
2. **Typography**: Use **Space Grotesk** (display/headings), **Inter** (body), **JetBrains Mono** (data/scores). No other fonts.
3. **Spacing**: Follow the 4px-base spacing scale (`--space-1` through `--space-40`).
4. **Border-radius**: Max **6px**. Standard is **2–3px**. No rounded corners.
5. **Buttons**: Follow `btn-primary`, `btn-secondary`, `btn-ghost`, `btn-icon` specs exactly.
6. **Cards**: Follow `card`, `card-feature`, `card-score` specs. No glassmorphism, no `backdrop-filter: blur()`.
7. **Badges/Verdicts**: Use the risk-level system (CRITICAL/HIGH/MODERATE/LOW/UNRATED) with the exact color mapping.
8. **Shadows**: Only black or red shadows. No colored shadows.
9. **Glow**: Red glow only, only on interactive elements or danger signals. Max opacity 0.3.
10. **Animations**: Short `ease-out` transitions (150–300ms). No bouncy/playful animations.

### Anti-Patterns (FORBIDDEN)

- ❌ `backdrop-filter: blur()` (glassmorphism)
- ❌ Pastel/startup gradients
- ❌ Purple/blue glows
- ❌ `border-radius` > 6px
- ❌ Colored shadows (non-black, non-red)
- ❌ Heavy textures or parallax
- ❌ Colored/emoji-style icons (use monochrome thin-stroke: Lucide, Phosphor)
- ❌ Bounce/playful animations

### Tone

The visual identity is **cyber · premium · anti-scam · risk intelligence**. Tension, vigilance, control. No softness, no generic SaaS aesthetics.

> Always refer to `/DESIGN_SYSTEM.md` for the full specification before writing any UI code.
