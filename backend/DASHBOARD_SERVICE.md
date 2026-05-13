# Dashboard Service — A Beginner's Walkthrough

This doc explains `src/services/dashboard.service.ts` line-by-line, so you can understand the *why* behind every piece. Read top to bottom — each section builds on the previous one.

---

## 1. The big picture

The admin dashboard page on the frontend needs three things in one API call:

1. **Stats cards** — total orders, revenue, pizzas, users, plus a % "trend" for each.
2. **Chart data** — number of orders per day for the last 7 days.
3. **Recent orders** — latest 5 orders with customer names.

Instead of making the frontend hit 3+ endpoints, we expose one endpoint (`GET /admin/dashboard`) that runs all the queries on the server and returns a single JSON blob.

The flow:

```
Browser → GET /admin/dashboard
          → authenticate middleware (checks JWT)
          → authorizePermission(REPORT_VIEW) middleware
          → getDashboardOverview controller
          → getDashboardOverviewService   ← this file
          → Drizzle ORM → MySQL → results
          ← JSON response
```

---

## 2. Imports

```ts
import { db } from '@/db/index.ts'
import { orders, pizzas, users } from '@/db/schema.ts'
import { and, count, desc, eq, gte, isNull, lt, sql } from 'drizzle-orm'
import { log } from '@/utils/logger.ts'
```

- `db` — the Drizzle database instance, used to run queries.
- `orders`, `pizzas`, `users` — table definitions from the schema. Think of them as JavaScript objects that describe MySQL tables. You use them in queries like `orders.totalAmount` to reference columns.
- `and`, `eq`, `gte`, `lt`, `isNull` — query operators. They build the SQL `WHERE` clause:
  - `eq(col, val)` → `col = val`
  - `gte(col, val)` → `col >= val`
  - `lt(col, val)` → `col < val`
  - `isNull(col)` → `col IS NULL`
  - `and(...)` → joins multiple conditions with `AND`
- `count` — aggregate function for `COUNT(*)`.
- `desc` — order by descending.
- `sql` — a "template tag" that lets you drop into raw SQL when Drizzle's helpers aren't enough (we use this for `SUM` and `DATE()`).
- `log` — our wrapper around console.log with nicer formatting.

---

## 3. Helpers

### `dayMs`
```ts
const dayMs = 24 * 60 * 60 * 1000
```
Milliseconds in a day. Used to subtract days from a Date.

### `toMysqlDatetime`
```ts
const toMysqlDatetime = (date: Date) =>
  date.toISOString().slice(0, 19).replace('T', ' ')
```
MySQL `TIMESTAMP` columns expect a string like `'2026-05-13 14:30:00'`. JavaScript's `Date.toISOString()` gives `'2026-05-13T14:30:00.123Z'`. We chop off the milliseconds + `Z`, and swap the `T` for a space. Now it's a string MySQL accepts.

> **Why a string and not a Date object?** Our schema declares timestamps with `mode: 'string'`, meaning Drizzle treats them as strings throughout — so we feed it strings.

### `trend`
```ts
const trend = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return Number((((current - previous) / previous) * 100).toFixed(1))
}
```
Computes percentage change: `((current - previous) / previous) * 100`.

- If `previous` is 0 we can't divide by zero, so we say "100% if current is anything, 0% if both are zero".
- `.toFixed(1)` keeps it to 1 decimal place (`12.5` not `12.4999987`); `Number()` converts the string back to a number.

### `DateRange` interface
```ts
interface DateRange {
  start: string
  end: string
}
```
A range of time, as two MySQL datetime strings. Used to pass "last 30 days" or "30–60 days ago" into the helpers below.

---

## 4. Small reusable query helpers

These four functions each run a tiny aggregate query for a given date range. They exist so the main service doesn't repeat itself 8 times.

