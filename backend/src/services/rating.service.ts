import { db } from '@/db/index.ts'
import { pizzas, ratings } from '@/db/schema.ts'
import { AddRatingRequest, RatePizzaResult } from '@/types/ratings.types.ts'
import { and, eq } from 'drizzle-orm'

export const ratePizza = async (ratingData: AddRatingRequest): Promise<RatePizzaResult> => {
  const { userId, pizzaId, newRating } = ratingData
  if (newRating > 5 || newRating < 1) {
    return {
      success: false,
      error: 'Rating must be between 1 and 5',
    }
  }
  return await db.transaction(async (tx) => {
    // check existing rating
    const existing = await tx.query.ratings.findFirst({
      where: and(eq(ratings.pizzaId, pizzaId), eq(ratings.userId, userId)),
    })
    // get pizza
    const pizza = await tx.query.pizzas.findFirst({
      where: eq(pizzas.id, pizzaId),
    })
    if (!pizza) {
      return {
        success: false,
        error: 'Pizza not found',
      }
    }
    let avg = Number(pizza.avgRating || 0)
    let count = Number(pizza.ratingCount || 0)
    if (!existing) {
      const newAvg = (avg * count + newRating) / count + 1
      await tx.insert(ratings).values({
        userId,
        pizzaId,
        rating: newRating.toString(),
      })
      await tx
        .update(pizzas)
        .set({
          avgRating: newAvg.toFixed(2),
          ratingCount: (count + 1).toString(),
        })
        .where(eq(pizzas.id, pizzaId))

      return {
        success: true,
        avgRating: newAvg,
        ratingCount: count + 1,
      }
    } else {
      const oldRating = Number(existing.rating)
      const newAvg = (avg * count - oldRating + newRating) / count
      await tx
        .update(ratings)
        .set({ rating: newRating.toString() })
        .where(eq(ratings.id, existing.id))
      await tx
        .update(pizzas)
        .set({
          avgRating: newAvg.toFixed(2),
        })
        .where(eq(pizzas.id, pizzaId))
      return {
        success: true,
        avgRating: newAvg,
        ratingCount: count,
      }
    }
  })
}
