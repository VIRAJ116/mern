import { createPizza, deletePizza, editPizza, getAllPizzas, getPizzaById } from '@/services/pizza.service.ts'
import { AddPizzaRequest, PizzaListResult, PizzaResponse } from '@/types/pizz.types.ts'
import { ApiErrorResponse, ApiSuccessResponse } from '@/types/response.types.ts'
import { Request, Response } from 'express'

/**
 * Add a new pizza
 * POST /api/admin/pizzas
 */
export const addPizza = async (req: Request, res: Response): Promise<void> => {
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
    const response: ApiErrorResponse = {
      success: false,
      error: 'Internal server error',
    }
    res.status(500).json(response)
  }
}

/**
 * Delete a pizza
 * DELETE /api/admin/pizzas/:id
 */
export const removePizza = async (req: Request, res: Response): Promise<void> => {
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
    res.status(200).json({ success: true, message: 'Pizza deleted successfully' })
  } catch (error) {
    const response: ApiErrorResponse = {
      success: false,
      error: 'Internal server error',
    }
    res.status(500).json(response)
  }
}

/**
 * Get a single pizza by ID
 * GET /api/admin/pizzas/:id
 */
export const getPizza = async (req: Request, res: Response): Promise<void> => {
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
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

/**
 * Edit a pizza
 * PATCH /api/admin/pizzas/:id
 */
export const updatePizza = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params
    const pizzaData: AddPizzaRequest = req.body
    const result = await editPizza(id, pizzaData)
    if (!result.success) {
      const statusCode = result.error === 'Pizza not found' ? 404 : 500
      res.status(statusCode).json({ success: false, error: result.error })
      return
    }
    res.status(200).json({ success: true, message: 'Pizza updated successfully' })
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' })
  }
}

export const getPizzas = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await getAllPizzas()
    const response: ApiSuccessResponse<PizzaListResult> = {
      success: true,
      data: result,
    }
    res.status(200).json(response)
  } catch (error) {
    const response: ApiErrorResponse = {
      success: false,
      error: 'Internal server error',
    }
    res.status(500).json(response)
  }
}
