# Frontend — Customer-Facing Pizza Storefront

Vite + React 19 SPA for customers: browse menu, cart, checkout (Razorpay), order tracking, profile.

## Stack

- React 19 with the React Compiler (`babel-plugin-react-compiler` enabled in [vite.config.js](vite.config.js))
- Router: `react-router` v7 (data router, `createBrowserRouter`)
- Server state: `@tanstack/react-query`
- Client state: `zustand` (cart in [src/store/cart.store.js](src/store/cart.store.js))
- Forms: `react-hook-form` + `zod` via `@hookform/resolvers`
- UI: Tailwind v4 + shadcn-style primitives in [src/components/ui/](src/components/ui/), Radix under the hood
- Tables: `@tanstack/react-table`, drag-and-drop via `@dnd-kit/*`
- Maps: `leaflet` + `react-leaflet` (live order tracking)
- HTTP: `axios` with a shared instance in [src/services/axios.js](src/services/axios.js)
- Notifications: `sonner`

## Scripts

- `npm run dev` — Vite dev server (default port 5173)
- `npm run build` — production build
- `npm run lint` — ESLint (flat config in [eslint.config.js](eslint.config.js))
- `npm run preview` — preview built bundle

## Structure

```
src/
├── App.jsx           # Root: AuthProvider → ThemeProvider → <Outlet />
├── main.jsx          # Entry, mounts RouterProvider
├── routes/           # Router config + ProtectedRoute / PublicRoute
├── layout/           # CustomerLayout (navbar + footer)
├── pages/            # One folder per route: index.jsx, optional [id].jsx
├── components/       # Shared composites + ui/ (shadcn primitives) + common/
├── context/          # auth-provider, theme-provider
├── hooks/            # use-mobile, etc.
├── services/         # axios client + per-resource API wrappers
├── store/            # zustand stores
├── schema/           # zod schemas for forms
├── lib/              # utils (cn, etc.)
└── const/            # constants (route lists, etc.)
```

Path alias: `@/*` → `./src/*` ([vite.config.js](vite.config.js) + [jsconfig.json](jsconfig.json)).

## Routing

Defined in [src/routes/index.jsx](src/routes/index.jsx) using `createBrowserRouter`:

- `App` is the root; renders providers and `<Outlet />`
- `PublicRoute` wraps `/login`, `/register` (redirects authed users away)
- `CustomerLayout` wraps the shop pages (navbar + footer)
- `ProtectedRoute` gates `/checkout`, `/order-confirmation`, `/orders`, `/profile`
- Dynamic segments use Next-style `[id].jsx` filenames inside the page folder

## Auth

- `AuthProvider` ([src/context/auth-provider](src/context/auth-provider)) owns auth state
- Token handling in [src/services/token-store.js](src/services/token-store.js)
- Axios instance attaches credentials; backend issues HttpOnly cookies
- `useAuth()` exposes `{ isAuthenticated, isLoading, user, ... }`

## Data fetching

- All HTTP goes through [src/services/axios.js](src/services/axios.js) (baseURL from `VITE_API_URL`)
- Per-resource service files: `auth.js`, `order.js`, `pizza.js`, `user.js`
- Components call services inside `useQuery` / `useMutation` hooks

## Environment

[.env.sample](.env.sample):
- `VITE_API_URL` — backend base URL (e.g. `http://localhost:3000`)
- `VITE_RAZORPAY_KEY_ID` — Razorpay public key for checkout

## Conventions

- JavaScript (JSX), not TypeScript. No `.ts`/`.tsx` files.
- Use `@/...` alias; relative imports only for siblings.
- Tailwind v4 — class merging via `tailwind-merge` + `clsx` (`cn()` helper in [src/lib/](src/lib/)).
- React Compiler is enabled, so manual `useMemo`/`useCallback`/`memo` is usually unnecessary.
- New page: add folder under [src/pages/](src/pages/) with `index.jsx`, then register in [src/routes/index.jsx](src/routes/index.jsx) under the correct layout/guard.
- Toasts via `sonner` (`toast.success(...)`, etc.).
