# Hustlr — Product Requirements Document

> **Status**: Baseline — reflects repository state as of 2026-08-19.  
> **Source of truth**: Repository inspection + `prompt.txt` backend specification.

---

## 1. Product Overview

Hustlr is a **multi-tenant e-commerce SaaS platform** for African merchants. Sellers register on the main platform (`hustlr.online`), configure a branded storefront, and receive a subdomain (e.g. `musa-store.hustlr.online`). Buyers shop on individual seller storefronts. Payments flow through Paystack using an escrow model.

### Brand Identity

| Property | Value |
|---|---|
| App name | Hustlr (stored as global constant `APP_NAME`) |
| Domain | `hustlr.online` |
| Slogan | "Launch Your Custom E-Commerce Storefront in Minutes" |
| Tagline | "Empowering African merchants and creators to build branded online stores, accept Paystack payments with escrow protection, and manage sales seamlessly." |
| Support email | `support@hustlr.online` |

---

## 2. User Roles

Three distinct roles are defined in the product specification:

| Role | Description | Authentication Context |
|---|---|---|
| **Admin** | Platform operators managing Hustlr itself | Main platform (`hustlr.online`) |
| **Seller** | Store owners who register, set up stores, manage products and orders | Main platform (`hustlr.online`) |
| **Buyer** | Customers shopping on a seller's storefront; scoped per-store | Seller subdomain (e.g. `musa-store.hustlr.online`) |

Key multi-tenancy rule: A buyer account on one store is completely independent from a buyer account on another store. The same person visiting two different stores must register separately on each.

---

## 3. Subscription Tiers

Three tiers are defined. Pricing and features are hardcoded in the frontend constants and specified in the backend spec:

| Tier | Monthly | Yearly | Commission | Key Differentiators |
|---|---|---|---|---|
| **Free** | ₦0 | ₦0 | 10% | 25 product limit, free templates only |
| **Pro** | ₦15,000 | ₦150,000 | 7% | Unlimited products, pro templates, blog, coupons |
| **Pro+** | ₦35,000 | ₦350,000 | 5% | Custom domain mapping, all templates, lowest commission |

---

## 4. Feature Scope (from Backend Specification)

The following features are **specified in `prompt.txt`** across 30 sections. **None are implemented** — this is the planned feature set, not current functionality.

### 4.1 Authentication & Accounts (§1)
- Seller registration: email+password with OTP verification, or Google OAuth
- Buyer registration: per-store, subdomain-scoped, same auth patterns
- JWT-based sessions; buyer tokens include both `buyerProfileId` and `storeId`
- Forgot password flow with OTP

### 4.2 Store Setup & Configuration (§2)
- Store name, slug (auto-generated subdomain), logo, banner, favicon
- Color scheme (CSS variables), template selection
- Social links, contact info, policies (shipping, return, terms, privacy)
- SEO metadata (metaTitle, metaDescription)

### 4.3 Website Templates (§3)
- Admin-managed templates with tier gating (free/pro/pro+)
- CSS variable-driven color customization
- Layout sections defined per template

### 4.4 KYC Verification (§4)
- Multi-step document upload (ID, selfie, proof of address, business registration)
- Admin review flow: approve / reject / request more info
- Required before a seller can go live

### 4.5 Subscriptions & Billing (§5)
- Paystack checkout for paid plans
- Auto-renewal with cron-based expiry checking
- Grace period (3 days), upgrade/downgrade with proration

### 4.6 Products (§6)
- Full CRUD with variants, images (R2 upload), bulk operations
- Stock management with auto-draft on zero stock
- SKU, weight, shipping fee per product

### 4.7 Storefront Public Endpoints (§8)
- Store info, product listing/detail, categories, featured, new arrivals, best sellers
- Public (no auth required), with optional personalization when buyer is logged in

### 4.8 Cart, Checkout & Escrow (§9–10)
- Per-store cart with variant support and price snapshots
- Paystack payment with escrow hold
- Auto-release after buyer confirmation or timeout

### 4.9 Order Management (§11)
- Seller: list/detail/ship/deliver with tracking
- Buyer: list/detail/confirm receipt
- PDF receipt and invoice generation via PDFKit

### 4.10 Wallet & Payouts (§12)
- Seller wallet with balance and pending balance
- Withdrawal requests with admin approval flow
- Paystack Transfer API for bank payouts

