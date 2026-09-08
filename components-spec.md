# SmartQonsumeR — Component spec

Concrete build specs for reproducing the design system in plain HTML/CSS. All colours, sizes and shadows reference `design-tokens.css`. No hex values are repeated where a token exists.

**Global rules**
- Marketing pages: `--color-bg-marketing` (white). Sections that need separating: `--color-bg-marketing-band`.
- App/dashboard: page `--color-bg-app` (neutral grey), every card and panel `--color-surface` (white).
- Text: `--color-text-primary` (near-black). Green is an accent — text, icons, borders, small action fills. Never a large background fill, never a pastel tint.
- Transitions: `var(--duration-fast) var(--ease-standard)` for hover/focus, `var(--duration-base)` for entries.
- Focus is always visible: `box-shadow: var(--focus-ring)` + `border-color: var(--focus-border-color)`.

Each entry marks its status:
**[DS]** = a real component in the system · **[Pattern]** = composed from DS components, no separate component exists.

---

## Core

### Button [DS]
Primary action control.

| | |
|---|---|
| Structure | `inline-flex`, centred, optional leading/trailing icon |
| Heights | sm 30 · md 36 · lg 44 |
| Padding | sm `0 10px` · md `0 14px` · lg `0 18px` |
| Gap | sm 6 · md 7 · lg 8 |
| Radius | `--radius-sm` |
| Border | `1px solid` (transparent except secondary) |
| Shadow | `--shadow-sm` on primary/secondary; none on tertiary/ghost |
| Type | sm `--font-size-caption` · md `--font-size-body-sm` · lg `--font-size-body`; weight `--font-weight-semibold`; `letter-spacing: var(--letter-spacing-label)`; `white-space: nowrap` |
| Icon size | sm 14 · md 16 · lg 18 |

Variants — background / text / border:

| Variant | Rest | Hover | Active | Border |
|---|---|---|---|---|
| primary | `--color-action-primary` / `--color-action-primary-text` | `--color-action-primary-hover` | `--color-action-primary-active` | transparent |
| secondary | `--color-action-secondary` / `--color-action-secondary-text` | `--color-action-secondary-hover` | `--color-action-secondary-active` | `--color-border-strong` |
| tertiary | `--color-neutral-100` / `--color-text-primary` | `--color-neutral-200` | `--color-neutral-300` | transparent |
| ghost | transparent / `--color-action-ghost-text` | `--color-action-ghost-hover` | `--color-action-ghost-active` | transparent |
| destructive | `--color-error` / white | darken one step | darken two steps | transparent |

- **Active** also applies `transform: translateY(1px)`.
- **Focus**: `box-shadow: var(--focus-ring)`.
- **Disabled**: background `--color-disabled-bg`, text `--color-disabled-text`, no shadow, `cursor: not-allowed`.
- **Loading**: leading icon replaced by a spinner (`rotate 900ms linear infinite`), interaction blocked.
- Exactly one primary button per view.

### IconButton [DS]
Square icon-only control for toolbars, table rows, card headers.

- Sizes: sm 28 · md 34 · lg 40 (square). Icon 15 / 17 / 20.
- Radius `--radius-sm`. Border transparent (`ghost`) or `1px solid var(--color-border)` (`quiet`, background `--color-surface`).
- Rest colour `--color-neutral-700`. **Hover** background `--color-neutral-200`. **Active/selected** background `--color-selected-surface`, icon `--color-brand-700`. **Disabled** icon `--color-neutral-400`, transparent background.
- Requires an accessible label (`aria-label` + `title`).

### Card [DS]
Default container for every panel.

- Background `--color-surface`, border `1px solid var(--color-border)`, radius `--radius-lg`, `overflow: hidden`.
- Elevation: `0` none · `1` `--shadow-md` (default) · `2` `--shadow-lg`.
- Body padding: none 0 · sm 16 · md 20 · lg 24.
- Optional header: `padding: (bodyPad − 4)px bodyPad`, `border-bottom: 1px solid var(--color-border)`, title `--font-size-h3` / `--font-weight-bold`, subtitle `--font-size-caption` / `--color-text-muted` (margin-top 2), actions right-aligned with `gap: var(--space-4)`.
- `inverse` variant: background `--color-surface-inverse`, text white, border `--color-border-inverse`, **no shadow**. Max one per view.
- Never a coloured left border. Separation comes from the border and shadow, not a tinted ground.

