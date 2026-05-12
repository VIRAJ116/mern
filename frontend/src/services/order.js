import { http } from './axios'

export const createOrder = (payload) => http.post('/orders', payload)
export const verifyPayment = (payload) =>
  http.post('/orders/verify-payment', payload)
export const getMyOrders = () => http.get('/orders/me')
export const getOrderById = (id) => http.get(`/orders/${id}`)
export const cancelOrder = (id) => http.patch(`/orders/${id}/cancel`)
export const ratePizza = (pizzaId, newRating) =>
  http.post('/ratings', { pizzaId, newRating })

