import { db } from '@/db/index.ts'
import { pizzas } from '@/db/schema.ts'
import {
  AddPizzaRequest,
  AddPizzaResult,
  PizzaResponse,
} from '@/types/pizz.types.ts'

export const createPizza = async (
  pizzaData: AddPizzaRequest
): Promise<AddPizzaResult> => {
  try {
    const { name, description, price, category, tags, imageUrl } = pizzaData
    if (!name || !price || !category || !imageUrl) {
      return {
        success: false,
        error: 'Missing required fields',
      }
    }

    const [newPizza] = await db
      .insert(pizzas)
      .values({
        name,
        description,
        price: price.toString(), // drizzle decimal expects string
        category,
        tags: JSON.stringify(tags || []),
        imageUrl,
      })
      .$returningId()

    const createdPizza = await db.query.pizzas.findFirst({
      where: (p, { eq }) => eq(p.id, newPizza.id),
    })
    if (!createdPizza) {
      return {
        success: false,
        error: 'Failed to create pizza',
      }
    }
    const response: PizzaResponse = {
      id: createdPizza.id,
      name: createdPizza.name,
      description: createdPizza.description ?? undefined,
      price: Number(createdPizza.price),
      category: createdPizza.category,
      tags: JSON.parse(createdPizza.tags || '[]'),
      imageUrl: createdPizza.imageUrl,
      createdAt: createdPizza.createdAt,
    }

    return {
      success: true,
      pizza: response,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Something went wrong',
    }
  }
}