### Badge [DS]
Status marker for system-defined state.

- Height 22, padding `0 8px`, gap 6, radius `--radius-xs`, `white-space: nowrap`.
- Type `--font-size-micro`, `--font-weight-semibold`, `letter-spacing: var(--letter-spacing-label)`.
- Optional 6×6 dot (`--radius-pill`, filled with the foreground colour) or a 12px icon at stroke 2.
- Tones (background / foreground): neutral `--color-neutral-status-bg` / `--color-neutral-status` · brand `--color-neutral-100` / `--color-text-brand` · success `--color-success-bg` / `--color-success` · warning `--color-warning-bg` / `--color-warning` · error `--color-error-bg` / `--color-error` · info `--color-info-bg` / `--color-info`.
- Static: no hover, no focus.

### Tag [DS]
Pill for user-authored labels (campaigns, segments, filters). Sentence case, unlike Badge.

- Height 26, radius `--radius-pill`, padding `0 10px` (`0 6px 0 10px` when removable), gap 6.
- Border `1px solid var(--color-border)`, background `--color-surface`, text `--color-neutral-800`, `--font-size-caption` / `--font-weight-medium`.
- **Hover** (only when clickable): background `--color-neutral-200`.
- **Selected**: border `--color-border-brand`, background `--color-selected-surface`, text `--color-neutral-900`.
- Remove affordance: 12px `x` at stroke 2, colour `--color-neutral-600`, 2px padding, radius `--radius-xs`.

### Icon [DS]
Lucide set, loaded from CDN.

- Stroke **1.75** up to 24px; 2 above.
- Sizes: 12 in badges · 14 with caption text · 16 in buttons · 17–18 default UI · 20 in nav · 22 in empty-state tiles.
- Colour `currentColor` by default; `--color-brand-700` for informational icons on white, `--color-brand-400` on the inverse surface, status colours in toasts.
- Never emoji, never a unicode glyph, never inline hand-drawn SVG.

### Avatar [Pattern]
No Avatar component exists. Build it as a square initials tile:

- 28×28 (nav/footer) or 34×34 (lists), radius `--radius-sm`.
- Background `--color-neutral-950`, text white, `--font-size-label`, `--font-weight-bold`, centred, two uppercase initials.
- Green is not used for avatars — it stays the action colour.

### Divider [Pattern]
No Divider component exists. Use a rule, never a component:

- Horizontal: `height: 1px; background: var(--color-border);` full width, `margin: var(--space-6) 0`.
- Vertical (in toolbars): `width: 1px; height: 26px; background: var(--color-border);`
- On the inverse surface: `--color-border-inverse`.

---

## Data

### DataTable [DS]
List of records.

| | |
|---|---|
| Table | `width: 100%; border-collapse: collapse;` font `--font-size-body-sm` |
| Header cell | padding `10px 16px` (dense `8px 12px`), background `--color-neutral-100`, `border-bottom: 1px solid var(--color-border)` |
| Header type | `--font-size-micro`, `--font-weight-bold`, `letter-spacing: var(--letter-spacing-label)`, uppercase, `--color-text-muted`, `white-space: nowrap` |
| Body cell | padding `12px 16px` (dense `8px 12px`), `border-bottom: 1px solid var(--color-border)`, `--color-text-primary` |
| Numbers | right-aligned, `font-variant-numeric: tabular-nums` |
| Mono cells | IDs, URLs, codes → `font-family: var(--font-mono)` |

- **Row hover** (only when the row is clickable): background `--color-neutral-100`, `cursor: pointer`.
- Sort indicator: 11px `arrow-up`/`arrow-down` at stroke 2.5, inline with the header label, gap 4.
- No zebra striping. Separation is the hairline rule only.
- Responsive: wrap in `overflow-x: auto`; never shrink the type below 14px.

### StatTile (KPI card) [DS]
Single headline metric.

