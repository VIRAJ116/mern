import { db } from '@/db/index.ts'
import { orders, pizzas, users } from '@/db/schema.ts'
import { and, count, desc, eq, gte, isNull, lt, sql } from 'drizzle-orm'
import { log } from '@/utils/logger.ts'

const dayMs = 24 * 60 * 60 * 1000

const toMysqlDatetime = (date: Date) =>
  date.toISOString().slice(0, 19).replace('T', ' ')

const trend = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return Number((((current - previous) / previous) * 100).toFixed(1))
}

interface DateRange {
  start: string
  end: string
}

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

const countOrders = async (range: DateRange) => {
  const [row] = await db
    .select({ total: count() })
    .from(orders)
    .where(
      and(gte(orders.createdAt, range.start), lt(orders.createdAt, range.end))
    )
  return Number(row?.total || 0)
}

const countUsers = async (range: DateRange) => {
  const [row] = await db
    .select({ total: count() })
    .from(users)
    .where(
      and(gte(users.createdAt, range.start), lt(users.createdAt, range.end))
    )
  return Number(row?.total || 0)
}

const countPizzas = async (range: DateRange) => {
  const [row] = await db
    .select({ total: count() })
    .from(pizzas)
    .where(
      and(
        gte(pizzas.createdAt, range.start),
        lt(pizzas.createdAt, range.end),
        isNull(pizzas.deletedAt)
      )
    )
  return Number(row?.total || 0)
}

export const getDashboardOverviewService = async () => {
  try {
    const now = new Date()
    const last30Start = toMysqlDatetime(new Date(now.getTime() - 30 * dayMs))
    const prev30Start = toMysqlDatetime(new Date(now.getTime() - 60 * dayMs))
    const nowStr = toMysqlDatetime(now)

    const currentRange: DateRange = { start: last30Start, end: nowStr }
    const previousRange: DateRange = { start: prev30Start, end: last30Start }

    // Totals (all-time)
    const [ordersTotalRow] = await db
      .select({ total: count() })
      .from(orders)
    const [usersTotalRow] = await db
      .select({ total: count() })
      .from(users)
    const [pizzasTotalRow] = await db
      .select({ total: count() })
      .from(pizzas)
      .where(isNull(pizzas.deletedAt))
    const [revenueTotalRow] = await db
      .select({
        total: sql<string | null>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      })
      .from(orders)
      .where(eq(orders.paymentStatus, 'completed'))

    const totalOrders = Number(ordersTotalRow?.total || 0)
    const totalUsers = Number(usersTotalRow?.total || 0)
    const totalPizzas = Number(pizzasTotalRow?.total || 0)
    const totalRevenue = Number(revenueTotalRow?.total || 0)

    // Trends: last 30d vs prior 30d
    const [
      ordersCurrent,
      ordersPrevious,
      revenueCurrent,
      revenuePrevious,
      usersCurrent,
      usersPrevious,
      pizzasCurrent,
      pizzasPrevious,
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

    // Chart data: last 7 days, count of orders per day
    const sevenDaysAgo = new Date(now)
    sevenDaysAgo.setHours(0, 0, 0, 0)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

    const chartRows = await db
      .select({
        day: sql<string>`DATE(${orders.createdAt})`,
        orders: count(),
      })
      .from(orders)
      .where(gte(orders.createdAt, toMysqlDatetime(sevenDaysAgo)))
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`)

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

    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(sevenDaysAgo)
      d.setDate(sevenDaysAgo.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      return {
        name: dayLabels[d.getDay()],
        orders: chartMap.get(key) || 0,
      }
    })

    // Recent orders: latest 5
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

    const recentOrders = recentRows.map((r) => ({
      _id: r.id,
      customer: { name: r.customerName || 'Unknown' },
      total: Number(r.total),
      status: r.status,
      createdAt: r.createdAt,
    }))

    return {
      success: true as const,
      data: {
        stats: {
          totalOrders,
          totalRevenue,
          totalPizzas,
          totalUsers,
          ordersTrend: trend(ordersCurrent, ordersPrevious),
          revenueTrend: trend(revenueCurrent, revenuePrevious),
          pizzasTrend: trend(pizzasCurrent, pizzasPrevious),
          usersTrend: trend(usersCurrent, usersPrevious),
        },
        chartData,
        recentOrders,
      },
    }
  } catch (error) {
    log.error('Error fetching admin dashboard', { error })
    return {
      success: false as const,
      error: 'Failed to load dashboard',
    }
  }
}