### 4.11 Additional Features (§13–24)
- Disputes & refunds (§13)
- Reviews & ratings (§14)
- Coupons & discounts (§15)
- Buyer wishlist (§16)
- Referral system — buyer-level and seller-level (§17)
- Blog for pro/pro+ sellers (§18)
- Seller analytics dashboard (§19)
- Email + in-app notifications (§20)
- Support tickets (§21)
- Custom domains for pro+ (§22)
- Admin dashboard with full platform management (§23)
- AI-powered product content tools (§24)

### 4.12 Infrastructure (§25–30)
- Cron jobs for escrow release, subscription expiry, review aggregation, stale cart cleanup, coupon deactivation (§25)
- Cloudflare R2 file uploads via AWS S3 SDK (§26)
- Rate limiting and security (§27)
- Seed scripts for admin, plans, categories, templates (§28)
- Postman collection with all endpoints (§29)
- Environment variables (§30)

---

---

## 5. Core User Journeys (Phase B Complete)

### 5.1 The Seller Journey
1. **Registration & OTP Auth (`/(auth)/register`, `/verify-otp`)**: Name, Email, Password, or Google OAuth → 6-digit OTP verification → `hustlr_session` cookie issued.
2. **Store Onboarding Wizard (`/(dashboard)/dashboard/setup`)**: Progressive 5-step setup (Store Name/Slug, Visual Assets/Logo/Banner to R2, Palette/Theme, Social/WhatsApp, Policies).
3. **Template Selection (`/(dashboard)/dashboard/templates`)**: Category browsing, live interactive preview, tier-gated selection (`free`, `pro`, `pro+`).
4. **Product Catalog (`/(dashboard)/dashboard/products`)**: Categories, products with multi-image gallery, optional AI-assisted descriptions (§24), variants (Size, Color), stock management.
5. **KYC Verification (`/(dashboard)/dashboard/kyc`)**: Personal ID + Selfie photo, Proof of Address, optional CAC, Bank Account validation via Paystack bank API. Admin review states: `pending`, `info_requested`, `rejected`, `approved`.
6. **Subscriptions & Going Live (`/(dashboard)/dashboard/billing`)**: Plan selection (Free, Pro @ ₦15k/mo, Pro+ @ ₦35k/mo) → Paystack payment → Store live celebration on `{slug}.hustlr.online`.
7. **Order Fulfillment (`/(dashboard)/dashboard/orders`)**: Escrow order tracking, fulfillment dispatch (Carrier, tracking number), delivery confirmation triggering escrow release to seller balance.
8. **Wallet & Payouts (`/(dashboard)/dashboard/wallet`)**: Available balance vs. Pending escrow balance, withdrawal request to verified bank account via Paystack Transfer API.
9. **Growth & Operations (`/(dashboard)/...`)**: Discount coupons, sales analytics, blog editor (Pro/Pro+), custom domain DNS verification (Pro+).

### 5.2 The Buyer Storefront Journey
1. **Storefront Landing (`/(storefront)/store/[slug]`)**: Merchant branding, dynamic template layout, hero banner, featured categories, trust badges, WhatsApp direct contact.
2. **Catalog & Search (`/(storefront)/store/[slug]/products`)**: Category filters, price sliders, sorting, search params URL persistence.
3. **Product Details (`/(storefront)/store/[slug]/products/[productSlug]`)**: Image gallery with zoom, variant selector (Size/Color) with live price/stock updates, verified customer reviews with photos.
4. **Tenant Cart (`hustlr_cart_{storeSlug}`)**: Slide-over drawer and `/cart` page, isolated per store, variant quantity adjustments.
5. **Checkout & Escrow (`/(storefront)/store/[slug]/checkout`)**: Guest or account checkout, shipping address, coupon code discount, Paystack escrow payment (`paid_in_escrow`).
6. **Order Confirmation & Tracking (`/(storefront)/store/[slug]/orders/[id]`)**: Instant receipt, tracking stepper (`Placed → Processing → Shipped → Delivered`), PDF receipt download.
7. **Delivery Confirmation & Escrow Release**: Buyer clicks "Confirm Delivery" upon receiving goods → releases escrow funds directly to merchant wallet.
8. **Post-Purchase Engagement**: Verified buyer reviews (1–5 stars), dispute submission (with escrow hold), store referral rewards.
9. **Buyer Account (`/(storefront)/store/[slug]/account`)**: Tenant-scoped login (`hustlr_buyer_session`), order history, saved addresses, wishlist.

