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
  createdAt: string
}

export interface AddPizzaResult {
  success: boolean
  pizza?: PizzaResponse
  error?: string
}
