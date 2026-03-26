import { createPizza } from '@/services/pizza.service.ts'
import { AddPizzaRequest, PizzaResponse } from '@/types/pizz.types.ts'
import { ApiErrorResponse, ApiSuccessResponse } from '@/types/response.types.ts'
import { Request, Response } from 'express'

/**
 * Add a new pizza
 * POST /api/admin/pizzas
 */
export const addPizza = async (req: Request, res: Response) => {
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
