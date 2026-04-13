import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/services/category.service.ts'
import { NextFunction, Request, Response } from 'express'

/**
 * Get all categories (public)
 * GET /categories
 */
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { data, total } = await getAllCategories()
    res.status(200).json({ success: true, data, total })
  } catch (error) {
    next(error)
  }
}

/**
 * Create a category (admin)
 * POST /admin/categories
 */
export const addCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await createCategory(req.body)
    if (!result.success) {
      const statusCode = result.error === 'Name is required' ? 400
        : result.error?.includes('already exists') ? 409 : 500
      res.status(statusCode).json({ success: false, error: result.error })
      return
    }
    res.status(201).json({ success: true, data: result.category, message: 'Category created successfully' })
  } catch (error) {
    next(error)
  }
}

/**
 * Update a category (admin)
 * PATCH /admin/categories/:id
 */
export const updateCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const result = await updateCategory(id, req.body)
    if (!result.success) {
      const statusCode = result.error === 'Category not found' ? 404 : 500
      res.status(statusCode).json({ success: false, error: result.error })
      return
    }
    res.status(200).json({ success: true, data: result.category, message: 'Category updated successfully' })
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a category (admin)
 * DELETE /admin/categories/:id
 */
export const removeCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const result = await deleteCategory(id)
    if (!result.success) {
      const statusCode = result.error === 'Category not found' ? 404 : 500
      res.status(statusCode).json({ success: false, error: result.error })
      return
    }
    res.status(200).json({ success: true, message: 'Category deleted successfully' })
  } catch (error) {
    next(error)
  }
}
