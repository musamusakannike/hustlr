# Hustlr — Monorepo

This is a **Turborepo monorepo** containing three separate applications that work together:

| App | Tech | URL |
|---|---|---|
| `apps/frontend` | Next.js 16 + Tailwind CSS | http://localhost:3000 |
| `apps/admin` | Next.js 16 + Tailwind CSS | http://localhost:3001 |
| `apps/server` | Node.js + Express + TypeScript | http://localhost:5000 |

---

## Prerequisites

Make sure you have these installed before you start:

- [Node.js](https://nodejs.org/) v18 or later
- [pnpm](https://pnpm.io/) — install it with: `npm install -g pnpm`
- [MongoDB](https://www.mongodb.com/) running locally, or a connection URI from [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)

---

## 1. Clone & Install

```bash
# Clone the repo
git clone <your-repo-url>
cd hustlr

# Install all dependencies for the entire monorepo
npm install
```

> **Note:** The `frontend` and `admin` apps have their own `pnpm` lockfiles. If you want to install their dependencies individually, `cd` into each app and run `pnpm install`.

---

## 2. Set Up Environment Variables

Copy the example env file and fill in your values:

```bash
cp .env.example apps/server/.env
```

Open `apps/server/.env` and update the following at minimum:

```env
MONGODB_URI=mongodb://localhost:27017/hustlr   # Your MongoDB connection string
JWT_SECRET=replace_this_with_a_long_random_string
```

Everything else (R2, Firebase, Email) is optional until you need those features.

---

## 3. Run Everything at Once

From the **root** of the project, run:

```bash
npm run dev
```

This uses **Turborepo** to start all three apps in parallel. You'll see their logs combined in one terminal.

---

## 4. Run Apps Individually

If you prefer to run just one app at a time, open separate terminals:

```bash
# Terminal 1 — Backend API server (port 5000)
cd apps/server
npm run dev

# Terminal 2 — Frontend client (port 3000)
cd apps/frontend
pnpm dev

# Terminal 3 — Admin dashboard (port 3001)
cd apps/admin
pnpm dev
```

---

## 5. Build for Production

```bash
# Build all apps at once
npm run build
```

Or build individually:

```bash
# Build only the frontend
cd apps/frontend && pnpm build

# Build only the server
cd apps/server && npm run build
```

---

## Project Structure

```
hustlr/
├── apps/
│   ├── frontend/          # Customer-facing Next.js app
│   │   └── src/app/       # Pages and layouts
│   ├── admin/             # Admin dashboard Next.js app
│   │   └── src/app/       # Pages and layouts
│   └── server/            # Express API server
│       └── src/
│           ├── index.ts       # App entry point
│           ├── config/        # DB, R2, Firebase, Mail setup
│           ├── middleware/    # Auth (JWT), Validation (Joi), Upload (Multer)
│           └── routes/        # API route handlers
├── package.json           # Root workspace config
├── turbo.json             # Turborepo task pipelines
├── .env.example           # Template for environment variables
└── README.md              # This file
```

---

## Backend API Endpoints (Quick Reference)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Check if the server is running |
| `POST` | `/api/auth/register` | Register a user (email + password) |
| `GET` | `/api/protected` | Example JWT-protected route |
| `POST` | `/api/upload` | Upload a file to Cloudflare R2 |

---

## Useful Commands

```bash
npm run dev        # Start all apps in development mode
npm run build      # Build all apps for production
npm run lint       # Lint all apps
```
