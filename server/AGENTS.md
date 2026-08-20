# Hustlr Server — Agent Guide

This document tells AI agents and contributors how to edit the Hustlr Express API. Follow every rule below.

## Git

Work only on the `abdullah` branch. Never commit or push to `main`. Never modify another contributor's branch.

```bash
git branch --show-current   # must be abdullah
git status
git fetch origin
```

Do not run destructive git commands (`git reset --hard`, `git clean -fd`, `git checkout .`) unless explicitly instructed.

## App name

Never hardcode the product name in copy, emails, PDFs, order prefixes, cookies, or logs.

Import brand values from `src/config/constants.config.ts`:

- `APP_NAME`
- `APP_SLUG`
- `APP_DOMAIN`
- `SUPPORT_EMAIL`
- `BRAND`

If the product is rebranded, change that file only.

## Folder structure

```text
server/
├── src/
│   ├── server.ts              # entry file (this name is the exception)
│   ├── app.ts
│   ├── config/
│   ├── controllers/
│   ├── jobs/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── services/
│   ├── types/
│   ├── utils/
│   └── validations/
├── postman/
├── .env.example
├── AGENTS.md
├── FEATURES.md
└── README.md
```

Do not invent a parallel architecture. Add new folders only when a concern does not fit the list above.

## File naming

Every file except `server.ts` and `app.ts` uses:

```text
filename.filetype.extension
```

Examples:

- `db.config.ts`
- `user.model.ts`
- `auth.controller.ts`
- `auth.route.ts`
- `auth.validation.ts`
- `paystack.service.ts`
- `jwt.util.ts`
- `error.middleware.ts`
- `seedAdmin.script.ts`

## Stack

Node.js, Express, Mongoose, TypeScript, pnpm.

Do not introduce a new framework, ORM, or package manager.

## API conventions

- All HTTP routes live under `/api`.
- Controllers stay thin: parse request, call a service, send a response.
- Business logic belongs in `services/`.
- Validate every write endpoint with Joi in `validations/` and `validate.middleware.ts`.
- Use `ApiError` + `asyncHandler` — do not write raw `try/catch` in every controller.
- Success body: `{ success: true, message, data }`.
- Error body: `{ success: false, message, errors? }`.
- Buyer and storefront routes must go through `resolveStore` middleware. Buyer data is always scoped to `req.store`.
- Seller-owned resources must check `sellerId` / store ownership in the service layer.
- Auth tokens are HttpOnly cookies (`SELLER_SESSION_COOKIE`, `BUYER_SESSION_COOKIE`) and also accepted as `Authorization: Bearer` for API clients.

## Multi-tenancy

- Seller/admin auth is platform-scoped (`hustlr.online`).
- Buyer auth is store-scoped. A buyer on store A is unrelated to a buyer on store B.
- `resolveStore` reads subdomain, custom domain, or `X-Store-Slug` (dev/Postman).
- Do not serve a storefront when the store is not live, unless the request is an authenticated seller preview explicitly added later.

## Environment variables

If a change needs a new env var:

1. Read it in `src/config/env.config.ts`.
2. Add it to `.env.example` with a placeholder and a comment.
3. Document it in `README.md` if it affects how to run the server.

Never commit `.env`.

## Postman

Every new or updated route must update `postman/hustlr.postman_collection.json`:

- Folder matching the domain (Auth, Products, Admin, …)
- Method + URL using `{{baseUrl}}`
- Headers (`Content-Type`, `Authorization` when needed)
- Realistic sample request body
- Short description of what the endpoint does

Postman env vars: `{{baseUrl}}`, `{{sellerToken}}`, `{{buyerToken}}`, `{{adminToken}}`, `{{storeSlug}}`.

## Email, uploads, payments

- Email: Resend primary, Nodemailer SMTP fallback, HTML templates that use `APP_NAME` / `BRAND`.
- Uploads: multer memory storage → Cloudflare R2 via AWS S3 SDK.
- Payments and payouts: Paystack only. Verify webhooks with HMAC-SHA512.

## AI features

Prefer SpaceXAI (`XAI_API_KEY`, `https://api.x.ai/v1`). Fall back to DeepSeek, then local generation if no key is set.

## Scripts

Seed scripts live in `src/scripts/` and are run with:

```bash
pnpm seed:admin
pnpm seed:plans
pnpm seed:categories
pnpm seed:templates
pnpm seed:all
```

## Documentation

- How to run: `README.md`
- What the API does: `FEATURES.md`
- Keep both in sync when adding a feature area.

## Do not

- Hardcode `"Hustlr"` in user-facing strings
- Use `localStorage` concepts on the server
- Skip Joi validation on write endpoints
- Skip Postman or `.env.example` updates
- Put business logic in route files
- Query another store's buyer/cart/order without an explicit admin context
