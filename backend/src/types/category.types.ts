export interface CategoryResponse {
  id: string
  name: string
  slug: string
  createdAt: string
  updatedAt?: string
}

export interface CategoryListResult {
  data: CategoryResponse[]
  total: number
}

export interface AddCategoryRequest {
  name: string
  slug?: string // auto-generated from name if not provided
}

export interface AddCategoryResult {
  success: boolean
  category?: CategoryResponse
  error?: string
}
