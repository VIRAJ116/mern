import {
  getAllToppings,
  createTopping,
  updateTopping,
  deleteTopping,
} from '@/services/topping.service.ts'
import { NextFunction, Request, Response } from 'express'

/**
 * Get all toppings (public)
 * GET /toppings
 */
export const getToppings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { data, total } = await getAllToppings()
    res.status(200).json({ success: true, data, total })
  } catch (error) {
    next(error)
  }
}

/**
 * Create a new topping (admin only)
 * POST /admin/toppings
 */
export const addTopping = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await createTopping(req.body)
    if (!result.success) {
      const statusCode = result.error === 'Missing required fields' ? 400 : 500
      res.status(statusCode).json({ success: false, error: result.error })
      return
    }
    res.status(201).json({ success: true, data: result.topping, message: 'Topping created successfully' })
  } catch (error) {
    next(error)
  }
}

/**
 * Update a topping (admin only)
 * PATCH /admin/toppings/:id
 */
export const updateToppingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const result = await updateTopping(id, req.body)
    if (!result.success) {
      const statusCode = result.error === 'Topping not found' ? 404 : 500
      res.status(statusCode).json({ success: false, error: result.error })
      return
    }
    res.status(200).json({ success: true, data: result.topping, message: 'Topping updated successfully' })
  } catch (error) {
    next(error)
  }
}

/**
 * Soft-delete a topping (admin only)
 * DELETE /admin/toppings/:id
 */
export const removeTopping = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const result = await deleteTopping(id)
    if (!result.success) {
      const statusCode = result.error === 'Topping not found' ? 404 : 500
      res.status(statusCode).json({ success: false, error: result.error })
      return
    }
    res.status(200).json({ success: true, message: 'Topping deleted successfully' })
  } catch (error) {
    next(error)
  }
}