### `sumRevenue(range)`
```ts
const sumRevenue = async (range: DateRange) => {
  const [row] = await db
    .select({
      total: sql<string | null>`COALESCE(SUM(${orders.totalAmount}), 0)`,
    })
    .from(orders)
    .where(
      and(
        gte(orders.createdAt, range.start),
        lt(orders.createdAt, range.end),
        eq(orders.paymentStatus, 'completed')
      )
    )
  return Number(row?.total || 0)
}
```

Step by step:

1. `db.select({...}).from(orders)` — start a SELECT query on the `orders` table.
2. `sql\`COALESCE(SUM(${orders.totalAmount}), 0)\`` — the raw-SQL escape hatch:
   - `SUM(total_amount)` adds up the column.
   - `COALESCE(x, 0)` returns `0` when `SUM` is `NULL` (which happens when no rows match).
   - The `${orders.totalAmount}` interpolates the *column reference*, not a string — Drizzle parameterizes this safely (no SQL injection).
3. `.where(and(...))` — three conditions joined with AND:
   - `gte(orders.createdAt, range.start)` → `created_at >= range.start`
   - `lt(orders.createdAt, range.end)` → `created_at < range.end`
   - `eq(orders.paymentStatus, 'completed')` → only count paid orders
4. `const [row] = await ...` — Drizzle returns an array of rows. For aggregates we always get one row; we destructure it as `row`.
5. `Number(row?.total || 0)` — `row.total` comes back as a string because of the `decimal` column. Convert to a JS number.

> **`?.` and `||`** — `row?.total` safely accesses `total` even if `row` is `undefined`. `|| 0` falls back to `0` if `total` is `null` / `undefined` / `0` / `''`.

### `countOrders`, `countUsers`, `countPizzas`
Same shape as `sumRevenue` but they use `count()` instead of `SUM`. `countPizzas` adds `isNull(pizzas.deletedAt)` to exclude soft-deleted pizzas — your schema marks deleted rows with a `deletedAt` timestamp rather than removing them.

---

## 5. The main service — `getDashboardOverviewService`

### 5a. Compute date boundaries

```ts
const now = new Date()
const last30Start = toMysqlDatetime(new Date(now.getTime() - 30 * dayMs))
const prev30Start = toMysqlDatetime(new Date(now.getTime() - 60 * dayMs))
const nowStr = toMysqlDatetime(now)

const currentRange: DateRange = { start: last30Start, end: nowStr }
const previousRange: DateRange = { start: prev30Start, end: last30Start }
```

We compute four moments in time:

```
prev30Start ─────── last30Start ─────── nowStr
  (60 days ago)    (30 days ago)         (now)
   └── previous ──┘└── current ──────────┘
```

`currentRange` = the last 30 days. `previousRange` = the 30 days before that. The trend % compares these two.

### 5b. All-time totals

```ts
const [ordersTotalRow] = await db.select({ total: count() }).from(orders)
const [usersTotalRow]  = await db.select({ total: count() }).from(users)
const [pizzasTotalRow] = await db
  .select({ total: count() })
  .from(pizzas)
  .where(isNull(pizzas.deletedAt))
const [revenueTotalRow] = await db
  .select({ total: sql<string | null>`COALESCE(SUM(${orders.totalAmount}), 0)` })
  .from(orders)
  .where(eq(orders.paymentStatus, 'completed'))
```

These four queries get the **all-time** numbers for the stat cards — not the 30-day window. They each:
- Run a single aggregate.
- Have no `gte/lt` date filters.
- Pizzas filter out soft-deleted; revenue filters to `paymentStatus = 'completed'`.

We `await` them one at a time here for readability. They could be parallelized with `Promise.all`, but on this scale the difference is negligible.

### 5c. Trend numbers

```ts
const [
  ordersCurrent,  ordersPrevious,
  revenueCurrent, revenuePrevious,
  usersCurrent,   usersPrevious,
  pizzasCurrent,  pizzasPrevious,
] = await Promise.all([
  countOrders(currentRange),
  countOrders(previousRange),
  sumRevenue(currentRange),
  sumRevenue(previousRange),
  countUsers(currentRange),
  countUsers(previousRange),
  countPizzas(currentRange),
  countPizzas(previousRange),
])
```

