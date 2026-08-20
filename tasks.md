# Hustlr — Task Tracker

> **Status**: Baseline — initialized from discovery findings, 2026-08-19.  
> **Convention**: Tasks describe PLANNED work. Nothing below is implemented unless explicitly marked ✅.

---

## Phase 0: Discovery & Planning (CURRENT)

- [x] Read and verify `AGENTS.md`
- [x] Read and verify `prompt.txt` (backend specification)
- [x] Inspect full frontend directory structure
- [x] Inspect frontend dependencies (`package.json`)
- [x] Inspect routing (only `/` exists)
- [x] Inspect authentication architecture (none exists)
- [x] Inspect API/data-fetching architecture (none exists)
- [x] Inspect shared components and design system
- [x] Inspect landing page implementation (all 13 components)
- [x] Inspect configuration files (`next.config.ts`, `tsconfig.json`, `.env`)
- [x] Produce discovery report
- [x] Initialize project documentation (`prd.md`, `architecture.md`, `tasks.md`, `memory.md`, `handoff.md`)
- [x] Create `.agents/` directory structure

### Discovery Findings — Confirmed Facts

- Only one page exists: `/` (marketing landing page)
- 13 components exist, all for the landing page
- No backend code, database, or API endpoints exist
- No authentication, middleware, or protected routes exist
- No API client layer or environment variables configured
- `next.config.ts` is empty
- 4 npm packages installed but completely unused: `axios`, `firebase`, `react-icons`, `react-spinners`
- `StartStoreModal` is a cosmetic UI mock (no network requests)
- `Navbar` component exists (206 lines) but is commented out in `page.tsx`
- `custom-build/` directory is empty with no documented purpose
- Design tokens exist in `globals.css` but components use hardcoded hex values inconsistently

---

# Hustlr — Master Task Tracker & Implementation Roadmap

> **Status**: Planning Complete — Ready for Infrastructure Phase.  
> **Rule**: No application code is implemented until explicit user instruction.

---

## Completed Planning Milestones (Phases 0–E)

- [x] **Phase 0: Discovery & Fact Verification** (Repository inspection, documentation creation, `AGENTS.md` verification)
- [x] **Phase 1: High-Impact Architecture Decisions** (Decisions 1–6 locked in `architecture.md`)
- [x] **Phase 2: Core User Journeys** (Seller, Buyer, Admin journeys documented in `prd.md`)
- [x] **Phase 3: Complete Frontend Page Inventory** (59-view inventory across 5 route groups in `prd.md`)
- [x] **Phase 4: Landing Page Audit & Resolutions** (Navbar, token cleanup, unused dependency cleanup in `architecture.md`)
- [x] **Phase 5: Final Technical Architecture Blueprint** (Section 10 in `architecture.md`)

---

## Implementation Roadmap (Phases 1–6)

### Phase 1: Foundation & Project Infrastructure
> Prerequisites: Complete before building any surface.

- [ ] **1.1 Dependencies & Cleanup**:
  - [ ] Remove unused dependencies: `axios`, `firebase`, `react-icons`, `react-spinners`
  - [ ] Install core dependencies: `@tanstack/react-query`, `lucide-react`, `clsx`, `tailwind-merge`
- [ ] **1.2 Configs & Environment**:
  - [ ] Configure `next.config.ts` (`output: 'standalone'`, remote image domains for Cloudflare R2)
  - [ ] Create `.env.example` and `.env.local`
- [ ] **1.3 Design System & UI Primitives (`components/ui/*`)**:
  - [ ] Normalize semantic color tokens in `globals.css`
  - [ ] Build shared primitives: `Button`, `Input`, `Card`, `Modal`, `Badge`, `Toast`, `Dropdown`, `Table`, `Stepper`, `Tabs`, `Spinner`
- [ ] **1.4 TypeScript Domain Entity Types (`types/*`)**:
  - [ ] `auth.ts`, `store.ts`, `product.ts`, `order.ts`, `kyc.ts`, `wallet.ts`, `dispute.ts`, `template.ts`, `subscription.ts`, `analytics.ts`, `admin.ts`
