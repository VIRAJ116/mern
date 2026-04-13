import {
  createPizza,
  deletePizza,
  editPizza,
  getAllPizzas,
  getPizzaById,
} from '@/services/pizza.service.ts'
import {
  AddPizzaRequest,
  PizzaListResult,
  PizzaResponse,
} from '@/types/pizz.types.ts'
import { ApiErrorResponse, ApiSuccessResponse } from '@/types/response.types.ts'
import { NextFunction, Request, Response } from 'express'

/**
 * Add a new pizza
 * POST /api/admin/pizzas
 */
export const addPizza = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pizzaData: AddPizzaRequest = req.body
    const result = await createPizza(pizzaData)
    if (!result.success) {
      const response: ApiErrorResponse = {
        success: false,
        error: result.error || 'Failed to add pizza',
      }
      const statusCode = result.error === 'Missing required fields' ? 400 : 500
      res.status(statusCode).json(response)
      return
    }
    const response: ApiSuccessResponse<PizzaResponse> = {
      success: true,
      data: result.pizza,
      message: 'Pizza added successfully',
    }
    res.status(201).json(response)
  } catch (error) {
    next(error)
  }
}

/**
 * Delete a pizza
 * DELETE /api/admin/pizzas/:id
 */
export const removePizza = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const result = await deletePizza(id)
    if (!result.success) {
      const response: ApiErrorResponse = {
        success: false,
        error: result.error || 'Failed to delete pizza',
      }
      const statusCode = result.error === 'Pizza not found' ? 404 : 500
      res.status(statusCode).json(response)
      return
    }
    res
      .status(200)
      .json({ success: true, message: 'Pizza deleted successfully' })
  } catch (error) {
    next(error)
  }
}

/**
 * Get a single pizza by ID
 * GET /api/admin/pizzas/:id
 */
export const getPizza = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const result = await getPizzaById(id)
    if (!result.success) {
      const statusCode = result.error === 'Pizza not found' ? 404 : 500
      res.status(statusCode).json({ success: false, error: result.error })
      return
    }
    const response: ApiSuccessResponse<PizzaResponse> = {
      success: true,
      data: result.pizza!,
    }
    res.status(200).json(response)
  } catch (error) {
    next(error)
  }
}

/**
 * Edit a pizza
 * PATCH /api/admin/pizzas/:id
 */
export const updatePizza = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params
    const pizzaData: AddPizzaRequest = req.body
    const result = await editPizza(id, pizzaData)
    if (!result.success) {
      const statusCode = result.error === 'Pizza not found' ? 404 : 500
      res.status(statusCode).json({ success: false, error: result.error })
      return
    }
    res
      .status(200)
      .json({ success: true, message: 'Pizza updated successfully' })
  } catch (error) {
    next(error)
  }
}

/**
 * Get all pizzas
 * GET /pizzas
 */
export const getPizzas = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { data, total } = await getAllPizzas()
    res.status(200).json({ success: true, data, total })
  } catch (error) {
    next(error)
  }
}

