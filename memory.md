# Hustlr — Project Memory

> **Purpose**: Persistent reference for agents and developers working on this project.  
> Captures verified facts, known constraints, patterns, and gotchas discovered during development.  
> **Last updated**: 2026-08-19 (Discovery phase).

---

## 1. Verified Constants

| Fact               | Value                         | Source                               |
| ------------------ | ----------------------------- | ------------------------------------ |
| App name           | `Hustlr`                      | `app.constants.ts` → `APP_NAME`      |
| Domain             | `hustlr.shop`                 | `app.constants.ts`                   |
| Logo path          | `/nav-icon.webp`              | `app.constants.ts` → `LOGO_PATH`     |
| Primary color      | `#800A1D` (deep maroon)       | `globals.css` + `app.constants.ts`   |
| Text color         | `#0A0E11` (near-black)        | `globals.css`                        |
| Background soft    | `#EFEFEF`                     | `globals.css`                        |
| Badge pattern      | `bg-[#FAD4D8] text-[#800A1D]` | Consistent across all components     |
| Free plan price    | ₦0/mo, 10% commission         | `app.constants.ts` → `PRICING_PLANS` |
| Pro plan price     | ₦15,000/mo, 7% commission     | `app.constants.ts` → `PRICING_PLANS` |
| Pro+ plan price    | ₦35,000/mo, 5% commission     | `app.constants.ts` → `PRICING_PLANS` |
| Yearly discount    | ~17% (save ≈2 months)         | `app.constants.ts`                   |
| Support email      | `support@hustlr.shop`         | `app.constants.ts`                   |
| Git working branch | `abdullah`                    | `AGENTS.md`                          |

---

## 2. Key File Locations

| Purpose                       | Path                                          |
| ----------------------------- | --------------------------------------------- |
| Backend specification         | `prompt.txt` (root, 1,364 lines)              |
| Git/branch safety rules       | `AGENTS.md` (root)                            |
| All static content/branding   | `frontend/src/constants/app.constants.ts`     |
| Root layout (fonts, metadata) | `frontend/src/app/layout.tsx`                 |
| Landing page (all sections)   | `frontend/src/app/page.tsx`                   |
| Tailwind theme + animations   | `frontend/src/app/globals.css`                |
| Registration modal (mock)     | `frontend/src/components/StartStoreModal.tsx` |
| Commented-out navbar          | `frontend/src/components/Navbar.tsx`          |

---

## 3. Git Rules (from AGENTS.md)

1. **NEVER push directly to `main`** — always work on `abdullah` branch
2. Use descriptive commit messages
3. Commit early and often
4. Always pull latest before starting work
5. Keep changes focused and atomic

---

## 4. Known Issues and Gotchas

### 4.1 StartStoreModal is Non-Functional

The registration modal collects store name, email, and password but makes **zero API calls**. On submit, it:

1. Sets a local state flag `submitted = true`
2. Shows a "Registration Started!" confirmation
3. Waits 2.5 seconds via `setTimeout`
4. Closes the modal

The Google OAuth button follows the same pattern with a 2-second delay.

**Implication**: Any future integration must wire this modal to a real registration endpoint, or replace it with a page-based registration flow.

### 4.2 Modal Is Instantiated 6+ Times

`StartStoreModal` is independently rendered in: Hero, WhoWeAre, WhatWeDo, StoreTemplates, Pricing, CTA, and Footer. Each creates its own `useState` for `isModalOpen`.

**Implication**: When making the modal functional, either (a) lift the modal to a shared context/provider to avoid 6 independent instances, or (b) replace with a route-based registration page.

### 4.3 Navbar vs. Hero Nav

Two navigation systems exist:

- **`Navbar.tsx`**: 206-line component with sticky header, mobile drawer, and "Start Your Free Store" CTA — exists but is **commented out** in `page.tsx`
- **Hero inline nav**: Built directly into the Hero component

Only the Hero inline nav is active. Decision pending on which to use going forward.

