# Hustlr API — Feature Documentation

This document describes what the server implements. Brand strings come from `APP_NAME` in `src/config/constants.config.ts`.

## Roles and tenancy

| Role   | Auth context   | Cookie                             |
| ------ | -------------- | ---------------------------------- |
| Seller | Main platform  | `hustlr_session`                   |
| Admin  | Main platform  | `hustlr_session`                   |
| Buyer  | One store only | `hustlr_buyer_session` (host-only) |

A buyer on store A has no account on store B. JWTs for buyers include `buyerProfileId` and `storeId`. `resolveStore` maps subdomain / custom domain / `X-Store-Slug` to a store and rejects stores that are not live.

## Authentication

- Seller/admin: email + password + 6-digit OTP (10 min), Google (Firebase ID token), forgot/reset password OTP
- Buyer: same flows, always scoped to the current store
- Google-only accounts cannot use password login
- Tokens are set as HttpOnly cookies and returned in the JSON body for API clients

Key routes: `/api/auth/seller/*`, `/api/auth/buyer/*`

## Store setup

Sellers save store profile via `PUT /api/store/setup` (partial updates). Slug is auto-generated and unique; it becomes the subdomain. Logo/banner/favicon upload to R2.

Templates are tier-gated (`free` / `pro` / `pro+`). Switching to a template the plan does not include returns 403.

Pro+ custom domains: save domain, return DNS instructions, `POST /api/seller/store/verify-domain` does CNAME/A lookup. `resolveStore` honours verified custom domains.

## KYC

Manual admin review. Seller saves progress, uploads ID/selfie/address/bank details, submits. Admins approve, reject, or request specific files. Bank codes are validated against Paystack’s bank list (cached 1 hour). KYC approval is required before going live.

## Subscriptions

Seeded plans:

| Plan | Monthly | Yearly   | Commission | Notes                                   |
| ---- | ------- | -------- | ---------- | --------------------------------------- |
| Free | ₦0      | ₦0       | 10%        | 25 products, free templates             |
| Pro  | ₦15,000 | ₦150,000 | 7%         | Unlimited products, blog, pro templates |
| Pro+ | ₦35,000 | ₦350,000 | 5%         | Custom domain, all templates            |

Paid plans initialize Paystack checkout. Verify via `/api/subscriptions/verify` or the Paystack webhook. Cron handles expiry reminders, 3-day grace, then takes the store offline.

## Catalog

Seller product CRUD with variants, images (max 8), bulk status/archive, stock decrement on paid orders. Hitting 0 stock drafts the product and emails the seller. Store categories plus admin global categories. Plan `maxProducts` is enforced.

## Storefront (public)

`/api/storefront/info|products|categories|featured|new-arrivals|best-sellers|blog` plus product reviews and coupon validation. Optional buyer JWT adds `isWishlisted`.

## Cart, checkout, escrow

Cart is per buyer per store, with price snapshots and variant keys.

Checkout:

1. Validate stock + coupon
2. Create order (`HUS-{initials}-{date}-{seq}`)
3. Initialize Paystack (amount in kobo)
4. On verify/webhook: mark paid, decrement stock, generate PDF receipt/invoice, notify both sides, lock escrow

Buyer confirms receipt → escrow releases to seller wallet. If the buyer does nothing after delivery, a hourly cron auto-confirms after `escrowAutoReleaseHours` (default 48).

## Wallet and payouts

Seller wallet: available + pending. Withdrawals require approved KYC bank details and the platform minimum. Admin approve → dispatch (Paystack Transfer) → complete/fail via webhook. Rejections and failed transfers reverse funds.

## Disputes, reviews, coupons, wishlist

- Buyer opens a dispute; three-way messages; admin refund / replacement / reject
- Verified-purchase reviews with rating aggregates and seller reply
- Store coupons (percentage/fixed, limits, product/category targeting)
- Per-store wishlist toggle

## Referrals

- Buyer: unique per-store code; first confirmed order rewards the referrer’s store credit
- Seller: platform code on the User; first paid subscription credits the referrer’s wallet (admin-configurable)

## Blog, analytics, notifications, tickets

Blog is Pro/Pro+ only. Seller analytics cover revenue, products, customers, and order status. In-app notifications + HTML email (Resend, SMTP fallback). Support tickets for sellers and buyers; admin queue.

## Admin

Users (ban/unban/promote), buyers, stores (live override), KYC queue, templates, plans, payouts, disputes, reviews, tickets, platform analytics, settings, audit logs, financial transactions, referrals.

## AI

`POST /api/seller/ai/improve-title|rewrite-description|generate-seo`

Provider order: SpaceXAI (`XAI_API_KEY`) → DeepSeek → local fallback so the endpoints always return JSON.

## Uploads and security

- Multer memory storage → Cloudflare R2
- Helmet, CORS (platform + `*.hustlr.shop` / `*.lvh.me`), rate limits (auth 5/min, API 100/min, upload 20/min)
- Joi on write endpoints, mongo sanitize, Paystack HMAC-SHA512 webhooks
- Webhooks are not rate-limited

## Cron (setInterval)

| Job                          | Interval |
| ---------------------------- | -------- |
| Escrow auto-release          | 1 hour   |
| Subscription expiry          | 6 hours  |
| Review aggregate backfill    | 24 hours |
| Stale cart cleanup (30 days) | 24 hours |
| Expired coupon deactivation  | 24 hours |
