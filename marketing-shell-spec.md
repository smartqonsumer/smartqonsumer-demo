# SmartQonsumeR — Marketing shell spec

Spécification du **logo**, du **header marketing**, de la **navigation**, du **bouton Connexion**, du **CTA principal**, du **menu mobile** et du **footer marketing**.

Toutes les valeurs ci-dessous sont extraites du code réel des composants du design system :
`components/core/Logo.jsx`, `components/core/Button.jsx`, `components/core/IconButton.jsx`,
`components/marketing/MarketingHeader.jsx`, `MarketingNav.jsx`, `MobileMenu.jsx`, `MarketingFooter.jsx`.

Les variables citées sont celles de **`design-tokens.css`** (préfixe `--color-*`, `--font-*`, `--space-*`…).
La valeur résolue est donnée entre parenthèses pour contrôle visuel.

> Deux fichiers de header coexistent dans le projet. Le seul **canonique** est `MarketingHeader` (78 px, logo image, une seule ligne verte de CTA).
> Le header inline de `ui_kits/website/Site.jsx` (66 px, wordmark en texte, fond translucide) est un prototype antérieur : **ne pas s'en inspirer**.

---

## 0. Réglages globaux

```css
:root { --marketing-breakpoint: 900px; } /* seuil desktop ↔ mobile */
```

| Réglage | Valeur |
| --- | --- |
| Breakpoint mobile | `max-width: 900px` |
| Container max | `var(--max-content)` → **1200px** |
| Padding horizontal desktop | **32px** (`var(--gutter-page)`) |
| Padding horizontal mobile | **20px** (`var(--space-7)`) |
| Police | `var(--font-sans)` → `"Instrument Sans","Helvetica Neue",Arial,sans-serif` |
| Fond de page marketing | `var(--color-bg-marketing)` → **#FFFFFF** |

Le container est toujours le même bloc :

```css
.sq-container{width:100%;max-width:var(--max-content);margin:0 auto;padding:0 32px;box-sizing:border-box}
@media (max-width:900px){.sq-container{padding:0 20px}}
```

---

## 1. Logo

### Asset à utiliser

**Ne jamais reconstruire le logo en texte HTML.** L'asset existe et doit être servi en `<img>`.

| Contexte | Fichier | Notes |
| --- | --- | --- |
| Header, footer, menu mobile — **canonique** | `assets/logo-wordmark.png` | Fond transparent, lettrage quasi-noir, `Q` et `R` verts. Pour tous fonds blancs / clairs. |
| Surface inverse `#12161A` uniquement | `assets/logo-wordmark-inverse.png` | Lettrage blanc, vert conservé. |
| Favicon, avatar, nav repliée, tout usage < 40px | `assets/logo-mark.png` | Le `Q` vert seul. |
| Decks, exports, presse | `assets/logo-on-white.png` | Lockup centré sur fond blanc officiel. |

### Fond

Le logo s'affiche **exclusivement sur fond blanc (`#FFFFFF`) ou transparent**.
Le fond crème / ivoire visible sur certains exports du fichier d'origine **n'est pas une couleur de marque** — c'est un artefact d'export. Ne jamais le reproduire, ne jamais poser le logo sur un fond coloré, une photo ou un dégradé (utiliser la variante `inverse` sur le seul fond `#12161A`).

### Tailles

La hauteur pilote tout ; la largeur est toujours `auto`. Ne jamais fixer la largeur.

| Contexte | Hauteur |
| --- | --- |
| Header desktop, état repos | **22px** |
| Header desktop, état sticky condensé | **19px** |
| Header mobile (barre) | **22px** |
| En-tête du menu mobile plein écran | **20px** |
| Footer | **22px** |
| Hauteur minimale absolue du wordmark | **18px** |

### Marges et zone de protection

