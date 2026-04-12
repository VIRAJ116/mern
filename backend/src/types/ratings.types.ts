export interface AddRatingRequest {
  userId: string
  pizzaId: string
  newRating: number // 1–5
}

export interface RatingResponse {
  id: string
  userId: string
  pizzaId: string
  rating: number
  createdAt: string
}

export type RatePizzaResult =
  | { success: true; avgRating: number; ratingCount: number }
  | { success: false; error: string }

export interface UpdateRatingResult {
  success: boolean
  rating?: RatingResponse
  error?: string
}

export interface DeleteRatingResult {
  success: boolean
  error?: string
}

export interface RatingListResult {
  data: RatingResponse[]
  total: number
}
