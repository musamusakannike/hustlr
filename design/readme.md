# Hustlr Design System

Hustlr is a multi-tenant e-commerce platform for physical goods. Independent tenant stores are rendered as mobile-first Progressive Web Apps (PWAs) on a shared foundation. This is that foundation: the visual language and component library every tenant storefront inherits, tuned for a single vertical to start (fashion/apparel) but built to extend across electronics, cosmetics, and other physical retail categories.

## Sources
- `uploads/Screen Shot 2026-08-05 at 3.19.47 PM.png` — the sole design reference provided: a product-detail screen (PDP) showing a 360°-rotation product viewer, sale tag, size selector, and a fixed dual-CTA action bar ("AR View" / "Add to Cart"). No codebase, Figma file, or existing brand guidelines were attached — this system is built from that single reference plus the written brief, not from an existing product.
- No logo file was provided. Nowhere in this system is a logo drawn or approximated — the wordmark "Hustlr" in the core typeface stands in for a mark until one is supplied.

## Index
- `styles.css` — root stylesheet; imports everything under `tokens/`.
- `tokens/colors.css`, `typography.css`, `spacing.css`, `effects.css`, `base.css` — design tokens.
- `assets/` — icons (Lucide, see Iconography below); no logo/photography supplied.
- `components/core/` — Button, IconButton, Badge, RatingBadge.
- `components/forms/` — TextField, PhoneField, Select, Checkbox, Radio, Switch.
- `components/commerce/` — ProductCard, ProductCarousel, VariantSelector, ColorSwatchSelector, ActionBar.
- `components/navigation/` — Tabs.
- `ui_kits/storefront/` — Home/PLP, PDP, Cart, Checkout screens as one click-through prototype (`index.html`).
- `SKILL.md` — portable skill definition for use outside this tool.

## Components
| Component | File |
|---|---|
| Button | `components/core/Button.jsx` |
| IconButton | `components/core/IconButton.jsx` |
| Badge, RatingBadge | `components/core/Badge.jsx` |
| TextField, PhoneField, Select | `components/forms/TextField.jsx` |
| Checkbox | `components/forms/Checkbox.jsx` |
| Radio | `components/forms/Radio.jsx` |
| Switch | `components/forms/Switch.jsx` |
| ProductCard | `components/commerce/ProductCard.jsx` |
| ProductCarousel | `components/commerce/ProductCarousel.jsx` |
| VariantSelector, ColorSwatchSelector | `components/commerce/VariantSelector.jsx` |
| ActionBar | `components/commerce/ActionBar.jsx` |
| Tabs | `components/navigation/Tabs.jsx` |

### Intentional additions
No existing component inventory was provided, so this is a from-scratch standard set sized to the brief. Beyond the four families the brief named explicitly (carousel, variant selector, action bar, form fields), Button/IconButton/Badge/Checkbox/Radio/Switch/Tabs/ProductCard were added as the minimum standard set any storefront needs — each documented above with a reason it exists.

## Content Fundamentals
Product copy in the reference is terse and factual: title case product names ("Light Hooded Tracksuit"), numeric prices with no rounding language, a plain percentage for discounts ("-20%"). Nothing editorial or exclamatory — no "Amazing deal!", no emoji, no urgency copy. Carry that restraint into all Hustlr surfaces:
- **Voice:** neutral, retail-standard, third person for product data ("Light Hooded Tracksuit"), second person ("you"/"your") for account and checkout flows ("Add your delivery address").
- **Casing:** Title Case for product names and section headers ("Characteristics", "Recommended"); sentence case for body copy, helper text, and buttons ("Add to Cart" is the exception — button labels are Title Case, short, verb-first).
- **Numbers:** prices always show two decimals and a currency symbol; discounts are whole-percent only; ratings show one decimal (4.7).
- **No emoji, no exclamation points, no sparkle/AI iconography.** Confidence comes from restraint and generous whitespace, not enthusiasm.
- **Errors/empty states:** plain, specific, and actionable ("Enter a valid Nigerian phone number"), never blaming the user.

