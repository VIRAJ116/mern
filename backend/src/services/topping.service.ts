import { db } from '@/db/index.ts'
import { toppings } from '@/db/schema.ts'
import {
  AddToppingRequest,
  AddToppingResult,
  ToppingListResult,
  ToppingResponse,
} from '@/types/topping.types.ts'
import { and, count, eq, isNull } from 'drizzle-orm'
import { nowMysql } from '@/utils/date.ts'

/**
 * Map a raw DB row to ToppingResponse shape
 */
const mapTopping = (t: typeof toppings.$inferSelect): ToppingResponse => ({
  id: t.id,
  name: t.name,
  price: Number(t.price),
  icon: t.icon,
  isAvailable: Boolean(t.isAvailable),
  createdAt: t.createdAt,
  updatedAt: t.updatedAt ?? undefined,
})

/**
 * Get all available toppings (soft-deleted excluded)
 * GET /toppings  (public)
 */
export const getAllToppings = async (): Promise<ToppingListResult> => {
  try {
    const [rows, [{ total }]] = await Promise.all([
      db.query.toppings.findMany({
        where: (t, { isNull }) => isNull(t.deletedAt),
        orderBy: (t, { asc }) => [asc(t.name)],
      }),
      db.select({ total: count() }).from(toppings).where(isNull(toppings.deletedAt)),
    ])
    return { data: rows.map(mapTopping), total }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to retrieve toppings')
  }
}

/**
 * Create a new topping
 * POST /admin/toppings
 */
export const createTopping = async (
  data: AddToppingRequest
): Promise<AddToppingResult> => {
  try {
    const { name, price, icon = '🍕', isAvailable = true } = data
    if (!name || price === undefined || price === null) {
      return { success: false, error: 'Missing required fields' }
    }

    const [{ id }] = await db
      .insert(toppings)
      .values({
        name,
        price: price.toString(),
        icon,
        isAvailable,
      })
      .$returningId()

    const created = await db.query.toppings.findFirst({
      where: (t, { eq }) => eq(t.id, id),
    })
    if (!created) return { success: false, error: 'Failed to create topping' }

    return { success: true, topping: mapTopping(created) }
  } catch (error: any) {
    return { success: false, error: error.message || 'Something went wrong' }
  }
}

/**
 * Update an existing topping
 * PATCH /admin/toppings/:id
 */
export const updateTopping = async (
  id: string,
  data: Partial<AddToppingRequest>
): Promise<AddToppingResult> => {
  try {
    const existing = await db.query.toppings.findFirst({
      where: (t, { eq, isNull }) => and(eq(t.id, id), isNull(t.deletedAt)),
    })
    if (!existing) return { success: false, error: 'Topping not found' }

    await db
      .update(toppings)
      .set({
        ...(data.name !== undefined && { name: data.name }),
        ...(data.price !== undefined && { price: data.price.toString() }),
        ...(data.icon !== undefined && { icon: data.icon }),
        ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
        updatedAt: nowMysql(),
      })
      .where(eq(toppings.id, id))

    const updated = await db.query.toppings.findFirst({
      where: (t, { eq }) => eq(t.id, id),
    })

    return { success: true, topping: mapTopping(updated!) }
  } catch (error: any) {
    return { success: false, error: error.message || 'Something went wrong' }
  }
}

/**
 * Soft delete a topping
 * DELETE /admin/toppings/:id
 */
export const deleteTopping = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const existing = await db.query.toppings.findFirst({
      where: (t, { eq, isNull }) => and(eq(t.id, id), isNull(t.deletedAt)),
    })
    if (!existing) return { success: false, error: 'Topping not found' }

    await db
      .update(toppings)
      .set({ deletedAt: nowMysql() })
      .where(eq(toppings.id, id))

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Something went wrong' }
  }
}