Eight queries run **in parallel** with `Promise.all`. Each returns a number; we destructure them into 8 named variables. Later we feed pairs into `trend(current, previous)`.

> **Why parallel here but not above?** All-time totals and trends are independent — we don't need totals to compute trends. Running them in parallel is faster. Inside `Promise.all`, all the awaited promises start immediately and we wait for all to finish.

### 5d. Chart data — orders per day, last 7 days

```ts
const sevenDaysAgo = new Date(now)
sevenDaysAgo.setHours(0, 0, 0, 0)
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
```

We want **today plus the previous 6 days** = 7 days total. So we:
1. Clone `now`.
2. Zero out the time component (we want the start of the day).
3. Subtract 6 days.

```ts
const chartRows = await db
  .select({
    day: sql<string>`DATE(${orders.createdAt})`,
    orders: count(),
  })
  .from(orders)
  .where(gte(orders.createdAt, toMysqlDatetime(sevenDaysAgo)))
  .groupBy(sql`DATE(${orders.createdAt})`)
  .orderBy(sql`DATE(${orders.createdAt})`)
```

This is the most interesting query:

- `DATE(created_at)` — MySQL function that strips the time, leaving just `'YYYY-MM-DD'`. So `'2026-05-13 14:30:00'` becomes `'2026-05-13'`.
- `groupBy(DATE(...))` — collapses all rows from the same calendar day into one group.
- `count()` — counts rows per group.
- `where(gte(...))` — only consider orders from the last 7 days.
- `orderBy(DATE(...))` — sort chronologically.

Result shape (example):
```
[
  { day: '2026-05-08', orders: 3 },
  { day: '2026-05-10', orders: 1 },
  { day: '2026-05-13', orders: 5 },
]
```

**Notice**: days with **zero orders are missing** from the result. That's a database thing — SQL can't return a group that has no rows. We'll fill the gaps next.

```ts
const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const chartMap = new Map<string, number>()
for (const row of chartRows) {
  const raw = row.day as unknown
  const key =
    raw instanceof Date
      ? raw.toISOString().slice(0, 10)
      : String(raw).slice(0, 10)
  chartMap.set(key, Number(row.orders))
}
```

Build a lookup map: `{ '2026-05-08' → 3, '2026-05-10' → 1, '2026-05-13' → 5 }`.

The `raw instanceof Date` branch handles a quirk: depending on the driver/version, the `DATE()` value might come back as a JS `Date` object or as a string. We normalize both into `'YYYY-MM-DD'`. The `as unknown` cast tells TypeScript "I know the declared type says string, but at runtime it might be either — let me check."

```ts
const chartData = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date(sevenDaysAgo)
  d.setDate(sevenDaysAgo.getDate() + i)
  const key = d.toISOString().slice(0, 10)
  return {
    name: dayLabels[d.getDay()],
    orders: chartMap.get(key) || 0,
  }
})
```

Build the final 7-element array:
- For each `i` from 0 to 6, walk one day forward starting at `sevenDaysAgo`.
- `d.getDay()` returns 0 for Sunday, 1 for Monday, etc. — we use it to pick the label.
- Look up that day in the map; default to 0 if missing.

Result:
```
[
  { name: 'Fri', orders: 0 },
  { name: 'Sat', orders: 3 },
  { name: 'Sun', orders: 0 },
  { name: 'Mon', orders: 1 },
  ...
]
```

This is exactly what Recharts on the frontend expects.

### 5e. Recent orders

```ts
const recentRows = await db
  .select({
    id: orders.id,
    total: orders.totalAmount,
    status: orders.status,
    createdAt: orders.createdAt,
    customerName: users.name,
  })
  .from(orders)
  .leftJoin(users, eq(orders.userId, users.id))
  .orderBy(desc(orders.createdAt))
  .limit(5)
```

