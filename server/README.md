# Hustlr API

Express + TypeScript backend for the Hustlr multi-tenant e-commerce platform.

Sellers register on the main platform, set up a branded store, and go live on `{slug}.hustlr.online`. Buyers shop on a single store at a time. Buyer accounts never leak across stores.

Full product behaviour is documented in [`FEATURES.md`](./FEATURES.md). Agent conventions are in [`AGENTS.md`](./AGENTS.md).

## Stack

- Node.js 20+
- Express 4
- MongoDB + Mongoose
- TypeScript
- pnpm
- Paystack, Cloudflare R2, Resend / SMTP, Firebase Admin, SpaceXAI / DeepSeek

## Setup

```bash
cd server
pnpm install
cp .env.example .env
```

Fill `.env` at least with:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLIENT_ORIGINS` / `FRONTEND_URL`
- Paystack, R2, and email keys when you exercise those flows

## Run

```bash
pnpm dev          # nodemon + tsx, default http://localhost:5000
pnpm build
pnpm start        # node dist/server.js
```

Health check: `GET http://localhost:5000/api/health`

## Seed data

```bash
pnpm seed:admin        # admin@hustlr.online / Admin1234!
pnpm seed:plans        # free, pro, pro+
pnpm seed:categories
pnpm seed:templates
pnpm seed:all
```

Override the admin login with `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## Local storefront testing

The API resolves a store from:

1. `Host` header (`musa-store.lvh.me`, `musa-store.hustlr.online`)
2. Verified custom domain
3. `X-Store-Slug` header or `?storeSlug=` (Postman / local)

Example:

```bash
curl http://localhost:5000/api/storefront/info -H "X-Store-Slug: musas-fashion-hub"
```

Auth uses HttpOnly cookies (`hustlr_session` for sellers/admins, `hustlr_buyer_session` for buyers) and also accepts `Authorization: Bearer`.

## Scripts

| Script | Purpose |
|---|---|
| `pnpm dev` | Watch mode |
| `pnpm build` | Compile to `dist/` |
| `pnpm start` | Run compiled server |
| `pnpm seed:*` | Seed admin, plans, categories, templates |

## Postman

Import `postman/hustlr.postman_collection.json`.

Collection variables:

- `baseUrl` — `http://localhost:5000/api`
- `sellerToken` / `buyerToken` / `adminToken`
- `storeSlug`

## Layout

```text
src/
  server.ts          entry
  app.ts             Express app
  config/            env, db, R2, Firebase, brand constants
  controllers/
  middlewares/
  models/
  routes/
  scripts/
  services/
  utils/
  validations/
  jobs/
```

The product name is always imported from `src/config/constants.config.ts` (`APP_NAME`). Do not hardcode it.