## Visual Foundations
- **Color:** a near-white/light-gray base (`--surface-app`, `--ink-100`) with pure-white cards. One saturated primary — a lime/chartreuse (`--action-primary-bg`) — carries all primary CTAs and is otherwise unused elsewhere, so it never competes with itself. A near-black (`--ink-900`) is the secondary-action and text color. Red (`--accent-error`) is reserved for sale tags and errors only. Blue (`--accent-info` / `--variant-selected-bg`) marks selection state exclusively. This is a two-accent system (lime + red) plus one functional blue — never introduce a third decorative color.
- **Type:** one family (Inter, a neutral grotesque sans — see Typography Note below) for everything; hierarchy comes from size and weight, not font changes. Product titles and prices are semibold/bold; body and helper copy is regular/medium.
- **Spacing:** an 4px-rooted scale (4/8/12/16/20/24/32/40/48/64). Screen gutters are 20px; the PDP media area, cards, and action bar all breathe with generous padding — nothing touches the edge except full-bleed product media.
- **Backgrounds:** flat color only. No gradients, no textures, no patterns, no illustration. Product photography (high-res, 3D-rendered where possible) is the only imagery, always full-bleed within its container.
- **Corners:** soft and generous — 14–28px on cards and inputs, full pill radius on every button, chip, and the action bar's controls. Nothing is sharp-cornered except the product photo container edge, which itself is `--radius-lg` (20px).
- **Cards:** white surface, no border, a very soft shadow (`--shadow-sm`) only when elevated off the page background (e.g. the floating rotation-control pill) — most cards sit flush with no shadow at all, relying on the light-gray page background for separation.
- **Shadows:** minimal and soft; used for floating controls over media (rotation pill) and true overlays (modals), never for flat list cards.
- **Borders:** 1px, low-contrast (`--border-default`), used mainly on unselected variant chips and sunken input fields at rest.
- **Motion:** fast and subtle — 120–200ms ease-out. Buttons scale down slightly on press (0.92–0.97); toggles and selection states cross-fade/slide. No bounce, no springy overshoot, no page-transition flourish.
- **Hover:** desktop-only consideration (this is a mobile-first PWA) — primary/secondary buttons darken one step; ghost buttons gain a subtle background tint.
- **Press:** the primary tactile feedback across the system — scale-down (~0.92–0.97) on every tappable element, no color-only feedback on touch.
- **Transparency/blur:** used sparingly, only for icon-button "light" tone overlaying photos (translucent white chip) and modal scrims (`--surface-overlay`) — never as a default card treatment.
- **Imagery tone:** neutral, well-lit product photography on light neutral backdrops (as in the reference) — no color casts, no heavy grain, no black-and-white treatment.
- **Layout rules:** single-column, `--container-max: 480px` mobile-first canvas; the action bar is the one fixed/sticky element, pinned to the bottom safe area; everything else scrolls.

### Typography note
No font files were supplied. Inter (loaded from Google Fonts) stands in as the closest widely-available match to the reference's neutral grotesque sans — geometric, high-legibility, similar x-height and weight range. **Flag for the user:** if Hustlr has a licensed or preferred production typeface, share the font files and this substitution will be replaced system-wide via `tokens/typography.css`.

## Iconography
No icon set was supplied with the brief. Lucide (MIT-licensed, CDN-available, thin-stroke, matches the reference's minimal linework — e.g. the heart/share/chevron glyphs on the PDP) is used as the system's icon set, loaded via CDN (`unpkg.com/lucide-static` or `lucide-react`) rather than hand-drawn SVGs. **Flag for the user:** this is a substitution, not a supplied asset — swap in Hustlr's own icon font/sprite if one exists. No emoji and no Unicode symbol icons are used anywhere in the system (arrows/chevrons in component demos use plain Unicode only as placeholders inside disabled-JS contexts; production icons should always be Lucide glyphs). No logo was supplied; every place a brand mark would go instead renders the wordmark "Hustlr" in `--font-sans` — do not draw a substitute mark.

## Caveats & ask
- Built from a **single reference screenshot only** — no codebase, Figma file, or additional brand materials were attached. Every token value (exact hex codes, spacing, radii) is inferred from that one image plus reasonable e-commerce defaults, not measured from source.
- **Typeface is a Google Fonts substitution (Inter)** — please share real font files if Hustlr has licensed/preferred faces.
- **Icon set is a substitution (Lucide via CDN)** — please share a real icon library/sprite if one exists.
- **No logo supplied** — a wordmark stands in everywhere; please share a logo file when available.
- Only one product surface (a fashion PDP) was shown; the Home/PLP, Cart, and Checkout screens in `ui_kits/storefront/` are original extrapolations built to match the established visual language, not recreations of a real screen — please review closely and flag anything that should change before this becomes the org-wide system.
