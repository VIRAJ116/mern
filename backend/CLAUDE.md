# Backend — Pizza Ordering API

Express + TypeScript API for the pizza ordering platform. ESM modules, MySQL via Drizzle ORM, JWT auth with cookie-based sessions, dynamic RBAC.

## Stack

- Runtime: Node.js (ESM), TypeScript with `tsx` for dev
- Framework: Express 5
- DB: MySQL via `drizzle-orm` + `mysql2`; migrations in `drizzle/`
- Auth: `jsonwebtoken` + `cookie-parser`, `bcryptjs` for hashing
- Logging: Winston (see [src/utils/logger.ts](src/utils/logger.ts))
- Build: `tsup` (ESM output) → `dist/`

## Scripts

- `npm run dev` — watch mode (`tsx watch src/index.ts`)
- `npm run build` — bundle to `dist/` via tsup
- `npm start` — run built output
- `npm run db:generate` / `db:migrate` / `db:studio` — Drizzle Kit
- `npm run db:seed`, `db:seed-roles`, `db:seed-toppings`, `db:seed-categories` — seeders in [src/db/](src/db/)

## Architecture (MVC + Service layer)

Strict layering — controllers stay thin, business logic lives in services. See [ARCHITECTURE.md](ARCHITECTURE.md) for the full write-up.

```
src/
├── config/        # cors, database config
├── controllers/   # HTTP layer — parse req, call service, shape response
├── services/      # Business logic — all DB access happens here
├── routes/        # Endpoint definitions + middleware wiring
├── middleware/    # auth, permission, validation, logger, error
├── db/            # drizzle client, schema, seeders
├── types/         # shared types (Permission enum, DTOs)
├── utils/         # logger
└── index.ts       # app bootstrap
```

Path alias: `@/*` → `src/*` (configured in [tsconfig.json](tsconfig.json), imports use `.ts` extensions because `allowImportingTsExtensions` is on).

## Routing

Mounted in [src/index.ts](src/index.ts):
- `/` → public + customer routes from [src/routes/index.ts](src/routes/index.ts) (auth, users, pizzas, ratings, toppings, orders, categories)
- `/admin` → admin routes from [src/routes/admin.routes.ts](src/routes/admin.routes.ts) (dashboard, pizza/topping/category CRUD, orders, roles & permissions)

## Auth & RBAC

- `authenticate` middleware ([src/middleware/auth.middleware.ts](src/middleware/auth.middleware.ts)) verifies JWT from cookie and attaches `req.user`.
- `authorizePermission(Permission.X)` ([src/middleware/permission.middleware.ts](src/middleware/permission.middleware.ts)) checks the user's role permissions.
- Permissions are an enum in [src/types/permission.types.ts](src/types/permission.types.ts); roles and role↔permission mappings are **database-driven** (not hardcoded). Seed via `npm run db:seed-roles`. The legacy `role` column on `users` was dropped — role membership lives in join tables.

## Database

- Connection: [src/db/index.ts](src/db/index.ts), config via `DATABASE_URL`
- Schema: [src/db/schema.ts](src/db/schema.ts)
- Generated migrations: [drizzle/](drizzle/)
- Studio: `npm run db:studio`

## Environment

See [.env.example](.env.example). Required: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN` (comma-separated, no `*` because credentials are enabled), `PORT`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`.

## Conventions

- Imports use `@/...` alias with explicit `.ts` extension.
- Response shape: `{ success: boolean, data?, message? }` — see [src/types/response.types.ts](src/types/response.types.ts).
- Controllers do not call Drizzle directly; they call services.
- New CRUD area = add types → service → controller → route, then mount in [src/routes/index.ts](src/routes/index.ts) or [src/routes/admin.routes.ts](src/routes/admin.routes.ts).
- Log via `log` from [src/utils/logger.ts](src/utils/logger.ts), not `console.*`.
