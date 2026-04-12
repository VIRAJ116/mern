export interface AddPizzaRequest {
  name: string
  description: string
  price: number
  category: string
  tags: string[]
  imageUrl: string
}

export interface PizzaResponse {
  id: string
  name: string
  description?: string
  price: number
  category: string
  tags: string[]
  imageUrl: string
  avgRating: number
  ratingCount: number
  createdAt: string
  updatedAt?: string
}

export interface AddPizzaResult {
  success: boolean
  pizza?: PizzaResponse
  error?: string
}

export interface DeletePizzaResult {
  success: boolean
  error?: string
}

export interface PizzaListResult {
  data: PizzaResponse[]
  total: number
}
