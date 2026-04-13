export interface ToppingResponse {
  id: string
  name: string
  price: number
  icon: string
  isAvailable: boolean
  createdAt: string
  updatedAt?: string
}

export interface ToppingListResult {
  data: ToppingResponse[]
  total: number
}

export interface AddToppingRequest {
  name: string
  price: number
  icon?: string
  isAvailable?: boolean
}
export interface AddToppingResult {
  success: boolean
  topping?: ToppingResponse
  error?: string
}
