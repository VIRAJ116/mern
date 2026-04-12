import { db } from '@/db/index.ts'
import { pizzas } from '@/db/schema.ts'
import {
  AddPizzaRequest,
  AddPizzaResult,
  DeletePizzaResult,
  PizzaListResult,
  PizzaResponse,
} from '@/types/pizz.types.ts'
import { and, count, eq, isNull } from 'drizzle-orm'
import { nowMysql } from '@/utils/date.ts'

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
      avgRating: Number(createdPizza.avgRating || 0),
      ratingCount: Number(createdPizza.ratingCount || 0),
      createdAt: createdPizza.createdAt,
      updatedAt: createdPizza.updatedAt ?? undefined,
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

export const deletePizza = async (id: string): Promise<DeletePizzaResult> => {
  try {
    const existing = await db.query.pizzas.findFirst({
      where: (p, { eq, isNull }) => and(eq(p.id, id), isNull(p.deletedAt)),
    })
    if (!existing) {
      return { success: false, error: 'Pizza not found' }
    }
    await db
      .update(pizzas)
      .set({
        deletedAt: nowMysql(),
      })
      .where(eq(pizzas.id, id))
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Something went wrong' }
  }
}

export const getAllPizzas = async (): Promise<PizzaListResult> => {
  try {
    const [rows, [{ total }]] = await Promise.all([
      db.query.pizzas.findMany({
        where: (p, { isNull }) => isNull(p.deletedAt),
      }),
      db
        .select({ total: count() })
        .from(pizzas)
        .where(isNull(pizzas.deletedAt)),
    ])

    const data = rows.map((pizza) => ({
      id: pizza.id,
      name: pizza.name,
      description: pizza.description ?? undefined,
      price: Number(pizza.price),
      category: pizza.category,
      tags: JSON.parse(pizza.tags || '[]'),
      imageUrl: pizza.imageUrl,
      avgRating: Number(pizza.avgRating || 0),
      ratingCount: Number(pizza.ratingCount || 0),
      createdAt: pizza.createdAt,
      updatedAt: pizza.updatedAt ?? undefined,
    }))

    return { data, total }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to retrieve pizzas')
  }
}

export const getPizzaById = async (id: string): Promise<AddPizzaResult> => {
  try {
    const pizza = await db.query.pizzas.findFirst({
      where: (p, { eq, isNull }) => and(eq(p.id, id), isNull(p.deletedAt)),
    })
    if (!pizza) {
      return { success: false, error: 'Pizza not found' }
    }
    return {
      success: true,
      pizza: {
        id: pizza.id,
        name: pizza.name,
        description: pizza.description ?? undefined,
        price: Number(pizza.price),
        category: pizza.category,
        tags: JSON.parse(pizza.tags || '[]'),
        imageUrl: pizza.imageUrl,
        avgRating: Number(pizza.avgRating || 0),
        ratingCount: Number(pizza.ratingCount || 0),
        createdAt: pizza.createdAt,
        updatedAt: pizza.updatedAt ?? undefined,
      },
    }
  } catch (error: any) {
    return { success: false, error: error.message || 'Something went wrong' }
  }
}

export const editPizza = async (
  id: string,
  pizzaData: AddPizzaRequest
): Promise<AddPizzaResult> => {
  try {
    const existing = await db.query.pizzas.findFirst({
      where: (p, { eq, isNull }) => and(eq(p.id, id), isNull(p.deletedAt)),
    })
    if (!existing) {
      return { success: false, error: 'Pizza not found' }
    }
    await db
      .update(pizzas)
      .set({
        name: pizzaData.name,
        description: pizzaData.description,
        price: pizzaData.price.toString(),
        category: pizzaData.category,
        tags: JSON.stringify(pizzaData.tags || []),
        imageUrl: pizzaData.imageUrl,
        updatedAt: nowMysql(),
      })
      .where(eq(pizzas.id, id))
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Something went wrong' }
  }
}

export const getDistinctCategories = async (): Promise<
  { _id: string; name: string }[]
> => {
  const rows = await db
    .selectDistinct({ category: pizzas.category })
    .from(pizzas)
    .where(isNull(pizzas.deletedAt))

  return rows.map((row) => ({
    _id: row.category,
    name: row.category.charAt(0).toUpperCase() + row.category.slice(1),
  }))
}