- Padding 16, radius `--radius-lg`, background `--color-surface`, border `1px solid var(--color-border)`, shadow `--shadow-sm`.
- Label row: gap 7, `margin-bottom: 10`. Icon 15px in `--color-brand-600`. Label `--font-size-micro`, `--font-weight-bold`, `letter-spacing: var(--letter-spacing-eyebrow)`, uppercase, `--color-text-muted`, truncated with ellipsis (never wraps).
- Value: `--font-size-h1`, `--font-weight-bold`, `letter-spacing: var(--letter-spacing-display)`, `line-height: 1`, `tabular-nums`. Unit sits on the baseline beside it: `--font-size-body-sm`, `--font-weight-semibold`, `--color-text-muted`, gap 5.
- Delta row: `margin-top: 8`, gap 5, `white-space: nowrap`. 14px `trending-up`/`trending-down` + mono `--font-size-caption`, coloured `--color-success` when ≥ 0, `--color-error` when negative. Comparison label in `--color-text-muted`.
- `inverse`: background `--color-surface-inverse`, value white, label and comparison `--color-neutral-400`, border `--color-border-inverse`, no shadow. **Max one per row.**
- Grid: `repeat(4, 1fr)` with `gap: var(--space-5)` on desktop; `repeat(2, 1fr)` under 900px.

### ProgressBar [DS]
Share-of-total, quota, and horizontal breakdowns.

- Track: height 8 (configurable), background `--color-neutral-200`, radius `--radius-pill`, `overflow: hidden`.
- Fill: radius `--radius-pill`, `transition: width var(--duration-slow) var(--ease-standard)`.
- Tones: brand `--color-brand-600` · accent `--color-brand-700` · warning `--color-warning` · danger `--color-error`.
- Optional label row above: `margin-bottom: 6`, label `--font-size-caption` / `--color-text-secondary` left, value mono `--font-size-caption` / `--color-text-primary` right.

### Chart container [Pattern]
No chart component exists — charts are product code. Wrap them in a `Card`:

- `Card` with `title`, optional `subtitle` (the period), and header actions (period selector, export `IconButton`).
- Plot height 168–190px inside a 20px body.
- Bar series: bars `flex: 1`, `gap: 3`, radius `--radius-xs`. Baseline series `--color-neutral-300`; the highlighted range `--color-brand-600`. **No opacity ramps** — they read as pastel.
- Categorical series follow `--color-chart-1` … `--color-chart-6` in order.
- Axis labels: `justify-content: space-between`, `margin-top: 8`, mono `--font-size-micro`, `--color-text-muted`.
- Grid lines, if any: `1px solid var(--color-border)`.

### Pagination [Pattern]
No Pagination component exists. Build from Button/IconButton:

- Row: `display: flex; align-items: center; gap: var(--space-4);` `padding: var(--space-5) var(--space-6);` `border-top: 1px solid var(--color-border);` inside the card, below the table.
- Left: result count, `--font-size-caption`, `--color-text-muted` ("1–10 sur 48").
- Right: `IconButton` `chevron-left` / `chevron-right` (variant `quiet`) around page numbers.
- Page number: 30×30, radius `--radius-sm`, `--font-size-body-sm`. Rest transparent / `--color-text-secondary`. **Hover** `--color-neutral-100`. **Current** background `--color-selected-surface`, text `--color-text-primary`, `--font-weight-semibold`. **Disabled** arrows `--color-neutral-400`.

### Filters [Pattern]
No Filters component exists. Standard filter bar, above the table, outside the card:

- `display: flex; align-items: center; gap: var(--space-4);`
- Search `Input` with `icon="search"`, `max-width: 320px`.
- One or more `Select` at `width: 180–220px`.
- `flex: 1` spacer, then secondary actions (export) and the primary action, right-aligned.
- Active filter chips use `Tag` with `selected` + `onRemove`.
- Responsive: `flex-wrap: wrap` under 760px; search takes full width.

### EmptyState [DS]
Zero-data placeholder for lists, tables and charts.