- [ ] **1.5 Data Layer Transport Adapter & Local Fixtures**:
  - [ ] `lib/transport.ts` (Transport interface & factory)
  - [ ] `fixtures/*` (Realistic mock data for stores, products, orders, KYC, wallet, templates, plans, admin)
  - [ ] `services/*` (Pure domain service modules delegating to transport)
- [ ] **1.6 State Management & Contexts**:
  - [ ] TanStack Query Client Provider setup in root layout
  - [ ] `SellerAuthContext.tsx` & `BuyerAuthContext.tsx`
  - [ ] Tenant-scoped `CartContext.tsx` (`hustlr_cart_{storeSlug}`)
  - [ ] Custom domain hooks (`hooks/useProducts.ts`, `useOrders.ts`, `useCart.ts`, etc.)
- [ ] **1.7 Next.js Edge Middleware (`middleware.ts`)**:
  - [ ] Host inspection and subdomain rewrites (`*.hustlr.online` / `*.lvh.me` → `/store/[slug]/*`)
  - [ ] Auth route protection for `/dashboard/*` (seller) and `/admin/*` (admin)
- [ ] **1.8 Route Groups & Layout Shells**:
  - [ ] Move existing landing page into `src/app/(marketing)/page.tsx` (internals unchanged)
  - [ ] Setup `(marketing)/layout.tsx` with repurposed `MarketingHeader.tsx` & `MarketingFooter.tsx`
  - [ ] Setup `(auth)/layout.tsx`, `(dashboard)/layout.tsx`, `(storefront)/layout.tsx`, `(admin)/layout.tsx`
  - [ ] Delete empty `src/app/custom-build/` directory
  - [ ] Create root `not-found.tsx`, `error.tsx`, `loading.tsx`

---

### Phase 2: Marketing & Authentication Surfaces
- [ ] **2.1 Marketing Sub-Pages**:
  - [ ] `(marketing)/pricing/page.tsx` (Interactive monthly/yearly comparison)
  - [ ] `(marketing)/templates/page.tsx` (Filterable template showcase + interactive preview)
  - [ ] `(marketing)/about/page.tsx`, `/contact/page.tsx`, `/terms/page.tsx`, `/privacy/page.tsx`
  - [ ] Wire `StartStoreModal` to redirect to `/(auth)/register?email=...`
- [ ] **2.2 Platform Authentication (`(auth)/*`)**:
  - [ ] `login/page.tsx` (Seller email+password / Google OAuth)
  - [ ] `register/page.tsx` (Registration with email pre-population)
  - [ ] `verify-otp/page.tsx` (6-digit OTP verification with countdown)
  - [ ] `forgot-password/page.tsx` & `reset-password/page.tsx`

---

### Phase 3: Storefront Surface (Buyer Shopping Experience)
- [ ] **3.1 Dynamic Store Theme**:
  - [ ] Storefront layout injecting merchant CSS color variables (`--primary`, `--accent`, etc.)
  - [ ] Branded Storefront Header (Logo, Search, Cart Drawer trigger, Wishlist, WhatsApp button)
- [ ] **3.2 Catalog & Product Pages**:
  - [ ] Storefront Landing (`store/[slug]/page.tsx`) with template-driven sections
  - [ ] Catalog Listing & Search (`/products`, `/categories/[slug]`) with URL filter params
  - [ ] Product Detail Page (`/products/[productSlug]`) with image gallery, variant selector, reviews
- [ ] **3.3 Shopping Cart & Checkout**:
  - [ ] Tenant-scoped Slide-over Cart Drawer & `/cart` page
  - [ ] Two-column Escrow Checkout page (`/checkout`) with coupon code validation
  - [ ] Paystack checkout simulation with escrow protection notice