- `.leftJoin(users, eq(orders.userId, users.id))` — for each order, also pull the matching user row. `leftJoin` (vs `innerJoin`) means: even if the user is missing/deleted, still return the order — `users.name` will just be `null`.
- `.orderBy(desc(orders.createdAt))` — newest first.
- `.limit(5)` — only 5 rows.

```ts
const recentOrders = recentRows.map((r) => ({
  _id: r.id,
  customer: { name: r.customerName || 'Unknown' },
  total: Number(r.total),
  status: r.status,
  createdAt: r.createdAt,
}))
```

Reshape into the structure the frontend wants:
- Rename `id` → `_id` (frontend uses Mongo-style names).
- Wrap the customer name in an object so the UI can later add `email`, `phone`, etc. without changing the shape.
- Convert the decimal string `'599.00'` to a number `599`.

### 5f. Return shape

```ts
return {
  success: true as const,
  data: {
    stats: {
      totalOrders, totalRevenue, totalPizzas, totalUsers,
      ordersTrend:  trend(ordersCurrent,  ordersPrevious),
      revenueTrend: trend(revenueCurrent, revenuePrevious),
      pizzasTrend:  trend(pizzasCurrent,  pizzasPrevious),
      usersTrend:   trend(usersCurrent,   usersPrevious),
    },
    chartData,
    recentOrders,
  },
}
```

`success: true as const` — the `as const` tells TypeScript "this is literally the value `true`, not just any boolean." That lets the caller use a "discriminated union" pattern: when `result.success === true` it knows `result.data` exists; when `false`, it knows `result.error` exists.

### 5g. Error path

```ts
} catch (error) {
  log.error('Error fetching admin dashboard', { error })
  return {
    success: false as const,
    error: 'Failed to load dashboard',
  }
}
```

Any thrown error (DB down, syntax error, network blip) is caught, logged with full detail, and converted into a clean `{ success: false, error: 'message' }` shape. The user-facing message is intentionally generic — we don't leak internal error details.

---

## 6. How the controller uses it

```ts
// dashboard.controller.ts
const result = await getDashboardOverviewService()
if (!result.success) {
  res.status(500).json({ success: false, error: result.error })
  return
}
res.status(200).json(result.data)
```

The controller's only job is to translate the service result into an HTTP response — service does the work, controller handles status codes and JSON serialization.

---

## 7. How the route protects it

```ts
// admin.routes.ts
router.get(
  '/dashboard',
  authenticate,
  authorizePermission(Permission.REPORT_VIEW),
  getDashboardOverview
)
```

Three middlewares run in order before the controller:

1. `authenticate` — reads the `Authorization: Bearer <token>` header, verifies the JWT, attaches the decoded user to `req.user`. Rejects 401 if missing/invalid.
2. `authorizePermission(REPORT_VIEW)` — checks that `req.user.permissions` includes `REPORT_VIEW`. Only `admin` and `super_admin` roles have this. Rejects 403 if not.
3. `getDashboardOverview` — the actual handler.

---

## 8. Things worth remembering

- **Strings in, strings out** for `decimal` and `timestamp` columns. Always `Number(...)` when you need math.
- **Use `Promise.all` for independent queries.** Sequential `await`s in a row block each other for no reason.
- **`sql\`\`` is the escape hatch.** Drizzle's `count`/`gte`/`eq` cover ~90% of needs; the rest (`SUM`, `DATE()`, window functions, custom expressions) use the `sql` tag — and column references inside `${}` are still safely parameterized.
- **Groups don't include zero-rows.** If you need a row per day even when no data, build the dense series in JS using a `Map` for lookup.
- **`success: true as const`** gives you typed branching at the call site — much nicer than checking `if (result.data)`.
- **Soft delete = always filter `deletedAt IS NULL`** unless you genuinely want the deleted rows.
