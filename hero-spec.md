# SmartQonsumeR — Hero marketing (`marketing-hero`)

Spécification du **seul bloc Hero** de la page « Site marketing / Accueil ».
Ni header, ni footer, ni autre section.

Source : `ui_kits/website/Site.jsx`, fonction `Hero` — bloc `#marketing-hero`.
Variables : **`design-tokens.css`** (préfixe `--color-*`, `--font-*`, `--space-*`…). Valeur résolue entre parenthèses.

Livrables de cet export :

| Fichier | Contenu |
| --- | --- |
| `hero-spec.md` | ce document |
| `exports/hero/hero.html` | le Hero seul, HTML statique, aucun JS |
| `exports/hero/hero.css` | le CSS du Hero, variables `design-tokens.css` |
| `exports/hero/hero-reference.png` | référence visuelle, rendu desktop 1280px |

---

## 1. Structure

```
<section id="marketing-hero">                        fond inverse, overflow hidden
  ├ .hero-modules                                    champ de modules décoratif (absolute)
  └ .hero-inner            [marketing-hero-inner]    max 1200px, grid 1.15fr / .85fr, gap 56
      ├ .hero-copy         [marketing-hero-copy]
      │   ├ .hero-eyebrow      surtitre
      │   ├ .hero-title        h1, deux lignes
      │   ├ .hero-subtitle     paragraphe
      │   ├ .hero-actions      CTA principal (un seul)
      │   └ .hero-proof        3 preuves à puce check
      └ .hero-visual       [marketing-hero-visual]
          ├ .loyalty-card  [marketing-hero-loyalty-card]   carte blanche
          │   ├ .loyalty-top      QR + badge + nom + entonnoir [marketing-hero-funnel]
          │   └ .segments         [marketing-hero-segments]
          └ .hero-kpis     [marketing-hero-kpis]           2 tuiles inverse
              ├ .tile                 Membres fidèles (valeur + delta)
              └ .tile          [marketing-hero-campaign]   Campagne email (2 taux)
```

Chaque bloc porte `id` et/ou `data-block` — ciblables via `#marketing-hero` ou `[data-block="marketing-hero-funnel"]`.

---

## 2. Section et container

| Propriété | Valeur |
| --- | --- |
| Fond | `var(--color-bg-inverse)` → **#12161A** |
| Couleur de texte par défaut | **#FFFFFF** |
| `position` / `overflow` | `relative` / `hidden` |
| Hauteur | **aucune** — pas de `min-height`, pas de `height`. La hauteur vient du contenu et des paddings. Environ **540px** en desktop. |
| Largeur max du container | `var(--max-content)` → **1200px**, `margin: 0 auto` |
| Padding du container | **84px 32px 88px** (haut / horizontal / bas) |
| Grille | `grid-template-columns: 1.15fr .85fr` |
| Gap de grille | **56px** |
| Alignement vertical des colonnes | `align-items: center` |
| Bordure | **aucune** |
| Rayon | **aucun** — la section est pleine largeur, à angles droits |
| Ombre | **aucune** sur la section |

### Champ de modules décoratif

Fond texturé évoquant les modules d'un QR code. **Ce n'est pas un dégradé de couleur** : la couleur est plate, seul le masque est dégradé.

| Propriété | Valeur |
| --- | --- |
| Position | `absolute; inset: 0 0 0 42%` (moitié droite) |
| Opacité | **0.16** |
| Couleur des modules | `var(--color-brand-500)` → **#51BD6F** |
| Pas de la trame | **9px** |
| Masque | `linear-gradient(to right, transparent, #000 22%)` — la trame naît au tiers gauche et sature à droite |
| `pointer-events` | `none`, `aria-hidden="true"` |

---

## 3. Colonne texte

### Surtitre — `.hero-eyebrow`

Texte : « CRM nouvelle génération pour la vente indirecte » (écrit en casse normale, mis en majuscules par le style).

| Propriété | Valeur |
| --- | --- |
| Taille | `var(--font-size-micro)` → **11px** |
| Graisse | `var(--font-weight-bold)` → **700** |
| Interlettrage | `var(--letter-spacing-eyebrow)` → **0.1em** |
| Casse | `uppercase` |
| Couleur | `var(--color-brand-400)` → **#67C888** |
| Marge | `0` |

### Titre — `.hero-title` (`h1`)

Texte, verbatim, avec une coupure explicite :
« Vous vendez vos produits partout. » `<br>` « Enfin, sachez qui les achète. »

