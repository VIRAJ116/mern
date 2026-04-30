import { http } from './axios'

export const createOrder = (payload) => http.post('/orders', payload) // Changed default /api/orders to /orders based on recent app structure
export const verifyPayment = (payload) =>
  http.post('/orders/verify-payment', payload)
export const getMyOrders = () => http.get('/orders/me')
export const getOrderById = (id) => http.get(`/orders/${id}`)
export const cancelOrder = (id) => http.patch(`/orders/${id}/cancel`)
