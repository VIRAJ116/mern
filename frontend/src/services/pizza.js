import { http } from './axios'

export const getAllPizzas = (params) => http.get('/pizzas', { params })
export const getPizzaById = (id) => http.get(`/pizzas/${id}`)
export const getCategories = () => http.get('/categories')
export const getToppings = () => http.get('/toppings')