- Column, centred, `text-align: center`, gap 8. Padding `48px 24px` (compact `24px 20px`).
- Icon tile: 44×44, radius `--radius-md`, background `--color-surface-muted`, icon 22px in `--color-brand-700`, `margin-bottom: 4`.
- Title `--font-size-h3` / `--font-weight-bold`. Message `--font-size-body-sm`, `--color-text-secondary`, `max-width: 340px`.
- Action `margin-top: 8` — one button, usually the primary action of the empty list.
- Copy says what to do next, not that something is missing.

---

## Feedback

### Toast [DS]
Transient confirmation, bottom-right of the app frame at 20px inset.

- Width 340, padding `12px 12px 12px 14px`, gap 10, radius `--radius-md`.
- Background `--color-surface`, border `1px solid var(--color-border)`, shadow `--shadow-lg`.
- Entry: fade + 6px rise over `--duration-base`.
- Leading 18px icon, `margin-top: 1`: success `check-circle` / `--color-success` · info `info` / `--color-info` · warning `triangle-alert` / `--color-warning` · error `circle-alert` / `--color-error`.
- Title `--font-size-body-sm` / `--font-weight-semibold`. Message `--font-size-caption` / `--color-text-secondary`, `margin-top: 2`. Optional action `margin-top: 8`.
- Close: `IconButton` size sm.
- **The icon carries the tone — the background stays white.** No tinted toast surfaces.

### Alert [Pattern]
No Alert component exists (Toast covers transient, this covers inline). Build as a static block:

- `display: flex; gap: var(--space-4);` padding `var(--space-5) var(--space-6)`, radius `--radius-md`.
- Background = the tone's `*-bg` token (`--color-success-bg`, `--color-warning-bg`, `--color-error-bg`, `--color-info-bg`), no border, or white with `1px solid var(--color-border)` for the neutral case.
- 18px leading icon in the tone's foreground token. Title `--font-size-body-sm` / `--font-weight-semibold` in `--color-text-primary`; body `--font-size-caption` / `--color-text-secondary`.
- These four `*-bg` tokens are the **only** tinted surfaces in the system and are reserved for status. Never use them decoratively.

### Dialog [DS]
Centred modal.

- Scrim: `position: absolute; inset: 0;` `background: rgba(18,22,26,.45)`, `backdrop-filter: blur(2px)`, padding 24, `z-index: 60`. Parent needs `position: relative`.
- Panel: width 480 default, `max-width: 100%`, background `--color-surface`, radius `--radius-lg`, shadow `--shadow-xl`, `overflow: hidden`. Entry fade + 6px rise.
- Header `padding: 20px 20px 0`, gap 16: title `--font-size-h2`; description `--font-size-body-sm` / `--color-text-secondary`, `margin-top: 6`; close `IconButton` right.
- Body `padding: 16px 20px`.
- Footer `padding: 14px 20px`, background `--color-neutral-100`, `border-top: 1px solid var(--color-border)`, buttons right-aligned with `gap: var(--space-4)`, primary last.

### Tooltip [DS]
- Padding `5px 8px`, radius `--radius-xs`, background `--color-neutral-950`, text white.
- `--font-size-micro`, `--font-weight-medium`, `letter-spacing: var(--letter-spacing-label)`, `white-space: nowrap`, shadow `--shadow-md`.
- Offset 6px from the trigger. Fade in over `--duration-fast`.
- Four words maximum, no trailing period. Never contains a control.

### Loader / Spinner [Pattern]
- Lucide `loader-circle` at the host control's icon size, `animation: spin 900ms linear infinite`.
- Colour: `currentColor` — inherits the button or surface it sits in.
- Full-panel loading: centre the spinner at 22px in `--color-neutral-500` over the white surface, with no overlay tint.

### Skeleton [Pattern]
- Block: `background: var(--color-neutral-100); border-radius: var(--radius-xs);`
- Text line heights 11px, widths varied 56–72% to suggest real copy; stack `gap: var(--space-5)`.
- Blocks (cards, charts): match the real element's height and radius.
- Pulse: `opacity 1 → .6 → 1` over 1.4s `--ease-in-out`. **No shimmer sweep, no gradient** — a gradient would read as pastel.

### Error state [Pattern]
Reuse `EmptyState` with `icon="circle-alert"`:

- Icon tile background stays `--color-surface-muted`; the icon takes `--color-error`.
- Title states the failure ("Chargement impossible"), message gives the recovery step.
- Action is a secondary Button ("Réessayer"), not primary — the primary action of the page is elsewhere.
- Inline field errors are handled by `Field` (see Forms).

---

## Forms

### Field [DS]
Label + hint/error wrapper. Use it around every control.

- Column, `gap: 6`.
- Label `--font-size-caption`, `--font-weight-semibold`, `--color-neutral-800`. Required marker: ` *` in `--color-brand-800`.
- Hint below the control: `--font-size-caption`, `--color-text-muted`.
- Error replaces the hint: `--font-size-caption`, `--color-error`.
- Form grid: two columns `1fr 1fr` with `gap: var(--space-6)`; single column under 640px.

### Input [DS]
| | |
|---|---|
| Height | 38 |
| Padding | `0 12px`; left 33 with a leading icon; right 64 with a suffix |
| Radius | `--radius-sm` |
| Border | `1px solid var(--color-border-strong)` |
| Type | `--font-size-body-sm`, `--color-text-primary` |
| Background | `--color-surface` |

- **Focus**: border `--color-brand-600`, `box-shadow: var(--focus-ring)`, `outline: none`.
- **Error**: border `--color-error` (focus ring still applies).
- **Disabled**: background `--color-neutral-200`, `cursor: not-allowed`.
- Placeholder `--color-text-placeholder`.
- Leading icon: 16px at `left: 11px`, `--color-neutral-600`. Suffix: `right: 11px`, `--font-size-caption`, `--color-text-muted`.
- `mono` variant for IDs and slugs: `font-family: var(--font-mono)`, `--font-size-caption`.

### Textarea [DS]
Same shell as Input, plus:
- Padding `10px 12px`, `resize: vertical`, `line-height: var(--line-height-body)`, default 4 rows.

### Select [DS]
Same shell as Input, plus:
- `appearance: none`, padding `0 34px 0 12px`, `cursor: pointer`.
- 16px `chevron-down` at `right: 11px`, `--color-neutral-600`, `pointer-events: none`.
- Placeholder state: text `--color-text-muted`.

### Search [Pattern]
Not a separate component — an `Input` with `icon="search"`:
- `max-width: 320px` in filter bars, full width in mobile menus and panels.
- Placeholder names the searchable field ("Rechercher un code ou un identifiant").

### Checkbox [DS]
- Box 18×18, radius `--radius-xs`, border `1.5px solid var(--color-border-strong)`, background `--color-surface`, `margin-top: 1`.
- **Checked / indeterminate**: background and border `--color-brand-700`, glyph white — `check` (12px, stroke 3) or `minus` for indeterminate.
- Row: `align-items: flex-start`, `gap: 10`. Label `--font-size-body-sm` / `--color-neutral-900`; optional hint on its own line, `--font-size-caption` / `--color-text-muted`.
- **Disabled**: `opacity: .55`, `cursor: not-allowed`.

### Radio [DS]
- Marker 18×18, `--radius-pill`, border `1.5px solid var(--color-border-strong)`, background `--color-surface`.
- **Selected**: border `--color-brand-700` with a 9×9 `--color-brand-700` dot centred.
- Group gap: 10 (column) / 20 (row). Same label + hint treatment as Checkbox.
- The only circular controls in the system are this marker and the Switch knob.

### Switch [DS]
Immediate on/off — for settings that apply without a save step. If there is a Save button, use Checkbox.

- Track: md 40×22 · sm 32×18, `--radius-pill`, padding 3.
- Off `--color-neutral-400`; on `--color-brand-600`. Transition `--duration-base`.
- Knob: (track height − 6) square, `--radius-pill`, white, `--shadow-sm`, justified to the active end.
- Label gap 10, `--font-size-body-sm` / `--color-neutral-900`. **Disabled**: `opacity: .55`.

### Validation states
| State | Border | Message | Notes |
|---|---|---|---|
| Rest | `--color-border-strong` | hint in `--color-text-muted` | |
| Focus | `--color-brand-600` + `--focus-ring` | unchanged | always visible |
| Error | `--color-error` | `--color-error`, replaces the hint | imperative, one sentence, no "Oups" |
| Disabled | `--color-border-strong` | unchanged | background `--color-neutral-200` |

