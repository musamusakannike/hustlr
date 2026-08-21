# Hustlr Core Architecture & Backend Rules

## 1. Project Stack & Boundaries
* **Monorepo**:
  * `frontend/`: Next.js 16 App Router, React 19, Tailwind CSS v4.
  * `server/`: Node.js, Express, TypeScript, MongoDB (Mongoose), Paystack, Cloudflare R2, Firebase Auth.
  * Root docs: `architecture.md`, `prd.md`, `tasks.md`, `handoff.md`.

## 2. Backend Design Patterns (`server/`)
* **Layered Architecture**:
  * **Routes (`src/routes/`)**: Map HTTP methods and URL paths, apply middlewares and validation.
  * **Controllers (`src/controllers/`)**: Extract request params/body/query, invoke services, return response.
  * **Services (`src/services/`)**: Contain all business logic, database queries, external API calls.
  * **Models (`src/models/`)**: Mongoose schemas with strict TypeScript interfaces.
  * **Validations (`src/validations/`)**: Joi validation schemas applied via `validate` middleware.
* **Standard Response Envelope**:
  * Success: `ApiResponse(res, statusCode, message, data)` returning `{ success: true, message, data }`.
  * Errors: Handled via `ApiError(statusCode, message)` and caught by `errorHandler` middleware.
* **Multi-Tenancy**:
  * Use `resolveStore` middleware for storefront routes to dynamically identify tenant by subdomain/custom domain.
* **Escrow & Financial Safety**:
  * Paystack webhook handling must verify cryptographic signatures.
  * Escrow balances must update via atomic database transactions or wallet operations.
