# Hustlr — Architecture Document

> **Status**: Baseline — reflects repository state as of 2026-08-19.  
> **Decision**: Single Next.js application architecture (confirmed by team).

---

## 1. High-Level Architecture

Hustlr is designed as a **monorepo** with two primary layers:

```
hustlr/
├── frontend/    ← Next.js 16 application (EXISTS)
└── src/         ← Node.js/Express/MongoDB backend (DOES NOT EXIST)
```

### Confirmed Decision

- **One Next.js application** serves all frontend surfaces: marketing site, seller dashboard, buyer storefronts, and (eventually) admin dashboard.

### Planned Architecture (from `prompt.txt`, NOT implemented)

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  ┌───────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ Marketing │  │   Seller     │  │    Buyer          │ │
│  │ Landing   │  │   Dashboard  │  │    Storefront     │ │
│  │ Page (/)  │  │  (/dashboard)│  │  (subdomain/*)    │ │
│  └───────────┘  └──────────────┘  └───────────────────┘ │
└────────────────────────┬────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────┐
│            Express.js Backend API (planned)              │
│  JWT Auth · Route Handlers · Middleware · Cron Jobs      │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
    ┌──────────┐  ┌────────────┐  ┌──────────┐
    │ MongoDB  │  │ Paystack   │  │ R2/S3    │
    │ Atlas    │  │ API        │  │ Storage  │
    └──────────┘  └────────────┘  └──────────┘
```

> **Important**: Only the leftmost box (Marketing Landing Page) in the frontend layer currently exists. All backend boxes are specification only.

---

## 2. Existing Frontend Architecture

### 2.1 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.3.1 |
| Runtime | React | 19.2.8 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS (via `@tailwindcss/postcss`) | v4 |
| Package Manager | pnpm | 10.33.0 |

### 2.2 Installed but Unused Dependencies

| Package | Installed | Used |
|---|---|---|
| `axios` | ✅ | ❌ — no API calls exist |
| `firebase` | ✅ | ❌ — no Firebase init or SDK usage |
| `react-icons` | ✅ | ❌ — inline SVGs used instead |
| `react-spinners` | ✅ | ❌ — no loading states exist |

### 2.3 File Structure

```
frontend/
├── package.json
├── pnpm-lock.yaml
├── next.config.ts         ← Empty configuration
├── tsconfig.json          ← Path alias: @/* → ./src/*
├── postcss.config.mjs     ← Tailwind v4 via @tailwindcss/postcss
├── eslint.config.mjs
├── CLAUDE.md              ← Contains only "@AGENTS.md"
├── public/
│   ├── nav-icon.webp      ← Logo (15.7 KB)
│   ├── hero.png           ← Hero image (617 KB)
│   ├── video.jpg          ← Video thumbnail (38 KB)
│   ├── whatwedo.jpg        ← Section image (28 KB)
│   ├── template-free.png  ← Template preview (525 KB)
│   ├── template-pro.png   ← Template preview (514 KB)
│   ├── template-proplus.png ← Template preview (550 KB)
│   ├── file.svg
│   └── globe.svg
└── src/
    ├── app/
    │   ├── layout.tsx     ← Root layout (fonts, metadata, JSON-LD)
    │   ├── page.tsx       ← Landing page (all sections composed)
    │   ├── globals.css    ← Tailwind theme + orbit animations
    │   ├── favicon.ico
    │   └── custom-build/  ← Empty directory (purpose unknown)
    ├── components/
    │   ├── Hero.tsx
    │   ├── Navbar.tsx         ← Exists but COMMENTED OUT in page.tsx
    │   ├── Marquee.tsx
    │   ├── Features.tsx
    │   ├── Ecosystem.tsx
    │   ├── WhoWeAre.tsx
    │   ├── WhatWeDo.tsx
    │   ├── StoreTemplates.tsx
    │   ├── Pricing.tsx
    │   ├── FAQ.tsx
    │   ├── CTA.tsx
    │   ├── Footer.tsx
    │   └── StartStoreModal.tsx ← Non-functional UI mock
    └── constants/
        └── app.constants.ts   ← Single source of truth for all static data
```

### 2.4 Directories That DO NOT Exist

The following standard architecture directories are absent:

- `lib/` — no utility library
- `hooks/` — no custom React hooks
- `utils/` — no utility functions
- `services/` or `api/` — no API client layer
- `types/` — no TypeScript type definitions
- `context/` or `store/` — no state management
- `middleware.ts` — no auth guards or subdomain routing

### 2.5 Routing

**Current state**: Only `/` exists (marketing landing page).

**Decided route group organization** (not yet implemented):

```
src/app/
├── (marketing)/              ← hustlr.online (public)
│   ├── layout.tsx            ← Marketing layout (Navbar/Footer)
│   └── page.tsx              ← Landing page (moved from src/app/page.tsx, internals unchanged)
│
├── (auth)/                   ← /login, /register, /verify-otp, /forgot-password (public)
│   ├── layout.tsx            ← Minimal centered auth layout
│   └── {auth pages}
│
├── (dashboard)/              ← /dashboard/* (seller, authenticated)
│   ├── layout.tsx            ← Sidebar + topbar dashboard shell
│   └── dashboard/{pages}
│
├── (storefront)/             ← *.hustlr.online → /store/[slug]/* (buyer, public+auth)
│   └── store/[slug]/
│       ├── layout.tsx        ← Store-branded layout
│       └── {storefront pages}
│
├── (admin)/                  ← /admin/* (admin role, authenticated)
│   ├── layout.tsx            ← Admin layout shell
│   └── admin/{pages}
│
├── layout.tsx                ← Root layout (fonts, providers, metadata — kept thin)
├── globals.css
├── middleware.ts             ← Subdomain detection, auth guards, role checks
└── not-found.tsx
```

**Rules**:
- Each surface has its own layout; layouts never bleed across surfaces
- Root `layout.tsx` stays thin: fonts, global providers, `<html>` wrapper
- The existing landing page moves into `(marketing)/page.tsx` without internal changes
- Route groups don't affect URLs — the landing page remains at `/`

**No route groups, middleware, error boundaries, loading states, or not-found pages exist.**

### 2.6 Configuration

| File | State |
|---|---|
| `next.config.ts` | Empty — no rewrites, redirects, image domains, or env vars |
| `.env` / `.env.local` | Does not exist |
| `tsconfig.json` | Functional — includes `@/*` path alias |
| `postcss.config.mjs` | Functional — Tailwind v4 configured |
| `eslint.config.mjs` | Default Next.js ESLint config |

---

## 3. Design System

### 3.1 Color Tokens

Defined in `globals.css` via `@theme`:

| Token | CSS Variable | Hex Value |
|---|---|---|
| Primary | `--color-primary` | `#800A1D` |
| Primary Hover | `--color-primary-hover` | `#660817` |
| Primary Light | `--color-primary-light` | `#FAD4D8` |
| Text | `--color-text` | `#0A0E11` |
| Background | `--color-bg` | `#FFFFFF` |
| Background Soft | `--color-bg-soft` | `#EFEFEF` |
| Black | `--color-black` | `#0A0E11` |

> **Known Issue**: Components inconsistently use Tailwind tokens (`text-primary`) and hardcoded hex values (`bg-[#800A1D]`). Both approaches coexist.

### 3.2 Typography

| Font Family | Google Font | Usage |
|---|---|---|
| Rajdhani | 500/600/700 | Base body font (applied on `<html>`) |
| Archivo Black | 400 | Display headings, pricing numbers |
| Space Grotesk | 400–700 | Primary UI font (applied per-section) |

Font loading: via `next/font/google` in `layout.tsx`, exposed as CSS variables `--font-rajdhani`, `--font-archivo-black`, `--font-space-grotesk`.

### 3.3 Shared Components

**None exist.** There are no reusable UI primitives (Button, Input, Card, Modal, Badge, Toast). Each section component defines its own styled elements inline.

---

## 4. State Management & Data Layer Architecture (DECIDED — not yet implemented)

**Decision**: Distributed State Architecture with TanStack Query (client-side server state), focused React Contexts (client state), Next.js URL parameters (search/filter state), and domain service transport abstraction.

```
                                  HUSTLR STATE TAXONOMY
                                            │
        ┌───────────────────────────┬───────┴───────────────────┬───────────────────────────┐
        ▼                           ▼                           ▼                           ▼
 1. Server / Remote State    2. Client Global State      3. URL / Search State       4. Local UI State
  (Products, Orders, KYC,     (Cart, Modals, Toast        (Table filters, sort,       (Form inputs, toggles,
   Wallet, Analytics, etc.)    queue, focused needs)       pagination, tabs)           accordions, dropdowns)
        │                           │                           │                           │
  TanStack Query              Focused React Contexts      Next.js useSearchParams()   useState() / useReducer()
  (where appropriate)               │                           │                           │
        │                     Local Persistence           URL Query String            Stays inside component
        ▼                     (Cart per storeSlug)
  Domain Services
        │
        ▼
  Transport Interface
  ├── MockTransport (Fixtures)
  └── ApiTransport  (HTTP API)
```

### 4.1 Server / Remote State: TanStack Query (`@tanstack/react-query`)
- **Scope**: TanStack Query manages **client-side server state** where client-side caching, request deduplication, background refetching, mutation handling, or query cache invalidation provide meaningful value (e.g. Seller Dashboard tables, order updates, stock adjustments, live review updates).
- **Next.js Coexistence**:
  - **Next.js remains the core application framework.** TanStack Query is **not** a framework replacement.
  - **Server Components** are used for static content, SEO-sensitive marketing pages, and initial server-rendered data where client-side caching is unnecessary.
  - **Client Components + TanStack Query** are used where interactive data manipulation, mutation lifecycles, and reactive client-side updates are required.
  - **Rule**: Do **not** convert Server Components into Client Components solely to fetch data with TanStack Query.
- **Rationale over Redux Toolkit / SWR**:
  - A monolithic Redux store introduces excessive boilerplate for data that is primarily owned by the remote backend.
  - TanStack Query is preferred over SWR for Hustlr because its structured mutation lifecycles (`useMutation`) and declarative multi-key invalidations (`queryClient.invalidateQueries()`) align cleanly with Hustlr's dashboard-heavy workflows (e.g. modifying product stock automatically invalidates inventory alerts and analytics).

### 4.2 Approved Data Boundary
The UI components never make direct HTTP calls or directly import mock fixtures:
```
UI Component (e.g. ProductsTable)
      │
      ▼
Application Hook / Data Function (e.g. useProducts(filters))
      │
      ▼
TanStack Query (handles caching, loading, error, deduplication where appropriate)
      │
      ▼
Domain Service (e.g. productService.getProducts(filters))
      │
      ▼
Transport Adapter Interface
  ├── MockTransport (Local fixtures with realistic latency simulation)
  └── ApiTransport  (HTTP client to https://api.hustlr.online)
```
- **Stability**: When the Express backend is ready, switching from `MockTransport` to `ApiTransport` requires **zero changes** to React hooks or UI components.

### 4.3 Multi-Tenant Query Keys (Cache Isolation, NOT Security)
- Storefront remote queries must be explicitly scoped by tenant in query keys:
  ```ts
  ['store', storeSlug]
  ['products', storeSlug, filters]
  ['categories', storeSlug]
  ```
- Platform seller queries are scoped to the authenticated seller:
  ```ts
  ['seller-products', filters]
  ['seller-orders', status, page]
  ['seller-wallet']
  ['seller-kyc']
  ```
- **Critical Security Principle**: **Tenant-scoped query keys provide cache/data isolation within the client application. They are NOT an authorization or security mechanism.** Actual security is strictly enforced by the backend via JWT identity, tenant validation, and server-side authorization.

### 4.4 Tenant-Scoped Cart Architecture
- **Abstraction**: Focused `CartContext` (`useCart()`).
- **Persistence**: Scoped per tenant/store in browser storage (`hustlr_cart_{storeSlug}`) so that a customer's cart on Store A never leaks into Store B.
- **Backend Sync**: Designed to synchronize with the backend Cart API (`prompt.txt` §9) when a buyer is authenticated without requiring UI restructuring.

### 4.5 Focused Contexts vs. No Generic Monolithic UIContext
- **Rule**: Use focused React Contexts **only** when genuinely shared client-side state requires cross-component access (e.g. `CartContext`, `SellerAuthContext`, `BuyerAuthContext`).
- Do **not** create a giant, catch-all `UIContext` that centralizes unrelated modal, toast, and layout states. Modal and toast states are evaluated individually and kept as close to their consumers as possible.

### 4.6 URL State
- Table filters, search terms, sorting options, pagination, and multi-step wizard tabs live in Next.js search parameters (`useSearchParams()`, `useRouter()`).
- Enables deep linking, bookmarking, and natural browser back/forward history without client store duplication.

### 4.7 Separation from Authentication
- Authentication uses `HttpOnly` session cookies (Decision 3).
- TanStack Query does **not** store JWT tokens or manage session cookies. Auth state and server-data caching remain architecturally distinct.

### 4.8 Planned Directory Structure
```
frontend/src/
├── services/          ← Domain service modules (pure business/data methods)
│   ├── auth.ts
│   ├── store.ts
│   ├── products.ts
│   ├── orders.ts
│   └── ...
├── hooks/             ← Domain hooks wrapping TanStack Query / Contexts
│   ├── useProducts.ts
│   ├── useOrders.ts
│   ├── useCart.ts
│   └── ...
├── context/           ← Focused React Contexts for shared client state
│   ├── CartContext.tsx
│   ├── SellerAuthContext.tsx
│   └── BuyerAuthContext.tsx
├── types/             ← TypeScript interfaces matching prompt.txt entities
│   ├── auth.ts
│   ├── store.ts
│   ├── product.ts
│   └── ...
├── lib/
│   ├── transport.ts   ← Transport adapter interface + factory
│   └── api-client.ts  ← HTTP client config (for ApiTransport)
└── fixtures/          ← Realistic mock data for MockTransport
    ├── products.ts
    ├── stores.ts
    └── ...
```

---

## 5. Planned Backend Architecture (from `prompt.txt` — NOT implemented)

The specification describes:

| Layer | Technology |
|---|---|
| Runtime | Node.js with Express.js |
| Language | TypeScript |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (access + refresh tokens), Google OAuth2, email OTP via Nodemailer |
| Payments | Paystack API (checkout, transfers, webhooks) |
| File Storage | Cloudflare R2 via AWS S3 SDK |
| Cron | `node-cron` for background tasks |
| PDF | PDFKit for receipts/invoices |
| AI | OpenAI API for product content generation |
| Email | Nodemailer with custom templates |

### 4.1 Planned API Structure

The spec defines ~100+ REST endpoints across the following route namespaces:

```
/api/auth/seller/*          ← Seller authentication
/api/auth/buyer/*           ← Buyer authentication (subdomain-scoped)
/api/store/*                ← Store setup & configuration
/api/templates/*            ← Website template management
/api/kyc/*                  ← KYC verification flow
/api/subscription/*         ← Plan management & Paystack billing
/api/products/*             ← Product CRUD & variants
/api/categories/*           ← Store categories
/api/storefront/*           ← Public buyer-facing endpoints
/api/cart/*                 ← Shopping cart
/api/checkout/*             ← Order creation & payment
/api/orders/*               ← Order management
/api/wallet/*               ← Seller wallet & payouts
/api/disputes/*             ← Dispute & refund handling
/api/reviews/*              ← Product reviews
/api/coupons/*              ← Discount codes
/api/wishlist/*             ← Buyer wishlists
/api/referrals/*            ← Referral programs
/api/blog/*                 ← Seller blog (pro/pro+ only)
/api/analytics/*            ← Seller analytics
/api/notifications/*        ← Email & in-app notifications
/api/support/*              ← Support tickets
/api/domains/*              ← Custom domain management
/api/admin/*                ← Platform admin operations
/api/ai/*                   ← AI content generation
/api/upload/*               ← File upload to R2
```

---

## 6. Multi-Tenancy & Subdomain Architecture (DECIDED — not yet implemented)

### 6.1 Subdomain Strategy
**Decision**: Middleware rewrite with path-based development fallback (`*.lvh.me`).

Each seller's store is accessed via a subdomain:

```
Production:
{store-slug}.hustlr.online
        ↓
middleware.ts
        ↓
internal /store/[slug]
```

**How it works**:
1. `middleware.ts` inspects the `Host` header on every incoming request.
2. If a subdomain is detected (e.g. `musa-store`), it internally rewrites the URL:
   - `musa-store.hustlr.online/products` → `/store/musa-store/products`
3. The buyer's browser URL bar remains unchanged (`musa-store.hustlr.online/products`).
4. Requests to `hustlr.online` (no subdomain) pass through to marketing/dashboard/admin routes.
5. Custom domains (Pro+ future) will extend the same middleware with a domain→slug lookup.

**Development Model**:
- Realistic local subdomain testing via `http://{store-slug}.lvh.me:3000`.
- Direct path-based route (`/store/[slug]/*`) also works as a dev/testing convenience (does not replace production subdomain model).

### 6.2 Data Isolation
Per `prompt.txt`, buyer data is fully scoped per-store. A buyer on `store-a.hustlr.online` has no relationship to the same person's account on `store-b.hustlr.online`.

---

## 7. Authentication & Session Architecture (DECIDED — not yet implemented)

**Decision**: Cookie-backed JWT authentication with separated Platform and Tenant-Scoped Buyer domains.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   HUSTLR AUTHENTICATION ARCHITECTURE                     │
│                                                                          │
│  1. Platform Authentication (hustlr.online)                              │
│     ├── Roles: Seller | Admin                                            │
│     ├── Session Cookie: hustlr_session (Domain=.hustlr.online, HttpOnly) │
│     └── Guards: /dashboard/* (seller), /admin/* (admin)                  │
│                                                                          │
│  2. Tenant Storefront Authentication (*.hustlr.online)                   │
│     ├── Role: Buyer (strictly scoped to storeId)                         │
│     ├── Session Cookie: hustlr_buyer_session (Host-only, HttpOnly)       │
│     └── Isolation: Host-level cookie boundary + Backend storeId check    │
└──────────────────────────────────────────────────────────────────────────┘
```

### 7.1 Platform Authentication (Seller & Admin)
- **Scope**: Used for `hustlr.online/login`, `hustlr.online/register`, `hustlr.online/dashboard/*`, and `hustlr.online/admin/*`.
- **Session Cookie**: `hustlr_session`
- **Cookie Attributes (Production)**: `HttpOnly`, `Secure`, `Path=/`, `SameSite=Lax`, `Domain=.hustlr.online`.
- **JWT Claims**: Derived strictly from `prompt.txt`: `{ userId, email, role: "seller" | "admin", isVerified }`.
- **Seller Registration Flow**:
  1. `/register` form submits `{ name, email, password }` to backend.
  2. Backend sends 6-digit OTP (10 min expiry) and returns `{ tempUserId, requiresOtp: true }`.
  3. Frontend redirects to `/verify-otp`.
  4. Seller submits OTP -> Backend verifies and issues `hustlr_session` cookie -> Redirect to `/dashboard` or store setup.
- **Google OAuth Flow**:
  1. Frontend uses Firebase client SDK to authenticate with Google and obtain a Firebase ID token.
  2. Frontend sends Firebase ID token to backend `POST /api/auth/google`.
  3. Backend verifies token via `firebase-admin`, provisions/finds User, and issues Hustlr `hustlr_session` cookie. (Firebase does not manage Hustlr application authorization).

### 7.2 Buyer Authentication (Tenant-Scoped)
- **Scope**: Used on individual merchant storefronts (`{store-slug}.hustlr.online`).
- **Session Cookie**: `hustlr_buyer_session`
- **Cookie Attributes (Production)**: `HttpOnly`, `Secure`, `Path=/`, `SameSite=Lax` (**Host-Only Cookie** — no wildcard domain).
- **Tenant Isolation (Two-Tier)**:
  1. *Host-level isolation*: The browser naturally isolates `hustlr_buyer_session` on `musa-store.hustlr.online` from `ada-fashion.hustlr.online`. Dynamic cookie names (e.g. `hustlr_buyer_{slug}`) are unnecessary and avoided.
  2. *Backend validation*: Buyer JWT contains `{ buyerProfileId, storeId, email, name }`. Backend verifies that `storeId` matches the request's resolved tenant.

### 7.3 Storage Policy: No localStorage
- **Rule**: `localStorage` is **never** used for long-lived session tokens.
- **Reason**: Next.js `middleware.ts` runs on the Edge before rendering. It cannot read `localStorage`. Cookie-backed auth allows middleware and server components to inspect session status before rendering HTML, eliminating client-side flash of unauthenticated content.

### 7.4 Middleware Responsibilities vs. Backend Authorization
- **Middleware Role**: Coarse, fast route protection at the Edge:
  - `/dashboard/*` -> checks `hustlr_session` exists and `role === "seller"`; redirects unauthenticated requests to `/login`.
  - `/admin/*` -> checks `hustlr_session` exists and `role === "admin"`; redirects unauthenticated requests to `/admin/login` (or 403).
  - Public storefront pages -> allowed without auth.
  - Buyer-protected actions (`/account`, `/checkout`) -> verified in storefront layout / route guard.
- **Backend Authority**: Middleware is **not** the final authorization layer. The Express backend remains authoritative for token validation, role authorization, tenant access control, and business logic permissions.

### 7.5 React Authentication Contexts
- **Abstractions**: `SellerAuthContext` (`useSellerAuth()`) for platform/dashboard, and `BuyerAuthContext` (`useBuyerAuth()`) for storefronts.
- **Purpose**: Purely for UI state, conditional rendering (e.g. header avatar, logged-in states), navigation, and developer experience.
- **Rule**: Client-side contexts are **not** security boundaries. All data mutations and private queries depend on backend authorization.

### 7.6 Production API Communication
- **Architecture**: Shared Root Domain (`.hustlr.online`).
- **Data Flow**: Browser makes direct requests to `https://api.hustlr.online` with `{ credentials: 'include' }`.
- **Cookie Access**: The `Domain=.hustlr.online` cookie is presented to both `hustlr.online` (Next.js middleware) and `api.hustlr.online` (Express API).
- **Next.js BFF**: Not the primary production architecture; direct API communication is standard.

### 7.7 Local Development Model (`lvh.me`)
- **Main Platform**: `http://lvh.me:3000`
- **Storefronts**: `http://{store-slug}.lvh.me:3000`
- **Backend API**: `http://api.lvh.me:5000`
- **Dev Cookies**: `Domain=.lvh.me` for platform session; host-only for buyer sessions.

### 7.8 Mock Authentication Constraints
- Client-side JavaScript cannot create true `HttpOnly` cookies. In mock transport mode, a lightweight server-controlled mechanism (e.g. Next.js internal auth route handler or lightweight cookie utility) simulates cookie issuance without introducing MSW or fake backend servers.

### 7.9 Security Principles
- `HttpOnly` cookies prevent client JavaScript from reading raw JWT tokens, significantly mitigating token theft via XSS.
- Full security defense also includes `SameSite=Lax` policies, CORS origin verification on the backend, and strict backend authorization.

---

## 8. Deployment & Infrastructure Architecture (DECIDED — not yet implemented)

**Decision**: Vercel-managed Next.js deployment with standalone container portability, decoupled Express backend, and a `DomainProvider` abstraction.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                   HUSTLR DEPLOYMENT ARCHITECTURE                         │
│                                                                          │
│  1. Frontend Layer (Next.js 16 App Router on Vercel)                     │
│     ├── Platform Host:      hustlr.online                                │
│     ├── Wildcard Tenants:   *.hustlr.online                              │
│     ├── Pro+ Custom Hosts:  www.musastore.com (via DomainProvider)       │
│     └── Edge Middleware:    Sub-millisecond host rewriting at CDN edge   │
│                                                                          │
│  2. Backend Layer (Independent Express / Node.js Deployment)             │
│     ├── API Endpoint:       https://api.hustlr.online                    │
│     ├── Database:           MongoDB Atlas                                │
│     ├── Storage:            Cloudflare R2 (via AWS S3 SDK)               │
│     └── Payments:           Paystack API (Escrow & Transfers)            │
│                                                                          │
│  3. Portability & Extensibility                                          │
│     ├── Standalone Output:  output: 'standalone' in next.config.ts       │
│     └── Domain Abstraction: DomainProvider interface isolates DNS APIs   │
└──────────────────────────────────────────────────────────────────────────┘
```

### 8.1 Primary Deployment Target: Vercel
- **Edge Middleware Execution**: Next.js 16 `middleware.ts` runs at the Vercel Edge, inspecting the `Host` header and rewriting `*.hustlr.online` into internal `/store/[slug]` routes with sub-millisecond global latency.
- **Wildcard Subdomains**: `*.hustlr.online` is configured on the Vercel project, providing automatic wildcard SSL certificate issuance and renewal.
- **Preview Environments**: Automated ephemeral preview URLs are generated on every Git push to working branches (e.g. `abdullah`) to support team review before merging to `main`.

### 8.2 Decoupled Backend Service (Express / Node.js)
- As specified in `prompt.txt` (§1), the backend is an **independent Node.js + Express + MongoDB** application deployed separately (e.g. Render, Railway, AWS, or DigitalOcean) under `api.hustlr.online`.
- Shares the parent `.hustlr.online` root domain to enable seamless `HttpOnly` cookie presentation for platform sessions.

### 8.3 Pro+ Custom Domains & `DomainProvider` Abstraction
- As defined in `prompt.txt` (§22), Pro+ merchants can map custom domains (e.g. `www.musastore.com`).
- **Clean Abstraction**: External domain/DNS provisioning APIs (e.g. Vercel Domains API) are strictly isolated behind a `DomainProvider` interface:
  ```ts
  interface DomainProvider {
    addDomain(domain: string): Promise<DomainStatus>;
    verifyDomain(domain: string): Promise<VerificationResult>;
    removeDomain(domain: string): Promise<void>;
  }
  ```
- **Rule**: No Vercel-specific SDKs or business logic are embedded inside UI components or application services. Swapping DNS/domain providers (e.g. to Cloudflare for SaaS or self-hosted Caddy) requires zero changes to core business logic.

### 8.4 Standalone Container Portability (No Vendor Lock-in)
- `next.config.ts` maintains `output: 'standalone'`, allowing Next.js to produce a self-contained production bundle.
- The entire frontend remains 100% portable and can be deployed inside a standard Docker container (on AWS ECS, Coolify, or a VPS with Caddy/Nginx) if ever required.

## 9. Consolidated Architecture Decisions Log

| # | Decision | Impact / Resolution | Status |
|---|---|---|---|
| 1 | Subdomain routing implementation | Middleware rewrite `*.hustlr.online` → `/store/[slug]` with `*.lvh.me` dev fallback | ✅ Decided & Locked |
| 2 | Backend-first vs. frontend-first | Frontend-first with domain service + transport adapter (`MockTransport` → `ApiTransport`) | ✅ Decided & Locked |
| 3 | Auth token & session architecture | Cookie-backed JWT (`hustlr_session` on `.hustlr.online` + host-only `hustlr_buyer_session`), no localStorage | ✅ Decided & Locked |
| 4 | Route group organization | Five groups: `(marketing)`, `(auth)`, `(dashboard)`, `(storefront)`, `(admin)` with dedicated layouts | ✅ Decided & Locked |
| 5 | State management & data layer | Distributed: TanStack Query (client server-state) + focused `CartContext` + Next.js URL params | ✅ Decided & Locked |
| 6 | Deployment target | Vercel (Edge/Serverless) + Standalone Docker portability + `DomainProvider` abstraction | ✅ Decided & Locked |
| 7 | Admin dashboard scope | Fully scoped in Phase C page inventory (16 views for KYC, disputes, templates, plans, audit) | ✅ Resolved |
| 8 | Design token cleanup | Normalize hardcoded hex to semantic Tailwind tokens (`bg-primary`, `border-border`, etc.) | ✅ Resolved |
| 9 | Unused dependency cleanup | Remove `axios`, `firebase`, `react-icons`, `react-spinners` during Phase 2 setup | ✅ Resolved |
| 10 | `custom-build/` directory | Delete empty legacy directory during Phase 2 folder tree initialization | ✅ Resolved |

---

## 10. Complete Technical Architecture Blueprint (Phase E)

```
frontend/src/
├── app/                                  ← Next.js 16 App Router
│   ├── (marketing)/                      ← Public platform surface
│   │   ├── layout.tsx                    ← MarketingHeader + MarketingFooter wrapper
│   │   ├── page.tsx                      ← Landing page (13 audited components)
│   │   ├── pricing/page.tsx              ← Plan comparison table
│   │   ├── templates/page.tsx            ← Storefront template showcase
│   │   ├── about/page.tsx                ← About page
│   │   ├── contact/page.tsx              ← Contact form
│   │   ├── terms/page.tsx                ← Terms of service
│   │   └── privacy/page.tsx              ← Privacy policy
│   │
│   ├── (auth)/                           ← Platform authentication
│   │   ├── layout.tsx                    ← Centered auth card layout
│   │   ├── login/page.tsx                ← Seller login
│   │   ├── register/page.tsx             ← Seller registration
│   │   ├── verify-otp/page.tsx           ← 6-digit OTP verification
│   │   ├── forgot-password/page.tsx      ← Password reset request
│   │   └── reset-password/page.tsx       ← Set new password
│   │
│   ├── (dashboard)/                      ← Seller dashboard (role: seller)
│   │   ├── layout.tsx                    ← DashboardSidebar + DashboardHeader + AuthGuard
│   │   └── dashboard/
│   │       ├── page.tsx                  ← Overview & Onboarding Checklist
│   │       ├── setup/page.tsx            ← Multi-step Store Setup Wizard
│   │       ├── templates/page.tsx        ← Storefront Template Selector
│   │       ├── products/
│   │       │   ├── page.tsx              ← Product Catalog Data Table
│   │       │   ├── new/page.tsx          ← Create Product Form + AI Copy (§24)
│   │       │   └── [id]/edit/page.tsx    ← Edit Product Form
│   │       ├── categories/page.tsx       ← Category Manager
│   │       ├── orders/
│   │       │   ├── page.tsx              ← Order Management Tabs (Escrow, Shipped)
│   │       │   └── [id]/page.tsx         ← Order Detail & Fulfillment Dispatch
│   │       ├── kyc/page.tsx              ← KYC Application & Status Banner
│   │       ├── billing/page.tsx          ← Subscription Plans & Paystack Billing
│   │       ├── wallet/page.tsx           ← Wallet Balance, Payouts & Ledger
│   │       ├── coupons/page.tsx          ← Discount Coupons Manager
│   │       ├── analytics/page.tsx        ← Sales, GMV & Traffic Charts
│   │       ├── blog/page.tsx             ← Blog Article Editor (Pro/Pro+)
│   │       ├── reviews/page.tsx          ← Reviews Management
│   │       ├── disputes/page.tsx         ← Dispute Resolution Thread
│   │       └── settings/
│   │           ├── page.tsx              ← General Store & Social Settings
│   │           └── domain/page.tsx       ← Custom Domain & DNS Verification (Pro+)
│   │
│   ├── (storefront)/                     ← Buyer storefront (rewritten from *.hustlr.online)
│   │   ├── layout.tsx                    ← Dynamic store theme provider (CSS variables)
│   │   └── store/[slug]/
│   │       ├── page.tsx                  ← Branded Storefront Landing
│   │       ├── products/
│   │       │   ├── page.tsx              ← Filterable Catalog & Search
│   │       │   └── [productSlug]/page.tsx← Product Detail, Variants, Reviews
│   │       ├── categories/[slug]/page.tsx← Category Product Listing
│   │       ├── cart/page.tsx             ← Shopping Cart Page
│   │       ├── checkout/page.tsx         ← Checkout & Paystack Escrow Payment
│   │       ├── orders/
│   │       │   └── [orderId]/
│   │       │       ├── page.tsx          ← Order Status & Delivery Tracking
│   │       │       ├── review/page.tsx   ← Submit Product Review
│   │       │       └── dispute/page.tsx  ← Submit Escrow Dispute
│   │       ├── blog/
│   │       │   ├── page.tsx              ← Store Blog
│   │       │   └── [articleSlug]/page.tsx← Article Detail
│   │       ├── about/page.tsx            ← Merchant About Page
│   │       ├── contact/page.tsx          ← Merchant Contact & WhatsApp
│   │       ├── policies/[type]/page.tsx  ← Store Policies
│   │       ├── login/page.tsx            ← Buyer Login
│   │       ├── register/page.tsx         ← Buyer Registration
│   │       └── account/
│   │           ├── page.tsx              ← Buyer Profile Overview
│   │           ├── orders/page.tsx       ← Buyer Order History
│   │           └── wishlist/page.tsx     ← Buyer Saved Items
│   │
│   ├── (admin)/                          ← Platform administration (role: admin)
│   │   ├── layout.tsx                    ← AdminSidebar + AdminHeader + AdminGuard
│   │   └── admin/
│   │       ├── login/page.tsx            ← Admin Login
│   │       ├── page.tsx                  ← Executive KPIs & Urgent Action Queue
│   │       ├── kyc/
│   │       │   ├── page.tsx              ← KYC Queue
│   │       │   └── [id]/page.tsx         ← KYC Side-by-Side Review Inspector
│   │       ├── disputes/
│   │       │   ├── page.tsx              ← Dispute Arbitration Queue
│   │       │   └── [id]/page.tsx         ← Dispute Resolution Case File
│   │       ├── payouts/page.tsx          ← Payout Approvals & Paystack Transfers
│   │       ├── templates/page.tsx        ← Storefront Template Studio
│   │       ├── plans/page.tsx            ← Subscription Plans & Commissions
│   │       ├── users/page.tsx            ← User Governance (Ban/Unban, Promote)
│   │       ├── stores/page.tsx           ← Store Governance (Live Override)
│   │       ├── buyers/page.tsx           ← Global Buyer Inspector
│   │       ├── analytics/page.tsx        ← Platform GMV & Cohort Trends
│   │       ├── transactions/page.tsx     ← Platform Financial Ledger
│   │       ├── audit-logs/page.tsx       ← Immutable Security Audit Trail
│   │       └── settings/page.tsx         ← Platform Settings (Escrow 48h, Maintenance)
│   │
│   ├── layout.tsx                        ← Root layout (fonts, providers, metadata)
│   ├── globals.css                       ← Design system tokens & Tailwind v4
│   ├── not-found.tsx                     ← 404 handler
│   ├── error.tsx                         ← Global error boundary
│   └── loading.tsx                       ← Root loading skeleton
│
├── components/
│   ├── ui/                               ← Shared design primitives
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── Toast.tsx
│   │   ├── Dropdown.tsx
│   │   ├── Table.tsx
│   │   ├── Stepper.tsx
│   │   ├── Tabs.tsx
│   │   └── Spinner.tsx
│   ├── layout/                           ← Navigation & layout shells
│   │   ├── MarketingHeader.tsx
│   │   ├── MarketingFooter.tsx
│   │   ├── DashboardSidebar.tsx
│   │   ├── DashboardHeader.tsx
│   │   ├── StorefrontHeader.tsx
│   │   ├── StorefrontFooter.tsx
│   │   ├── AdminSidebar.tsx
│   │   └── AdminHeader.tsx
│   ├── marketing/                        ← Landing page components (Hero, FAQ, etc.)
│   ├── dashboard/                        ← Seller dashboard widgets & forms
│   ├── storefront/                       ← Product cards, CartDrawer, VariantSelector
│   └── admin/                            ← DocViewer, DisputeTimeline, PlanEditor
│
├── context/                              ← Focused React Contexts
│   ├── SellerAuthContext.tsx
│   ├── BuyerAuthContext.tsx
│   └── CartContext.tsx
│
├── hooks/                                ← Domain hooks wrapping TanStack Query
│   ├── useProducts.ts
│   ├── useOrders.ts
│   ├── useCart.ts
│   ├── useKyc.ts
│   ├── useWallet.ts
│   ├── useStore.ts
│   ├── useDisputes.ts
│   └── useAnalytics.ts
│
├── services/                             ← Pure domain service modules
│   ├── auth.ts
│   ├── store.ts
│   ├── products.ts
│   ├── orders.ts
│   ├── kyc.ts
│   ├── wallet.ts
│   ├── disputes.ts
│   ├── templates.ts
│   ├── subscriptions.ts
│   ├── analytics.ts
│   └── admin.ts
│
├── types/                                ← TypeScript entity schemas from prompt.txt
│   ├── auth.ts
│   ├── store.ts
│   ├── product.ts
│   ├── order.ts
│   ├── kyc.ts
│   ├── wallet.ts
│   ├── dispute.ts
│   ├── template.ts
│   ├── subscription.ts
│   ├── analytics.ts
│   └── admin.ts
│
├── lib/
│   ├── transport.ts                      ← Transport adapter interface & factory
│   ├── api-client.ts                     ← HTTP client for ApiTransport
│   ├── domains.ts                        ← DomainProvider abstraction
│   ├── utils.ts                          ← Currency formatting, class merging
│   └── constants.ts                      ← Global platform constants
│
├── fixtures/                             ← Realistic mock datasets
│   ├── stores.ts
│   ├── products.ts
│   ├── orders.ts
│   ├── kyc.ts
│   ├── wallet.ts
│   ├── templates.ts
│   ├── plans.ts
│   └── admin.ts
│
└── middleware.ts                         ← Edge subdomain routing & route protection
```