### 5.3 The Admin Platform Journey
1. **Admin Auth & Edge Gating (`/(admin)/admin/login`)**: Role verification (`role === "admin"`), Edge middleware protection.
2. **Executive Overview (`/(admin)/admin`)**: Total GMV, platform revenue, active stores, priority action queue (Pending KYC, Active Disputes, Payout Requests).
3. **KYC Compliance Pipeline (`/(admin)/admin/kyc`)**: Review ID documents, selfie, address proof, bank details; Approve, Reject, or Request Specific Info.
4. **Template & Plan Studio (`/(admin)/admin/templates`, `/admin/plans`)**: Upload/configure storefront templates, configure pricing tiers, commissions, and limits.
5. **Payout Ledger (`/(admin)/admin/payouts`)**: Review and approve merchant withdrawal requests via Paystack Transfer API.
6. **Dispute Arbitration (`/(admin)/admin/disputes`)**: Inspect buyer and seller evidence, release escrow to seller or refund buyer.
7. **User & Store Governance (`/(admin)/admin/users`, `/admin/stores`)**: Ban/unban sellers, force store live/offline, inspect buyer profiles.
8. **Platform Analytics (`/(admin)/admin/analytics`)**: GMV trends, cohort charts, KYC funnel conversion, dispute rates.
9. **Audit Logs & Settings (`/(admin)/admin/settings`, `/admin/audit-logs`)**: Immutable security audit trail, global commission rates, escrow holding rules, emergency maintenance mode.

---

## 6. Current Implementation Status

### What Exists

| Component | Status |
|---|---|
| Static marketing landing page at `/` | ✅ Complete |
| 13 React components (Hero, Marquee, Features, Ecosystem, WhoWeAre, WhatWeDo, StoreTemplates, Pricing, FAQ, CTA, Footer, Navbar, StartStoreModal) | ✅ Complete (UI only) |
| SEO metadata, OG tags, JSON-LD schema | ✅ Complete |
| Design system (colors, fonts, Tailwind theme) | ✅ Partially established |
| Brand constants in `app.constants.ts` | ✅ Complete |
| Static assets (logo, hero image, template previews, video thumbnail) | ✅ Present |
| Git workflow and branch rules (`AGENTS.md`) | ✅ Complete |
| Backend feature specification (`prompt.txt`) | ✅ Complete |

### What Does NOT Exist (To Be Built)

| Component | Status |
|---|---|
| Backend server (Node.js/Express/MongoDB) | ❌ Specified in prompt.txt (mocked in frontend phase) |
| Any API endpoints | ❌ Specified in prompt.txt |
| Frontend route groups & pages beyond `/` | ❌ Planned in Phase C |
| Authentication & session management | ❌ Architecture approved (Decision 3) |
| Transport adapter layer & domain services | ❌ Architecture approved (Decision 4) |
| Seller dashboard | ❌ Planned in Phase C |
| Buyer storefront pages | ❌ Planned in Phase C |
| Admin dashboard | ❌ Planned in Phase C |
| Subdomain routing middleware | ❌ Architecture approved (Decision 1) |

---

## 7. Architecture Decisions Log

All 5 core architectural decisions have been approved and locked in `architecture.md`:
1. **Subdomain Routing**: Middleware rewrite `*.hustlr.online` → `/store/[slug]` with `*.lvh.me` dev testing.
2. **Route Group Organization**: 5 isolated route groups `(marketing)`, `(auth)`, `(dashboard)`, `(storefront)`, `(admin)` with dedicated layouts.
3. **Authentication Architecture**: Cookie-backed JWT (`hustlr_session` on `.hustlr.online` + host-only `hustlr_buyer_session`), no localStorage.
4. **State Management & Data Layer**: Distributed state with TanStack Query, focused `CartContext`, Next.js URL params, and UI → Hook → Service → Transport boundary.
5. **Deployment Target**: Vercel managed Edge/Serverless + standalone Docker portability + `DomainProvider` abstraction.
