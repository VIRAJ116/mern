import { http } from './axios'

export const createOrder = (payload) => http.post('/api/orders', payload)
export const getMyOrders = () => http.get('/api/orders/me')
export const getOrderById = (id) => http.get(`/api/orders/${id}`)
export const cancelOrder = (id) => http.patch(`/api/orders/${id}/cancel`)
