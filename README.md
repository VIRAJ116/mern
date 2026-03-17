# 🍕 PieRush — Pizza Ordering E-Commerce App

A full-stack MERN pizza ordering platform where customers can browse pizzas, customize them (size, crust, toppings), manage a cart, checkout, and track orders — all with a slick, modern UI.

---

## 📁 Project Structure

```
mern/
├── frontend/          # React + Vite (customer-facing UI)
└── backend/           # Express + Drizzle ORM (REST API)
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v20+
- PostgreSQL (or your configured DB)

### Frontend

```bash
cd frontend
npm install
npm run dev           # starts at http://localhost:5173
```

### Backend

```bash
cd backend
cp .env.example .env  # fill in your DB credentials and JWT secret
npm install
npm run dev           # starts at http://localhost:3000
```

---

## 🖥️ Frontend — Tech Stack

| Tool | Purpose |
|---|---|
| React 19 + Vite | UI framework & build tool |
| TailwindCSS v4 + shadcn/ui | Styling & component primitives |
| React Router v7 | Client-side routing |
| TanStack Query | Server state (data fetching, caching) |
| Zustand | Client state (cart management, persisted to localStorage) |
| React Hook Form + Zod v4 | Form validation |
| Axios | HTTP client (`withCredentials: true` for cookie auth) |
| Sonner | Toast notifications |

---

## 🗺️ Frontend Pages & Routes

| Route | Page | Auth Required |
|---|---|---|
| `/` | Home (hero, featured pizzas, how-it-works) | No |
| `/menu` | Pizza menu listing with category filter + search | No |
| `/menu/:id` | Pizza customizer (size, crust, toppings, qty) | No |
| `/cart` | Shopping cart with quantity controls | No |
| `/checkout` | Delivery address form + payment selection | ✅ Yes |
| `/order-confirmation` | Order success + status tracker | ✅ Yes |
| `/orders` | Order history list | ✅ Yes |
| `/orders/:id` | Order detail with step-by-step status tracker | ✅ Yes |
| `/profile` | View & edit user profile | ✅ Yes |
| `/login` | Login form | No (redirect if logged in) |
| `/register` | Registration form | No (redirect if logged in) |

---

## 🔐 Auth Flow

Authentication uses **HTTP-only cookies + JWT** (handled by the backend). The frontend never stores tokens in localStorage.

```
┌──────────────────────────────────────────────────────────┐
│                     AUTH FLOW                            │
│                                                          │
│  1. User visits /login → fills email + password          │
│  2. POST /api/auth/login → backend sets httpOnly cookie  │
│  3. AuthProvider calls GET /api/auth/validate-me          │
│     on every app load (via React Query['me'])            │
│  4. If cookie valid → user object returned → isAuthenticated = true │
│  5. If cookie invalid/missing → isAuthenticated = false  │
│     → ProtectedRoute redirects to /login                 │
│  6. POST /api/auth/logout → clears cookie                │
│     → React Query cache cleared → redirected to /login  │
└──────────────────────────────────────────────────────────┘
```

### Key auth files:
- **`src/context/auth-provider.jsx`** — calls `/api/auth/validate-me` on load, provides `user`, `isAuthenticated`, `isLoading`
- **`src/context/auth-context.jsx`** — creates the context / `useAuth()` hook
- **`src/routes/protected-route.jsx`** — redirects unauthenticated users to `/login`
- **`src/routes/public-route.jsx`** — redirects logged-in users away from `/login` and `/register`
- **`src/services/auth.js`** — `login`, `logout`, `validateMe` API calls

---

## 🛒 Cart Architecture

Cart state is managed by **Zustand** with `persist` middleware (saved to `localStorage`).

```
src/store/cart.store.js

State: items[] = { pizza, size, crust, toppings[], quantity, unitPrice, key }

Actions:
  addItem(item)           → Merges by key (pizza+size+crust+toppings combo)
  removeItem(key)         → Removes from list
  updateQty(key, qty)     → Updates quantity
  clearCart()             → Empties cart (called after successful order)

Key is auto-generated as:
  `${pizzaId}-${size}-${crust}-${toppingIds.sort().join(',')}`