- [ ] **3.4 Order Tracking & Post-Purchase**:
  - [ ] Order Confirmation & Tracking (`/orders/[orderId]`) with delivery confirmation button
  - [ ] Write Review modal (`/orders/[orderId]/review`)
  - [ ] Raise Escrow Dispute form (`/orders/[orderId]/dispute`)
  - [ ] Storefront Blog (`/blog`, `/blog/[slug]`)
  - [ ] Buyer Account portal (`/account`, `/account/orders`, `/account/wishlist`)

---

### Phase 4: Seller Dashboard Surface (Merchant Control Center)
- [ ] **4.1 Dashboard Shell & Onboarding**:
  - [ ] Collapsible sidebar, topbar, store switcher, and Onboarding Checklist Banner
  - [ ] Dashboard Overview (`/dashboard/page.tsx`) with sales KPIs and recent orders
- [ ] **4.2 Store Setup & Customization**:
  - [ ] Multi-step Store Setup Wizard (`/dashboard/setup`)
  - [ ] Template Selection Studio (`/dashboard/templates`)
  - [ ] Custom Domain & DNS verification (`/dashboard/settings/domain` for Pro+)
- [ ] **4.3 Catalog & Inventory**:
  - [ ] Product Data Table (`/dashboard/products`) with category filters and stock badges
  - [ ] Add/Edit Product form (`/dashboard/products/new`) with variant matrix and AI copy assist (§24)
  - [ ] Category Manager (`/dashboard/categories`)
- [ ] **4.4 Order Fulfillment & Escrow**:
  - [ ] Orders Management (`/dashboard/orders`) with status tabs
  - [ ] Order Detail & Dispatch modal (`/dashboard/orders/[id]`) with carrier tracking input
- [ ] **4.5 Compliance, Billing & Wallet**:
  - [ ] KYC Verification application & status tracker (`/dashboard/kyc`)
  - [ ] Subscription Plans & Paystack Billing (`/dashboard/billing`)
  - [ ] Wallet Balance, Withdrawal modal & Transaction Ledger (`/dashboard/wallet`)
- [ ] **4.6 Marketing & Tools**:
  - [ ] Discount Coupons manager (`/dashboard/coupons`)
  - [ ] Sales & Traffic Analytics (`/dashboard/analytics`)
  - [ ] Blog Article Rich Text Editor (`/dashboard/blog` for Pro/Pro+)
  - [ ] Customer Reviews & Dispute Response (`/dashboard/reviews`, `/dashboard/disputes`)

---

### Phase 5: Admin Surface (Platform Governance)
- [ ] **5.1 Admin Shell & Overview**:
  - [ ] Admin layout shell with role verification guard
  - [ ] Executive Command Center (`/admin`) with global GMV, revenue, and urgent action queue
- [ ] **5.2 Compliance & Financial Operations**:
  - [ ] KYC Application Queue & Side-by-Side Document Reviewer (`/admin/kyc/*`)
  - [ ] Dispute Arbitration Queue & Resolution rulings (`/admin/disputes/*`)
  - [ ] Payout Queue & Paystack Transfer execution (`/admin/payouts`)
- [ ] **5.3 Platform Configuration & Governance**:
  - [ ] Template Studio (`/admin/templates`) & Plan Manager (`/admin/plans`)
  - [ ] User & Store Governance (`/admin/users`, `/admin/stores`, `/admin/buyers`)
  - [ ] Platform Analytics, Financial Ledger & Audit Trail (`/admin/analytics`, `/admin/transactions`, `/admin/audit-logs`, `/admin/settings`)

---

### Phase 6: Quality Assurance & Integration Verification
- [ ] **6.1 End-to-End User Flow Testing**:
  - [ ] Flow 1: Seller registers → sets up store → uploads product → completes KYC → goes live.
  - [ ] Flow 2: Buyer visits `{slug}.lvh.me:3000` → adds to cart → pays in escrow → receives receipt.
  - [ ] Flow 3: Seller marks as shipped with tracking.
  - [ ] Flow 4: Buyer confirms receipt → escrow releases to seller wallet → seller requests payout.
  - [ ] Flow 5: Admin approves payout and inspects audit log.
