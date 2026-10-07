# SmartQonsumer — démo

Plateforme qui transforme un produit physique en relation client directe :

```
Produit → QR Code GS1 → Resolver Digital Link → Expérience de marque → Jeu / inscription
        → Club fidélité → Profil enrichi → Points → Récompenses (codes promo)
```

La démonstration met en scène **Croquin**, une marque d'alimentation pour chiens **fictive**. Tout ce qui est propre à la marque (thème, textes, campagnes, règles, jeux, récompenses) est de la configuration ; le moteur (scans, fidélité, jeux, récompenses, consentements) est générique.

| Dossier | Contenu |
|---|---|
| [`web/`](web/README.md) | Site Next.js 14 (App Router, TypeScript, Tailwind), **export statique** déployé en FTP chez OVH : site marketing, page `/qr`, parcours de marque, espace club |
| [`api/`](api/) | API **FastAPI** + PostgreSQL (SQLAlchemy 2, Alembic) : toute la logique métier |
| `docker-compose.yml` | Environnement local : PostgreSQL, Mailpit (emails), API |
| racine (`index.html`, `legal/`…) | Ancien site statique et maquette du tableau de bord SaaS (historique) |

Le **resolver GS1** est un projet séparé : `gs1-resolver-poc` ([variante PHP pour OVH](../saas-crm-qr/gs1-resolver-poc/php-resolver/README.md), déployée sur `brewfrance.fr`). Les deux systèmes ne partagent que l'URL de redirection.

---

## Architecture

```
Smartphone ── scan QR #1 / #2 ──▶ brewfrance.fr/01/{gtin}     (gs1-resolver-poc, PHP)
                                     │ 307 + linkset GS1, aucun appel API
                                     ▼
smartqonsumer.com/club-croquin[-simple]/?gtin=…&ser=…&src=gs1   (web/, statique, OVH)
   │ fetch (credentials: include, cookie de session HttpOnly)
   ▼
api.smartqonsumer.com/api/v1                                     (api/, FastAPI)
   ├─ scans ─────── enregistrement + politique anti-double-scan
   ├─ games ─────── tirage côté serveur, limites de parties
   ├─ auth ──────── inscription, email, session, mot de passe
   ├─ loyalty ───── ledger de points, actions rémunérées
   ├─ rewards ───── catalogue, échange transactionnel, codes promo
   └─ me ────────── profil progressif, consentements, export, suppression
   ▼
PostgreSQL
```

**Principes**

- Le navigateur ne décide **rien** : résultat des jeux, points, codes promo, éligibilité d'un scan sont décidés et enregistrés par l'API ; le front ne fait qu'animer.
- **Aucun chiffre métier dans React** : points, probabilités, coûts, limites, textes principaux viennent de la campagne (API).
- **Un seul moteur de fidélité** pour les deux parcours : `/club-croquin/` et `/club-croquin-simple/` sont deux stratégies d'acquisition qui aboutissent au même espace `/club/`.
- **Base de données comme dernière ligne de défense** : contraintes uniques et verrous de ligne garantissent l'unicité même en cas de requêtes simultanées (testé).

### Parcours

**Scénario A — club gamifié** (`QR #1`, GTIN `09506000164908`, campagne `croquin-dog-race`)
scan → resolver → `/club-croquin/` → scan enregistré et éligibilité vérifiée → course de chiens (probabilité de victoire configurable, 100 % dans la démo) → victoire, le chien mange ses croquettes → formulaire léger + consentements → compte créé, session ouverte, cadeau (code promo) attribué, 100 points → « Continuez l'aventure » → club : solde, profil (+ points), échange de points contre un code.

**Scénario B — club simple** (`QR #2`, GTIN `09506000164915`, campagne `croquin-simple-loyalty`)
scan → resolver → `/club-croquin-simple/` (pas de jeu) → inscription → compte `pending_email_verification` → email → `/verify-email/` → compte actif, **points crédités à la validation** → club : profil, course de chiens, roue de la chance, récompenses.

### Anti-double-scan (repris de `smartqonsumer-poc-qr-scan-checker`)

- Un **visiteur anonyme** = un UUID aléatoire en `localStorage` envoyé en en-tête `X-Anon-Token` ; l'API n'en stocke qu'un HMAC (pas d'IP, pas d'user-agent : aucun fingerprinting).
- Chaque **scan** est enregistré (événement technique) ; une **participation** valide le scan pour la campagne, protégée par `UNIQUE(campaign_id, eligibility_key)`.
- La clé dépend de la politique de la campagne : `single_use` (QR sérialisé `/21/{serial}`), `once_per_user` (par personne et par GTIN), `once_per_day`, `once_per_campaign`, `unlimited`.
- Un scan non éligible renvoie un `200` avec `eligible: false` et un message (« Ce QR Code a déjà été utilisé pour cette opération. »), jamais une erreur technique.
- Scan ≠ participation ≠ partie ≠ récompense : chaque étape a sa propre garantie d'unicité (partie : `UNIQUE(game_id, limit_key)` ; points : `UNIQUE(account, source_type, source_id)` ; cadeau : `UNIQUE(source, source_ref)`).
- `Idempotency-Key` : recharger la page après un scan rejoue le même verdict.