Success is **not** shown per field — no green borders or checkmarks on valid inputs. Confirmation happens once, at form level, as a Toast.

---

## Navigation

Two families, deliberately distinct: `navigation/` for the signed-in app, `marketing/` for the public site. Never mix them.

### SideNav (application) [DS]
- Width `--sidebar-width` (244), background `--color-bg-sidebar` (white), `border-right: 1px solid var(--color-border)`, full height, does not scroll.
- Brand row: height `--topbar-height` (60), `padding: 0 18px`, `border-bottom: 1px solid var(--color-border)`, logo at 20px.
- Body: `padding: 12px 10px`, item `gap: var(--space-1)`.
- Item: height 34, `padding: 0 8px`, radius `--radius-sm`, gap 10, `--font-size-body-sm`. Rest text `--color-text-secondary`, icon 17px `--color-neutral-500`.
- **Hover**: background `--color-hover-surface`.
- **Active**: background `--color-selected-surface`, text `--color-text-primary`, `--font-weight-semibold`, icon `--color-brand-600`.
- Section divider: `padding: 14px 8px 6px`, `--font-size-micro`, `--font-weight-semibold`, `letter-spacing: var(--letter-spacing-eyebrow)`, uppercase, `--color-text-muted`.
- Trailing count: mono `--font-size-micro`, `--color-text-muted`.
- Footer (account row): `padding: var(--space-5)`, `border-top: 1px solid var(--color-border)`.

### TopBar (application) [DS]
- Height `--topbar-height` (60), background `--color-surface`, `border-bottom: 1px solid var(--color-border)`, `padding: 0 var(--gutter-app)`, gap `var(--space-6)`, does not scroll.
- Breadcrumb above the title: gap 5, `--font-size-micro`, `--color-text-muted`, 12px `chevron-right` separators in `--color-neutral-400`. Current page excluded.
- Title `--font-size-h2`, truncated with ellipsis.
- Centre slot for search or filters; actions right-aligned, `gap: var(--space-4)`, primary last.

### Tabs [DS]
- Row: `gap: var(--space-2)`, `border-bottom: 1px solid var(--color-border)`.
- Tab: height 38, `padding: 0 12px`, gap 7, transparent background, `--font-size-body-sm`.
- Rest `--color-neutral-700` / `--font-weight-medium`. **Hover** text `--color-text-primary`.
- **Active**: text `--color-neutral-900`, `--font-weight-semibold`, `box-shadow: inset 0 -2px 0 var(--color-brand-700)` (the 2px green underline).
- Optional count chip: `padding: 1px 5px`, radius `--radius-xs`, background `--color-neutral-200`, `--font-size-micro` / `--font-weight-bold` / `--color-neutral-700`.

### Breadcrumbs [Pattern]
Built into `TopBar`; as a standalone row use the same spec:
- `display: flex; align-items: center; gap: 5px;` `--font-size-micro`, `--color-text-muted`.
- 12px `chevron-right` separators in `--color-neutral-400`.
- **Hover** on ancestor links: `--color-text-primary`. The current page is plain text, never a link.

### Dropdown menu [DS — marketing / Pattern — app]
- Panel: `min-width: 268px`, padding `var(--space-4)`, background `--color-surface`, `border: 1px solid var(--color-border)`, radius `--radius-lg`, shadow `--shadow-lg`, offset 10px below the trigger, `z-index: 50`. Entry fade + 6px rise over `--duration-fast`.
- Row: `padding: 9px 10px`, gap 10, radius `--radius-sm`, `align-items: flex-start`.
- **Hover**: background `--color-hover-surface`; the 17px leading icon shifts `--color-neutral-500` → `--color-brand-600`.
- Row label `--font-size-body-sm` / `--font-weight-semibold` / `--color-text-primary`; description `--font-size-caption` / `--color-text-muted`, `margin-top: 1`.
- Separator between groups: `1px solid var(--color-border)`, `margin: var(--space-2) 0`.