```

---

## 🔌 Backend API Contracts

The frontend expects these REST endpoints from the backend. All responses should follow the shape `{ success: boolean, data: {...} }`.

### Auth
```
POST   /api/auth/login           { email, password } → sets cookie
POST   /api/auth/logout          → clears cookie
GET    /api/auth/validate-me     → { user: { _id, name, email, phone, role } }
POST   /api/auth/register        { name, email, phone, password }
PATCH  /api/auth/profile         { name, email, phone } (authenticated)
```

### Pizzas
```
GET    /api/pizzas               ?category=veg&search=marg → [pizza, ...]
GET    /api/pizzas/:id           → { pizza }
GET    /api/categories           → [{ _id, name }, ...]
GET    /api/toppings             → [{ _id, name, price, icon }, ...]
```

### Orders
```
POST   /api/orders               { items[], deliveryAddress, paymentMethod, subtotal, deliveryFee, total }
GET    /api/orders/me            → [order, ...]
GET    /api/orders/:id           → { order }
PATCH  /api/orders/:id/cancel    → { order }
```

### Pizza Schema (expected)
```json
{
  "_id": "string",
  "name": "string",
  "description": "string",
  "category": "veg | non-veg | special",
  "basePrice": 299,
  "image": "url | null",
  "tags": ["bestseller", "popular", "spicy"],
  "rating": 4.8,
  "totalRatings": 1240
}
```

### Order Schema (expected)
```json
{
  "_id": "ORD001",
  "status": "placed | preparing | out-for-delivery | delivered | cancelled",
  "items": [{ "pizzaId", "size", "crust", "toppings", "quantity", "unitPrice" }],
  "deliveryAddress": { "name", "phone", "street", "city", "pincode", "landmark" },
  "paymentMethod": "cod | online",
  "subtotal": 1257,
  "deliveryFee": 49,
  "total": 1306,
  "createdAt": "ISO date"
}
```

---

## 📦 Frontend File Structure

```
src/
├── components/
│   ├── ui/               # shadcn/ui components (button, input, card, etc.)
│   ├── navbar.jsx         # Top navigation with cart badge + user menu
│   ├── footer.jsx         # Site footer
│   └── cart-drawer.jsx    # Slide-in cart panel (Sheet)
├── context/
│   ├── auth-context.jsx   # AuthContext + useAuth hook
│   ├── auth-provider.jsx  # Fetches /validate-me, wraps app
│   └── theme-provider.jsx # Dark/light mode
├── layout/
│   └── CustomerLayout.jsx # Navbar + Outlet + Footer
├── pages/
│   ├── home/              # Landing page
│   ├── menu/
│   │   ├── index.jsx      # Pizza listing with filters
│   │   └── [id].jsx       # Pizza customizer
│   ├── cart/              # Cart page
│   ├── checkout/          # Checkout form
│   ├── order-confirmation/# Order placed success
│   ├── orders/
│   │   ├── index.jsx      # Order history
│   │   └── [id].jsx       # Order detail + status tracker
│   ├── profile/           # User profile
│   ├── register/          # Sign up
│   └── login/             # Sign in
├── routes/
│   ├── index.jsx          # Router definition
│   ├── protected-route.jsx
│   └── public-route.jsx
├── services/
│   ├── axios.js           # Axios instance (baseURL: localhost:3000)
│   ├── auth.js            # login, logout, validateMe
│   ├── pizza.js           # getAllPizzas, getPizzaById, getCategories, getToppings
│   ├── order.js           # createOrder, getMyOrders, getOrderById
│   └── user.js            # register, updateProfile, changePassword
├── store/
│   └── cart.store.js      # Zustand cart store (persisted)
└── const/
    ├── mock-data.js        # Mock pizzas/toppings for development
    └── route.js            # PUBLIC_ROUTES and PROTECTED_ROUTES arrays
```

---

## 🎨 Design System

- **Primary color**: Warm pizza-red (`oklch(0.58 0.22 25)`)
- **Font**: Plus Jakarta Sans (headings/body), fallback Poppins
- **Dark mode**: Fully supported via `next-themes`
- **Border radius**: 1.4rem (very rounded, friendly feel)
- **Components**: All built on Radix UI primitives via shadcn/ui

---

## 🔧 Development Notes

- **Mock data**: `src/const/mock-data.js` contains sample pizzas, toppings, sizes, and crusts. Replace with real API calls when backend is ready. Each service file already has the API call ready — just uncomment in the pages.
- **Swapping to real API**: In `src/pages/menu/index.jsx` and `src/pages/orders/index.jsx`, look for the commented `useQuery` blocks and swap out the mock constant with them.
- **Delivery fee**: Currently hardcoded as ₹49 in the frontend. Consider making it dynamic from the API.
