import { NextFunction, Request, Response } from 'express'
import { ratePizza } from '@/services/rating.service.ts'
import { AddRatingRequest } from '@/types/ratings.types.ts'
import { ApiErrorResponse, ApiSuccessResponse } from '@/types/response.types.ts'

/**
 * Add or update a pizza rating
 * POST /api/ratings
 */
export const addOrUpdateRating = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.userId

    if (!userId) {
      const response: ApiErrorResponse = {
        success: false,
        error: 'Unauthorized',
      }
      res.status(401).json(response)
      return
    }

    const { pizzaId, newRating } = req.body

    if (!pizzaId || newRating === undefined) {
      const response: ApiErrorResponse = {
        success: false,
        error: 'Missing required fields: pizzaId, newRating',
      }
      res.status(400).json(response)
      return
    }

    const ratingData: AddRatingRequest = {
      userId,
      pizzaId,
      newRating,
    }

    const result = await ratePizza(ratingData)

    if (!result.success) {
      const response: ApiErrorResponse = {
        success: false,
        error: result.error || 'Failed to rate pizza',
      }
      const statusCode = result.error === 'Pizza not found' ? 404 : 400
      res.status(statusCode).json(response)
      return
    }

    const response: ApiSuccessResponse<{
      avgRating: number
      ratingCount: number
    }> = {
      success: true,
      data: {
        avgRating: result.avgRating,
        ratingCount: result.ratingCount,
      },
      message: 'Pizza rated successfully',
    }
    res.status(200).json(response)
  } catch (error) {
    next(error)
  }
}