- [ ] **6.2 Edge Subdomain Verification**:
  - [ ] Verify `lvh.me:3000` (main platform) vs. `{slug}.lvh.me:3000` (storefront) routing.
- [ ] **6.3 Backend Adapter Readiness**:
  - [ ] Verify that swapping `MockTransport` to `ApiTransport` requires zero UI/hook changes.
- [ ] Implement store setup endpoints (§2)
- [ ] Implement template management endpoints (§3)
- [ ] Implement KYC endpoints (§4)
- [ ] Implement subscription/billing endpoints (§5)
- [ ] Implement product CRUD endpoints (§6)
- [ ] Implement category endpoints (§7)
- [ ] Implement storefront public endpoints (§8)
- [ ] Implement cart endpoints (§9)
- [ ] Implement checkout/escrow endpoints (§10)
- [ ] Implement order management endpoints (§11)
- [ ] Implement wallet/payout endpoints (§12)
- [ ] Implement disputes endpoints (§13)
- [ ] Implement reviews endpoints (§14)
- [ ] Implement coupons endpoints (§15)
- [ ] Implement wishlist endpoints (§16)
- [ ] Implement referral endpoints (§17)
- [ ] Implement blog endpoints (§18)
- [ ] Implement analytics endpoints (§19)
- [ ] Implement notification endpoints (§20)
- [ ] Implement support ticket endpoints (§21)
- [ ] Implement custom domain endpoints (§22)
- [ ] Implement admin dashboard endpoints (§23)
- [ ] Implement AI tool endpoints (§24)
- [ ] Implement cron jobs (§25)
- [ ] Implement file upload (R2) (§26)
- [ ] Implement rate limiting & security (§27)
- [ ] Create seed scripts (§28)

---

## Phase 4: Frontend — Auth Pages (NOT STARTED)

> Blocked on backend auth endpoints.

- [ ] Seller login page (`/login`)
- [ ] Seller registration page (`/register`) — may replace `StartStoreModal`
- [ ] OTP verification page (`/verify-otp`)
- [ ] Forgot password page (`/forgot-password`)
- [ ] Wire `StartStoreModal` to real API (or replace with page redirect)

---

## Phase 5: Frontend — Seller Dashboard (NOT STARTED)

> Blocked on backend API and auth.

- [ ] Dashboard home/overview (`/dashboard`)
- [ ] Store setup/settings (`/dashboard/settings`)
- [ ] KYC wizard (`/dashboard/kyc`)
- [ ] Product management (`/dashboard/products`)
- [ ] Order management (`/dashboard/orders`)
- [ ] Analytics (`/dashboard/analytics`)
- [ ] Wallet & withdrawals (`/dashboard/wallet`)
- [ ] Blog editor (`/dashboard/blog`) — pro/pro+ only
- [ ] Subscription management
- [ ] Notification center

---

## Phase 6: Frontend — Buyer Storefront (NOT STARTED)

> Blocked on subdomain routing decision and backend API.

- [ ] Storefront home page
- [ ] Product listing page
- [ ] Product detail page
- [ ] Cart page
- [ ] Checkout flow
- [ ] Buyer registration/login
- [ ] Order history
- [ ] Wishlist
- [ ] Reviews submission

---

## Phase 7: Frontend — Admin Dashboard (NOT STARTED / NOT SCOPED)

> Scope and priority not yet determined.

- [ ] Scope decision pending

---

## Phase 8: Legal & Compliance Pages (NOT STARTED)

- [ ] Terms of Service page (currently links to `#hero`)
- [ ] Privacy Policy page (currently links to `#hero`)
- [ ] KYC Policy page (currently links to `#hero`)

---

## Notes

- Phases are approximate and may be reordered based on architecture decisions
- Phase numbers do not imply strict sequential execution
- Backend and frontend phases may run in parallel depending on team decisions
- Each task should be broken into subtasks when implementation begins