### MarketingHeader [DS]
- Height `--header-height` (78); condensed (scrolled) `--header-height-condensed` (62) with `--shadow-md`. Transition `--duration-base`.
- Background `--color-bg-marketing` (white), `border-bottom: 1px solid var(--color-border)`, `position: sticky; top: 0; z-index: 40`.
- Inner row: `max-width: var(--max-content)`, `margin: 0 auto`, `padding: 0 var(--gutter-page)`, gap 28, `min-width: 0`.
- Logo left at 22px (19px condensed). Nav `flex: 1 1 auto; min-width: 0`.
- Login: text button, `--font-size-body-sm` / `--font-weight-semibold` / `--color-text-secondary`. **Hover** `--color-text-primary` + underline at 3px offset. Never a second button.
- CTA: one `Button` variant primary, size lg (md when condensed), `white-space: nowrap`.
- **Mobile** (compact, under ~900px): nav, login and CTA are replaced by a 40px `IconButton` (`menu` / `x`), header padding drops to 20px.

### MarketingNav [DS]
- Row `gap: var(--space-1)`. Item: height 34, `padding: 0 12px`, gap 5, `--font-size-body-sm`, `white-space: nowrap`.
- Rest `--color-text-secondary` / `--font-weight-medium`.
- **Hover**: text `--color-text-primary`, 2px underline in `--color-neutral-300` (inset 12px each side, `bottom: -1px`, radius `--radius-xs`).
- **Active**: text `--color-text-primary`, `--font-weight-semibold`, underline `--color-selected-indicator` (green).
- Items with a submenu show a 14px `chevron-down` that rotates 180° when open.

### MobileMenu [DS]
- Full-screen white panel: `position: absolute; inset: 0; z-index: 60;` background `--color-surface`, fade in over `--duration-fast`.
- Header: height 68, `padding: 0 20px`, logo left, close `IconButton` right, `border-bottom: 1px solid var(--color-border)`.
- Row: `padding: 16px 0`, `--font-size-h4` / `--font-weight-semibold`, `border-bottom: 1px solid var(--color-border)`. Leaf rows show `chevron-right` in `--color-neutral-400`; parents show `plus` / `minus` in `--color-neutral-500`.
- Expanded children: `padding: 10px`, radius `--radius-sm`, background `--color-hover-surface`, `--font-size-body-sm` / `--color-text-secondary`, 16px icon in `--color-brand-600`.
- Footer: `padding: 20px`, `border-top: 1px solid var(--color-border)`, secondary Button (login) then primary Button (CTA), both `fullWidth` size lg, `gap: var(--space-5)`.

### MarketingFooter [DS]
- Background `--color-surface` (white), `border-top: 1px solid var(--color-border)`. **No dark slab.**
- Inner: `max-width: var(--max-content)`, `padding: 56px var(--gutter-page) 28px`.
- Grid `1.5fr repeat(n, 1fr)`, `gap: var(--space-10)`. First cell: logo 22px, tagline `--font-size-caption` / `--color-text-secondary` / `max-width: 280px`, `margin-top: 14`.
- Column title `--font-size-micro`, `--font-weight-semibold`, `letter-spacing: var(--letter-spacing-eyebrow)`, uppercase, `--color-text-muted`. Links `--font-size-caption` / `--color-text-secondary`, list `gap: 9`, **hover** `--color-text-primary`.
- Social: 32×32, radius `--radius-sm`, `1px solid var(--color-border)`, 16px icon in `--color-neutral-600`.
- Legal row: `margin-top: 44`, `padding-top: 20`, `border-top: 1px solid var(--color-border)`, `--font-size-micro` / `--color-text-muted`, optional mono note right-aligned.
- Responsive: columns collapse to 2 under 900px, 1 under 600px.

### Active navigation states — summary
| Surface | Active treatment |
|---|---|
| SideNav item | `--color-selected-surface` fill, near-black label, `--color-brand-600` icon |
| Tabs | 2px `--color-brand-700` inset underline, `--font-weight-semibold` |
| MarketingNav | 2px `--color-selected-indicator` underline, `--font-weight-semibold` |
| MobileMenu | no persistent active state — the panel closes on selection |
| Breadcrumb | current page is plain text, not a link |

Green marks the active item; the fill behind it is always neutral.