### 4.4 Inconsistent Design Token Usage

Components mix two approaches:

- Tailwind tokens from `globals.css` theme: `text-primary`, `bg-bg-soft`, `text-text`
- Hardcoded hex values: `bg-[#800A1D]`, `text-[#0A0E11]`, `bg-[#EFEFEF]`

Both refer to the same colors. Some components use one approach, some use the other, some mix both.

### 4.5 Next.js 16 Caution

The auto-generated `frontend/AGENTS.md` warns: _"This is NOT the Next.js you know — APIs, conventions, and file structure may all differ from your training data."_

Next.js 16.3.1 is very recent. Verify all Next.js API usage against current documentation before assuming prior-version patterns still work.

### 4.6 Empty Configuration

- `next.config.ts` exports an empty `NextConfig` object
- No `.env` or `.env.local` files exist
- No image domains configured (all images are local in `public/`)
- No rewrites, redirects, or middleware configured

### 4.7 Unused Dependencies

Four packages are installed but have zero imports anywhere:

- `axios` — HTTP client (no API calls exist)
- `firebase` — Auth SDK (no Firebase init code)
- `react-icons` — Icon library (inline SVGs used everywhere)
- `react-spinners` — Loading indicators (no loading states exist)

---

## 5. Confirmed Architecture Decisions

| #   | Decision                                 | Detail                                                                                                                                                                                                                                                                                                                                                             | Date       |
| --- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------- |
| 1   | Single Next.js application               | All surfaces (marketing, auth, dashboard, storefront, admin) in one app                                                                                                                                                                                                                                                                                            | 2026-08-19 |
| 2   | Subdomain routing via middleware rewrite | `middleware.ts` detects subdomains and rewrites to `/store/[slug]/*`. Path-based fallback for local dev. Custom domains extend the same pattern.                                                                                                                                                                                                                   | 2026-08-20 |
| 3   | Route group organization                 | Five groups: `(marketing)`, `(auth)`, `(dashboard)`, `(storefront)`, `(admin)`. Each with its own layout. Root layout stays thin.                                                                                                                                                                                                                                  | 2026-08-20 |
| 4   | Landing page move rule                   | Move existing `page.tsx` into `(marketing)/page.tsx` during infrastructure setup. No internal refactoring — internals stay untouched.                                                                                                                                                                                                                              | 2026-08-20 |
| 5   | Data layer transport adapter             | Service/domain + transport adapter pattern (`MockTransport` with local fixtures -> `ApiTransport`). No MSW or fake API server.                                                                                                                                                                                                                                     | 2026-08-20 |
| 6   | Cookie-backed JWT auth                   | Platform `hustlr_session` (Domain=.hustlr.shop) + host-only buyer `hustlr_buyer_session`. No localStorage for session tokens. Coarse Edge middleware protection with authoritative backend authorization. Direct browser-to-backend production communication.                                                                                                      | 2026-08-20 |
| 7   | State management & data layer            | Distributed state: TanStack Query for client server-state (caching, mutations, refetch), focused React Contexts (`CartContext` per `storeSlug`), Next.js URL search params for filters/pagination, `useState` for local UI. Server Components for static/SEO data. Tenant query keys provide client cache isolation (not security). No monolithic Redux/UIContext. | 2026-08-20 |
| 8   | Deployment & infrastructure              | Primary on Vercel (Edge middleware, `*.hustlr.shop` wildcard SSL, branch previews). Backend on independent Express/Node deployment (`api.hustlr.shop`). Standalone Docker portability preserved via `output: 'standalone'`. External DNS/domain APIs isolated behind `DomainProvider` abstraction.                                                                 | 2026-08-20 |
| 9   | Navbar layout strategy                   | Repurpose `Navbar.tsx` into shared `MarketingHeader.tsx` inside `(marketing)/layout.tsx` for all marketing pages; remove duplicated inline nav from `Hero.tsx`.                                                                                                                                                                                                    | 2026-08-20 |
| 10  | Unused dependency cleanup                | Remove `axios`, `firebase`, `react-icons`, `react-spinners` during Phase 2 setup.                                                                                                                                                                                                                                                                                  | 2026-08-20 |
| 11  | Design token normalization               | Standardize hardcoded hex values to semantic Tailwind tokens (`bg-primary`, `border-border`, etc.).                                                                                                                                                                                                                                                                | 2026-08-20 |
| 12  | `custom-build/` removal                  | Delete unused empty directory during folder restructuring.                                                                                                                                                                                                                                                                                                         | 2026-08-20 |