| Propriété | Desktop (> 1000px) | Tablette (≤ 1000px) | Mobile (≤ 640px) |
| --- | --- | --- | --- |
| Taille | `var(--font-size-display)` → **40px** | **34px** | **28px** |
| Graisse | 700 (`var(--font-weight-bold)`) | 700 | 700 |
| Line-height | `var(--line-height-display)` → **1.1** | 1.1 | 1.1 |
| Interlettrage | `var(--letter-spacing-display)` → **-0.022em** | idem | idem |
| Couleur | **#FFFFFF** | idem | idem |
| `margin-top` | **14px** | idem | idem |

`text-wrap: pretty`. Le `<br>` est conservé à toutes les tailles.

### Paragraphe — `.hero-subtitle`

| Propriété | Valeur |
| --- | --- |
| Taille | `var(--font-size-body-lg)` → **17px** (mobile ≤ 640px : `var(--font-size-body)` → **15px**) |
| Line-height | **1.6** |
| Couleur | `var(--color-neutral-300)` → **#D2D6DA** |
| Largeur max | **520px** (levée sous 1000px) |
| `margin-top` | **18px** |

### Preuves — `.hero-proof`

Trois mentions : **Connaissance client · Engagement client · Fidélisation**.

| Propriété | Valeur |
| --- | --- |
| Layout | `flex`, `gap: 20px` (mobile ≤ 640px : colonne, `gap: 10px`) |
| `margin-top` | **26px** |
| Taille | `var(--font-size-caption)` → **13px** |
| Couleur du texte | `var(--color-neutral-400)` → **#AFB6BB** |
| Icône | Lucide `check`, **14px**, trait 1.75, couleur `var(--color-brand-400)` (#67C888) |
| Gap icône ↔ texte | **6px** |

---

## 4. CTA principal — `.btn-primary.btn-lg`

**Un seul CTA dans le Hero.** Pas de CTA secondaire : le bouton « Voir la plateforme » a été retiré, ne pas le réintroduire.

| Propriété | Valeur |
| --- | --- |
| Libellé | **« Demander une démo »** |
| Icône | **aucune** (pas de flèche) |
| Hauteur | **44px** (taille `lg`) |
| Padding horizontal | **18px** |
| Taille du texte | `var(--font-size-body)` → **15px** |
| Graisse | `var(--font-weight-semibold)` → **600** |
| Interlettrage | `var(--letter-spacing-label)` → **0.01em** |
| Rayon | `var(--radius-sm)` → **6px** |
| Fond — repos | `var(--color-action-primary)` → **#1F8443** |
| Fond — **hover** | `var(--color-action-primary-hover)` → **#176733** |
| Fond — **active** | `var(--color-action-primary-active)` → **#0F4A25** |
| Texte | `var(--color-action-primary-text)` → **#FFFFFF** |
| Bordure | `1px solid transparent` |
| Ombre | `var(--shadow-sm)` → `0 1px 2px rgba(18,22,26,.05)` |
| **focus-visible** | `outline: none` + `box-shadow: var(--focus-ring)` → `0 0 0 3px rgba(81,189,111,.35)` |
| Transition | `background`, `border-color` sur `var(--duration-fast)` (140ms) `var(--ease-standard)` |
| `margin-top` du conteneur | **26px** |
| Mobile ≤ 640px | pleine largeur (`width: 100%`) |

---

## 5. Visuel — carte club fidélité

Colonne droite : pile verticale, `gap: 12px`. Aucun mockup d'appareil, aucune image — la démonstration est faite en UI réelle.

### 5.1 Carte — `.loyalty-card`

| Propriété | Valeur |
| --- | --- |
| Fond | `var(--color-surface)` → **#FFFFFF** |
| Padding | **20px** |
| Rayon | `var(--radius-lg)` → **14px** |
| Ombre | `var(--shadow-xl)` → `0 16px 40px rgba(18,22,26,.12)` |
| Bordure | **aucune** (l'ombre suffit sur le fond inverse) |
| Rangée haute | `flex`, `gap: 16px`, `align-items: flex-start` |

### 5.2 QR code — `.qr`

Aperçu de module, **placeholder** : ce n'est pas un QR encodé. Dans `hero.html`, la trame est un SVG statique 25 × 25 (296 modules).

| Propriété | Valeur |
| --- | --- |
| Cadre | **84 × 84px**, padding **7px** (8 % de la taille) |
| Fond du cadre | **#FFFFFF** |
| Bordure | `1px solid var(--color-border)` → **#E3E6E8** |
| Rayon | `var(--radius-md)` → **10px** |
| Ombre | `var(--shadow-sm)` |
| Modules | grille 25 × 25, remplissage `var(--color-neutral-950)` (#12161A), coins `var(--radius-xs)` |
| Légende | **« 3017620422003 »** — `var(--font-mono)`, **11px**, `var(--color-text-muted)` (#6B747C), `gap: 8px` sous le cadre |

### 5.3 Badge et nom

| Élément | Valeur |
| --- | --- |
| Badge | **« Club fidélité actif »**, ton `success` : fond `var(--color-success-bg)` **#E8F6EE**, texte `var(--color-success)` **#16794A**, hauteur **22px**, padding `0 8px`, rayon `var(--radius-xs)` (4px), **11px** / 600, interlettrage 0.01em |
| Puce du badge | disque **6 × 6px**, `border-radius: var(--radius-pill)`, couleur = couleur du texte |
| Nom | **« Produit exemple »** — `var(--font-size-h4)` **16px**, graisse **700**, `var(--color-text-primary)` (#12161A), `margin-top: 8px` |

### 5.4 Entonnoir d'adhésion — `[data-block="marketing-hero-funnel"]`

Trois étapes, `margin-top: 10px`, pile `gap: 6px`.

| Étape | Valeur | Barre |
| --- | --- | --- |
| Scans | 12 480 | **100 %** en `var(--color-neutral-400)` (#AFB6BB) — c'est le total, pas une conversion |
| Inscriptions au club | 4 812 | **39 %** en `var(--color-brand-600)` (#2FA55C) |
| Profils complétés | 3 104 | **25 %** en `var(--color-brand-600)` |

- Ligne d'en-tête : `justify-content: space-between`, **11px**, libellé `var(--color-text-muted)`, valeur en `var(--font-mono)` + `var(--color-text-primary)`.
- Piste : `margin-top: 3px`, hauteur **4px**, rayon `var(--radius-xs)`, fond `var(--color-neutral-100)` (#EFF1F2).

### 5.5 Segments — `[data-block="marketing-hero-segments"]`

`margin-top: 16px`, `padding-top: 14px`, `border-top: 1px solid var(--color-border)`.

- Titre : **« Segments constitués »** — **11px** / 600, interlettrage 0.1em, `uppercase`, `var(--color-text-muted)`.
- Liste : `margin-top: 10px`, pile `gap: 8px`. Chaque ligne : `flex`, `align-items: center`, `gap: 10px`.

| Segment | Volume | Barre | Icône Lucide |
| --- | --- | --- | --- |
| Urbains 25-34 | 1 840 | 100 % | `mail` |
| Familles, achat récurrent | 1 220 | 66,3 % | `repeat` |
| Primo-acheteurs | 960 | 52,2 % | `user-plus` |

- Icône : **15px**, trait 1.75, `var(--color-brand-600)`.
- Nom : `var(--font-size-body-sm)` **14px**, `var(--color-text-primary)`, `flex: 1`, troncature `ellipsis`.
- Piste : **84 × 6px** (mobile : 56px), rayon `var(--radius-xs)`, fond `var(--color-neutral-100)` ; remplissage `var(--color-brand-500)` (#51BD6F).
- Volume : largeur fixe **46px**, aligné à droite, `var(--font-mono)` **11px**, `var(--color-text-muted)`.

Les barres sont proportionnelles au **plus grand segment**, pas au total.

### 5.6 Tuiles KPI — `[data-block="marketing-hero-kpis"]`

Grille `1fr 1.15fr`, `gap: 12px`. Les deux tuiles partagent le même châssis inverse.

| Propriété | Valeur |
| --- | --- |
| Padding | **16px** |
| Rayon | `var(--radius-lg)` → **14px** |
| Fond | `var(--color-surface-inverse)` → **#12161A** |
| Bordure | `1px solid var(--color-border-inverse)` → `rgba(255,255,255,.12)` |
| Ombre | **aucune** |
| En-tête | `flex`, `gap: 7px`, `margin-bottom: 10px` — icône **15px** en `var(--color-brand-700)` (#1F8443) + libellé **11px** / 700 / 0.1em / `uppercase` / `var(--color-neutral-400)` |

**Tuile 1 — Membres fidèles**

- Icône `users`, valeur **« 4 812 »** : `var(--font-size-h1)` **30px**, graisse 700, interlettrage -0.022em, `line-height: 1`, `tabular-nums`, **#FFFFFF**.
- Delta : `margin-top: 8px`, icône `trending-up` **14px** + « +18% » en `var(--font-mono)` **13px**, couleur `var(--color-success)` (#16794A).

**Tuile 2 — Campagne email** (`[data-block="marketing-hero-campaign"]`)

- Icône `send`. Deux taux, pile `gap: 7px` : **Ouvertures 42 %**, **Clics 18 %**.
- Ligne : libellé largeur fixe **74px**, **13px**, `var(--color-neutral-300)` ; piste `flex: 1`, hauteur **6px**, fond `rgba(255,255,255,.12)`, remplissage `var(--color-brand-500)` ; valeur largeur **34px** alignée à droite, `var(--font-mono)` **13px**, **#FFFFFF**.
- Aucun grand chiffre ici : le bloc montre l'**efficacité**, pas un volume.

---

## 6. Typographie — récapitulatif

| Rôle | Famille | Desktop | Tablette | Mobile | Line-height |
| --- | --- | --- | --- | --- | --- |
| Surtitre | `--font-sans` | 11px / 700 | 11px | 11px | 1.3 |
| Titre h1 | `--font-sans` | 40px / 700 | 34px | 28px | 1.1 |
| Paragraphe | `--font-sans` | 17px / 400 | 17px | 15px | 1.6 |
| CTA | `--font-sans` | 15px / 600 | 15px | 15px | — |
| Preuves | `--font-sans` | 13px / 400 | 13px | 13px | 1.45 |
| Nom produit | `--font-sans` | 16px / 700 | idem | idem | 1.35 |
| Segments | `--font-sans` | 14px / 400 | idem | idem | 1.5 |
| Valeur KPI | `--font-sans` | 30px / 700 | idem | idem | 1 |
| Chiffres, ID, taux | `--font-mono` | 11–13px | idem | idem | — |

`--font-sans` → `"Instrument Sans","Helvetica Neue",Arial,sans-serif`
`--font-mono` → `"JetBrains Mono",ui-monospace,SFMono-Regular,Menlo,monospace`
Tous les nombres portent `font-variant-numeric: tabular-nums`.

---

## 7. Couleurs utilisées

| Usage | Variable | Hex |
| --- | --- | --- |
| Fond de section | `--color-bg-inverse` | #12161A |
| Titre, valeurs KPI | — | #FFFFFF |
| Surtitre, icônes de preuve | `--color-brand-400` | #67C888 |
| Paragraphe | `--color-neutral-300` | #D2D6DA |
| Preuves | `--color-neutral-400` | #AFB6BB |
| CTA | `--color-action-primary` / hover / active | #1F8443 / #176733 / #0F4A25 |
| Carte, cadre QR | `--color-surface` | #FFFFFF |
| Texte de carte | `--color-text-primary` | #12161A |
| Libellés secondaires | `--color-text-muted` | #6B747C |
| Barres d'entonnoir | `--color-brand-600` | #2FA55C |
| Barres de segments et de taux | `--color-brand-500` | #51BD6F |
| Pistes claires | `--color-neutral-100` | #EFF1F2 |
| Piste sur fond inverse | — | rgba(255,255,255,.12) |
| Badge actif | `--color-success-bg` / `--color-success` | #E8F6EE / #16794A |
| Filets de carte | `--color-border` | #E3E6E8 |
| Bordure de tuile inverse | `--color-border-inverse` | rgba(255,255,255,.12) |

**Aucun pastel, aucun dégradé de couleur.** Le seul dégradé du bloc est un masque d'opacité sur la trame décorative.

---

## 8. Responsive

| Palier | Comportement |
| --- | --- |
| **> 1000px** | 2 colonnes `1.15fr .85fr`, gap 56px, padding `84px 32px 88px`. Trame sur la moitié droite. |
| **≤ 1000px** | 1 colonne, gap 40px, padding `64px 24px 68px`. Titre 34px, largeur max du paragraphe levée. La trame passe en pleine largeur, opacité 0.10, masque de haut en bas. |
| **≤ 640px** | Padding `48px 20px 52px`, gap 32px. Titre 28px, paragraphe 15px. Preuves empilées (gap 10px). CTA pleine largeur. QR au-dessus du bloc texte dans la carte. Tuiles KPI empilées. Piste de segment réduite à 56px. |

### Ordre des éléments sur mobile

De haut en bas, l'ordre du DOM est conservé — aucun `order` CSS :

1. Surtitre
2. Titre
3. Paragraphe
4. CTA « Demander une démo » (pleine largeur)
5. Preuves (Connaissance client, Engagement client, Fidélisation)
6. Carte club fidélité — QR + légende, puis badge, nom, entonnoir, puis segments
7. Tuile « Membres fidèles »
8. Tuile « Campagne email »

Le visuel reste **sous** le texte : la promesse se lit avant la démonstration.

---

## 9. Règles de fidélité

1. **Un seul CTA** dans le Hero, vert, sans icône.
2. **Aucun pastel, aucun dégradé de couleur** — fond #12161A, accent vert SmartQonsumeR.
3. Le visuel est de l'**UI réelle**, pas un mockup d'appareil ni une image.
4. Les barres d'entonnoir sont proportionnelles au **total scans** ; celles des segments au **plus grand segment**.
5. La carte blanche ne porte **pas de bordure** — sa séparation du fond vient de `--shadow-xl`.
6. Le QR est un **placeholder de trame**, à remplacer par un vrai code encodé en production.
7. Chiffres, segments et taux sont des **exemples** ; à substituer par les données réelles sans changer la structure.
8. Ne pas ajouter de `min-height` : la hauteur du Hero suit son contenu.
