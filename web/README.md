# SmartQonsumer — web (Next.js)

Nouvelle base de la home page SmartQonsumer : Next.js 14 (App Router), TypeScript, Tailwind CSS, export 100% statique (SSG).

Ne couvre volontairement que la home page publique et ses pages annexes (mentions légales, CGV, confidentialité, RGPD) — pas le tableau de bord applicatif présent dans `index.html` à la racine du repo.

## Stack

- **Next.js 14** avec `output: 'export'` → génère un site 100% statique dans `out/`, déployable tel quel en FTP (comme le site actuel).
- **Tailwind CSS** avec les couleurs/typo reprises de `design-tokens.css`.
- **PostHog** (`posthog-js`) : pageviews + `capture_exceptions` (Error Tracking), gated par le consentement Axeptio.
- **Axeptio** (CMP) : mêmes réglages que le site actuel (`clientId`, `cookiesVersion`).

## Développement

```bash
npm install
npm run dev
```

## Build (export statique)

```bash
npm run build
```

Le site statique est généré dans `web/out/`. C'est ce dossier qu'il faut déployer en FTP (équivalent du contenu actuel de la racine du repo).

## Variables d'environnement

Voir `.env.example`. Toutes ont une valeur par défaut identique à la configuration actuelle du site statique — un `.env.local` n'est nécessaire que pour pointer vers un projet PostHog/Axeptio différent (staging, par exemple).

## Tests

```bash
npm run typecheck   # TypeScript strict
npm run lint        # ESLint (next/core-web-vitals)
npm run test        # Vitest + Testing Library (composants, analytics, SEO)
npm run test:e2e:install  # une seule fois : installe Chromium pour Playwright
npm run test:e2e    # Playwright : parcours utilisateur, pages légales, a11y (axe)
npm run test:all     # tout enchaîné
```

`test:e2e` build le site puis le sert statiquement (`npm run preview`, via `serve`) avant de lancer les scénarios — c'est le même mode que la prod (FTP), pas `next dev`.

## Point d'attention : Axeptio

Le vendor PostHog déclaré dans le backoffice Axeptio doit avoir un champ **"Nom"** (technique, pas "Titre") strictement égal à `posthog` (minuscules) — c'est cette valeur, sensible à la casse, qui sert de clé dans l'objet `choices` reçu par le callback `cookies:complete`. Voir `src/components/AxeptioScripts.tsx`.

## Ce qui n'a pas été repris

- Le tableau de bord applicatif (CRM, campagnes, etc.) de `index.html` — hors périmètre de cette page d'accueil.
- Le widget Userback — non demandé pour cette base.
- Le popup Calendly embarqué : le CTA "Nous contacter" ouvre directement `calendly.com` dans un nouvel onglet plutôt que d'embarquer le script tiers du popup.
