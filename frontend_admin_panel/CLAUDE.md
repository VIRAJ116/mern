# Frontend Admin Panel — Pizza Ordering Admin

Vite + React 19 SPA for staff/admins: dashboard, pizza/category/topping/order management, user & role administration.

## Stack

- React 19, `react-router` v7 (`BrowserRouter` + `<Routes>`)
- Server state: `@tanstack/react-query` (client in [src/lib/react-query](src/lib/react-query))
- Client state: `zustand`
- Forms: `react-hook-form` + `zod`
- UI: Tailwind v4 + shadcn-style primitives in [src/components/ui/](src/components/ui/) (Radix-based)
- Tables: `@tanstack/react-table` ([src/components/data-table.jsx](src/components/data-table.jsx))
- HTTP: `axios` with shared instance in [src/services/axios.js](src/services/axios.js)
- Notifications: `sonner` (`<Toaster />` mounted in [src/App.jsx](src/App.jsx))

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint (flat config in [eslint.config.js](eslint.config.js))
- `npm run preview` — preview built bundle

## Structure

```
src/
├── App.jsx           # QueryClient → ThemeProvider → BrowserRouter → AuthProvider → AppRoutes
├── main.jsx          # Entry
├── routes/           # AppRoutes + ProtectedRoute / PublicRoute
├── components/
│   ├── layout/       # AdminLayout (sidebar + topbar shell)
│   ├── ui/           # shadcn primitives
│   └── data-table.jsx
├── pages/            # dashboard, pizzas, categories, toppings, orders, users, roles, login
├── context/          # auth-provider, theme-provider
├── hooks/            # use-mobile, etc.
├── services/         # axios client + per-resource API wrappers
└── lib/              # react-query client, utils
```

Path alias: `@/*` → `./src/*` ([vite.config.js](vite.config.js) + [jsconfig.json](jsconfig.json)).

## Routing

Defined in [src/routes/index.jsx](src/routes/index.jsx):

- `PublicRoute` wraps `/login`
- `ProtectedRoute` wraps the rest, nested inside `AdminLayout`
- Routes: `/` (dashboard), `/pizzas`, `/pizzas/new`, `/pizzas/:id/edit`, `/categories`, `/toppings`, `/orders`, `/orders/:id`, `/users`, `/roles`

## Auth & permissions

- `AuthProvider` ([src/context/auth-provider](src/context/auth-provider)) loads the current user via the backend
- Token handling in [src/services/token-store.js](src/services/token-store.js); axios sends cookies
- Backend enforces RBAC per-endpoint (see backend's `Permission` enum). The admin UI should mirror those checks when conditionally rendering actions — fetch roles/permissions via [src/services/roles.js](src/services/roles.js).

## Data fetching

- All HTTP goes through [src/services/axios.js](src/services/axios.js) (baseURL from `VITE_API_URL`)
- Per-resource services: `auth.js`, `category.js`, `order.js`, `pizza.js`, `roles.js`, `topping.js`, `user.js`
- Admin endpoints live under the backend's `/admin` prefix

## Environment

[.env.sample](.env.sample):
- `VITE_API_URL` — backend base URL

## Conventions

- JavaScript (JSX), not TypeScript
- Use `@/...` alias for non-sibling imports
- New admin page: add folder under [src/pages/](src/pages/) with `index.jsx`, register in [src/routes/index.jsx](src/routes/index.jsx) inside the `ProtectedRoute` → `AdminLayout` subtree
- New resource: add a service in [src/services/](src/services/), wire up react-query hooks in the page, use `data-table.jsx` for list views
- Toasts via `sonner` (`toast.success(...)`)
- Mutations should `invalidateQueries` on success so list views refresh
