# SmartQonsumer — web (Next.js)

Nouvelle base de la home page SmartQonsumer : Next.js 14 (App Router), TypeScript, Tailwind CSS, export 100% statique (SSG).

Ne couvre volontairement que la home page publique et ses pages annexes (mentions légales, confidentialité, RGPD — pas de CGV tant que la société n'est pas créée) — pas le tableau de bord applicatif présent dans `index.html` à la racine du repo.

## Stack

- **Next.js 14** avec `output: 'export'` → génère un site 100% statique dans `out/`, déployable tel quel en FTP (comme le site actuel).
- **Tailwind CSS** avec les couleurs/typo reprises de `design-tokens.css`. Les tokens sont des variables CSS déclarées dans `src/app/globals.css` (`:root`), et `tailwind.config.ts` pointe dessus. Les couleurs sont stockées en canaux RGB (`--color-brand-500: 81 189 111`) pour garder les opacités Tailwind (`bg-brand-500/50`). En CSS : `rgb(var(--color-brand-500) / 0.2)`.
- **Styles** (convention Next.js) : utilitaires Tailwind dans le JSX par défaut ; CSS sur mesure d'un composant (keyframes, pseudo-éléments…) dans un `Composant.module.css` à côté du `.tsx` ; `src/app/globals.css` réservé au vraiment global (directives Tailwind, `@layer base`).
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

Le site statique est généré dans `web/out/`. C'est ce dossier qu'il faut déployer en FTP (équivalent du contenu actuel de la racine du repo) — voir « CI/CD » ci-dessous.

## Variables d'environnement

Voir `.env.example`. Toutes ont une valeur par défaut identique à la configuration actuelle du site statique — un `.env.local` n'est nécessaire que pour pointer vers un projet PostHog/Axeptio différent (staging, par exemple).

## Tests

```bash
npm run typecheck   # TypeScript strict
npm run lint        # ESLint (next/core-web-vitals)
npm run test        # Vitest + Testing Library (composants, analytics, SEO)
npm run test:e2e:install  # une seule fois : installe Chromium pour Playwright
npm run test:e2e    # Playwright : parcours utilisateur, pages légales, accessibilité
npm run test:all     # tout enchaîné
```

**Accessibilité** (`tests/e2e/accessibility.spec.ts`) : axe WCAG 2.0 → 2.2 niveaux A/AA + best practices sur toutes les pages, en desktop et mobile (menu ouvert compris), zéro violation tolérée ; navigation clavier (lien d'évitement, focus visible partout, focus jamais masqué par le header fixe, menu mobile fermé par Échap, FAQ) ; `prefers-reduced-motion` ; vidéo du hero mettable en pause. La bannière Axeptio (tierce) est exclue des audits.

⚠️ `test:e2e` et `build` réécrivent `.next` : un `npm run dev` lancé en parallèle ne sert alors plus son JavaScript (boutons inactifs). Le redémarrer après les tests.

`test:e2e` build le site puis le sert statiquement (`npm run preview`, via `serve`) avant de lancer les scénarios — c'est le même mode que la prod (FTP), pas `next dev`.

**SEO** (`npm run seo`, après `npm run build`) : audit statique de `out/` — title et description (longueur, unicité), un H1, `lang`, robots (`noindex` sur les pages légales et la 404, jamais de balises contradictoires), canonical et `og:url` propres à chaque page, Open Graph / Twitter complets, images avec `alt` et dimensions, liens internes et ancres valides, JSON-LD valide, `sitemap.xml` limité aux pages indexables, `robots.txt`, `.htaccess`. Les métadonnées de page passent par `src/lib/metadata.ts` (Next.js remplace, sans les fusionner, les objets `openGraph`/`twitter` du layout).

`public/.htaccess` (hébergement Apache OVH) : page 404 servie avec un vrai statut 404, redirections 301 des anciennes URLs du site statique (`/legal/rgpd.html` → `/legal/rgpd/`, `/index.html` → `/`) ; l'ancienne page CGV répond 410 (supprimée).

```bash
npm run build && npm run lighthouse   # Lighthouse CI sur out/ (3 passes, seuils dans lighthouserc.json)
```

En local, si Chrome n'est pas installé, pointer `CHROME_PATH` vers le Chromium de Playwright.

## CI/CD (GitHub Actions)

Workflow `.github/workflows/web.yml`, déclenché à chaque push / PR qui touche `web/` :

1. **quality** : typecheck, lint, tests unitaires, build, audit SEO (le dossier `out/` est partagé avec les jobs suivants).
2. **e2e** : Playwright + axe sur le build (`E2E_PREBUILT=1`, pas de rebuild). Rapport HTML en artefact en cas d'échec.
3. **lighthouse** : 3 passes sur `/` et `/legal/mentions-legales/` ; échoue si une régression dépasse les seuils de `lighthouserc.json` (scores perf ≥ 70, a11y = 100, best practices ≥ 95, SEO ≥ 95 sur la home, CLS ≤ 0,1, TBT ≤ 600 ms, poids JS/CSS/polices). Rapports en artefact.

**Déploiement FTP (manuel)** : Actions → *Web* → *Run workflow*, choisir la branche. Tous les contrôles sont rejoués, puis `out/` est envoyé en FTPS. `dry_run` est coché par défaut (liste les fichiers sans rien envoyer) : le décocher pour déployer réellement. Prérequis : un environnement GitHub `production` avec les secrets `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR` (et idéalement une approbation obligatoire).

## Point d'attention : Axeptio

Le vendor PostHog déclaré dans le backoffice Axeptio doit avoir un champ **"Nom"** (technique, pas "Titre") strictement égal à `posthog` (minuscules) — c'est cette valeur, sensible à la casse, qui sert de clé dans l'objet `choices` reçu par le callback `cookies:complete`. Voir `src/components/AxeptioScripts.tsx`.

## Ce qui n'a pas été repris

- Le tableau de bord applicatif (CRM, campagnes, etc.) de `index.html` — hors périmètre de cette page d'accueil.
- Le widget Userback — non demandé pour cette base.
- Le popup Calendly embarqué : le CTA "Nous contacter" ouvre directement `calendly.com` dans un nouvel onglet plutôt que d'embarquer le script tiers du popup.