### Modèle de données

`brands` · `campaigns` (politique de scan, points d'inscription, cadeau, textes, consentements) · `gtins` · `visitors` · `scans` · `participations` · `users` · `user_profiles` · `pets` · `consents` (journal versionné) · `auth_tokens` (vérification email / reset, hachés, usage unique) · `user_sessions` · `loyalty_accounts` (solde en cache) · `point_transactions` (**ledger**, source de vérité) · `earning_rules` (actions rémunérées) · `games` (configuration, limite) · `game_sessions` (résultat) · `rewards` · `promo_codes` (stock) · `reward_redemptions` · `events` (analytics métier).

### API (`/api/v1`, doc interactive sur `/docs` hors production)

| Domaine | Endpoints |
|---|---|
| Campagnes | `GET /campaigns/{slug}`, `GET /brands/{slug}`, `GET /qr-codes` |
| Scans | `POST /scans` |
| Auth | `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/verify-email`, `/auth/resend-verification`, `/auth/forgot-password`, `/auth/reset-password` |
| Compte | `GET /me`, `GET/PATCH /me/profile`, `GET /me/consents`, `POST /me/consents/{type}/grant|withdraw`, `GET /me/export`, `DELETE /me` |
| Fidélité | `GET /loyalty/summary`, `/loyalty/transactions`, `/loyalty/earning-actions` |
| Jeux | `GET /games`, `POST /games/{dog-race|roulette}/play`, `POST /games/sessions/{id}/claim` |
| Récompenses | `GET /rewards`, `POST /rewards/{id}/redeem`, `GET /rewards/my` |

Les endpoints du club prennent `?brand=croquin`. Erreurs : `{"error": {"code", "message", "details?"}}`, message en français destiné au consommateur.

---

## Lancement local

Prérequis : Docker, Python 3.11, Node 22, PHP ≥ 8.1 (resolver).

```bash
# 1. Base de données + emails (Mailpit : http://localhost:8026)
docker compose up -d db mailpit

# 2. API — http://localhost:8010 (doc : /docs)
cd api
python3 -m venv .venv && .venv/bin/pip install -e ".[dev]"
cp .env.example .env
.venv/bin/alembic upgrade head
.venv/bin/python -m seeds.demo          # rejouable sans risque
.venv/bin/uvicorn app.main:app --port 8010 --reload

# 3. Resolver GS1 — http://localhost:8091 (dépôt gs1-resolver-poc)
cd ../../saas-crm-qr/gs1-resolver-poc/php-resolver
cp config/config.local.php.example config/config.local.php
php -S localhost:8091 -t public public/router.php

# 4. Site — http://localhost:3010
cd web && npm install && npx next dev -p 3010
```

Puis : <http://localhost:3010/qr/> → « Ouvrir ce parcours dans le navigateur » (passe réellement par le resolver). Les emails de confirmation arrivent dans Mailpit. Ports volontairement décalés (5440, 8010, 8026, 3010, 8091) pour ne pas entrer en conflit avec d'autres projets locaux.

### Seed de démonstration (`api/seeds/demo.py`)

Marque `croquin`, campagnes `croquin-dog-race` et `croquin-simple-loyalty`, GTIN de démo `09506000164908` / `09506000164915` (plage d'exemple GS1), jeux (course, roue), règles de points du profil, 4 récompenses et **50 codes factices par récompense** préfixés `DEMO-CROQ-…`. Le script met à jour la configuration en place (par slug / code) : le relancer ne duplique rien et ne touche ni aux comptes, ni aux scans, ni aux transactions.

**Modifier une règle métier** (probabilité, points, coût, limite, période, politique de scan, textes) : dans le seed puis `python -m seeds.demo`, ou directement en base. Exemple : `games.config.win_probability` (0.0 → jamais, 0.5 → 50 %, 1.0 → toujours).

### Migrations

Toute évolution de schéma passe par Alembic (`api/alembic/versions/`) :

```bash
.venv/bin/alembic revision --autogenerate -m "description"
.venv/bin/alembic upgrade head
```

### Emails

`EmailService` (`api/app/services/email_service.py`) expose `verify_email`, `reset_password`, `reward_confirmation`, indépendamment du fournisseur : `smtp` (Mailpit en local, relais SMTP en production), `console` (dev uniquement), boîte en mémoire pour les tests. Les liens à usage unique portent le jeton dans le fragment d'URL (`#token=`), jamais envoyé au serveur web.

### Variables d'environnement

`api/.env.example` et `web/.env.example` (aucun secret réel). Principales :

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | PostgreSQL |
| `FRONTEND_URL`, `CORS_ORIGINS` | site autorisé (CORS strict + contrôle `Origin`) |
| `GS1_RESOLVER_URL` | base des URLs encodées dans les QR de `/qr` (prod : `https://brewfrance.fr`) |
| `SESSION_SECRET` | clé HMAC des jetons (longue valeur aléatoire, refusée si absente en production) |
| `SESSION_COOKIE_DOMAIN` | `.smartqonsumer.com` en production (API sur un sous-domaine) |
| `EMAIL_PROVIDER`, `EMAIL_FROM`, `SMTP_*` | envoi des emails |
| `APP_ENV` | `development` / `test` / `production` (cookies `Secure`, HSTS, `/docs` désactivé) |
| `ANONYMOUS_DATA_RETENTION_DAYS` | durée de conservation des visiteurs anonymes |
| `NEXT_PUBLIC_API_URL` | URL de l'API pour le site (figée au build) |
| `NEXT_PUBLIC_BRAND_SLUG`, `NEXT_PUBLIC_CAMPAIGN_*` | marque du club et campagnes des deux parcours |

---

## Tests

```bash
# API : ruff, format, mypy, pytest (PostgreSQL réel : base smartqonsumer_test)
api/scripts/check.sh

# Site : typecheck, lint, Vitest, build, audit SEO, Playwright + axe
cd web && npm run test:all && npm run seo
```

- **API** (`api/tests/`) : scans (premier scan, double scan, chaque politique, idempotence, **8 scans simultanés → 1 participation**), jeux (probabilité 0 / 1, limites, concurrence, réclamation unique du gain), ledger (crédit, débit, solde insuffisant, double crédit impossible sous concurrence), récompenses (échange, solde insuffisant, idempotence, **rollback** si rupture de stock, **jamais deux fois le même code**, pas de découvert sous concurrence), auth (inscription, consentements obligatoires, email, jeton expiré / réutilisé, login, rate limiting, reset), profil progressif, RGPD, **scénarios A et B complets**.
- **Resolver** : `php tests/run.php` dans `gs1-resolver-poc/php-resolver` (GTIN connu / inconnu / invalide, destination, série, linkset).
- **Site** (`web/tests/`) : logique du plan de course et de la roue, thème ; Playwright sur viewport mobile (API simulée) : `/qr`, scénarios A et B, QR déjà utilisé, redirection vers la connexion, audits axe WCAG 2.2 AA, absence de défilement horizontal.

CI : `.github/workflows/api.yml` (API + PostgreSQL) et `.github/workflows/web.yml` (site, déploiement FTP manuel).

---

## Sécurité et RGPD

- Mots de passe **Argon2id** ; session = jeton opaque aléatoire en cookie `HttpOnly`, `SameSite=Lax`, `Secure` en production, haché en base, révocable (déconnexion, reset) ; rien de sensible en `localStorage`.
- Jetons email / reset : 256 bits, haché (HMAC), expiration, usage unique atomique.
- Rate limiting (login par compte et par client, inscription, reset) ; pas d'énumération des comptes au reset ; timing constant au login.
- Validation Pydantic stricte (champs inconnus refusés), schémas d'entrée et de sortie distincts (aucun hash ni donnée interne exposés).
- CORS strict, contrôle de l'en-tête `Origin` sur les requêtes modifiantes, en-têtes de sécurité, aucune exception brute renvoyée, aucune donnée personnelle dans les logs ni dans les événements analytics.
- Consentements **versionnés**, obligatoire et facultatif séparés, jamais pré-cochés, retrait du consentement marketing, export des données, suppression = anonymisation (le ledger et les codes restent cohérents), purge des visiteurs anonymes : `python -m app.jobs.purge` (à planifier).

> Ces mécanismes permettent d'appliquer une politique RGPD ; ils ne constituent pas une validation juridique. Le règlement `/legal/reglement-club-croquin/` est un modèle de démonstration.

## Déploiement (prévu, non automatisé pour l'API)

- **Site** : `web/out/` en FTPS vers OVH via le workflow *Web* (manuel, `dry_run` par défaut). Construire avec `NEXT_PUBLIC_API_URL=https://api.smartqonsumer.com/api/v1`.
- **API + PostgreSQL** : hébergement à décider (conteneur `api/Dockerfile`, migrations lancées au démarrage). Le mutualisé OVH ne convient pas (pas de Python ni de PostgreSQL).
- **Resolver** : voir le README de `php-resolver` (dossier racine dédié pour `brewfrance.fr` dans le multisite OVH).