- **Zone de protection** : de chaque côté, une marge libre égale à la **hauteur du `S`** du wordmark, soit ≈ **0,55 × hauteur du logo** (≈ 12px pour un logo de 22px). Aucun texte, filet ou icône dans cette zone.
- Dans le header, cette zone est assurée par le `gap` du container (28px desktop, 16px mobile) — **aucune marge propre n'est appliquée au logo**.
- Le logo n'a ni `padding`, ni `border`, ni `border-radius`, ni ombre, ni cadre.

### Placement dans le header

- **Extrême gauche** du container, premier enfant, `flex: none` (jamais compressé).
- Centré verticalement (`align-items: center` du container).
- Enveloppé dans un lien vers l'accueil : `<a href="/" aria-label="SmartQonsumeR — accueil">`, `display:flex`, `border:0`, pas de soulignement, **pas d'état hover** (pas d'opacité, pas de translation).

### Implémentation

```html
<a class="sq-logo" href="/" aria-label="SmartQonsumeR — accueil">
  <img src="assets/logo-wordmark.png" alt="SmartQonsumeR">
</a>
```
```css
.sq-logo{display:flex;flex:none;border:0}
.sq-logo img{height:22px;width:auto;display:block}
.sq-header.is-condensed .sq-logo img{height:19px}
```

Interdits : redessiner, recolorer, contourer, pivoter, étirer, recomposer en type vivante, appliquer un filtre. **Seule la mise à l'échelle est permise.**

---

## 2. Header marketing

### Structure

```
<header>                       ← pleine largeur, fond blanc, bordure basse
  └ .sq-container              ← max 1200px, centré, padding 32px
      ├ logo                   flex:none
      ├ <nav>                  flex:1 1 auto  (pousse les actions à droite)
      ├ lien « Se connecter »  flex:none
      └ bouton CTA             flex:none
```

En mobile, `nav` + lien + CTA sont retirés du flux et remplacés par un `spacer` (`flex:1`) suivi du bouton hamburger.

### Métriques

| Propriété | Desktop repos | Sticky condensé | Mobile |
| --- | --- | --- | --- |
| Hauteur | **78px** (`var(--header-height)`) | **62px** (`var(--header-height-condensed)`) | **78px** |
| Largeur max container | 1200px (`var(--max-content)`) | 1200px | 1200px |
| Padding horizontal | **32px** | 32px | **20px** |
| Gap entre éléments | **28px** | 28px | **16px** |
| Hauteur du logo | 22px | 19px | 22px |
| Taille du CTA | `lg` (44px) | `md` (36px) | dans le menu |

### Couleurs et séparation

| Propriété | Valeur |
| --- | --- |
| Fond | `var(--color-bg-marketing)` → **#FFFFFF**, opaque. Pas de translucidité, pas de `backdrop-filter`. |
| Bordure basse | `1px solid var(--color-border)` → **#E3E6E8**, dans les deux états |
| Ombre — repos | `none` |
| Ombre — condensé | `var(--shadow-md)` → `0 1px 3px rgba(18,22,26,.06), 0 1px 2px rgba(18,22,26,.04)` |
| `z-index` | **40** |

### Sticky

- `position: sticky; top: 0;` — option, activée sur toutes les pages marketing.
- Au-delà de **8px de défilement**, ajouter la classe `is-condensed` : hauteur 78 → 62px, logo 22 → 19px, CTA `lg` → `md`, ombre `none` → `--shadow-md`.
- Transition : `height 200ms var(--ease-standard), box-shadow 200ms var(--ease-standard)` (`--duration-base`).

### Implémentation

```css
.sq-header{position:sticky;top:0;z-index:40;height:78px;display:flex;align-items:center;
  background:var(--color-bg-marketing);border-bottom:1px solid var(--color-border);box-shadow:none;
  transition:height var(--duration-base) var(--ease-standard),box-shadow var(--duration-base) var(--ease-standard)}
.sq-header>.sq-container{display:flex;align-items:center;gap:28px;min-width:0}
.sq-header.is-condensed{height:62px;box-shadow:var(--shadow-md)}
.sq-header nav{flex:1 1 auto;min-width:0}
.sq-header .sq-login,.sq-header .sq-cta{flex:none}
.sq-burger{display:none}
@media (max-width:900px){
  .sq-header>.sq-container{gap:16px}
  .sq-header nav,.sq-header .sq-login,.sq-header .sq-cta{display:none}
  .sq-header .sq-spacer{flex:1}
  .sq-burger{display:inline-flex}
}
```

### État mobile du header

- Hauteur inchangée (78px), padding 20px, gap 16px.
- Contenu : logo (22px) · spacer élastique · **bouton hamburger**.
- Bouton hamburger = `IconButton` taille `lg` : carré **40 × 40px**, `border-radius: var(--radius-sm)` (6px), fond transparent, bordure transparente, icône Lucide `menu` **20px** en `var(--color-neutral-700)` (#4E565D).
  - Hover : fond `var(--color-action-ghost-active)` → **#E3E6E8**.
  - Menu ouvert : l'icône devient `x`, le libellé accessible « Fermer le menu ».
  - `aria-label` obligatoire (« Ouvrir le menu » / « Fermer le menu »).

---

## 3. Navigation marketing

Liens de premier niveau, alignés à gauche juste après le logo. **3 à 4 entrées maximum**
(référence : *Produit* — avec dropdown —, *Cas d'usage*, *Tarifs*, *Ressources*).

### Conteneur

```css
.sq-nav{display:flex;align-items:center;gap:2px}
```

### Item

| Propriété | Valeur |
| --- | --- |
| Hauteur | **34px** |
| Padding | `0 12px` |
| Gap interne (label ↔ chevron) | **5px** |
| Taille | `var(--font-size-body-sm)` → **14px** |
| Graisse — repos | `var(--font-weight-medium)` → **500** |
| Graisse — actif | `var(--font-weight-semibold)` → **600** |
| Couleur — repos | `var(--color-text-secondary)` → **#4E565D** |
| Couleur — hover | `var(--color-text-primary)` → **#12161A** |
| Couleur — actif | `var(--color-text-primary)` → **#12161A** |
| Fond | transparent dans tous les états (jamais de pastille) |
| `border-radius` | `var(--radius-sm)` (6px) |
| `white-space` | `nowrap` |
| Transition | `color var(--duration-fast) var(--ease-standard)` (140ms) |

### Soulignement (l'indicateur d'état)

Barre absolue sous l'item, **c'est le seul marqueur d'état** :

| Propriété | Valeur |
| --- | --- |
| Position | `absolute; left:12px; right:12px; bottom:-1px` (elle recouvre la bordure du header) |
| Hauteur | **2px**, `border-radius: var(--radius-xs)` (4px) |
| Repos | `transparent` |
| Hover | `var(--color-neutral-300)` → **#D2D6DA** |
| Actif | `var(--color-brand-600)` → **#2FA55C** |
| Transition | `background var(--duration-fast) var(--ease-standard)` |

```html
<nav class="sq-nav">
  <div class="sq-nav-item is-active"><button type="button">Tarifs</button><span aria-hidden="true"></span></div>
</nav>
```
```css
.sq-nav-item{position:relative}
.sq-nav-item>button{display:inline-flex;align-items:center;gap:5px;height:34px;padding:0 12px;border:0;
  background:transparent;cursor:pointer;font:inherit;font-size:var(--font-size-body-sm);
  font-weight:var(--font-weight-medium);color:var(--color-text-secondary);border-radius:var(--radius-sm);
  white-space:nowrap;transition:color var(--duration-fast) var(--ease-standard)}
.sq-nav-item>span{position:absolute;left:12px;right:12px;bottom:-1px;height:2px;border-radius:var(--radius-xs);
  background:transparent;transition:background var(--duration-fast) var(--ease-standard)}
.sq-nav-item:hover>button{color:var(--color-text-primary)}
.sq-nav-item:hover>span{background:var(--color-neutral-300)}
.sq-nav-item.is-active>button{font-weight:var(--font-weight-semibold);color:var(--color-text-primary)}
.sq-nav-item.is-active>span{background:var(--color-brand-600)}
```

### Dropdown (entrées à sous-menu)

Ouvert au **survol** du parent (et au clavier via `:focus-within`). Le chevron `chevron-down` (Lucide, 14px) pivote de `180deg` en `var(--duration-fast)`.

| Propriété | Valeur |
| --- | --- |
| Position | `absolute; top: calc(100% + 10px); left: 0` |
| `z-index` | **50** |
| Largeur min | **268px** |
| Padding du panneau | **8px** |
| Fond | **#FFFFFF** (`var(--color-surface)`) |
| Bordure | `1px solid var(--color-border)` (#E3E6E8) |
| Rayon | `var(--radius-lg)` → **14px** |
| Ombre | `var(--shadow-lg)` → `0 6px 16px rgba(18,22,26,.08), 0 1px 3px rgba(18,22,26,.05)` |
| Entrée | apparition + montée légère sur `var(--duration-fast)` |

**Ligne de dropdown** : `display:flex; align-items:flex-start; gap:10px; width:100%; padding:9px 10px; border-radius: var(--radius-sm)`.
Fond hover `var(--color-hover-surface)` (#F6F7F8). Icône Lucide **17px**, `var(--color-neutral-500)` au repos → `var(--color-brand-600)` au hover.
Titre : 14px / 600 / `--color-text-primary`. Description : `var(--font-size-caption)` **13px** / `--color-text-muted` (#6B747C), `margin-top: 1px`.

---

## 4. Bouton Connexion

Un **lien texte**, jamais un bouton. C'est la règle qui garantit qu'il n'y a qu'un seul bloc vert par page.

| Propriété | Valeur |
| --- | --- |
| Libellé | **« Se connecter »** |
| Hauteur | **36px** (aligné sur le CTA) |
| Padding | `0 4px` |
| Fond / bordure | `transparent` / `none` dans tous les états |
| Taille | `var(--font-size-body-sm)` → **14px** |
| Graisse | `var(--font-weight-semibold)` → **600** |
| Interlettrage | `var(--letter-spacing-label)` → **0.01em** |
| Couleur — repos | `var(--color-text-secondary)` → **#4E565D** |
| Couleur — hover | `var(--color-text-primary)` → **#12161A** |
| Décoration — repos | `none` |
| Décoration — hover | `underline`, `text-underline-offset: 3px` |
| `white-space` | `nowrap` |
| Transition | `color var(--duration-fast) var(--ease-standard)` |
| Focus | `box-shadow: var(--focus-ring)` (3px `rgba(81,189,111,.35)`) |

```css
.sq-login{height:36px;padding:0 4px;border:0;background:transparent;cursor:pointer;font:inherit;
  font-size:var(--font-size-body-sm);font-weight:var(--font-weight-semibold);
  letter-spacing:var(--letter-spacing-label);color:var(--color-text-secondary);text-decoration:none;
  white-space:nowrap;transition:color var(--duration-fast) var(--ease-standard)}
.sq-login:hover{color:var(--color-text-primary);text-decoration:underline;text-underline-offset:3px}
```

---

## 5. CTA principal

Bouton `primary` du design system, taille `lg` dans le header au repos, `md` en état condensé.
**Un seul CTA vert par page.**

| Propriété | Valeur |
| --- | --- |
| Libellé | **« Demander une démo »** |
| Icône | Lucide `arrow-right`, **à droite**, 18px en `lg` / 16px en `md` |
| Hauteur | **44px** (`lg`) · **36px** (`md`) |
| Padding horizontal | **18px** (`lg`) · **14px** (`md`) |
| Gap icône ↔ label | **8px** (`lg`) · **7px** (`md`) |
| Taille du texte | **15px** (`lg`, `--font-size-body`) · **14px** (`md`, `--font-size-body-sm`) |
| Graisse | **600** (`var(--font-weight-semibold)`) |
| Interlettrage | **0.01em** (`var(--letter-spacing-label)`) |
| Rayon | `var(--radius-sm)` → **6px** (jamais pill) |
| Fond — repos | `var(--color-action-primary)` → **#1F8443** |
| Fond — hover | `var(--color-action-primary-hover)` → **#176733** |
| Fond — actif | `var(--color-action-primary-active)` → **#0F4A25** |
| Texte | `var(--color-action-primary-text)` → **#FFFFFF** |
| Bordure | `1px solid transparent` |
| Ombre | `var(--shadow-sm)` → `0 1px 2px rgba(18,22,26,.05)` |
| Désactivé | fond `var(--color-disabled-bg)` (#EFF1F2), texte `var(--color-disabled-text)` (#AFB6BB), ombre `none`, `cursor: not-allowed` |
| Focus | `box-shadow: var(--focus-ring)` |
| Transition | `background var(--duration-fast) var(--ease-standard), border-color var(--duration-fast) var(--ease-standard)` |
| `white-space` | `nowrap` |

```css
.sq-cta{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;
  font:inherit;font-size:var(--font-size-body);font-weight:var(--font-weight-semibold);
  letter-spacing:var(--letter-spacing-label);border:1px solid transparent;border-radius:var(--radius-sm);
  background:var(--color-action-primary);color:var(--color-action-primary-text);box-shadow:var(--shadow-sm);
  cursor:pointer;white-space:nowrap;transition:background var(--duration-fast) var(--ease-standard)}
.sq-cta:hover{background:var(--color-action-primary-hover)}
.sq-cta:active{background:var(--color-action-primary-active)}
.sq-header.is-condensed .sq-cta{height:36px;padding:0 14px;font-size:var(--font-size-body-sm);gap:7px}
```

---

## 6. Menu mobile

Panneau **plein écran opaque**, ouvert par le hamburger, sous le breakpoint 900px.

### Conteneur

| Propriété | Valeur |
| --- | --- |
| Position | `fixed; inset: 0` |
| `z-index` | **60** (au-dessus du header, 40) |
| Fond | **#FFFFFF** opaque (`var(--color-surface)`) — pas d'overlay sombre, pas de flou |
| Layout | `display:flex; flex-direction:column` |
| Entrée | fondu sur `var(--duration-fast)` avec `var(--ease-out)` |
| Scroll | verrouillé sur `body` tant que le menu est ouvert |

### En-tête du panneau

- Hauteur **68px**, `flex: none`, padding `0 20px`, `justify-content: space-between`.
- Logo `assets/logo-wordmark.png` à **20px** de haut, à gauche.
- À droite : `IconButton` taille `md` — **34 × 34px**, icône Lucide `x` **17px** en `var(--color-neutral-700)`, hover fond #E3E6E8, `aria-label="Fermer le menu"`.
- Bordure basse `1px solid var(--color-border)`.

### Corps — liste des liens

- `flex: 1; overflow: auto; padding: 8px 20px`.
- Chaque ligne : `border-bottom: 1px solid var(--color-border)`, bouton pleine largeur, `padding: 16px 0`, `justify-content: space-between`, fond transparent.
- Libellé : `var(--font-size-h4)` → **16px**, graisse **600**, `var(--color-text-primary)`.
- Affordance à droite :
  - lien simple → Lucide `chevron-right` **17px** en `var(--color-neutral-400)` (#AFB6BB) ;
  - entrée à sous-menu → Lucide `plus` **18px** en `var(--color-neutral-500)` (#8C949B), qui devient `minus` à l'ouverture (accordéon, pas de navigation).
- Sous-liens ouverts : pile `gap: 2px`, `padding-bottom: 12px`. Chaque sous-lien : `padding: 10px`, `border-radius: var(--radius-sm)`, fond `var(--color-hover-surface)` (#F6F7F8), icône Lucide **16px** en `var(--color-brand-600)`, texte **14px** en `var(--color-text-secondary)`, `gap: 10px`.

### Pied du panneau — actions

- `flex: none; padding: 20px; border-top: 1px solid var(--color-border)`.
- Pile verticale, `gap: 10px`, les deux boutons en `width: 100%`, taille `lg` (**44px**) :
  1. **« Se connecter »** — variante `secondary` : fond `var(--color-action-secondary)` #FFFFFF, bordure `1px solid var(--color-border-strong)` #D2D6DA, texte `var(--color-action-secondary-text)` #1F2429, ombre `var(--shadow-sm)`, hover fond #F6F7F8, actif #EFF1F2.
  2. **« Demander une démo »** — variante `primary` avec `arrow-right` à droite, spécifications du §5 en taille `lg`.

En mobile, « Se connecter » est donc un bouton bordé (et non un lien texte) : c'est la seule exception à la règle du §4, et le vert reste unique.

---

## 7. Footer marketing

### Structure

```
<footer>                          ← fond blanc, filet haut
  └ .sq-container (padding 56px 32px 28px)
      ├ grille principale         1.5fr + N×1fr, gap 40px
      │   ├ colonne marque        logo · tagline · réseaux sociaux
      │   └ N colonnes de liens   titre eyebrow + liste
      └ barre légale              filet haut, copyright + liens légaux ↔ note
```

Référence : **3 colonnes de liens** (*Produit*, *Cas d'usage*, *Entreprise*) + la colonne marque.

### Métriques

| Propriété | Valeur |
| --- | --- |
| Padding du container | **56px 32px 28px** (mobile : 40px 20px 24px) |
| Grille | `grid-template-columns: 1.5fr repeat(3, 1fr)` |
| Gap de grille | **40px** (`var(--space-10)`) |
| Fond | **#FFFFFF** (`var(--color-bg-marketing)`) |
| Filet supérieur | `1px solid var(--color-border)` (#E3E6E8) |

### Colonne marque

- Logo `assets/logo-wordmark.png`, hauteur **22px**, sur le fond blanc.
- Tagline : `margin-top: 14px`, `max-width: 280px`, `var(--font-size-caption)` **13px**, `line-height: var(--line-height-body)` **1.55**, couleur `var(--color-text-secondary)` (#4E565D).
- Réseaux sociaux : `margin-top: 18px`, rangée `gap: 6px`. Chaque lien = carré **32 × 32px**, `border: 1px solid var(--color-border)`, `border-radius: var(--radius-sm)` (6px), icône Lucide **16px** en `var(--color-neutral-600)` (#6B747C), `aria-label` explicite. Hover : bordure `var(--color-border-strong)`, icône `var(--color-text-primary)`.

### Colonnes de liens

- Titre (eyebrow) : `var(--font-size-micro)` **11px**, graisse **600**, `letter-spacing: var(--letter-spacing-eyebrow)` **0.1em**, `text-transform: uppercase`, couleur `var(--color-text-muted)` (#6B747C).
- Liste : `margin: 14px 0 0`, `padding: 0`, `list-style: none`, pile `gap: 9px`.
- Lien : `var(--font-size-caption)` **13px**, `border: 0`, pas de soulignement.
  - Repos `var(--color-text-secondary)` (#4E565D) → hover `var(--color-text-primary)` (#12161A).
  - Transition `color var(--duration-fast) var(--ease-standard)`.
  - Pas de soulignement au hover (contrairement au lien Connexion du header).

### Barre légale

- `margin-top: 44px`, `padding-top: 20px`, `border-top: 1px solid var(--color-border)`.
- `display:flex; align-items:center; justify-content:space-between; gap:20px; flex-wrap:wrap`.
- **Copyright** : `© 2026 SmartQonsumeR` — `var(--font-size-micro)` **11px**, `var(--color-text-muted)` (#6B747C).
- Liens légaux (*Mentions légales*, *Confidentialité*) : mêmes 11px / `--color-text-muted`, `gap: 16px` avec le copyright, hover → `var(--color-text-primary)`.
- Note à droite (ex. « Hébergement en France ») : `font-family: var(--font-mono)`, **11px**, `var(--color-text-muted)`.

### Implémentation

```css
.sq-footer{background:var(--color-bg-marketing);border-top:1px solid var(--color-border)}
.sq-footer>.sq-container{padding:56px 32px 28px}
.sq-footer-grid{display:grid;grid-template-columns:1.5fr repeat(3,1fr);gap:40px}
.sq-footer-brand img{height:22px;width:auto;display:block}
.sq-footer-tagline{margin:14px 0 0;max-width:280px;font-size:var(--font-size-caption);
  line-height:var(--line-height-body);color:var(--color-text-secondary)}
.sq-footer-social{margin-top:18px;display:flex;gap:6px}
.sq-footer-social a{width:32px;height:32px;display:flex;align-items:center;justify-content:center;
  border:1px solid var(--color-border);border-radius:var(--radius-sm);color:var(--color-neutral-600)}
.sq-footer-col p{margin:0;font-size:var(--font-size-micro);font-weight:var(--font-weight-semibold);
  letter-spacing:var(--letter-spacing-eyebrow);text-transform:uppercase;color:var(--color-text-muted)}
.sq-footer-col ul{margin:14px 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:9px}
.sq-footer-col a{font-size:var(--font-size-caption);color:var(--color-text-secondary);text-decoration:none;
  transition:color var(--duration-fast) var(--ease-standard)}
.sq-footer-col a:hover{color:var(--color-text-primary)}
.sq-footer-legal{margin-top:44px;padding-top:20px;border-top:1px solid var(--color-border);
  display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
.sq-footer-legal *{font-size:var(--font-size-micro);color:var(--color-text-muted)}
.sq-footer-note{font-family:var(--font-mono)}
```

### Responsive

| Largeur | Grille |
| --- | --- |
| > 1000px | `1.5fr repeat(3, 1fr)`, gap 40px |
| 640 – 1000px | `1fr 1fr` — la colonne marque occupe toute la première ligne (`grid-column: 1 / -1`), gap 32px |
| < 640px | `1fr` — colonnes empilées, gap 28px, padding container `40px 20px 24px`, barre légale en colonne (`align-items: flex-start`, `gap: 10px`) |

```css
@media (max-width:1000px){
  .sq-footer-grid{grid-template-columns:1fr 1fr;gap:32px}
  .sq-footer-brand{grid-column:1/-1}
}
@media (max-width:640px){
  .sq-footer>.sq-container{padding:40px 20px 24px}
  .sq-footer-grid{grid-template-columns:1fr;gap:28px}
  .sq-footer-legal{flex-direction:column;align-items:flex-start;gap:10px}
}
```

---

## 8. Règles non négociables

1. Le logo est un **asset image**, jamais du texte HTML — même en cas d'urgence de mise en page.
2. Le logo se pose sur **blanc ou transparent** uniquement. Pas de crème, pas d'ivoire, pas de fond coloré.
3. **Un seul bouton vert par page.** Dans le header : le CTA. « Se connecter » reste un lien texte en desktop.
4. **Aucun pastel, aucun dégradé** dans le shell. Fond blanc, texte quasi-noir, gris pour le secondaire, vert pour l'action.
5. Le header est **opaque**. Pas de `backdrop-filter`, pas de fond translucide.
6. L'état de navigation se lit au **soulignement 2px**, jamais avec une pastille de fond.
7. Rayons : **6px** pour les boutons et petits éléments, **14px** pour les panneaux flottants. Jamais de pill dans le shell.
8. Icônes : **Lucide**, épaisseur de trait par défaut, taille en px explicite. Aucune emoji.
