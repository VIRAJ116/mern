import { db } from '@/db/index.ts'
import { categories } from '@/db/schema.ts'
import {
  AddCategoryRequest,
  AddCategoryResult,
  CategoryListResult,
  CategoryResponse,
} from '@/types/category.types.ts'
import { and, count, eq, isNull } from 'drizzle-orm'
import { nowMysql } from '@/utils/date.ts'

/**
 * Generate a URL-safe slug from a name
 * e.g. "Non-Veg" → "non-veg", "Chef's Special" → "chef-s-special"
 */
const toSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const mapCategory = (c: typeof categories.$inferSelect): CategoryResponse => ({
  id: c.id,
  name: c.name,
  slug: c.slug,
  createdAt: c.createdAt,
  updatedAt: c.updatedAt ?? undefined,
})

/**
 * Get all categories (public)
 * GET /categories
 */
export const getAllCategories = async (): Promise<CategoryListResult> => {
  try {
    const [rows, [{ total }]] = await Promise.all([
      db.query.categories.findMany({
        where: (c, { isNull }) => isNull(c.deletedAt),
        orderBy: (c, { asc }) => [asc(c.name)],
      }),
      db.select({ total: count() }).from(categories).where(isNull(categories.deletedAt)),
    ])
    return { data: rows.map(mapCategory), total }
  } catch (error: any) {
    throw new Error(error.message || 'Failed to retrieve categories')
  }
}

/**
 * Create a category (admin only)
 * POST /admin/categories
 */
export const createCategory = async (
  data: AddCategoryRequest
): Promise<AddCategoryResult> => {
  try {
    const { name, slug: providedSlug } = data
    if (!name) return { success: false, error: 'Name is required' }

    const slug = providedSlug ? providedSlug.toLowerCase().trim() : toSlug(name)

    // Check slug uniqueness
    const existing = await db.query.categories.findFirst({
      where: (c, { eq, isNull }) => and(eq(c.slug, slug), isNull(c.deletedAt)),
    })
    if (existing) return { success: false, error: 'Category with this slug already exists' }

    const [{ id }] = await db.insert(categories).values({ name, slug }).$returningId()
    const created = await db.query.categories.findFirst({
      where: (c, { eq }) => eq(c.id, id),
    })
    if (!created) return { success: false, error: 'Failed to create category' }

    return { success: true, category: mapCategory(created) }
  } catch (error: any) {
    return { success: false, error: error.message || 'Something went wrong' }
  }
}

/**
 * Update a category (admin only)
 * PATCH /admin/categories/:id
 */
export const updateCategory = async (
  id: string,
  data: AddCategoryRequest
): Promise<AddCategoryResult> => {
  try {
    const existing = await db.query.categories.findFirst({
      where: (c, { eq, isNull }) => and(eq(c.id, id), isNull(c.deletedAt)),
    })
    if (!existing) return { success: false, error: 'Category not found' }

    const slug = data.slug ? data.slug.toLowerCase().trim() : toSlug(data.name)

    await db
      .update(categories)
      .set({ name: data.name, slug, updatedAt: nowMysql() })
      .where(eq(categories.id, id))

    const updated = await db.query.categories.findFirst({
      where: (c, { eq }) => eq(c.id, id),
    })
    return { success: true, category: mapCategory(updated!) }
  } catch (error: any) {
    return { success: false, error: error.message || 'Something went wrong' }
  }
}

/**
 * Soft-delete a category (admin only)
 * DELETE /admin/categories/:id
 */
export const deleteCategory = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const existing = await db.query.categories.findFirst({
      where: (c, { eq, isNull }) => and(eq(c.id, id), isNull(c.deletedAt)),
    })
    if (!existing) return { success: false, error: 'Category not found' }

    await db
      .update(categories)
      .set({ deletedAt: nowMysql() })
      .where(eq(categories.id, id))

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message || 'Something went wrong' }
  }
}