---

## 6. Component Inventory

| Component       | File                  | Lines | State  | Notes                                                           |
| --------------- | --------------------- | ----- | ------ | --------------------------------------------------------------- |
| Hero            | `Hero.tsx`            | ~180  | Client | Inline nav, hero image, 2 CTAs, StartStoreModal                 |
| Navbar          | `Navbar.tsx`          | 206   | Client | **Commented out** in page.tsx                                   |
| Marquee         | `Marquee.tsx`         | 18    | Server | Desktop-only feature keyword strip                              |
| Features        | `Features.tsx`        | 130   | Server | 3 feature cards, inline SVG icons                               |
| Ecosystem       | `Ecosystem.tsx`       | 242   | Server | Orbit animation with 8 chips (5 on mobile)                      |
| WhoWeAre        | `WhoWeAre.tsx`        | 154   | Client | Video lightbox (iStock URL) + StartStoreModal                   |
| WhatWeDo        | `WhatWeDo.tsx`        | 145   | Client | 2-column feature breakdown + StartStoreModal                    |
| StoreTemplates  | `StoreTemplates.tsx`  | 161   | Client | 3 template cards (starburst clip-path center) + StartStoreModal |
| Pricing         | `Pricing.tsx`         | 162   | Client | 3 plan cards, monthly/yearly toggle + StartStoreModal           |
| FAQ             | `FAQ.tsx`             | 88    | Client | 5-item accordion                                                |
| CTA             | `CTA.tsx`             | 51    | Client | Final call-to-action banner + StartStoreModal                   |
| Footer          | `Footer.tsx`          | 127   | Client | Logo, nav, socials, legal links + StartStoreModal               |
| StartStoreModal | `StartStoreModal.tsx` | 208   | Client | **Non-functional** registration mock                            |

---

## 6. Public Assets

| File                   | Size    | Used By                               |
| ---------------------- | ------- | ------------------------------------- |
| `nav-icon.webp`        | 15.7 KB | Navbar, Hero, Footer, StartStoreModal |
| `hero.png`             | 617 KB  | Hero section                          |
| `video.jpg`            | 38 KB   | WhoWeAre section (thumbnail)          |
| `whatwedo.jpg`         | 28 KB   | WhatWeDo section                      |
| `template-free.png`    | 525 KB  | StoreTemplates section                |
| `template-pro.png`     | 514 KB  | StoreTemplates section                |
| `template-proplus.png` | 550 KB  | StoreTemplates section                |

---

## 7. Data Flow

Currently, all data flows from a single source:

```
app.constants.ts
    ├── APP_NAME, LOGO_PATH, SUPPORT_EMAIL
    ├── NAV_LINKS (name + href pairs for navigation)
    ├── MARQUEE_ITEMS (string array)
    ├── FEATURE_CARDS (title, description, badge, isDark flag)
    ├── ECOSYSTEM_FEATURES (label + iconType for orbit chips)
    ├── STORE_TEMPLATES (id, name, tier, image path)
    ├── PRICING_PLANS (name, slug, prices, commission, features, isPopular)
    ├── FAQS (question + answer pairs)
    └── THEME_COLORS (primary, primaryLight, text, etc.)
```

**No data comes from any API, database, or external service.** Everything rendered on the landing page is hardcoded in this single constants file.
