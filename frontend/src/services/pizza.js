import { http } from './axios'

export const getAllPizzas = (params) => http.get('/api/pizzas', { params })
export const getPizzaById = (id) => http.get(`/api/pizzas/${id}`)
export const getCategories = () => http.get('/api/categories')
export const getToppings = () => http.get('/api/toppings')
